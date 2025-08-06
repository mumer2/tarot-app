import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

const STORAGE_KEYS = {
  token: '@jwt',
  name: 'userName',
  profilePic: 'profileImage',
  userId: 'userId',
  points: 'userPoints',
  referralCode: 'userReferral',
  referredBy: 'userReferredBy',
};

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [user, setUser] = useState({
    name: '',
    profilePic: null,
    userId: '',
    points: 0,
    referralCode: '',
    referredBy: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedValues = await AsyncStorage.multiGet(Object.values(STORAGE_KEYS));

        const values = storedValues.reduce((acc, [key, value]) => {
          acc[key] = value || '';
          return acc;
        }, {});

        setAuthToken(values[STORAGE_KEYS.token]);

        setUser({
          name: values[STORAGE_KEYS.name],
          profilePic: values[STORAGE_KEYS.profilePic] || null,
          userId: values[STORAGE_KEYS.userId],
          points: parseInt(values[STORAGE_KEYS.points]) || 0,
          referralCode: values[STORAGE_KEYS.referralCode],
          referredBy: values[STORAGE_KEYS.referredBy],
        });
      } catch (error) {
        console.error('❌ Failed to load user from storage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async ({ token, user }) => {
    if (!token || !user) return;

    const name = user.name || '';
    const profilePic = user.profilePic || '';
    const userId = user._id || user.userId || '';
    const points = user.points || 0;
    const referralCode = user.referralCode || '';
    const referredBy = user.referredBy || '';

    await AsyncStorage.multiSet([
      [STORAGE_KEYS.token, token],
      [STORAGE_KEYS.name, name],
      [STORAGE_KEYS.profilePic, profilePic],
      [STORAGE_KEYS.userId, userId],
      [STORAGE_KEYS.points, String(points)],
      [STORAGE_KEYS.referralCode, referralCode],
      [STORAGE_KEYS.referredBy, referredBy],
    ]);

    setAuthToken(token);
    setUser({ name, profilePic, userId, points, referralCode, referredBy });
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));

    setAuthToken(null);
    setUser({
      name: '',
      profilePic: null,
      userId: '',
      points: 0,
      referralCode: '',
      referredBy: '',
    });
  };

  const updateProfile = async ({ name, profilePic, points }) => {
    const updatedUser = { ...user };

    if (name !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.name, name);
      updatedUser.name = name;
    }

    if (profilePic !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.profilePic, profilePic);
      updatedUser.profilePic = profilePic;
    }

    if (points !== undefined) {
      await AsyncStorage.setItem(STORAGE_KEYS.points, String(points));
      updatedUser.points = points;
    }

    setUser(updatedUser);
  };

  const isLoggedIn = !!authToken;

  return (
    <AuthContext.Provider
      value={{
        authToken,
        user,
        isLoggedIn,
        login,
        logout,
        updateProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};




// import React, { createContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [authToken, setAuthToken] = useState(null);

//   useEffect(() => {
//     const loadToken = async () => {
//       const token = await AsyncStorage.getItem('@jwt');
//       if (token) setAuthToken(token);
//     };
//     loadToken();
//   }, []);

//   const login = async (token) => {
//     await AsyncStorage.setItem('@jwt', token);
//     setAuthToken(token);
//   };

//   const logout = async () => {
//     await AsyncStorage.removeItem('@jwt');
//     setAuthToken(null);
//   };

//   return (
//     <AuthContext.Provider value={{ authToken, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
