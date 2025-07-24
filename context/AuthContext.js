import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem('@jwt');
      if (token) setAuthToken(token);
    };
    loadToken();
  }, []);

  const login = async (token) => {
    await AsyncStorage.setItem('@jwt', token);
    setAuthToken(token);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@jwt');
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
