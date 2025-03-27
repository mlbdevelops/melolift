import { useState, useEffect } from "react";
import { Check, Shield, Cloud, Music, BarChart, Clock, Waves, Download } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { initiateStripeCheckout } from "../services/paymentService";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  features: string[];
}

const Subscription = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const sessionId = searchParams.get('session_id');
  
  const { user, subscription, refreshSubscription } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [processedSuccess, setProcessedSuccess] = useState(false);
  
  // Handle URL parameters only once on mount with improved logic
  useEffect(() => {
    if (success && sessionId && user && !processedSuccess) {
      // Wait a moment for the webhook to process the subscription
      const timer = setTimeout(() => {
        refreshSubscription();
        toast.success("Subscription updated successfully!");
        setProcessedSuccess(true);
        
        // Clear URL parameters to prevent duplicate notifications
        setSearchParams({});
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    if (canceled) {
      toast.error("Subscription process was canceled.");
      
      // Clear URL parameters to prevent duplicate notifications
      setSearchParams({});
    }
  }, [success, canceled, sessionId, user, refreshSubscription, setSearchParams, processedSuccess]);
  
  // Fetch subscription status periodically after successful checkout
  useEffect(() => {
    if (success && sessionId && user) {
      const checkInterval = setInterval(() => {
        refreshSubscription();
      }, 5000);
      
      // Stop checking after 30 seconds
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
      }, 30000);
      
      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeout);
      };
    }
  }, [success, sessionId, user, refreshSubscription]);
  
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .order("price", { ascending: true });
          
        if (error) throw error;
        
        const formattedPlans = data.map(plan => {
          let featuresArray: string[] = [];
          
          if (plan.features) {
            try {
              if (typeof plan.features === 'string') {
                const parsed = JSON.parse(plan.features);
                // Type assertion to any to handle different possible formats
                const parsedFeatures = parsed as any;
                featuresArray = Array.isArray(parsedFeatures) 
                  ? parsedFeatures.map(f => String(f)) 
                  : (parsedFeatures.features ? parsedFeatures.features.map((f: any) => String(f)) : []);
              } 
              else if (typeof plan.features === 'object') {
                if (Array.isArray(plan.features)) {
                  featuresArray = plan.features.map(item => String(item));
                } else {
                  const objFeatures = plan.features as any;
                  featuresArray = objFeatures.features 
                    ? objFeatures.features.map((f: any) => String(f)) 
                    : Object.values(plan.features as Record<string, unknown>).map(f => String(f));
                }
              }
            } catch (e) {
              console.error("Error parsing features:", e);
              featuresArray = [];
            }
          }
          
          return {
            ...plan,
            features: featuresArray
          };
        });
        
        setPlans(formattedPlans);
        setLoadingPlans(false);
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast.error("Failed to load subscription plans");
        setLoadingPlans(false);
      }
    };
    
    fetchPlans();
  }, []);
  
  const handleSubscribe = async (planId: number) => {
    if (!user) {
      toast.error("You must be logged in to subscribe");
      return;
    }
    
    setProcessingCheckout(true);
    
    try {
      const checkoutUrl = await initiateStripeCheckout(planId, user.id);
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error initiating checkout:", error);
      toast.error("Failed to start checkout process");
    } finally {
      setProcessingCheckout(false);
    }
  };
  
  const currentPlanId = subscription?.plan_id || 1; // Default to free plan
  
  const getIconForFeature = (feature: string) => {
    if (feature.includes("storage")) return <Cloud className="h-4 w-4 mr-2" />;
    if (feature.includes("track")) return <Music className="h-4 w-4 mr-2" />;
    if (feature.includes("analytics")) return <BarChart className="h-4 w-4 mr-2" />;
    if (feature.includes("unlimited")) return <Clock className="h-4 w-4 mr-2" />;
    if (feature.includes("effects")) return <Waves className="h-4 w-4 mr-2" />;
    if (feature.includes("export")) return <Download className="h-4 w-4 mr-2" />;
    return <Check className="h-4 w-4 mr-2" />;
  };
  
  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Subscription Plans</h1>
          <p className="text-light-100/70 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade anytime to access premium features and take your music production to the next level.
          </p>
        </div>
        
        {subscription && subscription.status === "active" && (
          <div className="mb-8 p-4 rounded-lg bg-primary/10 border border-primary/30 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-primary mr-3" />
              <div>
                <p className="font-semibold">
                  You are currently on the {plans.find(p => p.id === currentPlanId)?.name || "Free"} plan
                </p>
                <p className="text-sm text-light-100/70">
                  {subscription.current_period_end 
                    ? `Your subscription will renew on ${new Date(subscription.current_period_end).toLocaleDateString()}`
                    : ""}
                </p>
              </div>
            </div>
            
            <Button variant="outline" onClick={() => refreshSubscription()}>
              Refresh Status
            </Button>
          </div>
        )}
        
        {loadingPlans ? (
          <div className="flex justify-center my-16">
            <div className="animate-spin h-10 w-10 border-t-2 border-primary rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const isPro = plan.name === "Pro";
              const isPremium = plan.name === "Premium";
              const isCurrentPlan = plan.id === currentPlanId;
              
              return (
                <div 
                  key={plan.id}
                  className={`glass-card relative overflow-hidden rounded-xl ${
                    isPro ? "border-primary/50 border-2" : ""
                  } ${isPremium ? "border-accent-gold/50 border-2" : ""} ${
                    isCurrentPlan ? "ring-2 ring-primary" : ""
                  }`}
                >
                  {isPro && (
                    <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-medium">
                      Popular
                    </div>
                  )}
                  {isPremium && (
                    <div className="absolute top-0 right-0 bg-accent-gold text-white px-4 py-1 text-sm font-medium">
                      Best Value
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="absolute top-0 left-0 bg-primary text-white px-4 py-1 text-sm font-medium">
                      Current Plan
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-light-100/70 mb-4">{plan.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-3xl font-bold">
                        ${plan.price === 0 ? "0" : plan.price.toFixed(2)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-light-100/50 ml-1">/month</span>
                      )}
                    </div>
                    
                    <div className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <div className="text-primary mr-2 mt-0.5 flex-shrink-0">
                            {getIconForFeature(feature)}
                          </div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      variant={isPro || isPremium ? "gradient" : "default"}
                      className="w-full flex items-center justify-center"
                      disabled={isCurrentPlan || processingCheckout}
                      isLoading={processingCheckout}
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      {isCurrentPlan ? "Current Plan" : plan.price === 0 ? "Select Free Plan" : "Subscribe"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Subscription;
