import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import i18n from '../utils/i18n';


export default function MyBotScreen({ navigation }) {
  const [name, setName] = useState('');
  const [style, setStyle] = useState('');
  const [hasSetBot, setHasSetBot] = useState(false);
  const { theme } = useContext(ThemeContext);
const isDark = theme === 'dark';

  useEffect(() => {
    const loadBot = async () => {
      const saved = await AsyncStorage.getItem('@tarot_bot');
      if (saved) {
        const parsed = JSON.parse(saved);
        setName(parsed.name);
        setStyle(parsed.style);
        setHasSetBot(true);
      }
    };
    loadBot();
  }, []);

 const saveBot = async () => {
  if (!name.trim() || !style.trim()) {
    Alert.alert('Missing Info', 'Please fill both name and style.');
    return;
  }

  if (hasSetBot) {
    // Only allow if user has enough balance
    const balance = parseFloat(await AsyncStorage.getItem('@wallet_balance')) || 0;

    if (balance < 5) {
      Alert.alert('Insufficient Balance', 'You need at least 5 RMB in your wallet to update the bot.');
      return;
    }

    Alert.alert(
      'Change Personality',
      'You can only set this once for free. Pay 5 RMB to change it?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay 5 RMB',
          onPress: async () => {
            const newBalance = balance - 5;
            await AsyncStorage.setItem('@wallet_balance', String(newBalance));
            doSave(); // Save the new bot
          },
        },
      ]
    );
  } else {
    doSave(); // Free first time
  }
};


  const doSave = async () => {
    const data = { name, style };
    await AsyncStorage.setItem('@tarot_bot', JSON.stringify(data));
    setHasSetBot(true);
    Alert.alert('Saved', 'Your bot personality has been saved.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#1e1e1e' : '#ffffff', padding: 20 }}>
      <Text style={styles.title}>🧙‍♀️ {i18n.t('customizeYourTarotChat')}</Text>

      <Text style={styles.label}>Bot Name:</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Mystic Luna"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Bot Style / Personality:</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        placeholder="e.g. Mysterious, poetic, wise like a fortune teller..."
        placeholderTextColor="#888"
        value={style}
        onChangeText={setStyle}
      />

      <TouchableOpacity style={styles.saveButton} onPress={saveBot}>
        <Text style={styles.saveText}>Save Bot</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    color: '#f8e1c1',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  label: {
    color: '#ccc',
    marginBottom: 6,
    fontSize: 16,
  },
  input: {
    backgroundColor: '#2d2b4e',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#f8e1c1',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  saveText: {
    color: '#2c2c4e',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
