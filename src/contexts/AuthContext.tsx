
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: any | null;
  session: any | null;
  profile: any | null;
  subscription: Tables<'user_subscriptions'> | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
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
          setSubscription(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      } else {
        setLoading(false);
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
      
      // Fetch subscription after profile
      fetchSubscription(userId);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
      setLoading(false);
    }
  };
  
  const fetchSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
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
  };
  
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };
  
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };
  
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      
      if (error) throw error;
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  };
  
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
    const premiumPlanIds = [2, 3]; // 2 is Pro, 3 is Premium
    
    if (!premiumPlanIds.includes(subscription.plan_id)) {
      return false;
    }
    
    // Special features only in Premium plan (id 3)
    const premiumOnlyFeatures = [
      'flac-export',
      'wav-export',
      'advanced-effects',
      'unlimited-projects',
      'background-voices',
      'extended-mixing'
    ];
    
    if (premiumOnlyFeatures.includes(feature) && subscription.plan_id !== 3) {
      return false;
    }
    
    // Pro features - available to both Pro and Premium plans
    const proFeatures = [
      'mp3-export',
      'high-quality-export',
      'additional-presets',
      'cloud-storage'
    ];
    
    // All Pro features are available to Pro and Premium plans
    if (proFeatures.includes(feature)) {
      return true;
    }
    
    return true;
  };
  
  const value: AuthContextType = {
    user,
    session,
    profile,
    subscription,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
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
