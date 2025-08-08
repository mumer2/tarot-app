import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import i18n from '../utils/i18n';

const CHECKIN_URL = 'https://backend-tarot-app.netlify.app/.netlify/functions/check-in';

export default function DailyCheckInScreen() {
  const { user, updateProfile } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);

  const isDark = theme === 'dark';
  i18n.locale = language;

  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(1);
  const [todayReward, setTodayReward] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadCheckInStatus();
  }, []);

  const loadCheckInStatus = async () => {
    setInitialLoading(true);
    try {
      const res = await fetch(CHECKIN_URL + `?userId=${user.userId}`);
      const data = await res.json();

      if (res.ok) {
        setCheckedIn(data.alreadyCheckedIn);
        setStreak(data.streak || 1);
        setHistory(data.history || []);
        setTodayReward(data.todayReward || null);
      } else {
        console.error('Error loading check-in status:', data.message);
      }
    } catch (err) {
      console.error('Error fetching check-in status:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const res = await fetch(CHECKIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId }),
      });

      const data = await res.json();

      if (data.alreadyCheckedIn) {
        Alert.alert('✅ ' + i18n.t('alreadyCheckedIn'), i18n.t('alreadyCheckedInDesc'));
        setCheckedIn(true);
      } else {
        Alert.alert('🎉 ' + i18n.t('success'), i18n.t('youReceived', { coins: data.todayReward }));
        updateProfile({ points: data.newPoints });
        setTodayReward(data.todayReward);
        setCheckedIn(true);
      }

      setStreak(data.streak || 1);
      setHistory(data.history || []);
    } catch (err) {
      console.error('Check-in error:', err);
      Alert.alert(i18n.t('error'), i18n.t('checkInError'));
    } finally {
      setLoading(false);
    }
  };

  const renderHistory = ({ item }) => {
    const date = new Date(item.date).toLocaleDateString();
    return (
      <View style={styles.historyItem}>
        <Text style={[styles.historyDate, isDark && styles.textDark]}>{date}</Text>
        <Text style={[styles.historyCoins, isDark && styles.coinsDark]}>
          +{item.coins} {i18n.t('coins')}
        </Text>
      </View>
    );
  };

  const styles = getStyles(isDark);

  if (initialLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#7f5af0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗓️ {i18n.t('dailyCheckIn')}</Text>
      <Text style={styles.instruction}>{i18n.t('checkInDescription')}</Text>

      <TouchableOpacity
        style={[styles.button, checkedIn && styles.disabled]}
        onPress={handleCheckIn}
        disabled={loading || checkedIn}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {checkedIn ? '✅ ' + i18n.t('checkedIn') : i18n.t('checkIn')}
          </Text>
        )}
      </TouchableOpacity>

      {todayReward && (
        <Text style={styles.rewardText}>
          🎁 {i18n.t('earnedToday', { coins: todayReward })}
        </Text>
      )}

      <Text style={styles.streakText}>🔥 {i18n.t('streak', { day: streak })}</Text>

      <Text style={styles.subtitle}>📊 {i18n.t('historyCheck')}</Text>
      {history.length === 0 ? (
        <Text style={styles.emptyHistory}>{i18n.t('noHistory')}</Text>
      ) : (
        <FlatList
          data={history.slice().reverse()}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderHistory}
        />
      )}
    </View>
  );
}

const getStyles = (isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 6,
      color: isDark ? '#f8e1c1' : '#333',
    },
    instruction: {
      fontSize: 14,
      color: isDark ? '#ccc' : '#555',
      textAlign: 'center',
      marginBottom: 20,
    },
    button: {
      backgroundColor: '#7f5af0',
      padding: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 20,
    },
    disabled: { backgroundColor: '#ccc' },
    buttonText: { color: '#fff', fontSize: 18 },
    rewardText: {
      textAlign: 'center',
      fontSize: 16,
      color: '#228B22',
      marginBottom: 10,
    },
    streakText: {
      textAlign: 'center',
      fontSize: 16,
      color: '#7f5af0',
      marginBottom: 20,
      fontWeight: '600',
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 10,
      color: isDark ? '#f8e1c1' : '#333',
    },
    historyItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderColor: '#eee',
    },
    historyDate: {
      fontSize: 14,
      color: '#555',
    },
    historyCoins: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#7f5af0',
    },
    coinsDark: {
      color: '#91d1ff',
    },
    textDark: {
      color: '#ccc',
    },
    emptyHistory: {
      textAlign: 'center',
      color: '#999',
      marginTop: 20,
    },
  });
