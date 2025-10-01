import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, Eye, EyeOff, Chrome, Facebook, Apple, Sparkles, MapPin, Waves, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "../contexts/LanguageContext";
import belMascotImage from "figma:asset/f252610f6e9a8a9c93c9aaea8fde97dff0ee9a53.png";

interface LoginScreenProps {
  onLogin: () => void;
}

// Credenciais de demonstração
const DEMO_CREDENTIALS = {
  email: "demo@minas.com",
  password: "minas2024"
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { t } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validação
    if (!isSignUp) {
      // Login
      if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        setSuccess(true);
        setTimeout(onLogin, 1200);
      } else {
        setError("Email ou senha incorretos. Use: demo@minas.com / minas2024");
      }
    } else {
      // Cadastro
      if (name && email && password.length >= 6) {
        setSuccess(true);
        setTimeout(onLogin, 1200);
      } else {
        setError("Por favor, preencha todos os campos. Senha mínima: 6 caracteres");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#1a2332] to-[#2C4D7B] relative overflow-hidden">
      {/* Background animado com ondas */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Ondas fluidas */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-96"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <svg className="absolute bottom-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <motion.path
              fill="url(#wave-gradient-1)"
              fillOpacity="0.1"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              animate={{ d: [
                "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,80C672,64,768,64,864,80C960,96,1056,128,1152,128C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ]}}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4C9ED9" />
                <stop offset="100%" stopColor="#F3A64D" />
              </linearGradient>
            </defs>
          </svg>
          
          <svg className="absolute bottom-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <motion.path
              fill="url(#wave-gradient-2)"
              fillOpacity="0.15"
              d="M0,192L48,176C96,160,192,128,288,128C384,128,480,160,576,176C672,192,768,192,864,176C960,160,1056,128,1152,128C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              animate={{ d: [
                "M0,192L48,176C96,160,192,128,288,128C384,128,480,160,576,176C672,192,768,192,864,176C960,160,1056,128,1152,128C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,224L48,208C96,192,192,160,288,160C384,160,480,192,576,208C672,224,768,224,864,208C960,192,1056,160,1152,160C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,192L48,176C96,160,192,128,288,128C384,128,480,160,576,176C672,192,768,192,864,176C960,160,1056,128,1152,128C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ]}}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <defs>
              <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F3A64D" />
                <stop offset="100%" stopColor="#4C9ED9" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Partículas flutuantes */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              background: i % 2 === 0 ? '#4C9ED9' : '#F3A64D',
              opacity: 0.3,
            }}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * -100],
              x: [null, Math.random() * 100 - 50],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Seletor de idioma no canto superior direito */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageSelector />
      </div>

      {/* Container principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Demo info banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-4 bg-accent/20 backdrop-blur-md border border-accent/30 rounded-2xl p-4 text-center"
          >
            <p className="text-white text-sm mb-2">
              <strong>🎯 Demo Login:</strong>
            </p>
            <p className="text-white/90 text-xs">
              📧 demo@belmonte.com<br />
              🔐 belmonte2024
            </p>
          </motion.div>
          {/* Card de login com glassmorphism */}
          <div className="backdrop-blur-2xl bg-white/10 dark:bg-white/5 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header com Dora */}
            <div className="relative bg-gradient-to-br from-[#4C9ED9]/20 via-[#2C4D7B]/20 to-transparent p-8 text-center">
              {/* Dora Mascot */}
              <motion.div
                className="mx-auto w-24 h-24 mb-4"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 1, delay: 0.2 }}
              >
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <img
                    src={belMascotImage}
                    alt="Dora"
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </motion.div>
              </motion.div>

              <motion.h1
                className="text-3xl text-white mb-2"
                style={{ fontFamily: 'var(--font-family-heading)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {t.welcome}{" "}
                <span className="bg-gradient-to-r from-[#F3A64D] to-[#4C9ED9] bg-clip-text text-transparent">
                  Minas Gerais
                </span>
              </motion.h1>
              
              <motion.p
                className="text-white/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {t.welcomeSubtitle}
              </motion.p>

              {/* Decoração */}
              <div className="absolute top-4 right-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6 text-[#F3A64D]" />
                </motion.div>
              </div>
              <div className="absolute bottom-4 left-4">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <MapPin className="w-6 h-6 text-[#4C9ED9]" />
                </motion.div>
              </div>
            </div>

            {/* Formulário */}
            <div className="p-8">
              {/* Mensagens de erro/sucesso */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 bg-red-500/20 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-200 text-sm">{error}</p>
                  </motion.div>
                )}
                
                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mb-4 bg-green-500/20 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <p className="text-green-200 text-sm">Login realizado com sucesso! 🎉</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {isSignUp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label className="text-white/90 text-sm mb-2 block">{t.fullName}</label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder={t.fullName}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#4C9ED9] transition-all pl-4 pr-4 py-6 rounded-xl"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="text-white/90 text-sm mb-2 block">{t.email}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <Input
                      type="email"
                      placeholder="demo@minas.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#4C9ED9] transition-all pl-12 pr-4 py-6 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/90 text-sm mb-2 block">{t.password}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="minas2024"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#4C9ED9] transition-all pl-12 pr-12 py-6 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {!isSignUp && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center text-white/80 cursor-pointer">
                      <input type="checkbox" className="mr-2 rounded" />
                      {t.rememberMe}
                    </label>
                    <button type="button" className="text-[#4C9ED9] hover:text-[#F3A64D] transition-colors">
                      {t.forgotPassword}
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={success}
                  className="w-full bg-gradient-to-r from-[#F3A64D] to-[#4C9ED9] hover:shadow-2xl hover:shadow-[#F3A64D]/50 text-white py-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-2">
                    {success ? '✓ Sucesso!' : (isSignUp ? t.createAccount : t.login)}
                    {!success && <Waves className="w-5 h-5" />}
                  </span>
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-white/60">{t.orContinueWith}</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-3 gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all"
                >
                  <Chrome className="w-5 h-5 text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all"
                >
                  <Facebook className="w-5 h-5 text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all"
                >
                  <Apple className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              {/* Toggle Sign Up/Login */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {isSignUp ? (
                    <>{t.alreadyHaveAccount} <span className="text-[#F3A64D]">{t.signIn}</span></>
                  ) : (
                    <>{t.dontHaveAccount} <span className="text-[#F3A64D]">{t.createNow}</span></>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer info */}
          <motion.p
            className="text-center text-white/60 text-sm mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Ao continuar, você concorda com nossos{" "}
            <span className="text-[#4C9ED9] cursor-pointer">Termos de Uso</span> e{" "}
            <span className="text-[#4C9ED9] cursor-pointer">Política de Privacidade</span>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}