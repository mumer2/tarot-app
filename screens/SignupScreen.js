import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';

export default function SignupScreen() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('❌ Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        'https://backend-tarot.netlify.app/.netlify/functions/signup',
        {
          name,
          email,
          password,
        }
      );

      if (res.data?.success || res.status === 200) {
        Alert.alert('✅ Registered', 'You can now log in.');
        navigation.navigate('Login');
      } else {
        Alert.alert('❌ Error', res.data?.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('❌ Error', error.response?.data?.message || 'Signup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles(isDark).container}>
      <Text style={styles(isDark).title}>📝 Sign Up</Text>

      <TextInput
        placeholder="Full Name"
        placeholderTextColor="#999"
        style={styles(isDark).input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        style={styles(isDark).input}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#999"
        style={styles(isDark).input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles(isDark).button, loading && { opacity: 0.7 }]}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#2c2c4e" />
        ) : (
          <Text style={styles(isDark).buttonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles(isDark).link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = (isDark) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
      justifyContent: 'center',
      padding: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 30,
      color: isDark ? '#f8e1c1' : '#2c2c4e',
    },
    input: {
      backgroundColor: isDark ? '#2d2b4e' : '#eee',
      color: isDark ? '#fff' : '#000',
      padding: 12,
      borderRadius: 10,
      marginBottom: 15,
    },
    button: {
      backgroundColor: '#f8e1c1',
      paddingVertical: 14,
      borderRadius: 20,
      alignItems: 'center',
      marginBottom: 20,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#2c2c4e',
    },
    link: {
      textAlign: 'center',
      color: isDark ? '#aaa' : '#555',
      fontSize: 14,
    },
  });
