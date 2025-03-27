import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../components/Logo";
import { Mail, Lock, LogIn, UserPlus, AlertCircle } from "lucide-react";
import Button from "../components/Button";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signUp, signIn, signInWithGoogle } = useAuth();
  
  useEffect(() => {
    // Clear error after 5 seconds
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success("Logged in successfully!");
        navigate("/dashboard");
      } else {
        await signUp(email, password);
        toast.success("Account created successfully!");
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
      toast.success("Logged in with Google successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-200">
      <div className="glass-card w-full max-w-md p-6 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <Logo />
          <h2 className="text-2xl font-bold text-light-100 mt-4">
            {isLogin ? "Login" : "Sign Up"}
          </h2>
        </div>
        
        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive rounded-md p-4 mb-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-light-100 text-sm font-medium mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-light-100/60" />
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-dark-300 border border-white/10 rounded-lg text-light-100 focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-light-100 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-light-100/60" />
              <input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-dark-300 border border-white/10 rounded-lg text-light-100 focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            isLoading={loading}
          >
            {isLogin ? (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Create an account" : "Already have an account?"}
          </button>
          
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
