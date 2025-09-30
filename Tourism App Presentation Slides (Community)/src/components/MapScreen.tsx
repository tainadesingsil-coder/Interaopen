import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Navigation, Star, Clock, Compass, Camera, Search, Filter, ChevronRight, Phone, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Input } from "./ui/input";
import { allLocations, Location } from "../data/belmonte-database";

export function MapScreen() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = [
    { id: "all", label: "Todos", color: "#6ba3d6" },
    { id: "beach", label: "Praias", color: "#4C9ED9" },
    { id: "restaurant", label: "Restaurantes", color: "#F3A64D" },
    { id: "hotel", label: "Hotéis", color: "#2C4D7B" },
    { id: "shop", label: "Comércio", color: "#F3A64D" },
    { id: "historical", label: "Histórico", color: "#6ba3d6" },
  ];

  const categoryIcons: Record<string, string> = {
    beach: "🏖️",
    restaurant: "🍴",
    hotel: "🏨",
    shop: "🛍️",
    historical: "🏛️",
    culture: "🎭",
    nature: "🌿",
  };

  const filteredLocations = allLocations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         loc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || loc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Simular posições no mapa (distribuição mais realista)
  const getMapPosition = (index: number, total: number) => {
    // Criar clusters por categoria
    const categoryOffsets: Record<string, { x: number; y: number }> = {
      beach: { x: 20, y: 65 },
      restaurant: { x: 45, y: 45 },
      hotel: { x: 70, y: 60 },
      shop: { x: 50, y: 35 },
      historical: { x: 48, y: 42 },
      culture: { x: 55, y: 38 },
      nature: { x: 30, y: 70 },
    };

    const location = filteredLocations[index];
    const base = categoryOffsets[location.category] || { x: 50, y: 50 };
    
    // Adicionar variação aleatória mas consistente baseada no ID
    const seed = location.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const offsetX = ((seed * 17) % 20) - 10;
    const offsetY = ((seed * 23) % 20) - 10;

    return {
      top: `${Math.max(15, Math.min(80, base.y + offsetY))}%`,
      left: `${Math.max(15, Math.min(80, base.x + offsetX))}%`,
    };
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header com busca */}
      <div className="bg-gradient-to-br from-primary via-secondary to-accent p-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl text-white" style={{ fontFamily: 'var(--font-family-heading)' }}>
                Mapa Interativo
              </h1>
              <p className="text-white/90 text-sm">{allLocations.length} locais mapeados</p>
            </div>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
            <Input
              type="text"
              placeholder="Buscar locais..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/20 backdrop-blur-md border-white/30 text-white placeholder:text-white/60 pl-12 pr-4 py-6 rounded-2xl focus:bg-white/30 transition-all"
            />
          </div>

          {/* Filtros de categoria */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategoryFilter(cat.id)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-xl transition-all text-sm
                  ${categoryFilter === cat.id
                    ? 'bg-white text-primary shadow-lg scale-105'
                    : 'bg-white/20 text-white backdrop-blur-md'
                  }
                `}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Mapa com pontos */}
      <div className="relative flex-1 overflow-hidden bg-gradient-to-b from-[#e8f4f8] to-[#d4e8f0]">
        {/* Imagem de fundo do mapa */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1540909163456-800870874263?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWwlMjBjb2FzdGFsJTIwdG93biUyMGNvbG9yZnVsfGVufDF8fHx8MTc1OTI0NzMwOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Mapa de Belmonte"
            className="w-full h-full object-cover opacity-30"
          />
        </div>

        {/* Grid de coordenadas */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2C4D7B" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Pontos dos locais */}
        <div className="absolute inset-0">
          {filteredLocations.map((location, index) => {
            const position = getMapPosition(index, filteredLocations.length);
            const categoryColor = categories.find(c => c.id === location.category)?.color || "#6ba3d6";

            return (
              <motion.div
                key={location.id}
                className="absolute cursor-pointer"
                style={position}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4, ease: "backOut" }}
                whileHover={{ scale: 1.3, zIndex: 50 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedLocation(location)}
                layout
              >
                <motion.div
                  className="relative"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2 + (index % 3), repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Pin principal */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-2xl border-3 border-white relative overflow-hidden"
                    style={{ backgroundColor: categoryColor }}
                  >
                    {/* Glossy effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent" />
                    
                    <span className="text-xl relative z-10">
                      {categoryIcons[location.category] || '📍'}
                    </span>
                  </div>

                  {/* Pulso animado */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-white"
                    style={{ backgroundColor: categoryColor }}
                    animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  />

                  {/* Label compacto */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <div className="bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg shadow-lg">
                      {location.name}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl">
          <p className="text-xs text-muted-foreground mb-2">Legenda:</p>
          <div className="grid grid-cols-2 gap-2">
            {categories.filter(c => c.id !== "all").slice(0, 4).map((cat) => (
              <div key={cat.id} className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-foreground">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Botão de navegação */}
        <motion.div
          className="absolute top-4 right-4"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button className="bg-white/90 backdrop-blur-md hover:bg-white shadow-xl rounded-full w-12 h-12 p-0">
            <Navigation className="w-5 h-5 text-primary" />
          </Button>
        </motion.div>
      </div>

      {/* Panel de detalhes do local selecionado */}
      <AnimatePresence>
        {selectedLocation && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setSelectedLocation(null)}
            />

            {/* Card de detalhes */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-2xl max-h-[70vh] overflow-y-auto"
            >
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{categoryIcons[selectedLocation.category]}</span>
                      <Badge variant="outline" className="text-xs">
                        {categories.find(c => c.id === selectedLocation.category)?.label}
                      </Badge>
                    </div>
                    <h2 className="text-2xl text-foreground mb-1" style={{ fontFamily: 'var(--font-family-heading)' }}>
                      {selectedLocation.name}
                    </h2>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span>{selectedLocation.rating}</span>
                        <span className="text-xs">({selectedLocation.reviews} avaliações)</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Imagem */}
                <div className="relative h-48 rounded-2xl overflow-hidden">
                  <ImageWithFallback
                    src={selectedLocation.image}
                    alt={selectedLocation.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                {/* Descrição */}
                <p className="text-muted-foreground leading-relaxed">
                  {selectedLocation.fullDescription}
                </p>

                {/* Informações */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-foreground">{selectedLocation.address}</p>
                    </div>
                  </div>
                  
                  {selectedLocation.openingHours && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-foreground">{selectedLocation.openingHours}</p>
                      </div>
                    </div>
                  )}

                  {selectedLocation.price && (
                    <div className="flex items-start gap-3">
                      <span className="text-lg">💰</span>
                      <div>
                        <p className="text-sm text-foreground">{selectedLocation.price}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Features */}
                {selectedLocation.features && selectedLocation.features.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Características:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLocation.features.map((feature, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contato */}
                {selectedLocation.contact && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Contato:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLocation.contact.phone && (
                        <Button variant="outline" size="sm" className="rounded-xl">
                          <Phone className="w-4 h-4 mr-2" />
                          Ligar
                        </Button>
                      )}
                      {selectedLocation.contact.whatsapp && (
                        <Button variant="outline" size="sm" className="rounded-xl bg-green-500/10 border-green-500/30 text-green-600">
                          <span className="mr-2">💬</span>
                          WhatsApp
                        </Button>
                      )}
                      {selectedLocation.contact.instagram && (
                        <Button variant="outline" size="sm" className="rounded-xl">
                          <Camera className="w-4 h-4 mr-2" />
                          Instagram
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* CTAs */}
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1 bg-gradient-to-r from-secondary to-primary text-white rounded-2xl h-12">
                    <Navigation className="w-4 h-4 mr-2" />
                    Como Chegar
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-accent to-secondary text-white rounded-2xl h-12">
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}