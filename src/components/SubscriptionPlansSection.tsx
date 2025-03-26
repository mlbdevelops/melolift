
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import Button from "./Button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Json } from "@/integrations/supabase/types";

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  features: string[];
}

const SubscriptionPlansSection = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .order("price", { ascending: true });
          
        if (error) throw error;
        
        const formattedPlans = data.map(plan => {
          // Safely parse features from JSON
          let featuresArray: string[] = [];
          
          if (plan.features) {
            try {
              // If features is a string, try to parse it
              if (typeof plan.features === 'string') {
                const parsed = JSON.parse(plan.features);
                // Type assertion to any to handle different possible formats
                const parsedFeatures = parsed as any;
                featuresArray = Array.isArray(parsedFeatures) 
                  ? parsedFeatures.map(f => String(f)) 
                  : (parsedFeatures.features ? parsedFeatures.features.map((f: any) => String(f)) : []);
              } 
              // If features is already an object
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
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, []);

  const handleGetStarted = () => {
    navigate("/auth");
  };
  
  if (loading) {
    return (
      <section className="py-16 bg-dark-200">
        <div className="container mx-auto">
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-16 bg-dark-200">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-light-100/70">
            Unlock premium features to take your music production to the next level.
            Choose the plan that best suits your needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
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
                    variant={isPro || isPremium ? "gradient" : "default"}
                    className="w-full"
                    onClick={handleGetStarted}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SubscriptionPlansSection;
