
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";

serve(async (req) => {
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
    const stripeLiveKey = Deno.env.get('STRIPE_LIVE_KEY') || '';
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
    const stripeLiveWebhookSecret = Deno.env.get('STRIPE_LIVE_WEBHOOK_SECRET') || '';
    
    // Determine which key to use based on the signature
    const signature = req.headers.get('stripe-signature');
    const liveMode = req.headers.get('stripe-mode') === 'live';
    
    const keyToUse = liveMode && stripeLiveKey ? stripeLiveKey : stripeKey;
    const webhookSecretToUse = liveMode && stripeLiveWebhookSecret ? stripeLiveWebhookSecret : stripeWebhookSecret;
    
    if (!keyToUse) {
      throw new Error('Stripe key is not set');
    }
    
    // Initialize Stripe
    const stripe = new Stripe(keyToUse, {
      apiVersion: '2023-10-16',
    });
    
    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the signature from the headers
    if (!signature) {
      return new Response(JSON.stringify({ error: 'No signature' }), { status: 400 });
    }
    
    // Get the request body as text
    const body = await req.text();
    
    // Construct the event
    let event;
    
    try {
      if (webhookSecretToUse) {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecretToUse);
      } else {
        // For development, just parse the body
        event = JSON.parse(body);
      }
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), { status: 400 });
    }
    
    console.log(`Received event: ${event.type}`);
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, planId } = session.metadata;
        
        if (userId && planId) {
          console.log(`Processing checkout completion for user ${userId} with plan ${planId}`);
          
          // Check if user already has a subscription
          const { data: existingSubscription, error: subError } = await supabase
            .from('user_subscriptions')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();
          
          if (subError) {
            console.error('Error checking for existing subscription:', subError);
          }
            
          if (existingSubscription) {
            // Update existing subscription
            console.log(`Updating existing subscription ${existingSubscription.id}`);
            await supabase
              .from('user_subscriptions')
              .update({
                plan_id: Number(planId),
                status: 'active',
                stripe_subscription_id: session.subscription,
                current_period_start: new Date().toISOString(),
                current_period_end: null, // Will be updated when we get the invoice.paid event
                updated_at: new Date().toISOString()
              })
              .eq('id', existingSubscription.id);
          } else {
            // Create new subscription
            console.log(`Creating new subscription for user ${userId}`);
            await supabase
              .from('user_subscriptions')
              .insert({
                user_id: userId,
                plan_id: Number(planId),
                status: 'active',
                stripe_subscription_id: session.subscription,
                current_period_start: new Date().toISOString(),
                current_period_end: null // Will be updated when we get the invoice.paid event
              });
          }
          
          // Log successful subscription update
          console.log('Subscription updated successfully');
        } else {
          console.error('Missing userId or planId in session metadata');
        }
        break;
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object;
        const subscription = invoice.subscription;
        
        if (subscription) {
          console.log(`Processing paid invoice for subscription ${subscription}`);
          
          try {
            // Get the subscription
            const subscriptionObject = await stripe.subscriptions.retrieve(subscription);
            const { userId } = subscriptionObject.metadata;
            
            if (userId) {
              // Update the subscription period
              const result = await supabase
                .from('user_subscriptions')
                .update({
                  status: 'active',
                  current_period_start: new Date(invoice.period_start * 1000).toISOString(),
                  current_period_end: new Date(invoice.period_end * 1000).toISOString(),
                  updated_at: new Date().toISOString()
                })
                .eq('stripe_subscription_id', subscription);
                
              console.log(`Updated subscription period, result:`, result);
            } else {
              console.error('No userId found in subscription metadata');
            }
          } catch (error) {
            console.error('Error retrieving subscription details:', error);
          }
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        console.log(`Processing subscription deletion: ${subscription.id}`);
        
        try {
          // Downgrade the user to free plan
          const result = await supabase
            .from('user_subscriptions')
            .update({
              plan_id: 1, // Free plan
              status: 'inactive',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id);
            
          console.log(`Downgraded subscription, result:`, result);
        } catch (error) {
          console.error('Error downgrading subscription:', error);
        }
          
        break;
      }
    }
    
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});
