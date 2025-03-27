
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
    const stripeLiveKey = Deno.env.get('STRIPE_LIVE_KEY') || '';
    
    if (!stripeKey && !stripeLiveKey) {
      console.error('Neither STRIPE_SECRET_KEY nor STRIPE_LIVE_KEY is set');
      throw new Error('Stripe keys are not set');
    }
    
    // Get request data
    const requestData = await req.json();
    const { planId, userId, returnUrl, mode = 'live' } = requestData; // Default to live mode
    
    console.log("Request data:", { planId, userId, returnUrl, mode });
    
    // Use live key if mode is set to 'live', otherwise use test key
    const keyToUse = mode === 'live' && stripeLiveKey ? stripeLiveKey : stripeKey;
    console.log(`Using ${mode} mode for Stripe.`);
    
    // Initialize Stripe with the appropriate key
    const stripe = new Stripe(keyToUse, {
      apiVersion: '2023-10-16',
    });
    
    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
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
      console.error("Plan error:", planError);
      throw new Error('Plan not found');
    }
    
    // Get the user details
    const { data: userInfo, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error("User error:", userError);
      throw new Error('User not found');
    }
    
    // Get user email from auth.users table
    const { data: authUser, error: authError } = await supabase
      .auth.admin.getUserById(userId);
      
    if (authError || !authUser.user) {
      console.error("Auth user error:", authError);
      throw new Error('Auth user not found');
    }
    
    // Get Stripe Price ID based on mode
    let priceId;
    
    if (mode === 'live' && plan.stripe_live_price_id) {
      priceId = plan.stripe_live_price_id;
    } else if (plan.stripe_price_id) {
      priceId = plan.stripe_price_id;
    } else {
      try {
        // Create a product first
        const product = await stripe.products.create({
          name: `${plan.name} Plan`,
          active: true,
        });
        
        console.log("Created product:", product.id);
        
        // Then create a price for the product
        const price = await stripe.prices.create({
          unit_amount: Math.round(plan.price * 100), // Convert to cents
          currency: 'usd',
          product: product.id,
          recurring: {
            interval: 'month',
          },
        });
        
        console.log("Created price:", price.id);
        
        priceId = price.id;
        
        // Save the price ID for future use
        const priceColumn = mode === 'live' ? 'stripe_live_price_id' : 'stripe_price_id';
        await supabase
          .from('subscription_plans')
          .update({ [priceColumn]: priceId })
          .eq('id', planId);
      } catch (error) {
        console.error("Error creating Stripe product/price:", error);
        throw new Error(`Failed to create Stripe product/price: ${error.message}`);
      }
    }
    
    console.log('Creating checkout session with price ID:', priceId);
    
    try {
      // Look up existing customer or create new one
      let customerId: string | undefined;
      
      const { data: customers } = await stripe.customers.list({
        email: authUser.user.email,
        limit: 1,
      });
      
      if (customers && customers.length > 0) {
        customerId = customers[0].id;
        console.log('Found existing customer:', customerId);
      } else {
        // Create a new customer
        const newCustomer = await stripe.customers.create({
          email: authUser.user.email,
          name: userInfo.full_name || authUser.user.email,
          metadata: {
            userId: userId,
          },
        });
        customerId = newCustomer.id;
        console.log('Created new customer:', customerId);
      }
      
      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
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
      console.error("Error creating checkout session:", error);
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }
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
