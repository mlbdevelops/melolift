
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Music, Mic, Sliders, Sparkles, Play, Pause } from "lucide-react";
import Button from "./Button";
import Logo from "./Logo";
import { useAuth } from "../contexts/AuthContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  
  const features = [
    {
      title: "Record & Upload",
      description: "Record vocals directly in your browser or upload existing tracks",
      icon: <Mic className="h-6 w-6 text-primary" />
    },
    {
      title: "AI-Powered Mixing",
      description: "Our AI automatically enhances your vocals and matches them to the beat",
      icon: <Sparkles className="h-6 w-6 text-primary" />
    },
    {
      title: "Professional Controls",
      description: "Fine-tune your mix with studio-quality effects and parameters",
      icon: <Sliders className="h-6 w-6 text-primary" />
    },
    {
      title: "Extensive Library",
      description: "Choose from hundreds of instrumentals across various genres",
      icon: <Music className="h-6 w-6 text-primary" />
    }
  ];
  
  useEffect(() => {
    // Auto-rotate features
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [features.length]);
  
  const handlePlayDemo = () => {
    setIsPlaying(!isPlaying);
    // In a real app, this would play an audio demo
  };
  
  const handleGetStarted = () => {
    if (user) {
      navigate("/studio");
    } else {
      navigate("/auth");
    }
  };
  
  return (
    <div className="min-h-screen bg-dark-200 text-light-100 overflow-hidden">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Logo size="large" />
        
        <div className="flex items-center gap-4">
          {user ? (
            <Button onClick={() => navigate("/dashboard")}>
              Your Dashboard
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
              <Button onClick={() => navigate("/auth?signup=true")}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Transform Your Vocals with <span className="text-gradient">AI-Powered</span> Mixing
            </h1>
            
            <p className="text-xl text-light-100/70 mb-8">
              Record, mix, and master your vocals with professional quality in minutes, 
              not hours. No expensive equipment or technical expertise required.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="gradient" 
                size="lg"
                onClick={handleGetStarted}
                className="group"
              >
                Get Started
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={handlePlayDemo}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Stop Demo
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Play Demo
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="glass-morphism rounded-2xl p-6 relative z-10">
              <div className="bg-dark-300 rounded-xl h-64 md:h-80 overflow-hidden relative">
                {/* Waveform visualization - fixed animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center justify-center w-full h-full">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div 
                        key={i}
                        className="waveform-line mx-[1px]"
                        style={{ 
                          height: `${Math.sin(i * 0.2) * 50 + 50}%`,
                          opacity: isPlaying ? 1 : 0.5,
                          animationDelay: `${i * 0.05}s`,
                          animationPlayState: isPlaying ? 'running' : 'paused'
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Controls overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-dark-300 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <div className="font-medium">Your Vocal Track</div>
                      <div className="text-light-100/60">AI-enhanced • 00:45</div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handlePlayDemo}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Play
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Mixer controls */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Reverb", "Delay", "EQ", "Compression"].map((control) => (
                  <div key={control} className="text-center">
                    <div className="h-16 w-16 mx-auto bg-dark-400 rounded-full flex items-center justify-center mb-2">
                      <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <div className="h-4 w-4 bg-primary rounded-full"></div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">{control}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Background decorative elements */}
            <div className="absolute -top-10 -right-10 h-40 w-40 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-accent-purple/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Everything You Need to Create <span className="text-gradient">Professional</span> Vocals
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`glass-card p-6 transition-all duration-300 ${
                currentFeature === index ? "border-primary/50 scale-105" : ""
              }`}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-light-100/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          How It <span className="text-gradient">Works</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              step: "01",
              title: "Record or Upload",
              description: "Use your device's microphone to record vocals or upload an existing track"
            },
            {
              step: "02",
              title: "Select Instrumental",
              description: "Choose from our library of beats or upload your own instrumental track"
            },
            {
              step: "03",
              title: "Mix & Export",
              description: "Let our AI enhance your vocals and export your finished track"
            }
          ].map((item, index) => (
            <div key={index} className="glass-card p-6 relative">
              <div className="text-5xl font-bold text-primary/20 absolute top-4 right-4">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold mb-4 mt-8">{item.title}</h3>
              <p className="text-light-100/70">{item.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            variant="gradient" 
            size="lg"
            onClick={handleGetStarted}
          >
            Start Creating Now
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          What Our <span className="text-gradient">Users</span> Say
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "MeloLift has completely transformed my home recording setup. I can create professional-sounding tracks without expensive gear.",
              author: "Sarah J.",
              role: "Independent Artist"
            },
            {
              quote: "The AI mixing is incredible. It saved me hours of tweaking and gave me results that sound like they came from a professional studio.",
              author: "Marcus T.",
              role: "Podcast Host"
            },
            {
              quote: "As someone with no technical audio knowledge, this platform has been a game-changer. Now I can focus on my performance.",
              author: "Elena R.",
              role: "Singer-Songwriter"
            }
          ].map((testimonial, index) => (
            <div key={index} className="glass-card p-6">
              <div className="text-4xl text-primary mb-4">"</div>
              <p className="mb-6 text-light-100/90 italic">{testimonial.quote}</p>
              <div>
                <div className="font-semibold">{testimonial.author}</div>
                <div className="text-light-100/60 text-sm">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="glass-morphism rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Create <span className="text-gradient">Amazing</span> Vocals?
          </h2>
          
          <p className="text-xl text-light-100/70 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are using MeloLift to produce professional-quality vocals without the hassle.
          </p>
          
          <Button 
            variant="gradient" 
            size="lg"
            onClick={handleGetStarted}
            className="group"
          >
            Get Started for Free
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute top-1/4 left-1/4 h-64 w-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 bg-accent-purple/10 rounded-full blur-3xl -z-10"></div>
      </section>
      
      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-white/10 mt-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Logo />
            <p className="mt-4 text-light-100/60">
              AI-powered vocal mixing and mastering for everyone.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-light-100/60">
              <li><a href="#" className="hover:text-primary">Features</a></li>
              <li><a href="#" className="hover:text-primary">Pricing</a></li>
              <li><a href="#" className="hover:text-primary">Tutorials</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-light-100/60">
              <li><a href="#" className="hover:text-primary">About</a></li>
              <li><a href="#" className="hover:text-primary">Blog</a></li>
              <li><a href="#" className="hover:text-primary">Careers</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-light-100/60">
              <li><a href="#" className="hover:text-primary">Privacy</a></li>
              <li><a href="#" className="hover:text-primary">Terms</a></li>
              <li><a href="#" className="hover:text-primary">Copyright</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <div className="text-light-100/60 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} MeloLift. All rights reserved.
          </div>
          
          <div className="flex gap-4">
            <a href="#" className="text-light-100/60 hover:text-primary">
              Twitter
            </a>
            <a href="#" className="text-light-100/60 hover:text-primary">
              Instagram
            </a>
            <a href="#" className="text-light-100/60 hover:text-primary">
              YouTube
            </a>
          </div>
        </div>
        
        {/* Wave effect - fixed positioning */}
        <div className="absolute bottom-0 inset-x-0 flex justify-center items-end overflow-hidden">
          <svg className="w-full h-40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path 
              fill="rgba(124, 93, 250, 0.1)" 
              fillOpacity="1"
              d="M0,160L48,144C96,128,192,96,288,90.7C384,85,480,107,576,133.3C672,160,768,192,864,186.7C960,181,1056,139,1152,117.3C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
          <svg className="absolute bottom-0 w-full h-32" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path 
              fill="rgba(77, 124, 254, 0.1)" 
              fillOpacity="1" 
              d="M0,192L48,208C96,224,192,256,288,266.7C384,277,480,267,576,234.7C672,203,768,149,864,144C960,139,1056,181,1152,192C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
