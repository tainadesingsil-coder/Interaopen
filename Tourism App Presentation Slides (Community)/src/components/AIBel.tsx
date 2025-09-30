import { MessageCircle, Sparkles, MapPin, Heart, Star, Coffee, Utensils, Bed, Camera, Smile } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState, useEffect } from "react";
import belMascotImage from "figma:asset/f252610f6e9a8a9c93c9aaea8fde97dff0ee9a53.png";

interface AIBelProps {
  message: string;
  position?: "bottom-right" | "top-left" | "center";
  isVisible?: boolean;
  context?: "home" | "map" | "routes" | "food" | "hotels" | "shopping" | "favorites" | "profile";
}

type Emotion = "happy" | "excited" | "thinking" | "winking" | "surprised";

export function AIBel({ message, position = "bottom-right", isVisible = true, context = "home" }: AIBelProps) {
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>("happy");
  const [isBlinking, setIsBlinking] = useState(false);
  const [showGesture, setShowGesture] = useState(false);

  // Sistema de emoções baseado no contexto
  useEffect(() => {
    const emotionMap: Record<string, Emotion> = {
      home: "happy",
      map: "excited",
      routes: "thinking",
      food: "excited",
      hotels: "happy",
      shopping: "winking",
      favorites: "happy",
      profile: "surprised"
    };
    
    setCurrentEmotion(emotionMap[context] || "happy");
  }, [context]);

  // Animação de piscar automática
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Gestos contextuais
  useEffect(() => {
    const gestureTimeout = setTimeout(() => {
      setShowGesture(true);
      setTimeout(() => setShowGesture(false), 2000);
    }, 1500);

    return () => clearTimeout(gestureTimeout);
  }, [message, context]);

  // Resetar emoção quando o contexto muda
  useEffect(() => {
    setCurrentEmotion("surprised");
    setTimeout(() => {
      const emotionMap: Record<string, Emotion> = {
        home: "happy",
        map: "excited", 
        routes: "thinking",
        food: "excited",
        hotels: "happy",
        shopping: "winking",
        favorites: "happy",
        profile: "surprised"
      };
      setCurrentEmotion(emotionMap[context] || "happy");
    }, 500);
  }, [context]);

  if (!isVisible) return null;

  const positionClasses = {
    "bottom-right": "fixed bottom-20 right-4 z-50",
    "top-left": "absolute top-4 left-4",
    "center": "flex justify-center items-center"
  };

  const getContextIcon = () => {
    switch (context) {
      case "map": return MapPin;
      case "food": return Utensils;
      case "hotels": return Bed;
      case "shopping": return Camera;
      case "favorites": return Heart;
      default: return Sparkles;
    }
  };

  const ContextIcon = getContextIcon();

  return (
    <motion.div 
      className={positionClasses[position]}
      initial={{ scale: 0, y: 20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0, y: 20, opacity: 0 }}
      transition={{ duration: 0.6, ease: "backOut" }}
    >
      <div className="relative">
        {/* Balão de fala translúcido flutuante */}
        <motion.div 
          className="bg-white/10 dark:bg-card/20 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-white/20 dark:border-[#6ba3d6]/20 max-w-xs relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.3 }}
        >
          {/* Gradiente dinâmico baseado na emoção */}
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: currentEmotion === "excited" 
                ? "linear-gradient(135deg, rgba(243, 166, 77, 0.1), rgba(107, 163, 214, 0.1))"
                : currentEmotion === "thinking"
                ? "linear-gradient(135deg, rgba(107, 163, 214, 0.1), rgba(74, 123, 167, 0.1))"
                : "linear-gradient(135deg, rgba(243, 166, 77, 0.05), rgba(107, 163, 214, 0.05))"
            }}
            transition={{ duration: 0.8 }}
          />
          
          {/* Efeito glossy */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-3xl pointer-events-none" />
          
          <div className="flex items-start gap-3 relative z-10">
            {/* Ícone contextual animado */}
            <div className="flex-shrink-0">
              <motion.div 
                className="w-9 h-9 bg-gradient-to-br from-[#6ba3d6] to-[#4a7ba7] rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden"
                animate={{ 
                  rotate: showGesture ? [0, 10, -10, 0] : 0,
                  scale: currentEmotion === "excited" ? [1, 1.1, 1] : 1
                }}
                transition={{ 
                  rotate: { duration: 0.6 },
                  scale: { duration: 2, repeat: Infinity }
                }}
              >
                {/* Brilho glossy */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl" />
                <ContextIcon className="w-5 h-5 text-white relative z-10" />
              </motion.div>
            </div>
            
            <div className="flex-1">
              {/* Nome da Bel com status emocional */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-[#6ba3d6] dark:text-[#6ba3d6]">Bel</span>
                <motion.div
                  animate={{ 
                    scale: currentEmotion === "excited" ? [1, 1.3, 1] : [1, 1.1, 1],
                    rotate: currentEmotion === "winking" ? [0, 15, 0] : 0
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {currentEmotion === "excited" && <Star className="w-3 h-3 text-[#F3A64D] fill-current" />}
                  {currentEmotion === "happy" && <Heart className="w-3 h-3 text-[#F3A64D] fill-current" />}
                  {currentEmotion === "thinking" && <Coffee className="w-3 h-3 text-[#F3A64D] fill-current" />}
                  {currentEmotion === "winking" && <Smile className="w-3 h-3 text-[#F3A64D] fill-current" />}
                  {currentEmotion === "surprised" && <Sparkles className="w-3 h-3 text-[#F3A64D] fill-current" />}
                </motion.div>
              </div>
              
              {/* Mensagem com typing effect subtle */}
              <motion.p 
                className="text-sm text-foreground leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {message}
              </motion.p>
            </div>
          </div>
          
          {/* Seta do balão com brilho */}
          {position === "bottom-right" && (
            <div className="absolute -bottom-2 right-10">
              <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white/10 dark:border-t-card/20"></div>
              <div className="absolute -top-1 left-1 w-0 h-0 border-l-6 border-l-transparent border-r-6 border-r-transparent border-t-6 border-t-white/30"></div>
            </div>
          )}
        </motion.div>
        
        {/* Mascote 3D da Bel com glossy effect */}
        <motion.div 
          className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full shadow-2xl overflow-visible cursor-pointer"
          whileHover={{ scale: 1.15, y: -2 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            y: [0, -6, 0],
            rotate: showGesture ? [0, 5, -5, 0] : [0, 1, -1, 0]
          }}
          transition={{ 
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: showGesture ? 0.8 : 4, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          {/* Background gradient glossy com transparência */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4C9ED9]/30 via-[#2C4D7B]/20 to-transparent rounded-full blur-xl" />
          
          {/* Mascot com expressões */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={belMascotImage}
              alt="Bel Mascot"
              className="w-20 h-20 object-contain drop-shadow-2xl"
            />
          </div>
          
          {/* Elementos interativos contextuais */}
          <motion.div
            className="absolute -top-2 -right-2 w-5 h-5 bg-[#F3A64D] rounded-full flex items-center justify-center shadow-lg"
            animate={{ 
              scale: [1, 1.4, 1],
              rotate: context === "map" ? 360 : 0
            }}
            transition={{ 
              scale: { duration: 1.5, repeat: Infinity },
              rotate: { duration: 2, repeat: Infinity }
            }}
          >
            <ContextIcon className="w-3 h-3 text-white" />
          </motion.div>
          
          {/* Partículas brilhantes */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${20 + i * 20}%`,
                left: `${15 + i * 25}%`,
              }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5
              }}
            />
          ))}
        </motion.div>
        
        {/* Partículas flutuantes contextuais */}
        <AnimatePresence>
          {showGesture && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute -top-4 -left-4"
            >
              {context === "food" && (
                <motion.div
                  animate={{ 
                    y: [0, -15, 0],
                    rotate: [0, 10, 0]
                  }}
                  transition={{ duration: 2 }}
                  className="text-2xl"
                >
                  🍽️
                </motion.div>
              )}
              {context === "map" && (
                <motion.div
                  animate={{ 
                    y: [0, -15, 0],
                    rotate: [0, -10, 0]
                  }}
                  transition={{ duration: 2 }}
                  className="text-2xl"
                >
                  🗺️
                </motion.div>
              )}
              {context === "shopping" && (
                <motion.div
                  animate={{ 
                    y: [0, -15, 0],
                    rotate: [0, 15, 0]
                  }}
                  transition={{ duration: 2 }}
                  className="text-2xl"
                >
                  🛍️
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}