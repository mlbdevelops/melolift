
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserSubscription {
  id: string;
  plan_id: number;
  status: string;
  plan: {
    name: string;
    features: any;
  }
}

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  subscription: UserSubscription | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  isPremiumFeature: (feature: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          fetchUserProfile(currentSession.user.id);
          fetchUserSubscription(currentSession.user.id);
        } else {
          setProfile(null);
          setSubscription(null);
        }
      }
    );
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
        fetchUserSubscription(currentSession.user.id);
      }
      
      setLoading(false);
    });
    
    return () => {
      authListener.unsubscribe();
    };
  }, []);
  
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
        
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };
  
  const fetchUserSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          plan:plan_id(
            name,
            features
          )
        `)
        .eq("user_id", userId)
        .eq("status", "active")
        .single();
        
      if (error) {
        console.error("Error fetching subscription:", error);
        return;
      }
      
      setSubscription(data);
    } catch (error) {
      console.error("Error fetching user subscription:", error);
    }
  };
  
  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };
  
  const refreshSubscription = async () => {
    if (user) {
      await fetchUserSubscription(user.id);
    }
  };
  
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };
  
  const isPremiumFeature = (feature: string): boolean => {
    if (!subscription || !subscription.plan) return false;
    
    const planFeatures = subscription.plan.features?.features || [];
    return planFeatures.includes(feature);
  };
  
  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        subscription,
        loading,
        signOut,
        refreshProfile,
        refreshSubscription,
        isPremiumFeature
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
