
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

interface AuthContextType {
  user: any | null;
  session: any | null;
  profile: any | null;
  subscription: Tables<'user_subscriptions'> | null;
  loading: boolean;
  isPremiumFeature: (feature: string) => boolean;
  refreshSubscription: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [subscription, setSubscription] = useState<Tables<'user_subscriptions'> | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Fetch profile in a separate non-blocking call
          setTimeout(() => {
            fetchProfile(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    }
  };
  
  useEffect(() => {
    const fetchSubscription = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (error) {
            console.error("Error fetching subscription:", error);
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
    
    if (user) {
      fetchSubscription();
    }
  }, [user]);
  
  const refreshSubscription = async () => {
    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error refreshing subscription:", error);
          setSubscription(null);
        } else {
          setSubscription(data);
        }
      } catch (error) {
        console.error("Error refreshing subscription:", error);
        setSubscription(null);
      }
    } else {
      setSubscription(null);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };
  
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Auth state listener will handle updating the state
    } catch (error) {
      console.error("Error signing out:", error);
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
    profile,
    subscription,
    loading,
    isPremiumFeature,
    refreshSubscription,
    refreshProfile,
    signOut
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
