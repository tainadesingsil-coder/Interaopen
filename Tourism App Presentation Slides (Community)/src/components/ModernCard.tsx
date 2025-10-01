import { ReactNode } from "react";
import { motion } from "motion/react";
import { Card } from "./ui/card";

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  glassmorphism?: boolean;
  onClick?: () => void;
}

export function ModernCard({ 
  children, 
  className = "", 
  hover = true, 
  gradient = false,
  glassmorphism = false,
  onClick
}: ModernCardProps) {
  const baseClasses = "border-0 shadow-lg transition-all duration-300";
  
  const backgroundClasses = gradient 
    ? "bg-gradient-to-br from-[#F3A64D]/10 to-[#6ba3d6]/10"
    : glassmorphism 
    ? "bg-card/50 backdrop-blur-sm"
    : "bg-card";

  const hoverClasses = hover 
    ? "hover:shadow-xl hover:scale-[1.02] cursor-pointer"
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2 } : {}}
      onClick={onClick}
    >
      <Card className={`${baseClasses} ${backgroundClasses} ${hoverClasses} ${className}`}>
        {children}
      </Card>
    </motion.div>
  );
}