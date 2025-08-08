import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../utils/i18n';

export default function WelcomeScreen({ navigation }) {
  const scheme = useColorScheme(); // fallback if no theme in context
  const { theme } = useContext(ThemeContext);
  const isDark = (theme || scheme) === 'dark';

  const handleStart = async () => {
    try {
      await AsyncStorage.setItem('@first_login', 'false');
      navigation.replace('Home');
    } catch (error) {
      console.error('Error saving first login flag:', error);
    }
  };

  return (
    <SafeAreaView style={styles(isDark).safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles(isDark).container}>
        <Image
          source={require('../assets/WelcomeLogo.png')}
          style={styles(isDark).image}
          resizeMode="contain"
        />
        <Text style={styles(isDark).title}>🔮 {i18n.t('welcome.title')}</Text>
        <Text style={styles(isDark).subtitle}>{i18n.t('welcome.subtitle')}</Text>
        <TouchableOpacity style={styles(isDark).button} onPress={handleStart}>
          <Text style={styles(isDark).buttonText}>{i18n.t('welcome.button')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = (isDark) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#f9f9f9',
    },
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    image: {
      width: '100%',
      height: 350,
      marginBottom: 30,
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: isDark ? '#f8e1c1' : '#2c2c4e',
      marginBottom: 10,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? '#ccc' : '#555',
      textAlign: 'center',
      marginBottom: 30,
    },
    button: {
      backgroundColor: '#7D5A50',
      paddingVertical: 14,
      paddingHorizontal: 36,
      borderRadius: 10,
      elevation: 3,
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
    },
  });
