import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../utils/i18n';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext);
  const navigation = useNavigation();

  const [selectedLang, setSelectedLang] = useState(i18n.locale.startsWith('zh') ? 'zh' : 'en');
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    const loadLang = async () => {
      const lang = await AsyncStorage.getItem('@lang');
      if (lang) {
        i18n.locale = lang;
        setSelectedLang(lang);
      }
    };
    loadLang();
  }, []);

  const changeLanguage = async (lang) => {
    try {
      i18n.locale = lang;
      await AsyncStorage.setItem('@lang', lang);
      setSelectedLang(lang);
      Alert.alert('✅', `${i18n.t('language')} updated. Restart app to apply.`);
    } catch (e) {
      Alert.alert('❌', 'Language change failed.');
    }
  };

  const clearChatHistory = async () => {
    Alert.alert('⚠️ Confirm', i18n.t('confirmClearChat'), [
      { text: i18n.t('cancel'), style: 'cancel' },
      {
        text: i18n.t('delete'),
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('@chat_sessions');
          Alert.alert('✅', i18n.t('chatCleared'));
        },
      },
    ]);
  };

  const resetWallet = async () => {
    await AsyncStorage.setItem('@wallet_balance', '0');
    Alert.alert('✅', i18n.t('walletReset'));
  };

  const resetBot = async () => {
    await AsyncStorage.removeItem('@tarot_bot');
    Alert.alert('🧙‍♀️', i18n.t('botReset'));
  };

 const handleLogout = () => {
  Alert.alert(
    '⚠️ Confirm Logout',
    'Are you sure you want to logout?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout(); // Clear AsyncStorage + context

            // Wait a short moment to ensure context is updated
            setTimeout(() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }, 100); // 👈 Delay helps ensure context update is processed
          } catch (err) {
            console.error('Logout error:', err);
            Alert.alert('❌ Logout Failed', 'Please try again.');
          }
        },
      },
    ]
  );
};



  const styles = getStyles(theme);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{i18n.t('settings')}</Text>

      {/* Language */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🌐 {i18n.t('language')}</Text>
        <View style={styles.langRow}>
          <TouchableOpacity
            style={[styles.langButton, selectedLang === 'en' && styles.selectedButton]}
            onPress={() => changeLanguage('en')}
          >
            <Text style={styles.buttonText}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langButton, selectedLang === 'zh' && styles.selectedButton]}
            onPress={() => changeLanguage('zh')}
          >
            <Text style={styles.buttonText}>中文</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Theme Toggle */}
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>🌓 {i18n.t('darkTheme')}</Text>
          <Switch value={isDarkMode} onValueChange={toggleTheme} />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.itemButton} onPress={resetBot}>
          <Text style={styles.itemText}>♻️ {i18n.t('resetBot')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.itemButton} onPress={clearChatHistory}>
          <Text style={styles.itemText}>🗑️ {i18n.t('clearChat')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.itemButton} onPress={resetWallet}>
          <Text style={styles.itemText}>💰 {i18n.t('resetWallet')}</Text>
        </TouchableOpacity>
      </View>

      {/* Legal Links */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.itemButton} onPress={() => navigation.navigate('PrivacyPolicy')}>
          <Text style={styles.itemText}>🔐 {i18n.t('privacyPolicy')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.itemButton} onPress={() => navigation.navigate('Terms')}>
          <Text style={styles.itemText}>📄 {i18n.t('termOfService')}</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.itemButton} onPress={handleLogout}>
          <Text style={[styles.itemText, { color: 'red' }]}>🚪 {i18n.t('logout')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const getStyles = (theme) => {
  const isDark = theme === 'dark';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1e1e1e' : '#f7f7f7',
      paddingHorizontal: 16,
    },
    header: {
      fontSize: 28,
      color: isDark ? '#f8e1c1' : '#222',
      fontWeight: 'bold',
      textAlign: 'center',
      marginVertical: 25,
    },
    sectionTitle: {
      color: isDark ? '#f8e1c1' : '#333',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    card: {
      backgroundColor: isDark ? '#2d2b4e' : '#fff',
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 3,
    },
    langRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    langButton: {
      backgroundColor: isDark ? '#3b3857' : '#ddd',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
    },
    selectedButton: {
      backgroundColor: '#A26769',
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 15,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    settingText: {
      color: isDark ? '#fff' : '#000',
      fontSize: 16,
    },
    itemButton: {
      paddingVertical: 14,
      borderBottomColor: '#444',
      borderBottomWidth: 1,
    },
    itemText: {
      color: isDark ? '#f8e1c1' : '#333',
      fontSize: 15,
    },
  });
};
