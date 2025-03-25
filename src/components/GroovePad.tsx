
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface GroovePadProps {
  onChange?: (x: number, y: number) => void;
  className?: string;
  label?: string;
  xLabel?: string;
  yLabel?: string;
  initialX?: number;
  initialY?: number;
}

const GroovePad = ({
  onChange,
  className,
  label = "Groove Pad",
  xLabel = "Energy",
  yLabel = "Mood",
  initialX = 0.5,
  initialY = 0.5,
}: GroovePadProps) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const padRef = useRef<HTMLDivElement>(null);

  const updatePosition = (clientX: number, clientY: number) => {
    if (!padRef.current) return;

    const rect = padRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
    
    setPosition({ x, y });
    onChange?.(x, y);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updatePosition(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updatePosition(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updatePosition(e.clientX, e.clientY);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      updatePosition(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col space-y-2">
      {label && <label className="text-sm text-light-100/70">{label}</label>}
      <div 
        ref={padRef}
        className={cn(
          "relative w-64 h-64 glass-card overflow-hidden cursor-pointer transition-all",
          isDragging && "ring-2 ring-primary",
          className
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <div 
              key={i} 
              className="border border-white/5"
            />
          ))}
        </div>
        
        {/* Axis labels */}
        <div className="absolute inset-0 pointer-events-none text-xs text-white/40">
          <div className="absolute bottom-2 right-2">{xLabel} +</div>
          <div className="absolute bottom-2 left-2">{xLabel} -</div>
          <div className="absolute top-2 right-2">{yLabel} +</div>
          <div className="absolute top-2 left-2">{yLabel} -</div>
        </div>
        
        {/* Crosshair lines */}
        <div 
          className="absolute inset-0 w-full h-[1px] bg-white/20"
          style={{ top: `calc(${(1 - position.y) * 100}%)` }}
        />
        <div 
          className="absolute inset-0 w-[1px] h-full bg-white/20"
          style={{ left: `calc(${position.x * 100}%)` }}
        />
        
        {/* Control point */}
        <div 
          className="absolute w-5 h-5 bg-primary rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 border-2 border-white"
          style={{ 
            left: `${position.x * 100}%`, 
            top: `${(1 - position.y) * 100}%`,
          }}
        />
      </div>
      
      {/* Value display */}
      <div className="flex justify-between text-xs text-light-100/60">
        <span>{xLabel}: {Math.round(position.x * 100)}%</span>
        <span>{yLabel}: {Math.round(position.y * 100)}%</span>
      </div>
    </div>
  );
};

export default GroovePad;
