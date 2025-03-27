
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const initiateStripeCheckout = async (planId: number, userId: string): Promise<string | null> => {
  try {
    console.log(`Initiating checkout for plan ${planId} and user ${userId}`);
    
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
      toast.error(`Checkout error: ${error.message || 'Failed to create checkout session'}`);
      throw new Error(error.message || 'Failed to create checkout session');
    }
    
    if (!data || !data.url) {
      console.error('Invalid response from checkout function:', data);
      toast.error('Invalid response from checkout function');
      throw new Error('Invalid response from checkout function');
    }
    
    console.log('Checkout URL received:', data.url);
    return data.url;
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    toast.error(`Payment initialization failed: ${error.message || 'Unknown error'}`);
    return null;
  }
};
