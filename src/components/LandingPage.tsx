
import { ArrowRight, Mic, Music, Sliders, Users, BarChart, Download, Check, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "./Button";
import FeatureCard from "./FeatureCard";
import AudioVisualizer from "./AudioVisualizer";
import { useAuth } from "../contexts/AuthContext";

const PricingTier = ({ 
  name, 
  price, 
  features, 
  isPopular = false,
  isPremium = false 
}: { 
  name: string; 
  price: number; 
  features: string[]; 
  isPopular?: boolean;
  isPremium?: boolean;
}) => {
  const { user } = useAuth();
  
  return (
    <div 
      className={`glass-card p-6 rounded-xl relative ${
        isPopular ? "border-2 border-primary/30" : ""
      } ${
        isPremium ? "border-2 border-yellow-500/30" : ""
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-medium translate-y-[-50%] rounded-full">
          Popular
        </div>
      )}
      
      {isPremium && (
        <div className="absolute top-0 right-0 bg-yellow-500 text-white px-4 py-1 text-sm font-medium translate-y-[-50%] rounded-full">
          Best Value
        </div>
      )}
      
      <h3 className="text-xl font-bold mb-2">{name}</h3>
      
      <div className="mb-4">
        <span className="text-3xl font-bold">
          ${price.toFixed(2)}
        </span>
        {price > 0 && (
          <span className="text-light-100/50 ml-1">/month</span>
        )}
      </div>
      
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <Link to={user ? "/subscription" : "/auth"}>
        <Button
          variant={isPopular || isPremium ? "gradient" : "outline"}
          className="w-full"
        >
          {user ? "Choose Plan" : "Sign Up"}
        </Button>
      </Link>
    </div>
  );
};

const LandingPage = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-accent-blue/20 via-transparent to-transparent opacity-30" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 opacity-0 animate-fade-in">
                <span className="text-gradient">AI-Powered</span> Vocal <br /> Alignment Studio
              </h1>
              
              <p className="text-xl text-light-100/70 mb-8 max-w-2xl mx-auto lg:mx-0 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
                Create professional-sounding music by letting our AI perfectly align your vocals 
                with instrumentals, match pitch and tempo, and create harmonies.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
                <Link to={user ? "/studio" : "/auth"}>
                  <Button size="lg" variant="gradient" className="shadow-button-glow">
                    Start Creating <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                
                <Link to={user ? "/dashboard" : "/auth"}>
                  <Button size="lg" variant="outline">
                    Explore Features
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex-1 opacity-0 animate-fade-in" style={{ animationDelay: "600ms" }}>
              <div className="relative">
                <div className="glass-card rounded-2xl h-72 overflow-hidden">
                  <AudioVisualizer isPlaying={true} />
                </div>
                
                <div className="absolute top-4 left-4 glass-morphism rounded-lg px-3 py-2 text-sm animate-pulse-subtle">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>AI Processing Vocals</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-dark-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Key Features</h2>
          <p className="text-light-100/70 text-center mb-12 max-w-2xl mx-auto">
            Our powerful AI technology analyzes and adjusts your vocals to create perfect harmony with instrumentals.
          </p>
          
          <div className="content-grid">
            <FeatureCard
              title="Vocal Recording & Upload"
              description="Record vocals directly in the browser or upload existing audio files for processing."
              icon={<Mic className="h-6 w-6" />}
              delay={100}
            />
            
            <FeatureCard
              title="Instrumental Library"
              description="Browse and select from a variety of instrumentals or upload your own backing tracks."
              icon={<Music className="h-6 w-6" />}
              delay={200}
            />
            
            <FeatureCard
              title="AI Vocal Alignment"
              description="Our AI automatically aligns your vocals with the instrumental, adjusting timing and pitch."
              icon={<BarChart className="h-6 w-6" />}
              delay={300}
            />
            
            <FeatureCard
              title="Advanced Mixing Console"
              description="Fine-tune your mix with professional audio controls for the perfect sound."
              icon={<Sliders className="h-6 w-6" />}
              delay={400}
            />
            
            <FeatureCard
              title="Harmonic Layering"
              description="Add AI-generated harmonies that complement your vocal performance."
              icon={<Users className="h-6 w-6" />}
              delay={500}
            />
            
            <FeatureCard
              title="Export & Share"
              description="Download your finished tracks in high quality or share them directly."
              icon={<Download className="h-6 w-6" />}
              delay={600}
            />
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-light-100/70 text-center mb-12 max-w-2xl mx-auto">
            Create professional-sounding music in just a few simple steps.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Record or Upload</h3>
              <p className="text-light-100/70">
                Record your vocals directly in the app or upload an existing audio file.
              </p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Select Instrumental</h3>
              <p className="text-light-100/70">
                Choose from our library of instrumentals or upload your own backing track.
              </p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Alignment</h3>
              <p className="text-light-100/70">
                Our AI will automatically align your vocals with the instrumental for a perfect match.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link to={user ? "/studio" : "/auth"}>
              <Button size="lg" variant="gradient">
                Start Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="py-20 bg-dark-100" id="pricing">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Choose Your Plan</h2>
          <p className="text-light-100/70 text-center mb-12 max-w-2xl mx-auto">
            Select the perfect plan for your music production needs. Upgrade anytime.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingTier
              name="Free"
              price={0}
              features={[
                "Basic vocal alignment",
                "Up to 5 projects",
                "Standard audio quality",
                "Basic mixing tools",
                "Manual processing"
              ]}
            />
            
            <PricingTier
              name="Pro"
              price={9.99}
              features={[
                "Advanced vocal alignment",
                "Unlimited projects",
                "High-quality audio",
                "Advanced mixing tools",
                "AI suggestions",
                "Noise reduction",
                "Extended groove pad"
              ]}
              isPopular
            />
            
            <PricingTier
              name="Premium"
              price={19.99}
              features={[
                "Professional vocal alignment",
                "Unlimited projects",
                "Studio-quality audio",
                "Professional mixing console",
                "Priority AI processing",
                "Advanced noise reduction",
                "Full mixing suite",
                "Mix exporting in multiple formats",
                "Priority support"
              ]}
              isPremium
            />
          </div>
        </div>
      </section>
      
      {/* Testimonial/CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Music?</h2>
            <p className="text-xl text-light-100/70 mb-8">
              Join thousands of musicians who are already using MelodyAligner to create professional-quality tracks.
            </p>
            
            <Link to={user ? "/dashboard" : "/auth"}>
              <Button size="lg" variant="gradient" className="shadow-button-glow">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
