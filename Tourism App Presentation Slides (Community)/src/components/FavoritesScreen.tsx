import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Heart, Star, MapPin, Clock, Trash2, Share2, Eye } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function FavoritesScreen() {
  const favoriteItems = [
    {
      id: 1,
      type: "attraction",
      name: "Marco do Descobrimento",
      category: "Ponto Turístico",
      rating: 4.7,
      distance: "2.1 km",
      image: "https://images.unsplash.com/photo-1716317886865-4a52485ae48e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWxtb250ZSUyMGJhaGlhJTIwYnJhemlsJTIwY29hc3RhbCUyMHRvd258ZW58MXx8fHwxNzU5MjQwMjQzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      description: "Marco histórico do descobrimento do Brasil",
      savedDate: "Hoje"
    },
    {
      id: 2,
      type: "restaurant",
      name: "Casa do Acarajé",
      category: "Restaurante",
      rating: 4.8,
      distance: "800m",
      image: "https://images.unsplash.com/photo-1732827095554-9e2d664f3f70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjByZXN0YXVyYW50JTIwZm9vZCUyMGN1aXNpbmV8ZW58MXx8fHwxNzU5MjQwMjQ5fDA&ixlib=rb-4.1.0&q=80&w=1080",
      description: "Autêntica comida baiana feita com amor",
      savedDate: "Ontem"
    },
    {
      id: 3,
      type: "route",
      name: "Roteiro Histórico Cultural",
      category: "Roteiro",
      rating: 4.8,
      distance: "5 paradas",
      image: "https://images.unsplash.com/photo-1682152572654-6c0ec46f4aa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWhpYSUyMGJlYWNoJTIwdHJvcGljYWwlMjBwYWxtJTIwdHJlZXN8ZW58MXx8fHwxNzU5MjQwMjQ2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      description: "4 horas explorando a história de Belmonte",
      savedDate: "2 dias atrás"
    },
    {
      id: 4,
      type: "hotel",
      name: "Pousada Vista Mar",
      category: "Hospedagem",
      rating: 4.7,
      distance: "500m",
      image: "https://images.unsplash.com/photo-1682152572654-6c0ec46f4aa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWhpYSUyMGJlYWNoJTIwdHJvcGljYWwlMjBwYWxtJTIwdHJlZXN8ZW58MXx8fHwxNzU5MjQwMjQ2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      description: "Vista incrível para o mar e ótimo atendimento",
      savedDate: "3 dias atrás"
    },
    {
      id: 5,
      type: "shop",
      name: "Feira de Artesanato",
      category: "Compras",
      rating: 4.6,
      distance: "400m",
      image: "https://images.unsplash.com/photo-1667405539218-790649107194?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBoYW5kaWNyYWZ0cyUyMGFydGlzYW4lMjBtYXJrZXQlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NTkyNDAyNTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      description: "Artesanato local e produtos típicos",
      savedDate: "1 semana atrás"
    }
  ];

  const categories = [
    { id: "all", label: "Todos", count: 5, active: true },
    { id: "attractions", label: "Pontos Turísticos", count: 1, active: false },
    { id: "restaurants", label: "Restaurantes", count: 1, active: false },
    { id: "routes", label: "Roteiros", count: 1, active: false },
    { id: "hotels", label: "Hospedagem", count: 1, active: false },
    { id: "shops", label: "Compras", count: 1, active: false }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      "Ponto Turístico": "#2C4D7B",
      "Restaurante": "#F3A64D",
      "Roteiro": "#4C9ED9",
      "Hospedagem": "#2C4D7B",
      "Compras": "#F3A64D"
    };
    return colors[category as keyof typeof colors] || "#4C9ED9";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "route":
        return "📍";
      case "restaurant":
        return "🍽️";
      case "hotel":
        return "🏨";
      case "shop":
        return "🛍️";
      default:
        return "⭐";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4C9ED9]/10 to-[#F3A64D]/10 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl text-[#2C4D7B]">Meus Favoritos</h1>
          <p className="text-sm text-gray-600">
            {favoriteItems.length} itens salvos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-[#4C9ED9]/30">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filtros por categoria */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant={category.active ? "default" : "outline"}
            className={`whitespace-nowrap cursor-pointer ${
              category.active
                ? "bg-[#F3A64D] text-white"
                : "border-[#4C9ED9]/30 text-[#2C4D7B] hover:bg-[#4C9ED9]/10"
            }`}
          >
            {category.label} ({category.count})
          </Badge>
        ))}
      </div>

      {/* Lista de favoritos */}
      {favoriteItems.length > 0 ? (
        <div className="space-y-4">
          {favoriteItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 right-1">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <Heart className="w-3 h-3 text-white fill-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-1 left-1 text-xs">
                    {getTypeIcon(item.type)}
                  </div>
                </div>
                
                <div className="flex-1 p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-sm text-[#2C4D7B] mb-1">{item.name}</h3>
                      <Badge
                        variant="outline"
                        className="text-xs mb-1"
                        style={{
                          borderColor: getCategoryColor(item.category),
                          color: getCategoryColor(item.category)
                        }}
                      >
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{item.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{item.distance}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.savedDate}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-[#4C9ED9] text-white hover:bg-[#2C4D7B] text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Estado vazio */
        <Card className="p-8 text-center">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-[#2C4D7B] mb-2">Nenhum favorito ainda</h3>
          <p className="text-sm text-gray-600 mb-4">
            Explore Belmonte e salve seus lugares favoritos aqui!
          </p>
          <Button className="bg-[#4C9ED9] text-white hover:bg-[#2C4D7B]">
            Descobrir Lugares
          </Button>
        </Card>
      )}

      {/* CTA para explorar mais */}
      <Card className="mt-6 p-4 bg-gradient-to-r from-[#F3A64D] to-[#4C9ED9] text-white text-center">
        <h3 className="mb-2">Descubra mais lugares incríveis</h3>
        <p className="text-sm opacity-90 mb-3">
          A IA Bel pode sugerir novos lugares baseados nos seus favoritos!
        </p>
        <Button className="bg-white text-[#2C4D7B] hover:bg-white/90">
          Receber Sugestões
        </Button>
      </Card>
    </div>
  );
}