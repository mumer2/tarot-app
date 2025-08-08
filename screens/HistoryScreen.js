import React, { useEffect, useState, useContext } from 'react';
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
import { ThemeContext } from '../context/ThemeContext';
import i18n from '../utils/i18n'; // make sure this points to your i18n.js

export default function HistoryScreen() {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState('');
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const raw = await AsyncStorage.getItem('@chat_sessions');
        if (raw) {
          const parsed = JSON.parse(raw);
          setSessions(parsed.reverse());
        }
      } catch (e) {
        console.error('Failed to load sessions:', e);
      }
    };
    loadSessions();
  }, []);

  const handleOpen = (sessionId) => {
    navigation.navigate('SessionView', { sessionId });
  };

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
    <View style={[styles.card, { backgroundColor: isDark ? '#2d2b4e' : '#eee' }]}>
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>{item.title}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleOpen(item.id)}>
          <Text style={[styles.actionText, { color: isDark ? '#f8e1c1' : '#333' }]}>
            {i18n.t('view')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(i18n.t('deleteSession'), i18n.t('areYouSure'), [
              { text: i18n.t('cancel') },
              {
                text: i18n.t('delete'),
                onPress: () => handleDelete(item.id),
                style: 'destructive',
              },
            ])
          }
        >
          <Text style={[styles.actionText, { color: '#ff6961' }]}>{i18n.t('delete')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#1e1e1e' : '#ffffff', padding: 16 }}>
      <Text style={[styles.header, { color: isDark ? '#f8e1c1' : '#333' }]}>
        📜 {i18n.t('chatHistory')}
      </Text>

      <View style={[styles.searchContainer, { backgroundColor: isDark ? '#3b3857' : '#ddd' }]}>
        <Ionicons name="search" size={20} color="#aaa" style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: isDark ? '#fff' : '#000' }]}
          placeholder={i18n.t('searchByTopic')}
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {filtered.length === 0 ? (
        <Text style={[styles.empty, { color: isDark ? '#aaa' : '#666' }]}>
          {i18n.t('noSessions')}
        </Text>
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
    textAlign: 'center',
    marginBottom: 10,
  },
  card: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionText: {
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingLeft: 6,
  },
  searchIcon: {
    marginRight: 6,
  },
});
