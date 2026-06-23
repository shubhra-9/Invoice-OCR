import type { ReactNode } from "react";

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function DashboardCard({ children, className = "", onClick, style }: DashboardCardProps) {
  return (
    <div 
      className={`dashboard-card-wrapper ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}
