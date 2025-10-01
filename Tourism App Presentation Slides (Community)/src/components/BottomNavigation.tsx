import { motion } from "motion/react";
import { Home, Map, Route, UtensilsCrossed, Calendar, Heart, User } from "lucide-react";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: "home", icon: Home, label: "Início" },
    { id: "map", icon: Map, label: "Mapa" },
    { id: "routes", icon: Route, label: "Roteiros" },
    { id: "food", icon: UtensilsCrossed, label: "Comida" },
    { id: "events", icon: Calendar, label: "Eventos" },
    { id: "favorites", icon: Heart, label: "Favoritos" },
    { id: "profile", icon: User, label: "Perfil" }
  ];

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-40 shadow-2xl"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "backOut" }}
    >
      {/* Glossy effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      
      <div className="grid grid-cols-7 gap-1 px-2 py-2 relative">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-300 relative ${
                isActive 
                  ? "text-white" 
                  : "text-foreground hover:bg-[#6ba3d6]/10"
              }`}
              whileTap={{ scale: 0.9 }}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-[#F3A64D] to-[#6ba3d6] rounded-2xl shadow-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-2xl" />
                </motion.div>
              )}
              
              <motion.div
                className="relative z-10"
                animate={isActive ? { y: [0, -4, 0] } : {}}
                transition={{ duration: 0.6, repeat: isActive ? Infinity : 0, repeatDelay: 2 }}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[10px]">{tab.label}</span>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}