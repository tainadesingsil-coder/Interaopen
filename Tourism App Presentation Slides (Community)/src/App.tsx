import { useState } from "react";
import { BottomNavigation } from "./components/BottomNavigation";
import { LoginScreen } from "./components/LoginScreen";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { HomeScreen } from "./components/HomeScreen";
import { MapScreen } from "./components/MapScreen";
import { RoutesScreen } from "./components/RoutesScreen";
import { FoodScreen } from "./components/FoodScreen";
import { EventsScreen } from "./components/EventsScreen";
import { HotelsScreen } from "./components/HotelsScreen";
import { ShoppingScreen } from "./components/ShoppingScreen";
import { FavoritesScreen } from "./components/FavoritesScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { AIBel } from "./components/AIBel";
import { BelIntroAnimation } from "./components/BelIntroAnimation";
import { BelSuggestions } from "./components/BelSuggestions";
import { BelNotifications } from "./components/BelNotifications";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CityProvider } from "./contexts/CityContext";

function AppContent() {
  const [activeTab, setActiveTab] = useState("home");
  const [showAIBel, setShowAIBel] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getAIBelMessage = () => {
    switch (activeTab) {
      case "home":
        return "Oi! 👋 Pronta para explorar Minas Gerais? Tenho dicas incríveis para você!";
      case "map":
        return "🗺️ Vamos explorar! Cada ponto no mapa esconde uma história única de Minas Gerais.";
      case "routes":
        return "✨ Hora de criar sua aventura perfeita! Prefere praias, cultura ou gastronomia?";
      case "food":
        return "🍽️ Que delícia! Posso te levar aos melhores sabores de Minas!";
      case "events":
        return "🎉 O Festival de São João está chegando! Quer saber todos os detalhes?";
      case "hotels":
        return "🏨 Encontrei hospedagens charmosas em MG! Qual seu estilo preferido?";
      case "shopping":
        return "🎨 O artesanato local está maravilhoso! Que tal uma peça única feita pelos artistas daqui?";
      case "favorites":
        return "❤️ Seus gostos são excelentes! Baseado nisso, tenho mais surpresas para você.";
      case "profile":
        return "🌟 Você já explorou tanto! Que tal desbloquear o badge de 'Expert em Minas'?";
      default:
        return "⛰️ Minas Gerais te espera! Vamos juntas nessa jornada incrível?";
    }
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen onCreateRoute={() => setActiveTab("routes")} />;
      case "map":
        return <MapScreen />;
      case "routes":
        return <RoutesScreen />;
      case "food":
        return <FoodScreen />;
      case "events":
        return <EventsScreen />;
      case "hotels":
        return <HotelsScreen />;
      case "shopping":
        return <ShoppingScreen />;
      case "favorites":
        return <FavoritesScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <HomeScreen onCreateRoute={() => setActiveTab("routes")} />;
    }
  };

  if (showLogin) {
    return <LoginScreen onLogin={() => setShowLogin(false)} />;
  }

  if (showIntro) {
    return <BelIntroAnimation onComplete={() => setShowIntro(false)} />;
  }

  if (showWelcome) {
    return (
      <WelcomeScreen 
        onExplore={() => {
          setShowWelcome(false);
          setActiveTab("home");
        }}
        onCreateRoute={() => {
          setShowWelcome(false);
          setActiveTab("routes");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative dark">
      {/* Tela principal */}
      <main className="pb-16">
        {renderScreen()}
      </main>

      {/* IA Bel - Assistente virtual */}
      <div onClick={() => setShowSuggestions(true)}>
        <AIBel 
          message={getAIBelMessage()}
          isVisible={showAIBel}
          position="bottom-right"
          context={activeTab as any}
        />
      </div>

      {/* Sugestões da Bel */}
      <BelSuggestions
        context={activeTab}
        isVisible={showSuggestions}
        onClose={() => setShowSuggestions(false)}
        onSuggestionClick={(suggestion) => {
          console.log("Sugestão selecionada:", suggestion);
          setShowSuggestions(false);
          // Aqui você pode implementar a navegação baseada na sugestão
        }}
      />

      {/* Notificações contextuais da Bel */}
      <BelNotifications context={activeTab} />

      {/* Navegação inferior */}
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <CityProvider>
        <AppContent />
      </CityProvider>
    </LanguageProvider>
  );
}