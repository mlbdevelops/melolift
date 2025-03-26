
import { useState, useEffect } from "react";
import { Check, Shield, Cloud, Music, BarChart, Clock, Waves, Download } from "lucide-react";
import { toast } from "sonner";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  features: string[];
}

const Subscription = () => {
  const { user, subscription, refreshSubscription } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .order("price", { ascending: true });
          
        if (error) throw error;
        
        const formattedPlans = data.map(plan => ({
          ...plan,
          features: plan.features.features || []
        }));
        
        setPlans(formattedPlans);
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast.error("Failed to load subscription plans");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, []);
  
  const handleSubscribe = async (planId: number) => {
    if (!user) {
      toast.error("You must be logged in to subscribe");
      return;
    }
    
    setSubscribing(true);
    
    try {
      // In a real app, this would redirect to Stripe Checkout
      // For demo purposes, we'll just update the subscription directly
      
      // First check if user already has a subscription
      if (subscription) {
        const { error } = await supabase
          .from("user_subscriptions")
          .update({
            plan_id: planId,
            updated_at: new Date().toISOString()
          })
          .eq("id", subscription.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_subscriptions")
          .insert({
            user_id: user.id,
            plan_id: planId,
            status: "active"
          });
          
        if (error) throw error;
      }
      
      toast.success("Subscription updated successfully!");
      refreshSubscription();
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error("Failed to update subscription");
    } finally {
      setSubscribing(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-light-100/70">
            Unlock premium features to take your music production to the next level.
            Choose the plan that best suits your needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.plan_id === plan.id;
            const isPro = plan.name === "Pro";
            const isPremium = plan.name === "Premium";
            
            return (
              <div
                key={plan.id}
                className={`glass-card relative overflow-hidden rounded-xl ${
                  isPro ? "border-primary/50 border-2" : ""
                } ${isPremium ? "border-accent-gold/50 border-2" : ""}`}
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
                        <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    variant={isCurrentPlan ? "outline" : isPro || isPremium ? "gradient" : "default"}
                    className="w-full"
                    disabled={isCurrentPlan || subscribing}
                    onClick={() => handleSubscribe(plan.id)}
                    isLoading={subscribing}
                  >
                    {isCurrentPlan ? "Current Plan" : "Subscribe"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">All Plans Include</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-5 text-center">
              <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Secure Storage</h3>
              <p className="text-sm text-light-100/70">Your audio files are securely stored and encrypted</p>
            </div>
            
            <div className="glass-card p-5 text-center">
              <Cloud className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Cloud Access</h3>
              <p className="text-sm text-light-100/70">Access your projects from anywhere, anytime</p>
            </div>
            
            <div className="glass-card p-5 text-center">
              <Music className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Basic Alignment</h3>
              <p className="text-sm text-light-100/70">Essential vocal alignment with any instrumental</p>
            </div>
            
            <div className="glass-card p-5 text-center">
              <Clock className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Regular Updates</h3>
              <p className="text-sm text-light-100/70">Continuous improvements and new features</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Subscription;
