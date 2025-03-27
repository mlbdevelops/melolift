
import { Music } from "lucide-react";
import { Link } from "react-router-dom";

interface LogoProps {
  variant?: "default" | "light";
  size?: "small" | "medium" | "large";
  showText?: boolean;
}

const Logo = ({ 
  variant = "default", 
  size = "medium", 
  showText = true
}: LogoProps) => {
  // Size classes
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-8 w-8",
    large: "h-10 w-10"
  };
  
  // Text size classes
  const textSizeClasses = {
    small: "text-lg",
    medium: "text-xl",
    large: "text-2xl"
  };
  
  // Color classes
  const colorClasses = {
    default: "text-primary",
    light: "text-white"
  };
  
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className={`${colorClasses[variant]} bg-gradient-to-br from-primary/20 to-accent-purple/20 rounded-lg p-2 flex items-center justify-center`}>
        <Music className={sizeClasses[size]} />
      </div>
      
      {showText && (
        <h1 className={`font-bold ${textSizeClasses[size]} ${colorClasses[variant]}`}>
          MeloLift
        </h1>
      )}
    </Link>
  );
};

export default Logo;
