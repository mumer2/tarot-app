import React, { useEffect, useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import i18n from '../utils/i18n';
import { useNavigation } from '@react-navigation/native';

const GET_POINTS_URL = 'https://backend-tarot-app.netlify.app/.netlify/functions/get-points';

export default function CoinsRewardScreen() {
  const navigation = useNavigation();
  const { user, updateProfile } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const [loading, setLoading] = useState(true);

  i18n.locale = language;
  const isDark = theme === 'dark';

  const fetchCoins = async () => {
    try {
      const userId = user?.userId || (await AsyncStorage.getItem('userId'));
      if (!userId) {
        setLoading(false);
        return Alert.alert(i18n.t('error'), i18n.t('userNotLoggedIn'));
      }

      const res = await fetch(`${GET_POINTS_URL}?userId=${userId}`);
      const data = await res.json();

      if (res.ok) {
        const updatedPoints = data.coins || 0;
        updateProfile({ points: updatedPoints });
      } else {
        Alert.alert(i18n.t('error'), data.message || i18n.t('failedToFetch'));
      }
    } catch (err) {
      console.error('Fetch error:', err);
      Alert.alert(i18n.t('error'), i18n.t('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchCoins);
    return unsubscribe;
  }, [navigation]);

  const shareReferral = async () => {
    try {
      const referral = user?.referralCode || 'XXXXXX';
      await Share.share({
        message: `🔮 ${i18n.t('shareMessage')} ${referral}`,
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const styles = getStyles(isDark);

  return (
    <LinearGradient
      colors={isDark ? ['#1e1e1e', '#2a2a2a'] : ['#f6f9ff', '#dbeeff']}
      style={styles.container}
    >
      <View style={styles.card}>
        <Ionicons name="trophy" size={64} color="#f39c12" style={styles.icon} />
        <Text style={styles.title}>{i18n.t('myCoins')}</Text>

        {loading ? (
          <ActivityIndicator size="large" color={isDark ? '#fff' : '#0e4d92'} />
        ) : (
          <>
            <Text style={styles.coins}>{user?.points ?? 0}</Text>
            <Text style={styles.coinsLabel}>{i18n.t('coinsEarned')}</Text>

            <Text style={styles.referralTitle}>{i18n.t('yourReferralCode')}</Text>
            <Text selectable style={styles.referralCode}>
              {user?.referralCode || 'N/A'}
            </Text>

            <TouchableOpacity style={styles.button} onPress={shareReferral}>
              <Ionicons name="share-social" size={18} color="#fff" />
              <Text style={styles.buttonText}>{i18n.t('referFriend')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

// 🎨 Theming & Responsive Styles
const getStyles = (isDark) => {
  const screenWidth = Dimensions.get('window').width;

  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      backgroundColor: isDark ? '#2d2b4e' : '#fff',
      width: screenWidth * 0.9,
      borderRadius: 16,
      padding: 28,
      alignItems: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    icon: {
      marginBottom: 16,
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: isDark ? '#f8e1c1' : '#0e4d92',
      marginBottom: 10,
    },
    coins: {
      fontSize: 48,
      fontWeight: 'bold',
      color: '#f39c12',
      marginTop: 10,
    },
    coinsLabel: {
      fontSize: 16,
      color: isDark ? '#ccc' : '#888',
      marginBottom: 20,
    },
    referralTitle: {
      fontSize: 16,
      marginTop: 10,
      fontWeight: 'bold',
      color: isDark ? '#eee' : '#333',
    },
    referralCode: {
      fontSize: 16,
      color: isDark ? '#91d1ff' : '#0e4d92',
      marginVertical: 8,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#0e4d92',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 10,
      marginTop: 12,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      marginLeft: 8,
    },
  });
};
