import { motion } from "motion/react";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Clock, MapPin, Star, Route, Sparkles, Heart, Compass, Calendar, TrendingUp, Zap, Award, ChevronRight, Filter } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { tourRoutes } from "../data/belmonte-database";

export function RoutesScreen() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filters = [
    { id: "all", label: "Todos", icon: Route },
    { id: "easy", label: "Fácil", icon: Heart },
    { id: "moderate", label: "Moderado", icon: Compass },
    { id: "challenging", label: "Desafio", icon: TrendingUp },
  ];

  const difficultyColors: Record<string, string> = {
    easy: "bg-green-500/20 text-green-300 border-green-500/30",
    moderate: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    challenging: "bg-red-500/20 text-red-300 border-red-500/30",
  };

  const difficultyLabels: Record<string, string> = {
    easy: "Fácil",
    moderate: "Moderado",
    challenging: "Desafiador",
  };

  const filteredRoutes = selectedFilter === "all" 
    ? tourRoutes 
    : tourRoutes.filter(r => r.difficulty === selectedFilter);

  return (
    <div className="min-h-screen pb-20 overflow-hidden bg-gradient-to-b from-background to-background/80">
      {/* Header Premium com efeito parallax */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2C4D7B] via-[#4C9ED9] to-[#F3A64D] pt-12 pb-24 px-6">
        {/* Background pattern animado */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="route-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="white" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#route-pattern)" />
          </svg>
        </div>

        {/* Partículas decorativas */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.div 
              className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border border-white/30"
              animate={{ 
                rotate: [0, 5, 0, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-3xl" />
              <Compass className="w-8 h-8 text-white relative z-10" />
            </motion.div>
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-3xl text-white mb-1" style={{ fontFamily: 'var(--font-family-heading)' }}>
                  Roteiros Inteligentes
                </h1>
                <p className="text-white/90 text-lg">Experiências curadas pela IA Bel</p>
              </motion.div>
            </div>
          </div>

          {/* Stats rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4 mt-6"
          >
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-white" />
                <span className="text-white/80 text-xs">Total de Roteiros</span>
              </div>
              <p className="text-2xl text-white">{tourRoutes.length}</p>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-white fill-white" />
                <span className="text-white/80 text-xs">Avaliação Média</span>
              </div>
              <p className="text-2xl text-white">4.8</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="px-6 -mt-16 space-y-8 relative z-20">
        {/* Filtros modernos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-card backdrop-blur-xl border border-border rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-accent" />
              <h2 className="text-foreground" style={{ fontFamily: 'var(--font-family-heading)' }}>
                Filtrar por Dificuldade
              </h2>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {filters.map((filter, index) => {
                const Icon = filter.icon;
                const isActive = selectedFilter === filter.id;
                return (
                  <motion.button
                    key={filter.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`
                      relative overflow-hidden rounded-2xl p-3 transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-br from-accent to-secondary shadow-lg scale-105' 
                        : 'bg-muted/50 hover:bg-muted'
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeFilter"
                        className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                      <span className={`text-xs ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
                        {filter.label}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Roteiros */}
        <div>
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div>
              <h2 className="text-xl text-foreground" style={{ fontFamily: 'var(--font-family-heading)' }}>
                {selectedFilter === "all" ? "Todos os Roteiros" : `Roteiros ${difficultyLabels[selectedFilter]}`}
              </h2>
              <p className="text-sm text-muted-foreground">{filteredRoutes.length} experiências disponíveis</p>
            </div>
            <Calendar className="w-5 h-5 text-accent" />
          </motion.div>

          <div className="space-y-6">
            {filteredRoutes.map((route, index) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                layout
              >
                <div className="relative overflow-hidden rounded-3xl bg-card backdrop-blur-xl border border-border shadow-2xl group cursor-pointer hover:shadow-accent/20 transition-all duration-500">
                  {/* Imagem com overlay gradiente */}
                  <div className="relative h-56 overflow-hidden">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="w-full h-full"
                    >
                      <ImageWithFallback
                        src={route.image}
                        alt={route.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    
                    {/* Overlay com gradiente duplo */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-secondary/20 mix-blend-overlay" />
                    
                    {/* Badge de dificuldade */}
                    <div className="absolute top-4 right-4">
                      <Badge className={`backdrop-blur-md border ${difficultyColors[route.difficulty]}`}>
                        <Zap className="w-3 h-3 mr-1" />
                        {difficultyLabels[route.difficulty]}
                      </Badge>
                    </div>

                    {/* Badge de melhor época */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30">
                        <Calendar className="w-3 h-3 mr-1" />
                        {route.bestTime}
                      </Badge>
                    </div>

                    {/* Título e info principal no overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white text-2xl mb-2" style={{ fontFamily: 'var(--font-family-heading)' }}>
                        {route.name}
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-accent text-accent" />
                          <span className="text-white text-sm">Popular</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/50" />
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-white/80" />
                          <span className="text-white/90 text-sm">{route.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo detalhado */}
                  <div className="p-6">
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {route.description}
                    </p>

                    {/* Estatísticas */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-5 pb-5 border-b border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-secondary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Paradas</p>
                          <p className="text-foreground">{route.locations.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Destaques</p>
                          <p className="text-foreground">{route.highlights.length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Highlights/Destaques */}
                    <div className="mb-5">
                      <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                        <Star className="w-3 h-3" />
                        O que você vai ver:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {route.highlights.map((highlight, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs border-secondary/30 bg-secondary/5 text-foreground px-3 py-1"
                          >
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <motion.div 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                      className="relative"
                    >
                      <Button className="w-full bg-gradient-to-r from-accent via-secondary to-primary text-white border-0 rounded-2xl h-14 shadow-lg relative overflow-hidden group">
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        
                        <span className="relative flex items-center justify-center gap-2 text-lg">
                          Iniciar Roteiro
                          <motion.div
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ChevronRight className="w-5 h-5" />
                          </motion.div>
                        </span>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA personalizado com IA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="relative overflow-hidden rounded-3xl p-10 bg-gradient-to-br from-accent via-secondary to-primary shadow-2xl text-center">
            {/* Animated background */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
              />
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, -90, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
              />
            </div>

            <div className="relative z-10">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-block mb-4"
              >
                <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              
              <h3 className="text-white text-3xl mb-3" style={{ fontFamily: 'var(--font-family-heading)' }}>
                Crie Seu Roteiro Perfeito
              </h3>
              
              <p className="text-white/95 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                A Bel pode criar um roteiro 100% personalizado baseado nos seus interesses, tempo e preferências únicas!
              </p>
              
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-white text-primary hover:bg-white/90 rounded-2xl px-10 h-14 shadow-2xl text-lg">
                  <span className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5" />
                    Criar com IA Bel
                    <ChevronRight className="w-5 h-5" />
                  </span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Espaço extra no final */}
        <div className="h-8" />
      </div>
    </div>
  );
}