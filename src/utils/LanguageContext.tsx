import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppLanguage, SUPPORTED_LANGUAGES, LanguageOption, getTranslation } from './translations';

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  supportedLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('baitomate_language');
    if (saved && (saved === 'en' || saved === 'ja' || saved === 'vi' || saved === 'ne')) {
      return saved as AppLanguage;
    }
    // Check navigator language if available
    const navLang = navigator.language?.toLowerCase() || '';
    if (navLang.startsWith('ja')) return 'ja';
    if (navLang.startsWith('vi')) return 'vi';
    if (navLang.startsWith('ne')) return 'ne';
    return 'en';
  });

  const setLanguage = (newLang: AppLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('baitomate_language', newLang);
    } catch (e) {
      console.error('Failed to save language preference', e);
    }
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    return getTranslation(language, key, params);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key: string, params?: Record<string, string | number>) => getTranslation('en', key, params),
      supportedLanguages: SUPPORTED_LANGUAGES,
    };
  }
  return context;
};
