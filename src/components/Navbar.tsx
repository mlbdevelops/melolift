
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Music, Settings, User, LogOut, HelpCircle, Languages } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Button from "./Button";
import { toast } from "sonner";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [language, setLanguage] = useState("English");
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Error signing out");
    }
  };
  
  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    toast.info(`Language set to ${lang}`);
    setIsDropdownOpen(false);
  };
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false);
  }, [location]);
  
  const isLandingPage = location.pathname === "/" || location.pathname === "/landing";
  
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isLandingPage
          ? "bg-dark-300/80 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent">
              MeloLift
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link to="/studio">
                  <Button variant="ghost">Studio</Button>
                </Link>
                <Link to="/groovepad">
                  <Button variant="ghost">GroovePad</Button>
                </Link>
                
                <div className="relative ml-2">
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <User className="h-5 w-5 text-primary" />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-dark-300 border border-white/10 py-1 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm hover:bg-white/5 flex items-center"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm hover:bg-white/5 flex items-center"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <Link
                        to="/subscription"
                        className="block px-4 py-2 text-sm hover:bg-white/5 flex items-center"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Music className="h-4 w-4 mr-2" />
                        Subscription
                      </Link>
                      <div className="relative">
                        <button
                          className="w-full text-left block px-4 py-2 text-sm hover:bg-white/5 flex items-center"
                        >
                          <Languages className="h-4 w-4 mr-2" />
                          {language}
                        </button>
                        <div className="absolute left-full top-0 w-48 rounded-md shadow-lg bg-dark-300 border border-white/10 py-1 z-50 -mt-2">
                          <button
                            className="w-full text-left block px-4 py-2 text-sm hover:bg-white/5"
                            onClick={() => changeLanguage("English")}
                          >
                            English
                          </button>
                          <button
                            className="w-full text-left block px-4 py-2 text-sm hover:bg-white/5"
                            onClick={() => changeLanguage("Français")}
                          >
                            Français
                          </button>
                          <button
                            className="w-full text-left block px-4 py-2 text-sm hover:bg-white/5"
                            onClick={() => changeLanguage("Español")}
                          >
                            Español
                          </button>
                          <button
                            className="w-full text-left block px-4 py-2 text-sm hover:bg-white/5"
                            onClick={() => changeLanguage("Deutsch")}
                          >
                            Deutsch
                          </button>
                        </div>
                      </div>
                      <div className="border-t border-white/10 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/">
                  <Button variant="ghost">Home</Button>
                </Link>
                <Link to="/#features">
                  <Button variant="ghost">Features</Button>
                </Link>
                <Link to="/#pricing">
                  <Button variant="ghost">Pricing</Button>
                </Link>
                <Link to="/auth">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link to="/auth?signup=true">
                  <Button variant="gradient">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-light-100 hover:bg-white/5"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden h-screen bg-dark-300">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {user ? (
              <>
                <Link to="/dashboard" className="p-2 hover:bg-white/5 rounded flex items-center">
                  <span className="ml-2">Dashboard</span>
                </Link>
                <Link to="/studio" className="p-2 hover:bg-white/5 rounded flex items-center">
                  <span className="ml-2">Studio</span>
                </Link>
                <Link to="/groovepad" className="p-2 hover:bg-white/5 rounded flex items-center">
                  <span className="ml-2">GroovePad</span>
                </Link>
                <Link to="/profile" className="p-2 hover:bg-white/5 rounded flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  <span>Profile</span>
                </Link>
                <Link to="/settings" className="p-2 hover:bg-white/5 rounded flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  <span>Settings</span>
                </Link>
                <Link to="/subscription" className="p-2 hover:bg-white/5 rounded flex items-center">
                  <Music className="h-5 w-5 mr-2" />
                  <span>Subscription</span>
                </Link>
                <div className="p-2 hover:bg-white/5 rounded flex items-center">
                  <Languages className="h-5 w-5 mr-2" />
                  <select 
                    className="bg-transparent w-full"
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value)}
                  >
                    <option value="English">English</option>
                    <option value="Français">Français</option>
                    <option value="Español">Español</option>
                    <option value="Deutsch">Deutsch</option>
                  </select>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 hover:bg-white/5 rounded flex items-center text-red-400"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/" className="p-2 hover:bg-white/5 rounded">
                  Home
                </Link>
                <Link to="/#features" className="p-2 hover:bg-white/5 rounded">
                  Features
                </Link>
                <Link to="/#pricing" className="p-2 hover:bg-white/5 rounded">
                  Pricing
                </Link>
                <Link to="/auth" className="p-2 hover:bg-white/5 rounded">
                  Log In
                </Link>
                <Link to="/auth?signup=true">
                  <Button variant="gradient" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
