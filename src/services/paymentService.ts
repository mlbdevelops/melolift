
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const initiateStripeCheckout = async (planId: number, userId: string): Promise<string | null> => {
  try {
    console.log(`Initiating checkout for plan ${planId} and user ${userId}`);
    
    // Show a loading toast while the checkout process is initializing
    const toastId = toast.loading("Preparing checkout...");
    
    // Call the create-checkout edge function
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: {
        planId,
        userId,
        returnUrl: window.location.origin + '/subscription'
      }
    });
    
    // Hide the loading toast
    toast.dismiss(toastId);
    
    if (error) {
      console.error('Checkout error:', error);
      toast.error(`Checkout error: ${error.message || 'Failed to create checkout session'}`);
      return null;
    }
    
    if (!data || !data.url) {
      console.error('Invalid response from checkout function:', data);
      toast.error('Invalid response from checkout function');
      return null;
    }
    
    console.log('Checkout URL received:', data.url);
    toast.success("Redirecting to checkout...");
    return data.url;
  } catch (error: any) {
    console.error('Failed to create checkout session:', error);
    toast.error(`Payment initialization failed: ${error?.message || 'Unknown error'}`);
    return null;
  }
};
