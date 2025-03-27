
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Play, Music, Headphones, BarChart3, Download, Sparkles } from "lucide-react";
import Button from "./Button";
import SubscriptionPlansSection from "./SubscriptionPlansSection";
import FeatureCard from "./FeatureCard";
import Logo from "./Logo";

const LandingPage = () => {
  const [showFeatures, setShowFeatures] = useState(false);
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate("/auth");
  };
  
  return (
    <div className="min-h-screen bg-dark-200 text-light-100 flex flex-col">
      {/* Hero Section */}
      <header className="relative bg-dark-300 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[15%] -left-[10%] w-[70%] h-[60%] rounded-full bg-primary/5 blur-[120px]"></div>
          <div className="absolute -bottom-[15%] -right-[10%] w-[70%] h-[60%] rounded-full bg-accent-purple/5 blur-[120px]"></div>
        </div>
        
        {/* Navigation */}
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center relative z-10">
          <Logo size="large" />
          
          <div className="flex gap-2 sm:gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/auth")}
            >
              Log In
            </Button>
            <Button
              variant="gradient"
              onClick={handleGetStarted}
            >
              Sign Up
            </Button>
          </div>
        </nav>
        
        {/* Hero Content */}
        <div className="container mx-auto px-4 py-16 sm:py-24 flex flex-col items-center text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-purple">
            Unlock Your Musical Potential
          </h1>
          
          <p className="text-xl text-light-100/70 max-w-2xl mb-10">
            MeloLift is your all-in-one platform for creating, mixing, and sharing professional-quality music. From studio recording to publishing, we've got you covered.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button
              variant="gradient"
              size="lg"
              onClick={handleGetStarted}
              className="px-8"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="px-8"
              onClick={() => setShowFeatures(true)}
            >
              See Features <Play className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          {/* App Screenshot/Preview */}
          <div className="w-full max-w-5xl mx-auto overflow-hidden rounded-lg border border-white/10 shadow-2xl">
            <div className="relative bg-dark-100 aspect-video rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-dark-200/90 via-dark-300/80 to-dark-400/90 flex items-center justify-center">
                <div className="text-center p-8">
                  <h3 className="text-2xl font-bold mb-4">Experience MeloLift</h3>
                  <p className="mb-6">Create, mix, and share your music with our intuitive tools</p>
                  <Button 
                    variant="gradient" 
                    onClick={handleGetStarted}
                  >
                    Start Creating Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features wave divider */}
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
            <path
              fill="#1A1F2C"
              fillOpacity="1"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
            ></path>
          </svg>
        </div>
      </header>
      
      {/* Features Section */}
      <section id="features" className="py-16 bg-dark-200">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Musicians</h2>
            <p className="text-light-100/70">
              MeloLift provides everything you need to create professional music from start to finish.
              Our intuitive tools make it easy to bring your ideas to life.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Music className="h-6 w-6" />}
              title="Studio Recording"
              description="Record vocals and instruments with professional-grade audio tools."
            />
            
            <FeatureCard
              icon={<Headphones className="h-6 w-6" />}
              title="Advanced Mixing"
              description="Mix your tracks with our powerful console featuring EQ, compression, and effects."
            />
            
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Audio Analysis"
              description="Get detailed insights into your audio with visual analysis tools."
            />
            
            <FeatureCard
              icon={<Download className="h-6 w-6" />}
              title="Multiple Export Formats"
              description="Export your music in various formats including MP3, WAV, and FLAC."
            />
            
            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              title="GroovePad Creation"
              description="Create custom beats and loops with our intuitive GroovePad interface."
            />
            
            <FeatureCard
              icon={<ArrowRight className="h-6 w-6" />}
              title="One-Click Publishing"
              description="Share your music directly to popular platforms with a single click."
            />
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-dark-300">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How MeloLift Works</h2>
            <p className="text-light-100/70">
              Our streamlined workflow helps you go from concept to finished track in no time.
              Follow these simple steps to create professional music.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="glass-card p-6 relative">
              <div className="absolute -top-4 -left-4 bg-primary text-dark-300 h-10 w-10 rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-bold mb-4 mt-2">Record</h3>
              <p className="text-light-100/70 mb-4">
                Record your vocals or upload existing audio tracks to get started.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>High-quality audio recording</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Import from your library</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Access premium beats</span>
                </li>
              </ul>
            </div>
            
            <div className="glass-card p-6 relative">
              <div className="absolute -top-4 -left-4 bg-primary text-dark-300 h-10 w-10 rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-bold mb-4 mt-2">Mix</h3>
              <p className="text-light-100/70 mb-4">
                Use our powerful mixing tools to perfect your sound.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Professional mixing console</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Advanced effects library</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Real-time audio preview</span>
                </li>
              </ul>
            </div>
            
            <div className="glass-card p-6 relative">
              <div className="absolute -top-4 -left-4 bg-primary text-dark-300 h-10 w-10 rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-bold mb-4 mt-2">Share</h3>
              <p className="text-light-100/70 mb-4">
                Export your finished track and share it with the world.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Multiple export formats</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>One-click social sharing</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Direct platform integration</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing/Subscription Plans */}
      <SubscriptionPlansSection />
      
      {/* Testimonials/Social Proof */}
      <section className="py-16 bg-dark-300">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Musicians Love MeloLift</h2>
            <p className="text-light-100/70">
              Don't just take our word for it. See what artists are saying about MeloLift.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="glass-card p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/30 flex items-center justify-center text-xl font-bold mr-3">
                  J
                </div>
                <div>
                  <h4 className="font-semibold">Jamie Edwards</h4>
                  <p className="text-sm text-light-100/60">Indie Artist</p>
                </div>
              </div>
              <p className="text-light-100/80">
                "MeloLift transformed my home recordings into professional-sounding tracks. The mixing tools are intuitive yet powerful."
              </p>
            </div>
            
            <div className="glass-card p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-accent-purple/30 flex items-center justify-center text-xl font-bold mr-3">
                  S
                </div>
                <div>
                  <h4 className="font-semibold">Sofia Chen</h4>
                  <p className="text-sm text-light-100/60">Producer</p>
                </div>
              </div>
              <p className="text-light-100/80">
                "As a producer, I need reliable tools that don't get in the way of creativity. MeloLift delivers exactly that with its clean interface and powerful features."
              </p>
            </div>
            
            <div className="glass-card p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/30 flex items-center justify-center text-xl font-bold mr-3">
                  M
                </div>
                <div>
                  <h4 className="font-semibold">Marcus Johnson</h4>
                  <p className="text-sm text-light-100/60">Singer-Songwriter</p>
                </div>
              </div>
              <p className="text-light-100/80">
                "I've tried numerous music production apps, but MeloLift stands out for its simplicity and professional results. It's now an essential part of my workflow."
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/20 to-accent-purple/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Create Amazing Music?</h2>
          <p className="text-xl text-light-100/70 max-w-2xl mx-auto mb-8">
            Join thousands of musicians who trust MeloLift for their music production needs.
            Get started today and elevate your sound.
          </p>
          
          <Button
            variant="gradient"
            size="lg"
            onClick={handleGetStarted}
            className="px-8"
          >
            Start Your Musical Journey <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-dark-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo />
              <p className="mt-4 text-light-100/60">
                Elevate your music production with our professional tools and features.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Features</h3>
              <ul className="space-y-2 text-light-100/60">
                <li><Link to="/" className="hover:text-primary transition-colors">Studio Recording</Link></li>
                <li><Link to="/" className="hover:text-primary transition-colors">Mixing Console</Link></li>
                <li><Link to="/" className="hover:text-primary transition-colors">GroovePad</Link></li>
                <li><Link to="/" className="hover:text-primary transition-colors">Export Options</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-light-100/60">
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Connect</h3>
              <ul className="space-y-2 text-light-100/60">
                <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">YouTube</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Discord</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-white/10 text-center text-light-100/40 text-sm">
            <p>© {new Date().getFullYear()} MeloLift. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* Features Modal */}
      {showFeatures && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-300 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">MeloLift Features</h2>
                <button 
                  onClick={() => setShowFeatures(false)}
                  className="p-2 hover:bg-dark-200 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Recording Studio</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Professional vocal recording with noise reduction</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Multi-track recording capabilities</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Import audio from various sources</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Mixing Console</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Professional EQ controls</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Dynamic compression</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Reverb, delay, and other effects</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Real-time visualization</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">GroovePad</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Beat creation with customizable samples</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Loop recording and layering</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Tempo and time signature controls</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Export & Share</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Export in MP3, WAV, and FLAC formats</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Direct sharing to social platforms</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>Cloud storage for projects</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Premium Features</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-accent-purple mr-2 mt-0.5 flex-shrink-0" />
                      <span>AI-assisted mixing and mastering</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-accent-purple mr-2 mt-0.5 flex-shrink-0" />
                      <span>Advanced audio restoration tools</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-accent-purple mr-2 mt-0.5 flex-shrink-0" />
                      <span>Expanded sample library</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-accent-purple mr-2 mt-0.5 flex-shrink-0" />
                      <span>Priority cloud rendering</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10 flex justify-center">
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={() => {
                    setShowFeatures(false);
                    handleGetStarted();
                  }}
                >
                  Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
