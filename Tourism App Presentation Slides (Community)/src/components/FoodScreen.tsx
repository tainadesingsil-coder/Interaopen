import { motion } from "motion/react";
import { PremiumCard } from "./PremiumCard";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Star, Clock, MapPin, Phone, Filter, Utensils, Sparkles, ChefHat, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function FoodScreen() {
  const restaurants = [
    {
      id: 1,
      name: "Casa do Acarajé da Dona Maria",
      type: "Comida Baiana",
      rating: 4.9,
      reviews: 248,
      distance: "800m",
      priceRange: "$$",
      image: "https://images.unsplash.com/photo-1703836567326-f5a588ceaaf0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY2FyYWplJTIwYmFoaWElMjBzdHJlZXQlMjBmb29kfGVufDF8fHx8MTc1OTI0NTc0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      openHours: "08:00 - 22:00",
      specialties: ["Acarajé Especial", "Vatapá", "Caruru"],
      status: "Aberto",
      badge: "Recomendado pela Bel",
      color: "from-[#F3A64D] to-[#6ba3d6]"
    },
    {
      id: 2,
      name: "Restaurante Maré Alta",
      type: "Frutos do Mar",
      rating: 4.8,
      reviews: 187,
      distance: "1.2km",
      priceRange: "$$$",
      image: "https://images.unsplash.com/photo-1583085678956-bfd8d20bb7bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBzZWFmb29kJTIwbW9xdWVjYSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzU5MjQ1NzQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      openHours: "11:00 - 23:00",
      specialties: ["Moqueca de Peixe", "Casquinha de Siri", "Bobó de Camarão"],
      status: "Aberto",
      badge: "Mais Procurado",
      color: "from-[#6ba3d6] to-[#4a7ba7]"
    },
    {
      id: 3,
      name: "Sabor da Terra",
      type: "Regional",
      rating: 4.7,
      reviews: 156,
      distance: "600m",
      priceRange: "$$",
      image: "https://images.unsplash.com/photo-1596579283654-cfe0767a11b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjB0cmFkaXRpb25hbCUyMGZvb2QlMjBtb3F1ZWNhfGVufDF8fHx8MTc1OTI0NTUzMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      openHours: "10:00 - 22:00",
      specialties: ["Xinxim de Galinha", "Tapioca Recheada", "Cocada"],
      status: "Aberto",
      badge: "Tradicional",
      color: "from-[#4a7ba7] to-[#F3A64D]"
    }
  ];

  const filters = [
    { id: "all", label: "Todos", active: true, icon: Utensils },
    { id: "baiana", label: "Baiana", active: false, icon: ChefHat },
    { id: "seafood", label: "Frutos do Mar", active: false, icon: Star },
    { id: "open", label: "Aberto", active: false, icon: Clock }
  ];

  return (
    <div className="min-h-screen pb-20 overflow-hidden">
      {/* Header Premium */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#F3A64D]/20 to-[#6ba3d6]/20 pt-8 pb-12 px-6">
        {/* Partículas de comida */}
        <div className="absolute inset-0 pointer-events-none text-4xl opacity-10">
          {['🍤', '🐟', '🥥', '🌴'].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${20 + i * 25}%`,
                top: `${30 + i * 15}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-[#F3A64D] to-[#6ba3d6] rounded-2xl flex items-center justify-center shadow-xl"
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-2xl" />
              <Utensils className="w-6 h-6 text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-2xl text-foreground" style={{ fontFamily: 'var(--font-family-heading)' }}>
                Gastronomia
              </h1>
              <p className="text-sm text-muted-foreground">Sabores autênticos de Belmonte</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-6 -mt-6 space-y-6">
        {/* Filtros premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        >
          {filters.map((filter, index) => {
            const Icon = filter.icon;
            return (
              <motion.div
                key={filter.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap cursor-pointer transition-all ${
                    filter.active
                      ? 'bg-gradient-to-r from-[#F3A64D] to-[#6ba3d6] text-white shadow-lg'
                      : 'bg-white/5 backdrop-blur-md border border-white/10 text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{filter.label}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Dica da Bel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#F3A64D] to-[#6ba3d6] rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-foreground mb-1 text-sm">Dica da Bel</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                O acarajé da Dona Maria está imperdível hoje! Ela usa uma receita de família de 60 anos.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Lista de restaurantes */}
        <div>
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div>
              <h3 className="text-xl text-foreground" style={{ fontFamily: 'var(--font-family-heading)' }}>
                Melhores Restaurantes
              </h3>
              <p className="text-sm text-muted-foreground">Selecionados pela comunidade</p>
            </div>
            <TrendingUp className="w-5 h-5 text-[#F3A64D]" />
          </motion.div>

          <div className="space-y-6">
            {restaurants.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl group cursor-pointer">
                  {/* Imagem */}
                  <div className="relative h-56 overflow-hidden">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <ImageWithFallback
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Badge de destaque */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-[#F3A64D]/90 backdrop-blur-md text-white border-white/20 shadow-lg">
                        {restaurant.badge}
                      </Badge>
                    </div>

                    {/* Status */}
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/90 backdrop-blur-md rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-white text-xs">{restaurant.status}</span>
                      </div>
                    </div>

                    {/* Informações sobrepostas */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white text-lg mb-2" style={{ fontFamily: 'var(--font-family-heading)' }}>
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center gap-3 text-white/90 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-[#F3A64D] text-[#F3A64D]" />
                          <span>{restaurant.rating}</span>
                        </div>
                        <span>•</span>
                        <span>{restaurant.type}</span>
                        <span>•</span>
                        <span>{restaurant.priceRange}</span>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-6">
                    {/* Info */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#6ba3d6]" />
                        <span>{restaurant.distance}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#6ba3d6]" />
                        <span>{restaurant.openHours}</span>
                      </div>
                      <div className="text-muted-foreground">
                        ({restaurant.reviews} avaliações)
                      </div>
                    </div>

                    {/* Especialidades */}
                    <div className="mb-5">
                      <p className="text-xs text-muted-foreground mb-2">Pratos especiais:</p>
                      <div className="flex flex-wrap gap-2">
                        {restaurant.specialties.map((specialty, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs border-[#F3A64D]/30 bg-[#F3A64D]/5"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex gap-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                        <Button className={`w-full bg-gradient-to-r ${restaurant.color} text-white border-0 rounded-2xl h-11 shadow-lg relative overflow-hidden group`}>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                          <span className="relative">Ver Cardápio</span>
                        </Button>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="w-11 h-11 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-0 hover:bg-white/20">
                          <Phone className="w-5 h-5" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA para recomendações */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-[#F3A64D] via-[#6ba3d6] to-[#4a7ba7] shadow-2xl text-center">
            {/* Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <ChefHat className="w-12 h-12 mx-auto mb-4 text-white" />
              </motion.div>
              
              <h3 className="text-white text-2xl mb-3" style={{ fontFamily: 'var(--font-family-heading)' }}>
                Descubra novos sabores
              </h3>
              
              <p className="text-white/90 mb-6 max-w-md mx-auto">
                A IA Bel pode recomendar pratos perfeitos baseados no seu gosto e restrições alimentares!
              </p>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-white text-[#0a0e1a] hover:bg-white/90 rounded-2xl px-8 h-12 shadow-xl">
                  <span className="flex items-center gap-2">
                    Receber Recomendações
                    <Sparkles className="w-4 h-4" />
                  </span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}