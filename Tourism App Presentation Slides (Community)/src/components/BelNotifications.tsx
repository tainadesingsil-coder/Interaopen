import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, MapPin, Clock, Star } from "lucide-react";
import { useState, useEffect } from "react";

interface BelNotification {
  id: string;
  type: "tip" | "suggestion" | "achievement" | "weather";
  title: string;
  message: string;
  icon?: React.ReactNode;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface BelNotificationsProps {
  context: string;
}

export function BelNotifications({ context }: BelNotificationsProps) {
  const [notifications, setNotifications] = useState<BelNotification[]>([]);

  // Sistema de notificações contextuais automáticas
  useEffect(() => {
    const contextNotifications: Record<string, BelNotification[]> = {
      map: [
        {
          id: "map-tip",
          type: "tip",
          title: "Dica da Bel",
          message: "Toque nos pontos laranja para ver informações detalhadas!",
          icon: <MapPin className="w-4 h-4" />,
          duration: 4000
        }
      ],
      food: [
        {
          id: "food-special",
          type: "suggestion", 
          title: "Oferta Especial",
          message: "A Casa do Acarajé está com 20% de desconto até 18h!",
          icon: <Star className="w-4 h-4" />,
          duration: 6000,
          action: {
            label: "Ver no mapa",
            onClick: () => console.log("Navegar para restaurante")
          }
        }
      ],
      home: [
        {
          id: "welcome-back",
          type: "achievement",
          title: "Bem-vinda de volta!",
          message: "Você desbloqueou o badge 'Exploradora Regular'! 🎉",
          icon: <Sparkles className="w-4 h-4" />,
          duration: 5000
        }
      ]
    };

    const contextualNotifications = contextNotifications[context] || [];
    
    if (contextualNotifications.length > 0) {
      // Delay para dar tempo da tela carregar
      const timer = setTimeout(() => {
        setNotifications(contextualNotifications);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [context]);

  // Auto-dismiss notifications
  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          dismissNotification(notification.id);
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "tip":
        return "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400";
      case "suggestion":
        return "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400";
      case "achievement":
        return "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400";
      case "weather":
        return "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400";
      default:
        return "bg-card/90 border-border";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ x: 300, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 300, opacity: 0, scale: 0.8 }}
            transition={{ 
              type: "spring", 
              damping: 20, 
              stiffness: 200,
              delay: index * 0.1
            }}
            className={`p-4 rounded-2xl shadow-xl backdrop-blur-md border relative overflow-hidden ${getTypeStyles(notification.type)}`}
          >
            {/* Brilho sutil */}
            <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            
            <div className="flex items-start gap-3">
              {/* Ícone da Bel */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-[#F3A64D] to-[#6ba3d6] rounded-full flex items-center justify-center shadow-lg">
                  {notification.icon || <Sparkles className="w-4 h-4 text-white" />}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium">{notification.title}</h4>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => dismissNotification(notification.id)}
                    className="text-current/60 hover:text-current/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
                
                <p className="text-xs leading-relaxed mb-3">
                  {notification.message}
                </p>
                
                {notification.action && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={notification.action.onClick}
                    className="text-xs bg-current/10 hover:bg-current/20 transition-colors px-3 py-1 rounded-full"
                  >
                    {notification.action.label}
                  </motion.button>
                )}
              </div>
            </div>
            
            {/* Barra de progresso */}
            {notification.duration && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-current/30 rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: notification.duration / 1000, ease: "linear" }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}