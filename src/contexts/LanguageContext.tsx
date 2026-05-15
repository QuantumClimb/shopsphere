import React, { createContext, useContext, ReactNode } from 'react';
import enTranslations from '@/locales/en.json';

interface LanguageContextType {
  t: (key: string, fallback?: string) => string;
  tLegacy: (en: string, pt?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.');
    let value: any = enTranslations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }
    
    return typeof value === 'string' ? value : (fallback || key);
  };

  const tLegacy = (en: string, _pt?: string): string => {
    return en;
  };

  return (
    <LanguageContext.Provider value={{ t, tLegacy }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
