
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
    
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    
    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });
    
    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get request data
    const { planId, userId, returnUrl } = await req.json();
    
    if (!planId || !userId || !returnUrl) {
      throw new Error('Missing required fields');
    }
    
    // Get the plan details from the database
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();
      
    if (planError || !plan) {
      throw new Error('Plan not found');
    }
    
    // Get the user details
    const { data: userInfo, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (userError) {
      throw new Error('User not found');
    }
    
    // Get user email from auth.users table
    const { data: authUser, error: authError } = await supabase
      .auth.admin.getUserById(userId);
      
    if (authError || !authUser.user) {
      throw new Error('Auth user not found');
    }
    
    // Use Stripe Price ID if available, otherwise create a dynamic price
    let priceId = plan.stripe_price_id;
    
    if (!priceId) {
      // Create a product first
      const product = await stripe.products.create({
        name: `${plan.name} Plan`,
        active: true,
      });
      
      // Then create a price for the product
      const price = await stripe.prices.create({
        unit_amount: Math.round(plan.price * 100), // Convert to cents
        currency: 'usd',
        product: product.id,
        recurring: {
          interval: 'month',
        },
      });
      
      priceId = price.id;
      
      // Save the price ID for future use
      await supabase
        .from('subscription_plans')
        .update({ stripe_price_id: priceId })
        .eq('id', planId);
    }
    
    console.log('Creating checkout session with price ID:', priceId);
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: authUser.user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: {
        userId,
        planId: planId.toString(),
      },
    });
    
    console.log('Checkout session created:', session.id);
    
    // Return the session URL
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error:', error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400 
      }
    );
  }
});
