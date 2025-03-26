
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@13.9.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
    
    // Get request data
    const { planId, userId, returnUrl } = await req.json();
    
    if (!planId || !userId || !returnUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the plan details
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();
    
    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: "Plan not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the user details
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create a checkout session
    let session;
    
    try {
      // In a real implementation, you'd use real Stripe product/price IDs
      // This is just a mock implementation for demonstration
      session = {
        id: `cs_test_${crypto.randomUUID()}`,
        url: returnUrl, // In a real app, this would be a real Stripe checkout URL
      };
      
      // In a real app, you'd create a real Stripe checkout session like this:
      /*
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: plan.stripe_price_id, // The price ID from Stripe
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnUrl}?canceled=true`,
        customer_email: userData.email,
        client_reference_id: userId,
        metadata: {
          userId,
          planId: plan.id,
        },
      });
      */
      
      // For this example, we'll directly update the user's subscription
      const { error: updateError } = await supabase
        .from("user_subscriptions")
        .update({
          plan_id: planId,
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
      
      if (updateError) {
        throw updateError;
      }
      
      return new Response(
        JSON.stringify({ sessionId: session.id, url: session.url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error creating checkout session:", error);
      
      return new Response(
        JSON.stringify({ error: "Failed to create checkout session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
