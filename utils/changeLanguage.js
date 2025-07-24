// utils/changeLanguage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './i18n';

export const changeLanguage = async (lang) => {
  await AsyncStorage.setItem('@lang', lang);
  i18n.locale = lang;
};
