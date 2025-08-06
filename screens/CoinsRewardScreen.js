import React, { useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const GET_POINTS_URL = 'https://backend-tarot-app.netlify.app/.netlify/functions/get-points';

export default function CoinsRewardScreen() {
  const navigation = useNavigation();
  const { user, updateProfile } = useContext(AuthContext);

  const [loading, setLoading] = React.useState(true);

  const fetchCoins = async () => {
    try {
      const userId = user?.userId || (await AsyncStorage.getItem('userId'));
      if (!userId) {
        setLoading(false);
        return Alert.alert('Error', 'User not logged in');
      }

      const res = await fetch(`${GET_POINTS_URL}?userId=${userId}`);
      const data = await res.json();

      if (res.ok) {
        const updatedPoints = data.coins || 0;
        updateProfile({ points: updatedPoints });
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch points');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  // 🔁 Refresh points when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchCoins);
    return unsubscribe;
  }, [navigation]);

  const shareReferral = async () => {
    try {
      const referral = user?.referralCode || 'XXXXXX';
      await Share.share({
        message: `🔮 Join me on Tarot Station! Use my referral code: ${referral}`,
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  return (
    <LinearGradient colors={["#f6f9ff", "#dbeeff"]} style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="trophy" size={64} color="#f39c12" style={styles.icon} />
        <Text style={styles.title}>My Coins</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0e4d92" />
        ) : (
          <>
            <Text style={styles.coins}>{user?.points ?? 0}</Text>
            <Text style={styles.coinsLabel}>Coins Earned</Text>

            <Text style={styles.referralTitle}>Your Referral Code</Text>
            <Text selectable style={styles.referralCode}>
              {user?.referralCode || 'N/A'}
            </Text>

            <TouchableOpacity style={styles.button} onPress={shareReferral}>
              <Ionicons name="share-social" size={18} color="#fff" />
              <Text style={styles.buttonText}>Refer a Friend</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  icon: { marginBottom: 16 },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0e4d92',
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
    color: '#888',
    marginBottom: 20,
  },
  referralTitle: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  referralCode: {
    fontSize: 16,
    color: '#0e4d92',
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
