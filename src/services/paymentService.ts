
import { supabase } from "@/integrations/supabase/client";

export const initiateStripeCheckout = async (planId: number, userId: string): Promise<string | null> => {
  try {
    // Call the create-checkout edge function
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        planId,
        userId,
        returnUrl: window.location.origin + '/subscription'
      }
    });
    
    if (error) {
      console.error('Checkout error:', error);
      throw new Error(error.message);
    }
    
    return data.url;
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    return null;
  }
};
