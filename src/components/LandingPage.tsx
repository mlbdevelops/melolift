
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Music, Wand2, Sliders, Mic, Headphones, BarChart2, Check } from 'lucide-react';
import Button from './Button';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import SubscriptionPlansSection from './SubscriptionPlansSection';

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
        <SubscriptionPlansSection />
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
