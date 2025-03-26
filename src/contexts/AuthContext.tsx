import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Tables } from '@/integrations/supabase/types';

interface AuthContextType {
  user: any | null;
  session: any | null;
  subscription: Tables<'user_subscriptions'> | null;
  loading: boolean;
  isPremiumFeature: (feature: string) => boolean;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();
  const [session, setSession] = useState(null);
  const [subscription, setSubscription] = useState<Tables<'user_subscriptions'> | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      setSession(session);
    };
    
    getSession();
  }, [supabaseClient]);
  
  useEffect(() => {
    const fetchSubscription = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabaseClient
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (error) {
            // No subscription found, which is fine
            setSubscription(null);
          } else {
            setSubscription(data);
          }
        } catch (error) {
          console.error("Error fetching subscription:", error);
          setSubscription(null);
        } finally {
          setLoading(false);
        }
      } else {
        setSubscription(null);
        setLoading(false);
      }
    };
    
    fetchSubscription();
  }, [user, supabaseClient]);
  
  const refreshSubscription = async () => {
    if (user?.id) {
      try {
        const { data, error } = await supabaseClient
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          // No subscription found, which is fine
          setSubscription(null);
        } else {
          setSubscription(data);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setSubscription(null);
      }
    } else {
      setSubscription(null);
    }
  };
  
  const isPremiumFeature = (feature: string): boolean => {
    if (!subscription) return false;
    
    // Check if the user has an active subscription
    if (subscription.status !== 'active') {
      return false;
    }
    
    // Check the plan ID against your premium plans
    const premiumPlanIds = [2, 3]; // Example: 2 is Pro, 3 is Premium
    
    if (!premiumPlanIds.includes(subscription.plan_id)) {
      return false;
    }
    
    // Add more sophisticated logic here to check specific features
    // based on the user's subscription plan if needed
    return true;
  };
  
  const value: AuthContextType = {
    user,
    session,
    subscription,
    loading,
    isPremiumFeature,
    refreshSubscription
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
