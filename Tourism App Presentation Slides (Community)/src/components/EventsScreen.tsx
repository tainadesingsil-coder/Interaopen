import { motion } from "motion/react";
import { PremiumCard } from "./PremiumCard";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, MapPin, Clock, Users, Bell, Sparkles, Music, PartyPopper } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function EventsScreen() {
  const upcomingEvents = [
    {
      id: 1,
      title: "Festival de São João",
      date: "24 de Junho",
      time: "19:00",
      location: "Praça Central",
      attendees: "500+ pessoas",
      type: "Festa Tradicional",
      image: "https://images.unsplash.com/photo-1640251314219-be6eb294446b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWxpYW4lMjBmZXN0aXZhbCUyMGNlbGVicmF0aW9uJTIwc3RyZWV0JTIwcGFydHl8ZW58MXx8fHwxNzU5MjQ1NzQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "A maior festa junina da região com comidas típicas, forró e muita animação",
      badge: "Destaque",
      color: "from-[#F3A64D] to-[#6ba3d6]"
    },
    {
      id: 2,
      title: "Feira de Artesanato",
      date: "Todos os Sábados",
      time: "08:00 - 18:00",
      location: "Beira Rio",
      attendees: "200+ visitantes/dia",
      type: "Cultural",
      image: "https://images.unsplash.com/photo-1667405539218-790649107194?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmF6aWwlMjBhcnRpc2FuJTIwY3JhZnRzJTIwaGFuZG1hZGUlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NTkyNDU1MzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Artesanato local, gastronomia e música ao vivo às margens do Jequitinhonha",
      badge: "Semanal",
      color: "from-[#6ba3d6] to-[#4a7ba7]"
    },
    {
      id: 3,
      title: "Procissão de Nossa Senhora",
      date: "15 de Agosto",
      time: "16:00",
      location: "Igreja do Rosário",
      attendees: "1000+ fiéis",
      type: "Religioso",
      image: "https://images.unsplash.com/photo-1555681102-b797fb73aa6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvbmlhbCUyMGNodXJjaCUyMGJyYXppbCUyMGhpc3RvcmljJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc1OTI0NTUzMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Tradicional procissão pelas ruas históricas de Belmonte",
      badge: "Tradicional",
      color: "from-[#4a7ba7] to-[#F3A64D]"
    }
  ];

  const categories = [
    { id: "all", label: "Todos", icon: Calendar, active: true },
    { id: "culture", label: "Cultural", icon: Music, active: false },
    { id: "religious", label: "Religioso", icon: Bell, active: false },
    { id: "party", label: "Festas", icon: PartyPopper, active: false }
  ];

  return (
    <div className="min-h-screen pb-20 overflow-hidden">
      {/* Header Premium */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#6ba3d6]/20 to-[#F3A64D]/20 pt-8 pb-12 px-6">
        {/* Partículas decorativas */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-3xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 360],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                delay: i * 0.6,
              }}
            >
              {['🎵', '🎨', '🎭', '🎪'][i % 4]}
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
              <Calendar className="w-6 h-6 text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-2xl text-foreground" style={{ fontFamily: 'var(--font-family-heading)' }}>
                Eventos & Cultura
              </h1>
              <p className="text-sm text-muted-foreground">Celebre Minas Gerais conosco</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-6 -mt-6 space-y-6">
        {/* Categorias */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        >
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap cursor-pointer transition-all ${
                    category.active
                      ? 'bg-gradient-to-r from-[#F3A64D] to-[#6ba3d6] text-white shadow-lg'
                      : 'bg-white/5 backdrop-blur-md border border-white/10 text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{category.label}</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Alerta da Bel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-gradient-to-r from-[#F3A64D]/10 to-[#6ba3d6]/10 backdrop-blur-md border border-[#F3A64D]/20 rounded-3xl p-5 flex items-start gap-4">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-[#F3A64D] to-[#6ba3d6] rounded-xl flex items-center justify-center flex-shrink-0"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Bell className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex-1">
              <h4 className="text-foreground mb-1 text-sm">Próximo Evento</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                O Festival de São João começa em 3 dias! Não perca a maior festa do ano.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Lista de eventos */}
        <div>
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div>
              <h3 className="text-xl text-foreground" style={{ fontFamily: 'var(--font-family-heading)' }}>
                Próximos Eventos
              </h3>
              <p className="text-sm text-muted-foreground">Agenda cultural completa</p>
            </div>
            <Sparkles className="w-5 h-5 text-[#F3A64D]" />
          </motion.div>

          <div className="space-y-6">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
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
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-[#F3A64D]/90 backdrop-blur-md text-white border-white/20 shadow-lg">
                        {event.badge}
                      </Badge>
                    </div>

                    {/* Data em destaque */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-3 text-center min-w-[60px]">
                        <div className="text-white text-xs mb-1">
                          {event.date.split(' ')[0]}
                        </div>
                        <div className="text-white text-lg" style={{ fontFamily: 'var(--font-family-heading)' }}>
                          {event.date.split(' ')[2] || event.date.split(' ')[1]}
                        </div>
                      </div>
                    </div>

                    {/* Título sobreposto */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge variant="outline" className="mb-2 border-white/30 bg-white/10 backdrop-blur-md text-white">
                        {event.type}
                      </Badge>
                      <h3 className="text-white text-xl mb-1" style={{ fontFamily: 'var(--font-family-heading)' }}>
                        {event.title}
                      </h3>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-6">
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Informações do evento */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-[#6ba3d6]/10 rounded-xl flex items-center justify-center">
                          <Clock className="w-4 h-4 text-[#6ba3d6]" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Horário</p>
                          <p className="text-foreground text-sm">{event.time}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-[#F3A64D]/10 rounded-xl flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-[#F3A64D]" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Local</p>
                          <p className="text-foreground text-sm">{event.location}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm col-span-2">
                        <div className="w-8 h-8 bg-[#6ba3d6]/10 rounded-xl flex items-center justify-center">
                          <Users className="w-4 h-4 text-[#6ba3d6]" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Público esperado</p>
                          <p className="text-foreground text-sm">{event.attendees}</p>
                        </div>
                      </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex gap-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                        <Button className={`w-full bg-gradient-to-r ${event.color} text-white border-0 rounded-2xl h-11 shadow-lg relative overflow-hidden group`}>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                          <span className="relative flex items-center justify-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Adicionar ao Calendário
                          </span>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA para notificações */}
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
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Bell className="w-12 h-12 mx-auto mb-4 text-white" />
              </motion.div>
              
              <h3 className="text-white text-2xl mb-3" style={{ fontFamily: 'var(--font-family-heading)' }}>
                Nunca perca um evento
              </h3>
              
              <p className="text-white/90 mb-6 max-w-md mx-auto">
                Ative as notificações e a IA Dora te avisa quando houver eventos do seu interesse!
              </p>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-white text-[#0a0e1a] hover:bg-white/90 rounded-2xl px-8 h-12 shadow-xl">
                  <span className="flex items-center gap-2">
                    Ativar Notificações
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