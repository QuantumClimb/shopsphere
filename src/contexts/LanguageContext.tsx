import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import enTranslations from '@/locales/en.json';
import ptTranslations from '@/locales/pt.json';

type Language = 'en' | 'pt';

interface Translations {
  [key: string]: any;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  // Legacy function for backwards compatibility
  tLegacy: (en: string, pt: string | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

const translations: Record<Language, Translations> = {
  en: enTranslations,
  pt: ptTranslations
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Initialize from localStorage or default to English
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('shopsphere-language');
    // Force reset to English if version flag is not set (migration from old default)
    const version = localStorage.getItem('shopsphere-language-version');
    if (!version) {
      localStorage.setItem('shopsphere-language-version', '1');
      localStorage.setItem('shopsphere-language', 'en');
      return 'en';
    }
    return (saved as Language) || 'en';
  });

  // Persist language preference
  useEffect(() => {
    localStorage.setItem('shopsphere-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'pt' : 'en'));
  };

  // New translation function using JSON keys
  // e.g., t('nav.menu') returns "Menu" in English or "Menu" in Portuguese
  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Return fallback or key if translation not found
        return fallback || key;
      }
    }
    
    return typeof value === 'string' ? value : (fallback || key);
  };

  // Legacy helper function for backwards compatibility with existing code
  // Falls back to English if Portuguese translation is not available
  const tLegacy = (en: string, pt: string | undefined): string => {
    if (language === 'pt' && pt) {
      return pt;
    }
    return en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, tLegacy }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
