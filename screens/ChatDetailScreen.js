import React, { useEffect, useState, useRef, useContext } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import i18n from '../utils/i18n';

const LANG_KEY = '@app_language';

export default function ChatDetailScreen({ route, navigation }) {
  const { sessionId, issue } = route.params;
  const [messages, setMessages] = useState(null);
  const scrollRef = useRef(null);

  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [lang, setLang] = useState(i18n.language || 'en');

  // Effect to load language and listen for changes from AsyncStorage
  useEffect(() => {
    const loadLang = async () => {
      try {
        const storedLang = await AsyncStorage.getItem(LANG_KEY);
        if (storedLang && storedLang !== lang) {
          setLang(storedLang);
          i18n.changeLanguage(storedLang);
        }
      } catch (e) {
        // handle error if needed
      }
    };

    // Load initially
    loadLang();

    // Setup interval or better approach to listen for changes globally
    // Here is a simple polling every 1s, you can replace with event system if you want
    const intervalId = setInterval(loadLang, 1000);

    return () => clearInterval(intervalId);
  }, [lang]);

  // Load chat messages
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(`session_${sessionId}`);
        if (json) setMessages(JSON.parse(json));
        else setMessages([]);
      } catch (err) {
        console.warn('Failed to load chat session', err);
        setMessages([]);
      }
    })();
  }, [sessionId]);

  // Auto-scroll on messages load/update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Remove headerRight button completely since language toggle is now automatic
  useEffect(() => {
    navigation.setOptions({
      headerRight: null,
      headerStyle: {
        backgroundColor: isDark ? '#1e1e1e' : '#fff',
      },
      headerTintColor: isDark ? '#f8e1c1' : '#333',
    });
  }, [navigation, isDark]);

  if (messages === null) {
    return (
      <View style={[styles.center, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
        <ActivityIndicator size="large" color="#8a2be2" />
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
        <Text style={{ color: isDark ? '#aaa' : '#333' }}>
          {i18n.t('noMessages')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
      <Text style={[styles.issue, { color: isDark ? '#f8e1c1' : '#333' }]}>
        {i18n.t('issue')}: {issue || i18n.t('noIssue')}
      </Text>
      <ScrollView ref={scrollRef} style={styles.chatContainer}>
        {messages.map((msg, i) => {
          if (msg.type === 'text') {
            return (
              <View
                key={i}
                style={[
                  msg.role === 'user' ? styles.userMessage : styles.botMessage,
                  {
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginVertical: 6,
                    backgroundColor: msg.role === 'user'
                      ? (isDark ? '#214d7a' : '#daf0ff')
                      : (isDark ? '#5c3a8a' : '#f3e8ff'),
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  },
                ]}
              >
                {msg.role !== 'user' && <Text style={[styles.icon, { color: isDark ? '#f8e1c1' : '#5b2c6f' }]}>🔮</Text>}
                <Text style={[msg.role === 'user' ? styles.userText : styles.botText, { color: isDark ? '#cce4ff' : '#0a3d62',flexShrink: 1,flexWrap: 'wrap' }]}>
                  {msg.text}
                </Text>
                {msg.role === 'user' && <Text style={[styles.icon, { color: isDark ? '#f8e1c1' : '#0a3d62' }]}>🧑</Text>}
              </View>
            );
          }
          if (msg.type === 'card' && msg.card) {
            return (
              <View key={i} style={[styles.cardMessageWrap, { backgroundColor: isDark ? '#333' : '#eee' }]}>
                <View style={styles.cardMessage}>
                  <Image source={{ uri: msg.card.image }} style={styles.cardImage} />
                  <View style={styles.cardMeta}>
                    <Text style={[styles.cardName, { color: isDark ? '#f8e1c1' : '#333' }]}>{msg.card.name}</Text>
                    <Text style={[styles.cardMeaning, { color: isDark ? '#ccc' : '#555' }]}>{msg.card.meaning}</Text>
                  </View>
                </View>
              </View>
            );
          }
          return null;
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  issue: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  chatContainer: { flex: 1 },
  userMessage: {
    borderRadius: 15,
    padding: 12,
    maxWidth: '80%',
    overflow: 'hidden',
  },
  botMessage: {
    borderRadius: 15,
    padding: 12,
    maxWidth: '80%',
    overflow: 'hidden',
  },
  userText: { fontWeight: '600' },
  botText: { fontWeight: '600' },
  icon: { marginHorizontal: 6, fontSize: 18, marginTop: 2 },
  cardMessageWrap: {
    marginVertical: 8,
    alignSelf: 'center',
    borderRadius: 12,
    padding: 10,
    maxWidth: 320,
  },
  cardMessage: { flexDirection: 'row', alignItems: 'center' },
  cardImage: { width: 60, height: 90, borderRadius: 4 },
  cardMeta: { marginLeft: 10, flexShrink: 1 },
  cardName: { fontWeight: 'bold', fontSize: 16 },
  cardMeaning: { fontStyle: 'italic', marginTop: 4, fontSize: 13 },
});
