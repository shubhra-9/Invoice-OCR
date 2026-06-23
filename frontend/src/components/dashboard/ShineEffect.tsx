import { useEffect, useState } from "react";

interface ShineEffectProps {
  trigger: boolean; // Triggers the animation when true
}

export default function ShineEffect({ trigger }: ShineEffectProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsAnimating(true);
      // Remove the class after the animation completes (800ms)
      const timer = setTimeout(() => setIsAnimating(false), 800);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!isAnimating) return null;

  return <div className="shine-overlay animate-shine" />;
}
