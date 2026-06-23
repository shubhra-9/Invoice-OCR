import type { ReactNode } from "react";
import AnimatedCard from "./AnimatedCard";
import DashboardCard from "./DashboardCard";

type CardVariant = "success" | "warning" | "danger" | "primary";

interface StatsCardWrapperProps {
  children: ReactNode;
  isActive: boolean;
  onClick?: () => void;
  delay?: number;
  variant?: CardVariant;
  style?: React.CSSProperties;
  className?: string;
}

export default function StatsCardWrapper({ 
  children, 
  isActive, 
  onClick, 
  delay = 0,
  variant = "primary",
  style,
  className = ""
}: StatsCardWrapperProps) {
  return (
    <AnimatedCard delay={delay}>
      <DashboardCard
        className={`stats-card-wrapper variant-${variant} ${isActive ? "card-active active" : ""} ${className}`}
        onClick={onClick}
        style={style}
      >
        {children}
      </DashboardCard>
    </AnimatedCard>
  );
}
