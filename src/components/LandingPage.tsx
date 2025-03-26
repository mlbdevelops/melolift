import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Music, Wand2, Sliders, Mic, Headphones, BarChart2, Check } from 'lucide-react';
import Button from './Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  features: string[];
}

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .order("price", { ascending: true });
          
        if (error) throw error;
        
        const formattedPlans = data.map(plan => {
          // Handle features safely as an array
          let featuresArray: string[] = [];
          
          // Parse features from the JSON
          if (plan.features) {
            if (typeof plan.features === 'string') {
              try {
                const parsed = JSON.parse(plan.features);
                featuresArray = parsed.features || [];
              } catch {
                featuresArray = [];
              }
            } else if (typeof plan.features === 'object') {
              featuresArray = plan.features.features || [];
            }
          }
          
          return {
            ...plan,
            features: featuresArray
          };
        });
        
        setPlans(formattedPlans);
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, []);
  
  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };
  
  const handleSubscribe = () => {
    navigate('/subscription');
  };

  return (
    <div className="min-h-screen bg-dark-200 text-light-100">
      {/* Navigation */}
      <nav className="py-4 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Music className="h-8 w-8 text-primary mr-2" />
          <span className="text-xl font-bold">VocalStudio</span>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <Button variant="gradient" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Log In
              </Button>
              <Button variant="gradient" onClick={() => navigate('/auth?signup=true')}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent-purple text-transparent bg-clip-text">
            Transform Your Vocals with AI
          </h1>
          
          <p className="text-xl md:text-2xl text-light-100/70 mb-10 max-w-3xl mx-auto">
            Professional vocal processing and mixing in your browser.
            No complex software needed.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="gradient" onClick={handleGetStarted}>
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button size="lg" variant="outline" onClick={() => navigate('#features')}>
              See Features
            </Button>
          </div>
          
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-dark-200 to-transparent z-10 pointer-events-none" />
            <img 
              src="/app-preview.png" 
              alt="VocalStudio Interface" 
              className="rounded-lg shadow-2xl border border-white/10 mx-auto"
            />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-6 bg-dark-100" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-light-100/70 max-w-3xl mx-auto">
              Everything you need to create professional-quality vocals, all in one place.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card p-6">
              <Wand2 className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">AI Vocal Processing</h3>
              <p className="text-light-100/70">
                Our AI automatically enhances your vocals with professional-grade processing.
              </p>
            </div>
            
            <div className="glass-card p-6">
              <Sliders className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Advanced Mixing</h3>
              <p className="text-light-100/70">
                Fine-tune your mix with intuitive controls for reverb, delay, EQ, and more.
              </p>
            </div>
            
            <div className="glass-card p-6">
              <Mic className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">In-Browser Recording</h3>
              <p className="text-light-100/70">
                Record vocals directly in your browser with low-latency monitoring.
              </p>
            </div>
            
            <div className="glass-card p-6">
              <Headphones className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Beat Matching</h3>
              <p className="text-light-100/70">
                Automatically align your vocals with any instrumental track.
              </p>
            </div>
            
            <div className="glass-card p-6">
              <BarChart2 className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Real-time Visualization</h3>
              <p className="text-light-100/70">
                See your audio with beautiful waveforms and spectral displays.
              </p>
            </div>
            
            <div className="glass-card p-6">
              <Music className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">GroovePad</h3>
              <p className="text-light-100/70">
                Adjust the mood and energy of your mix with our intuitive GroovePad.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="py-16 bg-dark-200" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-light-100/70">
              Unlock premium features to take your music production to the next level.
              Choose the plan that best suits your needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const isPro = plan.name === "Pro";
              const isPremium = plan.name === "Premium";
              
              return (
                <div
                  key={plan.id}
                  className={`glass-card relative overflow-hidden rounded-xl ${
                    isPro ? "border-primary/50 border-2" : ""
                  } ${isPremium ? "border-accent-gold/50 border-2" : ""}`}
                >
                  {isPro && (
                    <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-medium">
                      Popular
                    </div>
                  )}
                  {isPremium && (
                    <div className="absolute top-0 right-0 bg-accent-gold text-white px-4 py-1 text-sm font-medium">
                      Best Value
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-light-100/70 mb-4">{plan.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-3xl font-bold">
                        ${plan.price === 0 ? "0" : plan.price.toFixed(2)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-light-100/50 ml-1">/month</span>
                      )}
                    </div>
                    
                    <div className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      variant={isPro || isPremium ? "gradient" : "default"}
                      className="w-full"
                      onClick={handleSubscribe}
                    >
                      {plan.price === 0 ? "Get Started" : "Subscribe"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Sound?</h2>
          <p className="text-xl text-light-100/70 mb-10 max-w-3xl mx-auto">
            Join thousands of musicians who are creating professional-quality vocals with VocalStudio.
          </p>
          
          <Button size="lg" variant="gradient" onClick={handleGetStarted}>
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 px-6 bg-dark-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <Music className="h-6 w-6 text-primary mr-2" />
              <span className="text-lg font-bold">VocalStudio</span>
            </div>
            
            <div className="flex flex-wrap gap-6 text-light-100/70">
              <a href="#features" className="hover:text-primary transition-colors">Features</a>
              <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-light-100/50 text-sm">
            &copy; {new Date().getFullYear()} VocalStudio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
