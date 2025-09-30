import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Star, MapPin, Clock, ShoppingBag, Filter, Palette } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function ShoppingScreen() {
  const shops = [
    {
      id: 1,
      name: "Feira de Artesanato",
      type: "Feira",
      rating: 4.6,
      reviews: 127,
      distance: "400m",
      openHours: "08:00 - 18:00",
      image: "https://images.unsplash.com/photo-1667405539218-790649107194?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCcmF6aWxpYW4lMjBjcmFmdCUyMG1hcmtldCUyMGFydGlzYW4lMjBoYW5kbWFkZSUyMGNvbG9yZnVsfGVufDF8fHx8MTc1OTI0MTEyNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      products: ["Cerâmica", "Tecidos", "Bijuterias", "Souvenirs"],
      status: "Aberto",
      highlight: "Produtos Locais",
      priceRange: "$"
    },
    {
      id: 2,
      name: "Loja do Coco",
      type: "Artesanato",
      rating: 4.8,
      reviews: 89,
      distance: "600m",
      openHours: "09:00 - 19:00",
      image: "https://images.unsplash.com/photo-1667405539218-790649107194?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBoYW5kaWNyYWZ0cyUyMGFydGlzYW4lMjBtYXJrZXQlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NTkyNDAyNTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      products: ["Artigos de coco", "Decoração", "Utensílios", "Lembranças"],
      status: "Aberto",
      highlight: "Feito à mão",
      priceRange: "$$"
    },
    {
      id: 3,
      name: "Casa das Rendas",
      type: "Têxtil",
      rating: 4.7,
      reviews: 64,
      distance: "800m",
      openHours: "10:00 - 17:00",
      image: "https://images.unsplash.com/photo-1667405539218-790649107194?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBoYW5kaWNyYWZ0cyUyMGFydGlzYW4lMjBtYXJrZXQlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NTkyNDAyNTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      products: ["Renda de bilro", "Bordados", "Toalhas", "Vestidos"],
      status: "Fechado",
      highlight: "Tradição local",
      priceRange: "$$$"
    },
    {
      id: 4,
      name: "Galeria Arte Bahiana",
      type: "Arte",
      rating: 4.5,
      reviews: 42,
      distance: "1.1km",
      openHours: "11:00 - 20:00",
      image: "https://images.unsplash.com/photo-1667405539218-790649107194?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBoYW5kaWNyYWZ0cyUyMGFydGlzYW4lMjBtYXJrZXQlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NTkyNDAyNTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      products: ["Pinturas", "Esculturas", "Gravuras", "Fotografias"],
      status: "Aberto",
      highlight: "Arte Original",
      priceRange: "$$$"
    }
  ];

  const categories = [
    { id: "all", label: "Todos", icon: ShoppingBag, active: true },
    { id: "handicrafts", label: "Artesanato", icon: Palette, active: false },
    { id: "textiles", label: "Têxtil", icon: ShoppingBag, active: false },
    { id: "art", label: "Arte", icon: Palette, active: false },
    { id: "souvenirs", label: "Lembranças", icon: ShoppingBag, active: false }
  ];

  const featuredProducts = [
    { name: "Cerâmica Marajoara", price: "R$ 45", category: "Decoração" },
    { name: "Renda de Bilro", price: "R$ 120", category: "Têxtil" },
    { name: "Colar de Sementes", price: "R$ 25", category: "Bijuteria" },
    { name: "Quadro Paisagem", price: "R$ 180", category: "Arte" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4C9ED9]/10 to-[#F3A64D]/10 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl text-[#2C4D7B]">Comércio Local</h1>
          <p className="text-sm text-gray-600">Artesanato e produtos típicos</p>
        </div>
        <Button variant="outline" size="sm" className="border-[#4C9ED9]/30">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Categorias */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={category.active ? "default" : "outline"}
              size="sm"
              className={`whitespace-nowrap ${
                category.active
                  ? "bg-[#F3A64D] text-white hover:bg-[#F3A64D]/90"
                  : "border-[#4C9ED9]/30 text-[#2C4D7B] hover:bg-[#4C9ED9]/10"
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {category.label}
            </Button>
          );
        })}
      </div>

      {/* Produtos em destaque */}
      <Card className="p-4 mb-6 bg-gradient-to-r from-[#F3A64D]/10 to-[#4C9ED9]/10">
        <h2 className="text-[#2C4D7B] mb-3">Produtos em Destaque</h2>
        <div className="grid grid-cols-2 gap-3">
          {featuredProducts.map((product, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
            >
              <h4 className="text-sm text-[#2C4D7B] mb-1">{product.name}</h4>
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="text-xs border-[#4C9ED9]/30 text-[#4C9ED9]">
                  {product.category}
                </Badge>
                <span className="text-sm text-[#F3A64D]">{product.price}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Lista de lojas */}
      <div className="space-y-4">
        {shops.map((shop) => (
          <Card key={shop.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex">
              <div className="relative w-24 h-24 flex-shrink-0">
                <ImageWithFallback
                  src={shop.image}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      shop.status === "Aberto"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {shop.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex-1 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-[#2C4D7B] mb-1">{shop.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Badge variant="outline" className="border-[#4C9ED9]/30 text-[#4C9ED9]">
                        {shop.type}
                      </Badge>
                      <span>{shop.priceRange}</span>
                    </div>
                  </div>
                  <Badge className="bg-[#F3A64D] text-white text-xs">
                    {shop.highlight}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{shop.rating}</span>
                    <span>({shop.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{shop.distance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{shop.openHours}</span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Produtos:</p>
                  <div className="flex flex-wrap gap-1">
                    {shop.products.slice(0, 3).map((product, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs border-[#F3A64D]/30 text-[#F3A64D]"
                      >
                        {product}
                      </Badge>
                    ))}
                    {shop.products.length > 3 && (
                      <Badge
                        variant="outline"
                        className="text-xs border-gray-300 text-gray-500"
                      >
                        +{shop.products.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-[#4C9ED9] text-white hover:bg-[#2C4D7B] text-xs"
                  >
                    Ver Produtos
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#F3A64D] text-[#F3A64D] hover:bg-[#F3A64D] hover:text-white"
                  >
                    Localizar
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* CTA para tour de compras */}
      <Card className="mt-6 p-4 bg-gradient-to-r from-[#F3A64D] to-[#4C9ED9] text-white text-center">
        <ShoppingBag className="w-6 h-6 mx-auto mb-2" />
        <h3 className="mb-2">Tour de Compras Personalizado</h3>
        <p className="text-sm opacity-90 mb-3">
          Deixe a IA Bel criar um roteiro de compras baseado nos seus interesses!
        </p>
        <Button className="bg-white text-[#2C4D7B] hover:bg-white/90">
          Criar Tour com IA Bel
        </Button>
      </Card>
    </div>
  );
}