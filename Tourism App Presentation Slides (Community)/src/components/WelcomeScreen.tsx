import { motion } from "motion/react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Sparkles, MapPin, Heart } from "lucide-react";
import belMascotImage from "figma:asset/f252610f6e9a8a9c93c9aaea8fde97dff0ee9a53.png";
import { useCity } from "../contexts/CityContext";
import { getCitiesFromMG } from "../data/minas-database";
import { useCityIntelligence } from "../hooks/useCityIntelligence";

interface WelcomeScreenProps {
  onExplore: () => void;
  onCreateRoute: () => void;
}

export function WelcomeScreen({ onExplore, onCreateRoute }: WelcomeScreenProps) {
  const { selectedCity, interests, setCity, setInterests } = useCity();
  const localCities = getCitiesFromMG();
  const intel = useCityIntelligence(selectedCity, interests);
  const cities = intel.cities.length ? intel.cities : localCities;
  const interestOptions = [
    { id: 'culture', label: 'Cultura' },
    { id: 'historical', label: 'História' },
    { id: 'restaurant', label: 'Gastronomia' },
    { id: 'hotel', label: 'Hospedagem' },
    { id: 'shop', label: 'Compras' },
    { id: 'lake', label: 'Lagos' },
    { id: 'mountain', label: 'Montanhas' },
    { id: 'waterfall', label: 'Cachoeiras' },
  ] as const;
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background com parallax */}
      <motion.div 
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 20, ease: "linear" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-10" />
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1509395176047-4a66953fd231?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
          alt="Montanhas de Minas Gerais"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Partículas flutuantes */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-[#F3A64D] rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{ 
              y: [null, Math.random() * -100],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-30 flex flex-col items-center justify-center min-h-screen px-6 py-12">
      {/* Mascote Dora 3D */}
        <motion.div
          initial={{ scale: 0, rotateY: -180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ duration: 1.2, ease: "backOut" }}
          className="mb-12"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F3A64D] to-[#6ba3d6] blur-3xl opacity-50 scale-150" />
            
            {/* Mascot container */}
            <motion.div 
              className="relative w-40 h-40 rounded-full p-1 shadow-2xl"
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 5, 0, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#4C9ED9]/20 via-[#2C4D7B]/10 to-transparent flex items-center justify-center overflow-visible relative backdrop-blur-sm">
                {/* Glossy overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-full" />
                
                <img
                  src={belMascotImage}
                  alt="Dora - Sua guia virtual"
                  className="w-36 h-36 object-contain relative z-10 drop-shadow-2xl"
                />
              </div>
            </motion.div>

            {/* Floating icons */}
            <motion.div
              className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center"
              animate={{ 
                y: [0, -12, 0],
                rotate: [0, 15, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-6 h-6 text-[#F3A64D]" />
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center"
              animate={{ 
                y: [0, 12, 0],
                rotate: [0, -15, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5
              }}
            >
              <MapPin className="w-6 h-6 text-[#6ba3d6]" />
            </motion.div>
          </div>
        </motion.div>

        {/* Texto de boas-vindas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mb-10 max-w-md"
        >
          <motion.h1 
            className="text-4xl text-white mb-4"
            style={{ fontFamily: 'var(--font-family-heading)' }}
          >
            Olá, eu sou a <span className="bg-gradient-to-r from-[#F3A64D] to-[#6ba3d6] bg-clip-text text-transparent">Dora</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg text-white/90 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Escolha a cidade e seus interesses para personalizar sua experiência em Minas Gerais
          </motion.p>

          <motion.p 
            className="text-sm text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Quer que eu monte um roteiro personalizado para você?
          </motion.p>
        </motion.div>

        {/* Filtros de cidade e interesses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="w-full max-w-sm mb-6"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white">
            <div className="mb-4 text-left">
              <label className="block text-sm mb-2">Cidade</label>
              <select
                value={selectedCity}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2"
              >
                {cities.map((c) => (
                  <option key={c} value={c} className="text-black">{c}</option>
                ))}
              </select>
            </div>
            <div className="text-left">
              <label className="block text-sm mb-2">Interesses</label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((opt) => {
                  const active = interests.includes(opt.id as any);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        const has = interests.includes(opt.id as any);
                        setInterests(
                          has
                            ? interests.filter((i) => i !== (opt.id as any))
                            : [...interests, opt.id as any]
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-xs border ${
                        active ? 'bg-white text-[#0a0e1a]' : 'bg-transparent text-white'
                      } border-white/40`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Botões de ação */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col gap-4 w-full max-w-sm"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onCreateRoute}
              className="w-full h-14 bg-gradient-to-r from-[#F3A64D] to-[#6ba3d6] hover:from-[#f5b05d] hover:to-[#7ab3df] text-white border-0 rounded-2xl shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Criar meu roteiro
              </span>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onExplore}
              className="w-full h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-2xl shadow-xl transition-all duration-300"
            >
              <span className="relative flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5" />
                Explorar Minas Gerais
              </span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Informações rápidas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mt-12 flex gap-6 text-white/80 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#F3A64D] rounded-full animate-pulse" />
            <span>Praias paradisíacas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#6ba3d6] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            <span>Cultura rica</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#F3A64D] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            <span>Gastronomia única</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}