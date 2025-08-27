import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext'; // your theme provider
import i18n from '../utils/i18n'; // your i18n instance

const HISTORY_KEY = '@chat_history';

export default function ChatHistory() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setHistory(parsed.reverse());
        }
      } catch (e) {
        console.error(i18n.t('loadError'), e);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const handleOpen = (sessionId, issue) => {
    navigation.navigate('ChatDetail', { sessionId, issue });
  };

  const handleDelete = async (sessionId) => {
    Alert.alert(
      i18n.t('deleteSession'),
      i18n.t('areYouSure'),
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = history.filter(s => s.id !== sessionId);
              setHistory(updated);
              await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
              await AsyncStorage.removeItem(sessionId);
            } catch (e) {
              console.error(i18n.t('deleteError'), e);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const filteredHistory = history.filter(item =>
    (item.issue || '').toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item, index }) => (
    <View style={[styles.item, { backgroundColor: isDark ? '#2d2b4e' : '#fafafa' }]}>
      <Text style={[styles.issue, { color: isDark ? '#f8e1c1' : '#000' }]}>
        {item.issue || i18n.t('noIssue')}
      </Text>
      <Text style={[styles.date, { color: isDark ? '#aaa' : '#555' }]}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
      <Text style={[styles.preview, { color: isDark ? '#ccc' : '#333' }]}>
        {item.preview || ''}
      </Text>
      {item.drawnCards?.length > 0 && (
        <Text style={[styles.cards, { color: isDark ? '#b08aff' : '#8a2be2' }]}>
          {i18n.t('cards')}: {item.drawnCards.join(', ')}
        </Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleOpen(item.id, item.issue)}>
          <Text style={[styles.actionText, { color: isDark ? '#f8e1c1' : '#333' }]}>
            {i18n.t('view')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={[styles.actionText, { color: '#ff6961' }]}>
            {i18n.t('delete')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
        <ActivityIndicator size="large" color="#8a2be2" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
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

      {filteredHistory.length === 0 ? (
        <Text style={[styles.empty, { color: isDark ? '#aaa' : '#666' }]}>
          {i18n.t('noSessions')}
        </Text>
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
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
  item: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  issue: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    marginBottom: 8,
  },
  preview: {
    fontStyle: 'italic',
    fontSize: 14,
    marginBottom: 8,
  },
  cards: {
    fontSize: 14,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
