import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Star, MapPin, Wifi, Car, Waves, Coffee, Calendar, Users } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function HotelsScreen() {
  const hotels = [
    {
      id: 1,
      name: "Pousada Vista Mar",
      type: "Pousada",
      rating: 4.7,
      reviews: 89,
      price: "R$ 180",
      priceUnit: "/noite",
      distance: "500m do centro",
      image: "https://images.unsplash.com/photo-1609517448522-2e108986b505?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCcmF6aWwlMjBwb3VzYWRhJTIwaG90ZWwlMjB0cm9waWNhbCUyMGFjY29tbW9kYXRpb258ZW58MXx8fHwxNzU5MjQxMTMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      amenities: ["Wifi", "Estacionamento", "Vista para o mar", "Café da manhã"],
      availability: "Disponível",
      highlight: "Vista para o mar"
    },
    {
      id: 2,
      name: "Hotel Belmonte Resort",
      type: "Resort",
      rating: 4.9,
      reviews: 234,
      price: "R$ 350",
      priceUnit: "/noite",
      distance: "1.2km do centro",
      image: "https://images.unsplash.com/photo-1682152572654-6c0ec46f4aa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWhpYSUyMGJlYWNoJTIwdHJvcGljYWwlMjBwYWxtJTIwdHJlZXN8ZW58MXx8fHwxNzU5MjQwMjQ2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      amenities: ["Wifi", "Piscina", "Spa", "Restaurante"],
      availability: "Últimos quartos",
      highlight: "All Inclusive"
    },
    {
      id: 3,
      name: "Hostel do Pescador",
      type: "Hostel",
      rating: 4.3,
      reviews: 156,
      price: "R$ 45",
      priceUnit: "/noite",
      distance: "300m da praia",
      image: "https://images.unsplash.com/photo-1682152572654-6c0ec46f4aa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWhpYSUyMGJlYWNoJTIwdHJvcGljYWwlMjBwYWxtJTIwdHJlZXN8ZW58MXx8fHwxNzU5MjQwMjQ2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      amenities: ["Wifi", "Cozinha compartilhada", "Área comum", "Bicicletas"],
      availability: "Disponível",
      highlight: "Melhor custo-benefício"
    },
    {
      id: 4,
      name: "Casa dos Coqueiros",
      type: "Casa",
      rating: 4.6,
      reviews: 43,
      price: "R$ 280",
      priceUnit: "/noite",
      distance: "800m do centro",
      image: "https://images.unsplash.com/photo-1682152572654-6c0ec46f4aa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWhpYSUyMGJlYWNoJTIwdHJvcGljYWwlMjBwYWxtJTIwdHJlZXN8ZW58MXx8fHwxNzU5MjQwMjQ2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      amenities: ["Wifi", "Cozinha completa", "Varanda", "Jardim"],
      availability: "Indisponível",
      highlight: "Casa completa"
    }
  ];

  const amenityIcons = {
    "Wifi": Wifi,
    "Estacionamento": Car,
    "Vista para o mar": Waves,
    "Café da manhã": Coffee,
    "Piscina": Waves,
    "Spa": Star,
    "Restaurante": Coffee,
    "Cozinha compartilhada": Coffee,
    "Área comum": Users,
    "Bicicletas": Car,
    "Cozinha completa": Coffee,
    "Varanda": Waves,
    "Jardim": Waves
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4C9ED9]/10 to-[#F3A64D]/10 p-4 pb-20">
      {/* Header com busca rápida */}
      <div className="mb-6">
        <h1 className="text-xl text-[#2C4D7B] mb-4">Hospedagem</h1>
        
        <Card className="p-4 bg-white/80 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 bg-[#4C9ED9]/10 rounded-lg">
              <Calendar className="w-4 h-4 text-[#4C9ED9]" />
              <span className="text-sm text-[#2C4D7B]">Check-in: Hoje</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-[#F3A64D]/10 rounded-lg">
              <Calendar className="w-4 h-4 text-[#F3A64D]" />
              <span className="text-sm text-[#2C4D7B]">Check-out: Amanhã</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mt-3">
            <Users className="w-4 h-4 text-[#2C4D7B]" />
            <span className="text-sm text-[#2C4D7B]">2 hóspedes • 1 quarto</span>
          </div>
        </Card>
      </div>

      {/* Lista de hospedagens */}
      <div className="space-y-4">
        {hotels.map((hotel) => (
          <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <div className="h-40 overflow-hidden">
                <ImageWithFallback
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Badge de destaque */}
              <div className="absolute top-3 left-3">
                <Badge className="bg-[#F3A64D] text-white">
                  {hotel.highlight}
                </Badge>
              </div>
              
              {/* Status de disponibilidade */}
              <div className="absolute top-3 right-3">
                <Badge
                  variant="secondary"
                  className={`${
                    hotel.availability === "Disponível"
                      ? "bg-green-500 text-white"
                      : hotel.availability === "Últimos quartos"
                      ? "bg-orange-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {hotel.availability}
                </Badge>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="text-[#2C4D7B] mb-1">{hotel.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <Badge variant="outline" className="border-[#4C9ED9]/30 text-[#4C9ED9]">
                      {hotel.type}
                    </Badge>
                    <MapPin className="w-3 h-3" />
                    <span>{hotel.distance}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg text-[#F3A64D]">{hotel.price}</div>
                  <div className="text-xs text-gray-500">{hotel.priceUnit}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{hotel.rating}</span>
                <span>({hotel.reviews} avaliações)</span>
              </div>
              
              {/* Comodidades */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Comodidades:</p>
                <div className="flex flex-wrap gap-2">
                  {hotel.amenities.slice(0, 3).map((amenity, index) => {
                    const IconComponent = amenityIcons[amenity as keyof typeof amenityIcons] || Star;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-1 text-xs text-[#2C4D7B] bg-[#4C9ED9]/10 px-2 py-1 rounded-full"
                      >
                        <IconComponent className="w-3 h-3" />
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                  {hotel.amenities.length > 3 && (
                    <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      +{hotel.amenities.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  className={`flex-1 text-xs ${
                    hotel.availability === "Indisponível"
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#4C9ED9] hover:bg-[#2C4D7B]"
                  }`}
                  disabled={hotel.availability === "Indisponível"}
                >
                  {hotel.availability === "Indisponível" ? "Indisponível" : "Reservar"}
                </Button>
                <Button
                  variant="outline"
                  className="border-[#F3A64D] text-[#F3A64D] hover:bg-[#F3A64D] hover:text-white"
                >
                  Ver detalhes
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* CTA para mais opções */}
      <Card className="mt-6 p-4 bg-gradient-to-r from-[#F3A64D] to-[#4C9ED9] text-white text-center">
        <h3 className="mb-2">Não encontrou o ideal?</h3>
        <p className="text-sm opacity-90 mb-3">
          A IA Bel pode ajudar você a encontrar a hospedagem perfeita!
        </p>
        <Button className="bg-white text-[#2C4D7B] hover:bg-white/90">
          Buscar com IA Bel
        </Button>
      </Card>
    </div>
  );
}