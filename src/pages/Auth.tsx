
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Button from "../components/Button";

type AuthMode = "signin" | "signup";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/dashboard");
      }
    };
    
    checkUser();
  }, [navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        toast.success("Successfully signed in!");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: displayName,
            },
          },
        });
        
        if (error) throw error;
        toast.success("Account created successfully!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-dark-200">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gradient">MelodyAligner</span>
          </Link>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 rounded-xl">
            <h1 className="text-2xl font-bold mb-6 text-center">
              {mode === "signin" ? "Welcome Back" : "Create Your Account"}
            </h1>
            
            <div className="mb-6">
              <div className="flex rounded-md overflow-hidden">
                <button
                  className={`flex-1 py-3 text-center transition-colors ${
                    mode === "signin"
                      ? "bg-primary text-white"
                      : "bg-dark-300 text-light-100/60 hover:text-light-100"
                  }`}
                  onClick={() => setMode("signin")}
                >
                  Sign In
                </button>
                <button
                  className={`flex-1 py-3 text-center transition-colors ${
                    mode === "signup"
                      ? "bg-primary text-white"
                      : "bg-dark-300 text-light-100/60 hover:text-light-100"
                  }`}
                  onClick={() => setMode("signup")}
                >
                  Sign Up
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-100/40">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-dark-300 border border-white/10 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-primary"
                      placeholder="Your display name"
                      required={mode === "signup"}
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-100/40">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-dark-300 border border-white/10 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-primary"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-100/40">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-dark-300 border border-white/10 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-primary"
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              
              {mode === "signin" && (
                <div className="text-right">
                  <a href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
              )}
              
              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                disabled={loading}
                isLoading={loading}
              >
                {mode === "signin" ? "Sign In" : "Create Account"}
                <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
