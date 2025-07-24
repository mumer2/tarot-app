import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function WalletHistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = await AsyncStorage.getItem('@user_id');
        if (!userId) {
          Alert.alert('❌ Error', 'User ID not found');
          return;
        }

        const res = await axios.post(
          'https://backend-tarot-app.netlify.app/.netlify/functions/get-recharge-history',
          { userId }
        );

        if (Array.isArray(res.data?.history)) {
          setHistory(res.data.history);
        } else {
          Alert.alert('⚠️ Error', 'No recharge history found');
        }
      } catch (err) {
        console.error('❌ History fetch error:', err.message);
        Alert.alert('❌ Error', 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const renderItem = ({ item }) => {
    const date = item.createdAt || item.timestamp || item.date;
    const formattedDate = date ? new Date(date).toLocaleString() : 'Unknown date';
    const amount = item.amount ?? 0;
    const method = item.method ?? 'Recharge';

    return (
      <View style={styles(isDark).item}>
        <Ionicons name="cash-outline" size={22} color={isDark ? '#f8e1c1' : '#2c2c4e'} />
        <View style={styles(isDark).itemTextWrapper}>
          <Text style={styles(isDark).amount}>+{amount} RMB</Text>
          <Text style={styles(isDark).method}>{method}</Text>
          <Text style={styles(isDark).date}>{formattedDate}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles(isDark).container}>
      <Text style={styles(isDark).title}>📜 Recharge History</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#f8e1c1" style={{ marginTop: 20 }} />
      ) : history.length === 0 ? (
        <Text style={styles(isDark).emptyText}>No recharge history found.</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = (isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      color: isDark ? '#f8e1c1' : '#2c2c4e',
      marginBottom: 20,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#2a2a2a' : '#f1f1f1',
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    itemTextWrapper: {
      marginLeft: 14,
      flex: 1,
    },
    amount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? '#f8e1c1' : '#2c2c4e',
    },
    method: {
      fontSize: 14,
      fontStyle: 'italic',
      color: isDark ? '#ccc' : '#555',
      marginTop: 2,
    },
    date: {
      fontSize: 14,
      color: isDark ? '#aaa' : '#666',
      marginTop: 2,
    },
    emptyText: {
      textAlign: 'center',
      fontSize: 16,
      color: isDark ? '#888' : '#555',
      marginTop: 40,
    },
  });
