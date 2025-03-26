
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";

serve(async (req) => {
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
    
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    
    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });
    
    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(JSON.stringify({ error: 'No signature' }), { status: 400 });
    }
    
    // Get the request body as text
    const body = await req.text();
    
    // Construct the event
    let event;
    
    try {
      if (stripeWebhookSecret) {
        event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
      } else {
        // For development, just parse the body
        event = JSON.parse(body);
      }
    } catch (err) {
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), { status: 400 });
    }
    
    console.log(`Received event: ${event.type}`);
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, planId } = session.metadata;
        
        if (userId && planId) {
          // Check if user already has a subscription
          const { data: existingSubscription } = await supabase
            .from('user_subscriptions')
            .select('id')
            .eq('user_id', userId)
            .single();
            
          if (existingSubscription) {
            // Update existing subscription
            await supabase
              .from('user_subscriptions')
              .update({
                plan_id: Number(planId),
                status: 'active',
                stripe_subscription_id: session.subscription,
                current_period_start: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', existingSubscription.id);
          } else {
            // Create new subscription
            await supabase
              .from('user_subscriptions')
              .insert({
                user_id: userId,
                plan_id: Number(planId),
                status: 'active',
                stripe_subscription_id: session.subscription,
                current_period_start: new Date().toISOString()
              });
          }
        }
        break;
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object;
        const subscription = invoice.subscription;
        
        if (subscription) {
          // Get the subscription
          const subscriptionObject = await stripe.subscriptions.retrieve(subscription);
          const { userId } = subscriptionObject.metadata;
          
          if (userId) {
            // Update the subscription period
            await supabase
              .from('user_subscriptions')
              .update({
                status: 'active',
                current_period_start: new Date(invoice.period_start * 1000).toISOString(),
                current_period_end: new Date(invoice.period_end * 1000).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('stripe_subscription_id', subscription);
          }
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Downgrade the user to free plan
        await supabase
          .from('user_subscriptions')
          .update({
            plan_id: 1, // Free plan
            status: 'inactive',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
          
        break;
      }
    }
    
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});
