import { motion, AnimatePresence } from "motion/react";
import { MapPin, Utensils, Camera, Star, Clock, Heart } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

interface Suggestion {
  id: string;
  type: "restaurant" | "attraction" | "experience" | "route";
  title: string;
  description: string;
  rating?: number;
  distance?: string;
  price?: string;
  image?: string;
  tags: string[];
}

interface BelSuggestionsProps {
  context: string;
  isVisible: boolean;
  onClose: () => void;
  onSuggestionClick: (suggestion: Suggestion) => void;
}

export function BelSuggestions({ context, isVisible, onClose, onSuggestionClick }: BelSuggestionsProps) {
  const getSuggestions = (): Suggestion[] => {
    switch (context) {
      case "food":
        return [
          {
            id: "1",
            type: "restaurant",
            title: "Casa do Acarajé da Dona Maria",
            description: "O acarajé mais autêntico de Belmonte, receita de família há 30 anos",
            rating: 4.9,
            distance: "400m",
            price: "R$ 12-25",
            tags: ["Tradicional", "Familiar", "Autêntico"]
          },
          {
            id: "2", 
            type: "restaurant",
            title: "Restaurante Maré Alta",
            description: "Moqueca de peixe fresco com vista para o mar",
            rating: 4.7,
            distance: "800m", 
            price: "R$ 35-60",
            tags: ["Vista Mar", "Frutos do Mar", "Romântico"]
          }
        ];
      case "map":
        return [
          {
            id: "3",
            type: "attraction",
            title: "Marco do Descobrimento", 
            description: "Local histórico onde Pedro Álvares Cabral chegou ao Brasil",
            rating: 4.8,
            distance: "1.2km",
            tags: ["Histórico", "Cultural", "Imperdível"]
          },
          {
            id: "4",
            type: "attraction",
            title: "Praia do Pescador",
            description: "Praia paradisíaca com águas cristalinas e coqueiros",
            rating: 4.9,
            distance: "600m",
            tags: ["Praia", "Relaxante", "Fotogênico"]
          }
        ];
      case "routes":
        return [
          {
            id: "5",
            type: "route",
            title: "Roteiro Histórico Cultural",
            description: "Descubra a rica história de Belmonte em meio dia",
            distance: "3.5km",
            tags: ["Histórico", "Meio dia", "Família"]
          },
          {
            id: "6", 
            type: "route",
            title: "Paraíso das Praias",
            description: "As 3 praias mais bonitas para um dia perfeito",
            distance: "5km",
            tags: ["Praias", "Dia inteiro", "Aventura"]
          }
        ];
      default:
        return [
          {
            id: "7",
            type: "experience",
            title: "Pôr do Sol no Farol",
            description: "Experiência única com vista panorâmica de Belmonte",
            rating: 5.0,
            distance: "2km",
            tags: ["Pôr do Sol", "Romântico", "Instagramável"]
          }
        ];
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "restaurant": return Utensils;
      case "attraction": return MapPin;
      case "route": return Camera;
      default: return Star;
    }
  };

  const suggestions = getSuggestions();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-end justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-md bg-card/95 backdrop-blur-md rounded-t-3xl p-6 shadow-2xl border-t border-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F3A64D] to-[#6ba3d6] rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg text-foreground">Sugestões da Dora</h3>
                <p className="text-sm text-muted-foreground">Especialmente para você</p>
              </div>
            </div>

            {/* Suggestions */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {suggestions.map((suggestion, index) => {
                const Icon = getTypeIcon(suggestion.type);
                
                return (
                  <motion.div
                    key={suggestion.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-card/50"
                      onClick={() => onSuggestionClick(suggestion)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#6ba3d6] to-[#4a7ba7] rounded-2xl flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="text-sm text-foreground mb-1">{suggestion.title}</h4>
                          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                            {suggestion.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {suggestion.tags.slice(0, 2).map((tag) => (
                                <Badge 
                                  key={tag}
                                  variant="outline"
                                  className="text-xs px-2 py-0 border-[#6ba3d6]/30 text-[#6ba3d6]"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {suggestion.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span>{suggestion.rating}</span>
                                </div>
                              )}
                              {suggestion.distance && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{suggestion.distance}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Close indicator */}
            <motion.div 
              className="w-12 h-1 bg-muted rounded-full mx-auto mt-4"
              whileHover={{ scale: 1.2 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}