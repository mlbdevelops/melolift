
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
  delay?: number;
}

const FeatureCard = ({ 
  title, 
  description, 
  icon, 
  className,
  delay = 0 
}: FeatureCardProps) => {
  return (
    <div 
      className={cn(
        "glass-card p-6 opacity-0 animate-fade-in",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-primary/10 text-primary mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-light-100/70 text-sm flex-grow">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
