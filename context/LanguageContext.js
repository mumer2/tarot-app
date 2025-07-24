import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../utils/i18n';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(i18n.locale);

  useEffect(() => {
    const loadLang = async () => {
      const storedLang = await AsyncStorage.getItem('@lang');
      if (storedLang) {
        i18n.locale = storedLang;
        setLanguage(storedLang);
      }
    };
    loadLang();
  }, []);

  const changeLanguage = async (lang) => {
    i18n.locale = lang;
    await AsyncStorage.setItem('@lang', lang);
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
