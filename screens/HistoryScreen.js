import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext'; 

export default function HistoryScreen() {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState('');
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
const isDark = theme === 'dark';

  // Load sessions from AsyncStorage
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const raw = await AsyncStorage.getItem('@chat_sessions');
        if (raw) {
          const parsed = JSON.parse(raw);
          setSessions(parsed.reverse()); // most recent first
        }
      } catch (e) {
        console.error('Failed to load sessions:', e);
      }
    };
    loadSessions();
  }, []);

  // Navigate to a session's view
  const handleOpen = (sessionId) => {
    navigation.navigate('SessionView', { sessionId });
  };

  // Delete a session
  const handleDelete = async (sessionId) => {
    try {
      const updated = sessions.filter((s) => s.id !== sessionId);
      setSessions(updated);
      await AsyncStorage.setItem('@chat_sessions', JSON.stringify(updated));
      await AsyncStorage.removeItem(sessionId);
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const filtered = sessions.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleOpen(item.id)}>
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Delete Session', 'Are you sure?', [
              { text: 'Cancel' },
              {
                text: 'Delete',
                onPress: () => handleDelete(item.id),
                style: 'destructive',
              },
            ])
          }
        >
          <Text style={[styles.actionText, { color: '#ff6961' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#1e1e1e' : '#ffffff', padding: 16 }}>
      <Text style={styles.header}>📜 Chat History</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#aaa" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by topic..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {filtered.length === 0 ? (
        <Text style={styles.empty}>No sessions found.</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f8e1c1',
    textAlign: 'center',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#2d2b4e',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionText: {
    color: '#f8e1c1',
    fontWeight: 'bold',
  },
  empty: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b3857',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    paddingLeft: 6,
  },
  searchIcon: {
    marginRight: 6,
  },
});
