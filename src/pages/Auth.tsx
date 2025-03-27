import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Apple } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../components/Logo";
import { Google } from "lucide-react";

const Auth = () => {
  const [type, setType] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === "signup" && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setLoading(true);
    
    try {
      if (type === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Logged in successfully");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Signed up successfully. Check your email to verify.");
      }
      
      // Redirect to dashboard after successful login/signup
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };
  
  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
      });
      if (error) throw error;
    } catch (error: any) {
      console.error(`OAuth sign-in with ${provider} error:`, error);
      toast.error(error.message || `Failed to sign in with ${provider}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error: any) {
      console.error("Sign-out error:", error);
      toast.error(error.message || "Failed to sign out");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-dark-200 text-light-100 flex items-center justify-center">
      <div className="glass-card w-full max-w-md p-8 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <Logo />
          <h2 className="text-2xl font-bold mt-4">
            {type === "login" ? "Login" : "Sign Up"}
          </h2>
        </div>
        
        <form onSubmit={handleAuthAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-100">
              Email
            </label>
            <div className="relative mt-1">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-dark-300 border border-dark-100 text-light-100 focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
              <Mail className="absolute top-1/2 right-3 -translate-y-1/2 h-5 w-5 text-light-100/50" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-light-100">
              Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-dark-300 border border-dark-100 text-light-100 focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
              <Lock className="absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-light-100/50" />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 focus:outline-none"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-light-100/50 cursor-pointer" />
                ) : (
                  <Eye className="h-5 w-5 text-light-100/50 cursor-pointer" />
                )}
              </button>
            </div>
          </div>
          
          {type === "signup" && (
            <div>
              <label className="block text-sm font-medium text-light-100">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-dark-300 border border-dark-100 text-light-100 focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
                <Lock className="absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-light-100/50" />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 focus:outline-none"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-light-100/50 cursor-pointer" />
                  ) : (
                    <Eye className="h-5 w-5 text-light-100/50 cursor-pointer" />
                  )}
                </button>
              </div>
            </div>
          )}
          
          <div>
            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              isLoading={loading}
            >
              {type === "login" ? "Login" : "Sign Up"}
            </Button>
          </div>
        </form>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="border-t border-dark-100 w-5/12"></div>
          <p className="text-light-100/70 text-center w-2/12">or</p>
          <div className="border-t border-dark-100 w-5/12"></div>
        </div>
        
        <div className="mt-6 space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthSignIn("google")}
            disabled={loading}
          >
            <Google className="w-5 h-5 mr-2" />
            Continue with Google
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthSignIn("apple")}
            disabled={loading}
          >
            <Apple className="w-5 h-5 mr-2" />
            Continue with Apple
          </Button>
        </div>
        
        <div className="mt-8 text-sm text-light-100/70 text-center">
          {type === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setType("signup")}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setType("login")}
              >
                Login
              </button>
            </>
          )}
        </div>
        
        <div className="mt-4 text-sm text-light-100/60 text-center">
          <button
            type="button"
            className="text-red-500 hover:underline"
            onClick={handleSignOut}
            disabled={loading}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
