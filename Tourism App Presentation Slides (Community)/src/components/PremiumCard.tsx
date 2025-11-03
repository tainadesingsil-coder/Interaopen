import { motion } from "motion/react";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PremiumCardProps {
  children?: ReactNode;
  image?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
  variant?: "glass" | "gradient" | "minimal";
  hover3d?: boolean;
}

export function PremiumCard({ 
  children, 
  image, 
  title, 
  subtitle, 
  badge, 
  icon: Icon,
  onClick,
  className = "",
  variant = "glass",
  hover3d = true
}: PremiumCardProps) {
  const baseClasses = "relative overflow-hidden rounded-3xl cursor-pointer";
  
  const variantClasses = {
    glass: "bg-white/5 backdrop-blur-md border border-white/10 shadow-xl",
    gradient: "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl",
    minimal: "bg-card/50 backdrop-blur-sm border border-border shadow-lg"
  };

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover3d ? { 
        scale: 1.03, 
        y: -4,
        transition: { duration: 0.3 }
      } : {}}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Imagem se fornecida */}
      {image && (
        <div className="relative h-48 overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <ImageWithFallback
              src={image}
              alt={title || "Card image"}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Badge */}
          {badge && (
            <motion.div 
              className="absolute top-4 right-4 px-3 py-1.5 bg-[#F3A64D]/90 backdrop-blur-md rounded-full text-white text-xs shadow-lg"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              {badge}
            </motion.div>
          )}
        </div>
      )}

      {/* Conteúdo */}
      <div className="p-6 relative z-10">
        {Icon && (
          <motion.div 
            className="w-12 h-12 bg-gradient-to-br from-[#6ba3d6] to-[#4a7ba7] rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-2xl" />
            <Icon className="w-6 h-6 text-white relative z-10" />
          </motion.div>
        )}

        {title && (
          <h3 className="text-foreground mb-2" style={{ fontFamily: 'var(--font-family-heading)' }}>
            {title}
          </h3>
        )}

        {subtitle && (
          <p className="text-sm text-muted-foreground mb-4">
            {subtitle}
          </p>
        )}

        {children}
      </div>

      {/* Hover glow effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-[#F3A64D]/0 via-[#6ba3d6]/10 to-[#F3A64D]/0 opacity-0 pointer-events-none"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
}