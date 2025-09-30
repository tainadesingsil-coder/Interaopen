import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "../contexts/LanguageContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  MapPin, 
  Calendar, 
  Star, 
  Settings, 
  HelpCircle, 
  Share2, 
  Crown,
  Camera,
  Edit3,
  Trophy,
  Clock,
  Heart,
  QrCode,
  Smartphone,
  Download,
  Globe,
  Moon,
  Sun,
  Bell,
  LogOut,
  Shield,
  Award
} from "lucide-react";

export function ProfileScreen() {
  const { t } = useLanguage();
  const [showQRCode, setShowQRCode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const userStats = [
    { label: "Lugares visitados", value: "23", icon: MapPin },
    { label: "Roteiros feitos", value: "8", icon: Calendar },
    { label: "Avaliações", value: "15", icon: Star },
    { label: "Favoritos", value: "12", icon: Heart }
  ];

  const achievements = [
    { title: "Primeiro Check-in", description: "Visitou seu primeiro lugar", icon: "🏆", earned: true },
    { title: "Explorer", description: "Visitou 10 lugares diferentes", icon: "🗺️", earned: true },
    { title: "Foodie", description: "Avaliou 5 restaurantes", icon: "🍽️", earned: true },
    { title: "Aventureiro", description: "Completou 5 roteiros", icon: "⭐", earned: false }
  ];

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-background to-background/80">
      {/* Header com foto de capa */}
      <div className="relative h-48 bg-gradient-to-br from-primary via-secondary to-accent overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="profile-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#profile-pattern)" />
          </svg>
        </div>

        {/* Partículas flutuantes */}
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}

        {/* Settings button */}
        <div className="absolute top-6 right-6 z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg"
          >
            <Settings className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-6 -mt-20 relative z-20">
        <div className="bg-card backdrop-blur-xl border border-border rounded-3xl p-6 shadow-2xl">
          {/* Avatar */}
          <div className="flex flex-col items-center -mt-16 mb-4">
            <div className="relative">
              <Avatar className="w-28 h-28 border-4 border-card shadow-2xl">
                <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400" />
                <AvatarFallback className="bg-gradient-to-br from-secondary to-accent text-white text-2xl">
                  JD
                </AvatarFallback>
              </Avatar>
              
              {/* Badge VIP */}
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center border-2 border-card shadow-lg">
                <Crown className="w-5 h-5 text-white" />
              </div>

              {/* Edit button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg"
              >
                <Camera className="w-4 h-4 text-white" />
              </motion.button>
            </div>

            <h1 className="text-2xl text-foreground mt-4 mb-1" style={{ fontFamily: 'var(--font-family-heading)' }}>
              João Demo
            </h1>
            <p className="text-muted-foreground text-sm mb-3">demo@belmonte.com</p>
            
            <Badge className="bg-gradient-to-r from-accent to-secondary text-white border-0">
              <Trophy className="w-3 h-3 mr-1" />
              Explorer Premium
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            {userStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-2xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-secondary" />
                  </div>
                  <p className="text-xl text-foreground mb-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* QR Code Section - NOVO */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card className="p-6 bg-gradient-to-br from-accent/10 via-secondary/10 to-primary/10 border-accent/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg text-foreground" style={{ fontFamily: 'var(--font-family-heading)' }}>
                    {t.downloadApp}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t.scanQRCode}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQRCode(!showQRCode)}
                className="p-2"
              >
                <QrCode className="w-6 h-6 text-accent" />
              </motion.button>
            </div>

            <AnimatePresence>
              {showQRCode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white rounded-2xl p-6 flex flex-col items-center">
                    {/* QR Code simulado */}
                    <div className="w-48 h-48 bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden">
                      {/* Pattern de QR Code */}
                      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-1 p-3">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div
                            key={i}
                            className={`${
                              Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'
                            } rounded-sm`}
                          />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
                          <QrCode className="w-10 h-10 text-primary" />
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-center text-foreground mb-2">
                      Escaneie para baixar o app
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      Disponível para iOS e Android
                    </p>
                    
                    <div className="flex gap-2 mt-4">
                      <Badge variant="outline" className="text-xs">
                        📱 iOS
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        🤖 Android
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Settings Menu */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 space-y-3"
        >
          <h2 className="text-lg text-foreground px-2 mb-4" style={{ fontFamily: 'var(--font-family-heading)' }}>
            {t.settings}
          </h2>

          {/* Language Selector */}
          <Card className="p-4 bg-card hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground">{t.language}</p>
                </div>
              </div>
              <LanguageSelector />
            </div>
          </Card>

          {/* Dark Mode */}
          <Card className="p-4 bg-card hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  {isDarkMode ? (
                    <Moon className="w-5 h-5 text-accent" />
                  ) : (
                    <Sun className="w-5 h-5 text-accent" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-foreground">{t.darkMode}</p>
                  <p className="text-xs text-muted-foreground">
                    {isDarkMode ? 'Ativado' : 'Desativado'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`
                  relative w-12 h-6 rounded-full transition-colors
                  ${isDarkMode ? 'bg-accent' : 'bg-muted'}
                `}
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                  animate={{ x: isDarkMode ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-4 bg-card hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground">{t.notifications}</p>
                  <p className="text-xs text-muted-foreground">Gerenciar notificações</p>
                </div>
              </div>
              <Badge className="bg-accent/20 text-accent border-0">
                3
              </Badge>
            </div>
          </Card>

          {/* Privacy */}
          <Card className="p-4 bg-card hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-foreground">Privacidade & Segurança</p>
                <p className="text-xs text-muted-foreground">Controle seus dados</p>
              </div>
            </div>
          </Card>

          {/* Help */}
          <Card className="p-4 bg-card hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-foreground">Ajuda & Suporte</p>
                <p className="text-xs text-muted-foreground">Central de ajuda</p>
              </div>
            </div>
          </Card>

          {/* Logout */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="p-4 bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer border-red-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-red-500">{t.logout}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 mb-8"
        >
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-lg text-foreground" style={{ fontFamily: 'var(--font-family-heading)' }}>
              Conquistas
            </h2>
            <Badge variant="outline">
              {achievements.filter(a => a.earned).length}/{achievements.length}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className={`
                  p-4 text-center
                  ${achievement.earned
                    ? 'bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/20'
                    : 'bg-muted/30 opacity-60'
                  }
                `}>
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <p className="text-sm text-foreground mb-1">{achievement.title}</p>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* App Version */}
        <div className="text-center py-6 text-xs text-muted-foreground">
          <p>Guia de Turismo de Belmonte</p>
          <p className="mt-1">Versão 1.0.0 • Made with ❤️ in Bahia</p>
        </div>
      </div>
    </div>
  );
}