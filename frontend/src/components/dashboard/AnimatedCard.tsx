import { useEffect, useState } from "react";
import type { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function AnimatedCard({ children, delay = 0, className = "" }: AnimatedCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Add a slight delay for staggered animations
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`${mounted ? "animated-card-enter" : "opacity-0"} ${className}`}>
      {children}
    </div>
  );
}
