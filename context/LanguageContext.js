import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from '../utils/i18n';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
 const defaultLang = (Localization.locale || 'en').startsWith('zh') ? 'zh' : 'en';
  const [language, setLanguage] = useState(defaultLang);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLang = await AsyncStorage.getItem('appLanguage');
        const selectedLang = storedLang || defaultLang;
        i18n.locale = selectedLang;
        setLanguage(selectedLang);
      } catch (err) {
        console.error('Failed to load language from storage:', err);
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (lang) => {
    try {
      i18n.locale = lang;
      setLanguage(lang);
      await AsyncStorage.setItem('appLanguage', lang);
    } catch (err) {
      console.error('Failed to save language to storage:', err);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// import React, { createContext, useState, useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import i18n from "../utils/i18n";

// export const LanguageContext = createContext();

// export const LanguageProvider = ({ children }) => {
//   const [language, setLanguage] = useState(i18n.locale); // default from i18n

//   useEffect(() => {
//     const loadLang = async () => {
//       const storedLang = await AsyncStorage.getItem("@lang");
//       if (storedLang) {
//         i18n.locale = storedLang;
//         setLanguage(storedLang);
//       }
//     };
//     loadLang();
//   }, []);

//   const changeLanguage = async (lang) => {
//     i18n.locale = lang; // update globally
//     await AsyncStorage.setItem("@lang", lang);
//     setLanguage(lang);
//   };

//   return (
//     <LanguageContext.Provider value={{ language, changeLanguage }}>
//       {children}
//     </LanguageContext.Provider>
//   );
// };




// import React, { createContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import i18n from '../utils/i18n';

// export const LanguageContext = createContext();

// export const LanguageProvider = ({ children }) => {
//   const [language, setLanguage] = useState(i18n.locale);

//   useEffect(() => {
//     const loadLang = async () => {
//       const storedLang = await AsyncStorage.getItem('@lang');
//       if (storedLang) {
//         i18n.locale = storedLang;
//         setLanguage(storedLang);
//       }
//     };
//     loadLang();
//   }, []);

//   const changeLanguage = async (lang) => {
//     i18n.locale = lang;
//     await AsyncStorage.setItem('@lang', lang);
//     setLanguage(lang);
//   };

//   return (
//     <LanguageContext.Provider value={{ language, changeLanguage }}>
//       {children}
//     </LanguageContext.Provider>
//   );
// };
