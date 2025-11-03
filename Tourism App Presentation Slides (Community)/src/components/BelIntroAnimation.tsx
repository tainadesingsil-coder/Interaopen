import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Sparkles, Compass, Heart, Star } from "lucide-react";
const belMascotImage = "https://i.postimg.cc/Z58dyFfS/Chat-GPT-Image-30-de-set-de-2025-23-27-13.png";

interface BelIntroAnimationProps {
  onComplete: () => void;
}

export function BelIntroAnimation({ onComplete }: BelIntroAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        setTimeout(onComplete, 800);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-gradient-to-br from-[#0a0e1a] via-[#2C4D7B] to-[#1a1f2e] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: i % 3 === 0 ? '#F3A64D' : i % 3 === 1 ? '#6ba3d6' : '#ffffff',
            }}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
              opacity: 0
            }}
            animate={{ 
              scale: [0, 1, 0.5, 1, 0],
              opacity: [0, 0.8, 0.6, 0.8, 0],
              x: [null, Math.random() * window.innerWidth],
              y: [null, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Circular waves */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2 border-[#F3A64D]/20"
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={currentStep >= 1 ? {
              width: [0, 400, 600],
              height: [0, 400, 600],
              opacity: [0.5, 0.3, 0]
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      <div className="relative text-center z-10">
          {/* Dora's Mascot com entrada espetacular */}
        <motion.div
          className="relative mx-auto mb-12"
          initial={{ scale: 0, y: -100, rotateZ: -180 }}
          animate={{ 
            scale: currentStep >= 0 ? 1 : 0,
            y: currentStep >= 0 ? 0 : -100,
            rotateZ: currentStep >= 0 ? 0 : -180,
          }}
          transition={{ 
            duration: 1.2,
            type: "spring",
            bounce: 0.5
          }}
        >
          {/* Glow effect pulsante */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-[#F3A64D] via-[#6ba3d6] to-[#4a7ba7] rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Container da Bel */}
          <motion.div 
            className="relative w-48 h-48"
            animate={currentStep >= 1 ? { 
              y: [0, -15, 0],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Background circle com gradiente */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#4C9ED9]/30 via-[#2C4D7B]/20 to-transparent rounded-full" />
            
            {/* Dora mascot */}
            <motion.div
              className="relative w-full h-full rounded-full overflow-visible flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <img
                src={belMascotImage}
                alt="Bel - Assistente Virtual"
                className="w-44 h-44 object-contain relative z-10 drop-shadow-2xl"
              />
              
              {/* Glossy overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-full pointer-events-none" />
            </motion.div>
            
            {/* Floating icons animados */}
            <AnimatePresence>
              {currentStep >= 2 && (
                <>
                  <motion.div
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{ 
                      scale: 1,
                      x: -80,
                      y: -40,
                      rotate: [0, 10, -10, 0]
                    }}
                    exit={{ scale: 0 }}
                    transition={{ 
                      duration: 0.6,
                      rotate: { duration: 2, repeat: Infinity }
                    }}
                    className="absolute top-0 left-0 w-12 h-12 bg-gradient-to-br from-[#F3A64D] to-[#ff8c42] rounded-2xl flex items-center justify-center shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-2xl" />
                    <Sparkles className="w-6 h-6 text-white relative z-10" />
                  </motion.div>
                  
                  <motion.div
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{ 
                      scale: 1,
                      x: 80,
                      y: -40,
                      rotate: [0, -10, 10, 0]
                    }}
                    exit={{ scale: 0 }}
                    transition={{ 
                      duration: 0.6,
                      delay: 0.2,
                      rotate: { duration: 2, repeat: Infinity, delay: 0.5 }
                    }}
                    className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-[#6ba3d6] to-[#4a7ba7] rounded-2xl flex items-center justify-center shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-2xl" />
                    <MapPin className="w-6 h-6 text-white relative z-10" />
                  </motion.div>
                  
                  <motion.div
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{ 
                      scale: 1,
                      x: -70,
                      y: 60,
                      rotate: [0, 15, -15, 0]
                    }}
                    exit={{ scale: 0 }}
                    transition={{ 
                      duration: 0.6,
                      delay: 0.4,
                      rotate: { duration: 2, repeat: Infinity, delay: 1 }
                    }}
                    className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-br from-[#ff6b9d] to-[#c9184a] rounded-2xl flex items-center justify-center shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-2xl" />
                    <Heart className="w-6 h-6 text-white relative z-10" />
                  </motion.div>
                  
                  <motion.div
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{ 
                      scale: 1,
                      x: 70,
                      y: 60,
                      rotate: [0, -15, 15, 0]
                    }}
                    exit={{ scale: 0 }}
                    transition={{ 
                      duration: 0.6,
                      delay: 0.6,
                      rotate: { duration: 2, repeat: Infinity, delay: 1.5 }
                    }}
                    className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-[#4a7ba7] to-[#2C4D7B] rounded-2xl flex items-center justify-center shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-2xl" />
                    <Compass className="w-6 h-6 text-white relative z-10" />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Text Animation com efeito de digitação */}
        <AnimatePresence>
          {currentStep >= 3 && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.6, ease: "backOut" }}
              className="text-center px-6"
            >
              <motion.h1 
                className="text-4xl text-white mb-3"
                style={{ fontFamily: 'var(--font-family-heading)' }}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Olá! Eu sou a{" "}
                <motion.span 
                  className="bg-gradient-to-r from-[#F3A64D] to-[#6ba3d6] bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Dora
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-lg text-white/90 mb-8 max-w-md mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Sua assistente virtual em Minas Gerais
              </motion.p>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring", bounce: 0.5 }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 0 20px rgba(243, 166, 77, 0.3)",
                      "0 0 40px rgba(243, 166, 77, 0.5)",
                      "0 0 20px rgba(243, 166, 77, 0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block px-8 py-4 bg-gradient-to-r from-[#F3A64D] via-[#6ba3d6] to-[#4a7ba7] rounded-full text-white shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shimmer" />
                  <span className="relative flex items-center gap-2 text-lg">
                    <Star className="w-5 h-5" />
                    Vamos explorar juntos!
                    <Sparkles className="w-5 h-5" />
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Progress mais elegante */}
        <motion.div 
          className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              className="h-full bg-gradient-to-r from-[#F3A64D] via-[#6ba3d6] to-[#4a7ba7] rounded-full relative"
              initial={{ width: "0%" }}
              animate={{ width: `${(currentStep + 1) * 20}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
          <motion.p 
            className="text-white/60 text-xs text-center mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Preparando sua experiência...
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}