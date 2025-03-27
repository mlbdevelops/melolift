import React from "react";
import { Link } from "react-router-dom";
import { Music, Mic, Sliders, Download, FileAudio, Share2, Check } from "lucide-react";
import Button from "./Button";

const HeroSection = () => (
  <section className="py-24 text-center relative">
    <div className="container mx-auto">
      <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent">
        Unleash Your Musical Potential with MeloLift
      </h1>
      <p className="text-light-100/70 text-xl mb-8 max-w-2xl mx-auto">
        Create, mix, and master your music with ease. MeloLift provides all the tools you need to bring your musical vision to life.
      </p>
      <div className="flex justify-center gap-4">
        <Link to="/auth?signup=true">
          <Button variant="gradient" size="lg">
            Start Creating
          </Button>
        </Link>
        <Link to="#features">
          <Button variant="outline" size="lg" className="mt-4">
            See Features
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

const FeaturesSection = () => (
  <section id="features" className="py-20 relative">
    <div className="container mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Key Features</h2>
        <p className="text-light-100/70 text-xl max-w-2xl mx-auto">
          Explore the powerful features that make MeloLift the ultimate music creation platform.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard
          icon={<Music className="h-6 w-6" />}
          title="AI-Powered Mixing"
          description="Automatically balance and enhance your tracks with our intelligent mixing algorithms."
        />
        <FeatureCard
          icon={<Mic className="h-6 w-6" />}
          title="Vocal Recording"
          description="Record high-quality vocals directly in your browser with real-time monitoring."
        />
        <FeatureCard
          icon={<Sliders className="h-6 w-6" />}
          title="Advanced Effects"
          description="Add depth and character to your music with a wide range of professional effects."
        />
        <FeatureCard
          icon={<Download className="h-6 w-6" />}
          title="Export in High Quality"
          description="Download your finished tracks in various formats, including WAV and MP3."
        />
        <FeatureCard
          icon={<FileAudio className="h-6 w-6" />}
          title="Instrumental Selection"
          description="Choose from a vast library of instrumentals to create the perfect backing track."
        />
        <FeatureCard
          icon={<Share2 className="h-6 w-6" />}
          title="Share Your Music"
          description="Easily share your creations with the world on social media and streaming platforms."
        />
      </div>
    </div>
  </section>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="glass-card p-6">
    <div className="mb-4 text-primary">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-light-100/70">{description}</p>
  </div>
);

const PricingSection = () => (
  <section id="pricing" className="py-20 relative">
    <div className="container mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Subscription Plans</h2>
        <p className="text-light-100/70 text-xl max-w-2xl mx-auto">
          Choose the plan that fits your needs. Start creating for free, or upgrade for more features.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PricingCard
          title="Free"
          price="0"
          features={[
            "Basic mixing tools",
            "Limited instrumental library",
            "Standard quality exports",
            "5 projects"
          ]}
          buttonText="Get Started"
          isPopular={false}
        />
        <PricingCard
          title="Pro"
          price="9.99"
          features={[
            "Advanced mixing tools",
            "Expanded instrumental library",
            "High-quality exports",
            "20 projects",
            "Priority support"
          ]}
          buttonText="Upgrade to Pro"
          isPopular={true}
        />
        <PricingCard
          title="Premium"
          price="19.99"
          features={[
            "All Pro features",
            "Unlimited projects",
            "Exclusive effects",
            "Custom presets",
            "FLAC exports"
          ]}
          buttonText="Go Premium"
          isPopular={false}
        />
      </div>
    </div>
  </section>
);

const PricingCard = ({ title, price, features, buttonText, isPopular }: { title: string; price: string; features: string[]; buttonText: string; isPopular: boolean }) => (
  <div className={`glass-card p-6 relative overflow-hidden ${isPopular ? 'border-2 border-primary' : ''}`}>
    {isPopular && (
      <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-medium">
        Popular
      </div>
    )}
    <h3 className="text-2xl font-semibold mb-4">{title}</h3>
    <div className="text-center mb-6">
      <span className="text-4xl font-bold">${price}</span>
      <span className="text-light-100/50">/month</span>
    </div>
    <ul className="space-y-3 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <Check className="h-4 w-4 mr-2 text-primary" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <Link to="/auth?signup=true">
      <Button variant={isPopular ? 'gradient' : 'outline'} className="w-full">
        {buttonText}
      </Button>
    </Link>
  </div>
);

const LandingPage = () => (
  <div>
    <HeroSection />
    <FeaturesSection />
    <PricingSection />
  </div>
);

export default LandingPage;
