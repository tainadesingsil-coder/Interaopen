import { motion } from "motion/react";
import { Globe, Check } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Language } from "../data/translations";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const currentLang = languages.find(l => l.code === language);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-2xl hover:bg-muted/50 transition-colors"
      >
        <Globe className="w-5 h-5 text-secondary" />
        <span className="text-lg">{currentLang?.flag}</span>
        <span className="text-sm text-foreground">{currentLang?.name}</span>
      </motion.button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 min-w-[200px]"
          >
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                whileHover={{ backgroundColor: 'rgba(var(--muted), 0.5)' }}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-foreground">{lang.name}</span>
                </div>
                {language === lang.code && (
                  <Check className="w-5 h-5 text-accent" />
                )}
              </motion.button>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}