
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Music, Settings, User, Menu, X, LogOut } from "lucide-react";
import Button from "./Button";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isHomePage = location.pathname === "/";

  const navLinks = [
    { name: "Studio", path: "/studio", icon: <Music className="h-5 w-5" /> },
    { name: "Profile", path: "/profile", icon: <User className="h-5 w-5" /> },
    { name: "Settings", path: "/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  const handleLogout = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled || !isHomePage
          ? "py-4 backdrop-blur-xl bg-dark-100/80 border-b border-white/5"
          : "py-6 bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xl font-bold text-gradient"
          >
            <Music className="h-8 w-8" />
            <span>MelodyAligner</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md transition-all",
                      location.pathname === link.path
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/80 hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                ))}
                
                <div className="flex items-center gap-3 ml-2">
                  <div className="flex flex-col items-end">
                    <span className="font-medium">
                      {profile?.display_name || "User"}
                    </span>
                    <Link to="/subscription" className="text-xs text-primary hover:underline">
                      Manage Subscription
                    </Link>
                  </div>
                  
                  <button 
                    onClick={handleLogout}
                    className="text-light-100/70 hover:text-light-100 p-2 rounded-full hover:bg-white/5 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              isHomePage ? (
                <>
                  <Link to="/auth">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                  <Link to="/auth">
                    <Button>Get Started</Button>
                  </Link>
                </>
              ) : (
                <Link to="/auth">
                  <Button>Sign In</Button>
                </Link>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white hover:text-primary transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-morphism mt-4 mx-4 rounded-xl overflow-hidden animate-fade-in">
          <div className="flex flex-col py-4">
            {user ? (
              <>
                <div className="px-6 py-4 border-b border-white/10 mb-2">
                  <div className="font-medium text-lg">
                    {profile?.display_name || "User"}
                  </div>
                  <Link 
                    to="/subscription" 
                    className="text-sm text-primary hover:underline"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Manage Subscription
                  </Link>
                </div>
                
                {navLinks.map((link, index) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={cn(
                      "flex items-center gap-2 px-6 py-4 transition-all",
                      location.pathname === link.path
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/80 hover:text-foreground hover:bg-white/5"
                    )}
                    style={{ animationDelay: `${(index + 1) * 50}ms` }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                ))}
                
                <button
                  className="flex items-center gap-2 px-6 py-4 text-left text-foreground/80 hover:text-foreground hover:bg-white/5 transition-all mt-2 border-t border-white/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="px-4 py-3">
                <Link 
                  to="/auth" 
                  className="block mb-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button className="w-full">Sign In</Button>
                </Link>
                
                <Link 
                  to="/auth?mode=signup" 
                  className="block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button variant="outline" className="w-full">Create Account</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
