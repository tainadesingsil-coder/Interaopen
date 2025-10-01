// Sistema de traduções multilíngue para o app Belmonte

export type Language = 'pt' | 'en' | 'es' | 'fr';

export interface Translations {
  // Login & Auth
  welcome: string;
  welcomeSubtitle: string;
  email: string;
  password: string;
  login: string;
  signup: string;
  createAccount: string;
  fullName: string;
  rememberMe: string;
  forgotPassword: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;
  createNow: string;
  signIn: string;
  orContinueWith: string;
  
  // Navigation
  home: string;
  map: string;
  routes: string;
  food: string;
  events: string;
  hotels: string;
  shopping: string;
  favorites: string;
  profile: string;
  
  // Home
  discoverBelmonte: string;
  aiAssistant: string;
  popularPlaces: string;
  featuredRoutes: string;
  startExploring: string;
  
  // Map
  interactiveMap: string;
  searchPlaces: string;
  filterByCategory: string;
  all: string;
  beaches: string;
  restaurants: string;
  shops: string;
  historical: string;
  howToGetThere: string;
  viewDetails: string;
  
  // Routes
  smartRoutes: string;
  createCustomRoute: string;
  duration: string;
  stops: string;
  difficulty: string;
  easy: string;
  moderate: string;
  challenging: string;
  startRoute: string;
  highlights: string;
  
  // Food
  localCuisine: string;
  openNow: string;
  closed: string;
  viewMenu: string;
  makeReservation: string;
  
  // Events
  eventsAndCulture: string;
  upcoming: string;
  thisWeek: string;
  thisMonth: string;
  
  // Hotels
  accommodation: string;
  checkAvailability: string;
  pricePerNight: string;
  bookNow: string;
  
  // Shopping
  localCommerce: string;
  artisanShops: string;
  souvenirs: string;
  
  // Profile
  myProfile: string;
  settings: string;
  language: string;
  darkMode: string;
  notifications: string;
  logout: string;
  downloadApp: string;
  scanQRCode: string;
  
  // Bel AI
  belGreeting: string;
  askBel: string;
  suggestions: string;
  
  // Common
  search: string;
  filter: string;
  save: string;
  share: string;
  cancel: string;
  confirm: string;
  back: string;
  next: string;
  rating: string;
  reviews: string;
  contact: string;
  openingHours: string;
  address: string;
  phone: string;
  website: string;
  getDirections: string;
}

export const translations: Record<Language, Translations> = {
  pt: {
    // Login & Auth
    welcome: "Bem-vindo(a) a",
    welcomeSubtitle: "Entre e descubra as belezas de Minas Gerais",
    email: "E-mail",
    password: "Senha",
    login: "Entrar",
    signup: "Cadastrar",
    createAccount: "Criar Conta",
    fullName: "Nome completo",
    rememberMe: "Lembrar de mim",
    forgotPassword: "Esqueceu a senha?",
    dontHaveAccount: "Não tem conta?",
    alreadyHaveAccount: "Já tem uma conta?",
    createNow: "Criar agora",
    signIn: "Entrar",
    orContinueWith: "ou continue com",
    
    // Navigation
    home: "Início",
    map: "Mapa",
    routes: "Roteiros",
    food: "Gastronomia",
    events: "Eventos",
    hotels: "Hospedagem",
    shopping: "Comércio",
    favorites: "Favoritos",
    profile: "Perfil",
    
    // Home
    discoverBelmonte: "Descubra Minas Gerais",
    aiAssistant: "Assistente IA",
    popularPlaces: "Lugares Populares",
    featuredRoutes: "Roteiros em Destaque",
    startExploring: "Começar a Explorar",
    
    // Map
    interactiveMap: "Mapa Interativo",
    searchPlaces: "Buscar locais...",
    filterByCategory: "Filtrar por categoria",
    all: "Todos",
    beaches: "Praias",
    restaurants: "Restaurantes",
    shops: "Comércio",
    historical: "Histórico",
    howToGetThere: "Como Chegar",
    viewDetails: "Ver Detalhes",
    
    // Routes
    smartRoutes: "Roteiros Inteligentes",
    createCustomRoute: "Criar Roteiro Personalizado",
    duration: "Duração",
    stops: "Paradas",
    difficulty: "Dificuldade",
    easy: "Fácil",
    moderate: "Moderado",
    challenging: "Desafiador",
    startRoute: "Iniciar Roteiro",
    highlights: "Destaques",
    
    // Food
    localCuisine: "Gastronomia Local",
    openNow: "Aberto agora",
    closed: "Fechado",
    viewMenu: "Ver Cardápio",
    makeReservation: "Fazer Reserva",
    
    // Events
    eventsAndCulture: "Eventos & Cultura",
    upcoming: "Em breve",
    thisWeek: "Esta semana",
    thisMonth: "Este mês",
    
    // Hotels
    accommodation: "Hospedagem",
    checkAvailability: "Verificar Disponibilidade",
    pricePerNight: "por noite",
    bookNow: "Reservar Agora",
    
    // Shopping
    localCommerce: "Comércio Local",
    artisanShops: "Lojas de Artesanato",
    souvenirs: "Lembranças",
    
    // Profile
    myProfile: "Meu Perfil",
    settings: "Configurações",
    language: "Idioma",
    darkMode: "Modo Escuro",
    notifications: "Notificações",
    logout: "Sair",
    downloadApp: "Baixar App",
    scanQRCode: "Escaneie o QR Code",
    
    // Bel AI
    belGreeting: "Olá! Sou a Dora, sua assistente virtual",
    askBel: "Pergunte à Dora",
    suggestions: "Sugestões",
    
    // Common
    search: "Buscar",
    filter: "Filtrar",
    save: "Salvar",
    share: "Compartilhar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    back: "Voltar",
    next: "Próximo",
    rating: "Avaliação",
    reviews: "avaliações",
    contact: "Contato",
    openingHours: "Horário de funcionamento",
    address: "Endereço",
    phone: "Telefone",
    website: "Site",
    getDirections: "Como Chegar",
  },
  
  en: {
    // Login & Auth
    welcome: "Welcome to",
    welcomeSubtitle: "Log in and discover the gems of Minas Gerais",
    email: "Email",
    password: "Password",
    login: "Login",
    signup: "Sign Up",
    createAccount: "Create Account",
    fullName: "Full name",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    createNow: "Create now",
    signIn: "Sign In",
    orContinueWith: "or continue with",
    
    // Navigation
    home: "Home",
    map: "Map",
    routes: "Routes",
    food: "Food",
    events: "Events",
    hotels: "Hotels",
    shopping: "Shopping",
    favorites: "Favorites",
    profile: "Profile",
    
    // Home
    discoverBelmonte: "Discover Minas Gerais",
    aiAssistant: "AI Assistant",
    popularPlaces: "Popular Places",
    featuredRoutes: "Featured Routes",
    startExploring: "Start Exploring",
    
    // Map
    interactiveMap: "Interactive Map",
    searchPlaces: "Search places...",
    filterByCategory: "Filter by category",
    all: "All",
    beaches: "Beaches",
    restaurants: "Restaurants",
    shops: "Shops",
    historical: "Historical",
    howToGetThere: "How to Get There",
    viewDetails: "View Details",
    
    // Routes
    smartRoutes: "Smart Routes",
    createCustomRoute: "Create Custom Route",
    duration: "Duration",
    stops: "Stops",
    difficulty: "Difficulty",
    easy: "Easy",
    moderate: "Moderate",
    challenging: "Challenging",
    startRoute: "Start Route",
    highlights: "Highlights",
    
    // Food
    localCuisine: "Local Cuisine",
    openNow: "Open now",
    closed: "Closed",
    viewMenu: "View Menu",
    makeReservation: "Make Reservation",
    
    // Events
    eventsAndCulture: "Events & Culture",
    upcoming: "Upcoming",
    thisWeek: "This week",
    thisMonth: "This month",
    
    // Hotels
    accommodation: "Accommodation",
    checkAvailability: "Check Availability",
    pricePerNight: "per night",
    bookNow: "Book Now",
    
    // Shopping
    localCommerce: "Local Commerce",
    artisanShops: "Artisan Shops",
    souvenirs: "Souvenirs",
    
    // Profile
    myProfile: "My Profile",
    settings: "Settings",
    language: "Language",
    darkMode: "Dark Mode",
    notifications: "Notifications",
    logout: "Logout",
    downloadApp: "Download App",
    scanQRCode: "Scan QR Code",
    
    // Bel AI
    belGreeting: "Hi! I'm Dora, your virtual assistant",
    askBel: "Ask Dora",
    suggestions: "Suggestions",
    
    // Common
    search: "Search",
    filter: "Filter",
    save: "Save",
    share: "Share",
    cancel: "Cancel",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    rating: "Rating",
    reviews: "reviews",
    contact: "Contact",
    openingHours: "Opening hours",
    address: "Address",
    phone: "Phone",
    website: "Website",
    getDirections: "Get Directions",
  },
  
  es: {
    // Login & Auth
    welcome: "Bienvenido a",
    welcomeSubtitle: "Inicia sesión y descubre los encantos de Minas Gerais",
    email: "Correo electrónico",
    password: "Contraseña",
    login: "Iniciar sesión",
    signup: "Registrarse",
    createAccount: "Crear Cuenta",
    fullName: "Nombre completo",
    rememberMe: "Recuérdame",
    forgotPassword: "¿Olvidaste tu contraseña?",
    dontHaveAccount: "¿No tienes cuenta?",
    alreadyHaveAccount: "¿Ya tienes cuenta?",
    createNow: "Crear ahora",
    signIn: "Entrar",
    orContinueWith: "o continuar con",
    
    // Navigation
    home: "Inicio",
    map: "Mapa",
    routes: "Rutas",
    food: "Gastronomía",
    events: "Eventos",
    hotels: "Alojamiento",
    shopping: "Compras",
    favorites: "Favoritos",
    profile: "Perfil",
    
    // Home
    discoverBelmonte: "Descubre Minas Gerais",
    aiAssistant: "Asistente IA",
    popularPlaces: "Lugares Populares",
    featuredRoutes: "Rutas Destacadas",
    startExploring: "Comenzar a Explorar",
    
    // Map
    interactiveMap: "Mapa Interactivo",
    searchPlaces: "Buscar lugares...",
    filterByCategory: "Filtrar por categoría",
    all: "Todos",
    beaches: "Playas",
    restaurants: "Restaurantes",
    shops: "Tiendas",
    historical: "Histórico",
    howToGetThere: "Cómo Llegar",
    viewDetails: "Ver Detalles",
    
    // Routes
    smartRoutes: "Rutas Inteligentes",
    createCustomRoute: "Crear Ruta Personalizada",
    duration: "Duración",
    stops: "Paradas",
    difficulty: "Dificultad",
    easy: "Fácil",
    moderate: "Moderado",
    challenging: "Desafiante",
    startRoute: "Iniciar Ruta",
    highlights: "Destacados",
    
    // Food
    localCuisine: "Cocina Local",
    openNow: "Abierto ahora",
    closed: "Cerrado",
    viewMenu: "Ver Menú",
    makeReservation: "Hacer Reserva",
    
    // Events
    eventsAndCulture: "Eventos y Cultura",
    upcoming: "Próximamente",
    thisWeek: "Esta semana",
    thisMonth: "Este mes",
    
    // Hotels
    accommodation: "Alojamiento",
    checkAvailability: "Verificar Disponibilidad",
    pricePerNight: "por noche",
    bookNow: "Reservar Ahora",
    
    // Shopping
    localCommerce: "Comercio Local",
    artisanShops: "Tiendas Artesanales",
    souvenirs: "Recuerdos",
    
    // Profile
    myProfile: "Mi Perfil",
    settings: "Configuración",
    language: "Idioma",
    darkMode: "Modo Oscuro",
    notifications: "Notificaciones",
    logout: "Cerrar sesión",
    downloadApp: "Descargar App",
    scanQRCode: "Escanear código QR",
    
    // Bel AI
    belGreeting: "¡Hola! Soy Dora, tu asistente virtual",
    askBel: "Pregunta a Dora",
    suggestions: "Sugerencias",
    
    // Common
    search: "Buscar",
    filter: "Filtrar",
    save: "Guardar",
    share: "Compartir",
    cancel: "Cancelar",
    confirm: "Confirmar",
    back: "Volver",
    next: "Siguiente",
    rating: "Calificación",
    reviews: "reseñas",
    contact: "Contacto",
    openingHours: "Horario",
    address: "Dirección",
    phone: "Teléfono",
    website: "Sitio web",
    getDirections: "Cómo Llegar",
  },
  
  fr: {
    // Login & Auth
    welcome: "Bienvenue à",
    welcomeSubtitle: "Connectez-vous et découvrez les trésors du Minas Gerais",
    email: "Email",
    password: "Mot de passe",
    login: "Connexion",
    signup: "S'inscrire",
    createAccount: "Créer un Compte",
    fullName: "Nom complet",
    rememberMe: "Se souvenir de moi",
    forgotPassword: "Mot de passe oublié?",
    dontHaveAccount: "Vous n'avez pas de compte?",
    alreadyHaveAccount: "Vous avez déjà un compte?",
    createNow: "Créer maintenant",
    signIn: "Se connecter",
    orContinueWith: "ou continuer avec",
    
    // Navigation
    home: "Accueil",
    map: "Carte",
    routes: "Itinéraires",
    food: "Gastronomie",
    events: "Événements",
    hotels: "Hébergement",
    shopping: "Shopping",
    favorites: "Favoris",
    profile: "Profil",
    
    // Home
    discoverBelmonte: "Découvrez Minas Gerais",
    aiAssistant: "Assistant IA",
    popularPlaces: "Lieux Populaires",
    featuredRoutes: "Itinéraires en Vedette",
    startExploring: "Commencer à Explorer",
    
    // Map
    interactiveMap: "Carte Interactive",
    searchPlaces: "Rechercher des lieux...",
    filterByCategory: "Filtrer par catégorie",
    all: "Tous",
    beaches: "Plages",
    restaurants: "Restaurants",
    shops: "Boutiques",
    historical: "Historique",
    howToGetThere: "Comment y Arriver",
    viewDetails: "Voir les Détails",
    
    // Routes
    smartRoutes: "Itinéraires Intelligents",
    createCustomRoute: "Créer un Itinéraire Personnalisé",
    duration: "Durée",
    stops: "Arrêts",
    difficulty: "Difficulté",
    easy: "Facile",
    moderate: "Modéré",
    challenging: "Difficile",
    startRoute: "Commencer l'Itinéraire",
    highlights: "Points Forts",
    
    // Food
    localCuisine: "Cuisine Locale",
    openNow: "Ouvert maintenant",
    closed: "Fermé",
    viewMenu: "Voir le Menu",
    makeReservation: "Faire une Réservation",
    
    // Events
    eventsAndCulture: "Événements et Culture",
    upcoming: "À venir",
    thisWeek: "Cette semaine",
    thisMonth: "Ce mois-ci",
    
    // Hotels
    accommodation: "Hébergement",
    checkAvailability: "Vérifier la Disponibilité",
    pricePerNight: "par nuit",
    bookNow: "Réserver Maintenant",
    
    // Shopping
    localCommerce: "Commerce Local",
    artisanShops: "Boutiques Artisanales",
    souvenirs: "Souvenirs",
    
    // Profile
    myProfile: "Mon Profil",
    settings: "Paramètres",
    language: "Langue",
    darkMode: "Mode Sombre",
    notifications: "Notifications",
    logout: "Déconnexion",
    downloadApp: "Télécharger l'App",
    scanQRCode: "Scanner le QR Code",
    
    // Bel AI
    belGreeting: "Bonjour! Je suis Dora, votre assistante virtuelle",
    askBel: "Demandez à Dora",
    suggestions: "Suggestions",
    
    // Common
    search: "Rechercher",
    filter: "Filtrer",
    save: "Enregistrer",
    share: "Partager",
    cancel: "Annuler",
    confirm: "Confirmer",
    back: "Retour",
    next: "Suivant",
    rating: "Évaluation",
    reviews: "avis",
    contact: "Contact",
    openingHours: "Heures d'ouverture",
    address: "Adresse",
    phone: "Téléphone",
    website: "Site web",
    getDirections: "Obtenir l'Itinéraire",
  },
};