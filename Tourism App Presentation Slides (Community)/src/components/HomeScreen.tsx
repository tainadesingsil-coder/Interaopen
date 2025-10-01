import { motion } from "motion/react";
import { Button } from "./ui/button";
import { PremiumCard } from "./PremiumCard";
import { MapPin, Star, Compass, Utensils, Camera, Calendar, Sparkles, TrendingUp, PhoneCall, Hospital, Building2, Bus, Shield, LifeBuoy } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useCity } from "../contexts/CityContext";
import { recommendLocations } from "../services/locationService";
import { useCityIntelligence } from "../hooks/useCityIntelligence";

interface HomeScreenProps {
  onCreateRoute: () => void;
}

export function HomeScreen({ onCreateRoute }: HomeScreenProps) {
  const { selectedCity, interests } = useCity();
  const intel = useCityIntelligence(selectedCity, interests as any);
  const recs = (intel.places.length ? intel.places : recommendLocations({ city: selectedCity, interests: interests as any })).slice(0, 2) as any[];
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Section com parallax */}
      <motion.div 
        className="relative h-[60vh] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Background com gradiente */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-background z-10" />
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          >
              <ImageWithFallback
              src="https://images.unsplash.com/photo-1598899134739-24f11f9b4338?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfHNlYXJjaHwxfHxNaW5hcyUyMEdlcmFpcyUyMHNlbnJhcmlvfGVufDB8fHx8MTcwNjk2MjE1OQ&ixlib=rb-4.0.3&q=80&w=1080"
              alt="Minas Gerais - Serra"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* Conteúdo do Hero */}
        <div className="relative z-20 h-full flex flex-col justify-end p-6 pb-12">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-4 border border-white/20"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-[#F3A64D] rounded-full animate-pulse" />
              <span className="text-white text-sm">28°C • Ensolarado</span>
            </motion.div>

            <h1 className="text-white text-4xl mb-3" style={{ fontFamily: 'var(--font-family-heading)' }}>
              Bem-vindo a <br />
              <span className="bg-gradient-to-r from-[#F3A64D] to-[#6ba3d6] bg-clip-text text-transparent">
                Minas Gerais
              </span>
            </h1>
            <p className="text-white/90 text-lg max-w-md">
              Descubra as maravilhas de Minas Gerais com a IA mais inteligente do turismo
            </p>
          </motion.div>
        </div>

        {/* Partículas decorativas */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#F3A64D] rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Conteúdo principal */}
      <div className="px-6 py-8 space-y-8 relative z-10">
        {/* CTA Principal - Criar Roteiro */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-[#F3A64D] via-[#6ba3d6] to-[#4a7ba7] shadow-2xl card-mobile-tight">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            
            {/* Floating elements */}
            <motion.div
              className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute -left-4 -bottom-4 w-24 h-24 bg-black/10 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-6 h-6 text-white" />
                <span className="text-white/90 text-sm uppercase tracking-wider">IA Dora Recomenda</span>
              </div>
              
            <h2 className="text-white text-2xl mb-3" style={{ fontFamily: 'var(--font-family-heading)' }}>
              {selectedCity}: experiências personalizadas
              </h2>
              
              <p className="text-white/90 mb-6 text-base">
                A IA Dora vai criar uma experiência única baseada nos seus interesses em {selectedCity}
              </p>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={onCreateRoute}
                  className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/30 rounded-2xl px-8 h-12 shadow-xl group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative flex items-center gap-2">
                    Criar agora
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Destaques */}
        <div>
          <motion.div 
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div>
              <h3 className="text-foreground text-xl" style={{ fontFamily: 'var(--font-family-heading)' }}>
                Destaques de hoje
              </h3>
              <p className="text-muted-foreground text-sm">Os lugares mais incríveis para visitar</p>
            </div>
            <TrendingUp className="w-5 h-5 text-[#F3A64D]" />
          </motion.div>

          <div className="grid grid-cols-2 gap-4 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="h-full"
            >
              <PremiumCard
                image={recs[0]?.image || "https://images.unsplash.com/photo-1528821154947-1aa3d1b87b34?q=80&w=1080&auto=format&fit=crop"}
                badge="Popular"
                variant="glass"
                className="h-full min-h-[14rem]"
              >
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-white mb-1 truncate">{recs[0]?.name || selectedCity}</h4>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[#F3A64D] text-[#F3A64D]" />
                    <span className="text-white/90 text-sm">{recs[0]?.rating ?? "4.8"}</span>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="h-full"
            >
              <PremiumCard
                image={recs[1]?.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1080&auto=format&fit=crop"}
                badge="Novo"
                variant="glass"
                className="h-full min-h-[14rem]"
              >
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-white mb-1 truncate">{recs[1]?.name || "Destaque"}</h4>
                  <div className="flex items-center gap-1 text-white/90 text-sm">
                    <div className="w-2 h-2 bg-[#F3A64D] rounded-full animate-pulse" />
                    <span>{selectedCity}</span>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          </div>
        </div>

        {/* Serviços da cidade */}
        <div>
          <motion.h3 
            className="text-foreground text-xl mb-6"
            style={{ fontFamily: 'var(--font-family-heading)' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            Serviços da cidade
          </motion.h3>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: PhoneCall, label: "Emergências", gradient: "from-[#ef4444] to-[#f97316]", delay: 1.0 },
              { icon: Hospital, label: "Saúde", gradient: "from-[#10b981] to-[#34d399]", delay: 1.05 },
              { icon: Building2, label: "Prefeitura", gradient: "from-[#6ba3d6] to-[#4a7ba7]", delay: 1.1 },
              { icon: Bus, label: "Transporte", gradient: "from-[#F3A64D] to-[#6ba3d6]", delay: 1.15 },
              { icon: Shield, label: "Segurança", gradient: "from-[#4a7ba7] to-[#F3A64D]", delay: 1.2 },
              { icon: LifeBuoy, label: "Assistência", gradient: "from-[#22c55e] to-[#16a34a]", delay: 1.25 }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: item.delay }}
              >
                <PremiumCard
                  icon={item.icon}
                  title={item.label}
                  variant="minimal"
                  className="h-28"
                >
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 hover:opacity-10 transition-opacity duration-300 rounded-3xl`}
                  />
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Informações contextuais */}
        <motion.div
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F3A64D] to-[#6ba3d6] rounded-2xl flex items-center justify-center flex-shrink-0">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-foreground mb-2">Dica da Dora</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                O pôr do sol na Serra do Cipó é imperdível! Entre 17h30 e 18h a vista é incrível.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}