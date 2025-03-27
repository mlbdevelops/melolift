
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Google, Apple } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";
import Layout from "../components/Layout";
import Button from "../components/Button";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const isSignUp = searchParams.get("signup") === "true";
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isSignUp) {
        // Sign up flow
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        
        if (error) throw error;
        
        // Create profile
        const { data: { user: newUser } } = await supabase.auth.getUser();
        
        if (newUser) {
          await supabase.from('profiles').insert({
            id: newUser.id,
            full_name: fullName,
            avatar_url: null,
          });
        }
        
        toast.success("Account created successfully! Please check your email for verification.");
      } else {
        // Sign in flow
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast.success("Signed in successfully!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast.error(error.message || "Failed to sign in with Google");
    }
  };
  
  const handleAppleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Apple sign in error:", error);
      toast.error(error.message || "Failed to sign in with Apple");
    }
  };
  
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="glass-card max-w-md w-full p-8 rounded-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent">
              MeloLift
            </h1>
            <h2 className="mt-4 text-2xl font-bold">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-light-100/60">
              {isSignUp 
                ? "Sign up to start creating amazing music" 
                : "Sign in to continue your music journey"}
            </p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-6">
            {isSignUp && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-light-100/40" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-dark-300 border border-white/10 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-light-100/40" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-dark-300 border border-white/10 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-light-100/40" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-dark-300 border border-white/10 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>
            
            {!isSignUp && (
              <div className="flex items-center justify-end">
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
            )}
            
            <Button
              type="submit"
              variant="gradient"
              className="w-full flex items-center justify-center"
              isLoading={isSubmitting}
            >
              {isSignUp ? "Create Account" : "Sign In"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-dark-200 text-light-100/60">Or continue with</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center"
                onClick={handleGoogleSignIn}
              >
                <Google className="mr-2 h-4 w-4" />
                Google
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center"
                onClick={handleAppleSignIn}
              >
                <Apple className="mr-2 h-4 w-4" />
                Apple
              </Button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p>
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <a
                href={isSignUp ? "/auth" : "/auth?signup=true"}
                className="text-primary hover:underline"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
