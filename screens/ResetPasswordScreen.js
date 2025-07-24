import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';

export default function ResetPasswordScreen({ route, navigation }) {
  const { email } = route.params; // Email passed from forgot screen
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!token.trim() || !newPassword.trim()) {
      Alert.alert('❌ Error', 'Please fill all fields.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('❌ Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'https://backend-tarot.netlify.app/.netlify/functions/setNewPassword',
        {
          email,
          token,
          newPassword,
        }
      );

      if (response.data?.success) {
        Alert.alert('✅ Success', 'Password has been reset.');
        navigation.replace('Login');
      } else {
        Alert.alert('❌ Error', response.data?.message || 'Failed to reset password.');
      }
    } catch (err) {
      console.error('Reset error:', err.message);
      Alert.alert('❌ Error', err.response?.data?.message || 'Server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles(isDark).container}>
      <Text style={styles(isDark).title}>🔐 Reset Password</Text>

      <TextInput
        placeholder="Reset code (OTP)"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={token}
        onChangeText={setToken}
        style={styles(isDark).input}
      />

      <TextInput
        placeholder="New password"
        placeholderTextColor="#999"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles(isDark).input}
      />

      <TouchableOpacity
        style={[styles(isDark).button, loading && { opacity: 0.7 }]}
        onPress={handleReset}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles(isDark).buttonText}>Reset Password</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles(isDark).link}>← Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = (isDark) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      justifyContent: 'center',
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
      padding: 24,
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: isDark ? '#f8e1c1' : '#2c2c4e',
      textAlign: 'center',
      marginBottom: 30,
    },
    input: {
      backgroundColor: isDark ? '#2d2b4e' : '#eee',
      color: isDark ? '#fff' : '#000',
      padding: 12,
      borderRadius: 10,
      marginBottom: 16,
    },
    button: {
      backgroundColor: '#A26769',
      paddingVertical: 14,
      borderRadius: 10,
      marginBottom: 16,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    link: {
      textAlign: 'center',
      color: isDark ? '#aaa' : '#555',
      fontSize: 14,
    },
  });
