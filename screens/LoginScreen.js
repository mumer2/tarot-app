import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('❌ Error', 'Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'https://backend-tarot.netlify.app/.netlify/functions/login',
        { email, password }
      );

      const { token, user } = response.data;

      // ✅ Save user details
      await AsyncStorage.setItem('@auth_token', token);
      await AsyncStorage.setItem('@user_id', user._id); // important for wallet and history
      await AsyncStorage.setItem('@user_email', user.email);
      await AsyncStorage.setItem('@user_name', user.name);
      await AsyncStorage.setItem('@wallet_balance', String(user.balance || 0));
      await AsyncStorage.setItem('@first_login', 'true');

      await login(token); // context-aware login

      navigation.replace('Welcome'); // Redirect after login
    } catch (error) {
      Alert.alert(
        '❌ Login Failed',
        error.response?.data?.message || 'Invalid credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles(isDark).container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles(isDark).scroll}>
        <Text style={styles(isDark).title}>🔮 Login to Tarot Station</Text>

        <TextInput
          style={styles(isDark).input}
          placeholder="Email"
          placeholderTextColor={isDark ? '#aaa' : '#666'}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles(isDark).input}
          placeholder="Password"
          placeholderTextColor={isDark ? '#aaa' : '#666'}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles(isDark).loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles(isDark).loginText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles(isDark).linkText}>Forgot Password?</Text>
        </TouchableOpacity>

        <View style={styles(isDark).bottomRow}>
          <Text style={styles(isDark).bottomText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles(isDark).signupLink}> Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
    },
    scroll: {
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      flexGrow: 1,
    },
    title: {
      fontSize: 24,
      color: isDark ? '#f8e1c1' : '#2c2c4e',
      marginBottom: 40,
      fontWeight: 'bold',
    },
    input: {
      width: '100%',
      padding: 14,
      borderRadius: 10,
      backgroundColor: isDark ? '#2a2a2a' : '#f2f2f2',
      color: isDark ? '#fff' : '#000',
      marginBottom: 20,
    },
    loginButton: {
      backgroundColor: '#f8e1c1',
      paddingVertical: 14,
      borderRadius: 10,
      width: '100%',
      alignItems: 'center',
      marginBottom: 20,
    },
    loginText: {
      color: '#2c2c4e',
      fontWeight: 'bold',
      fontSize: 16,
    },
    linkText: {
      color: '#a88',
      marginBottom: 20,
    },
    bottomRow: {
      flexDirection: 'row',
      marginTop: 20,
    },
    bottomText: {
      color: isDark ? '#ccc' : '#444',
    },
    signupLink: {
      color: '#A26769',
      fontWeight: 'bold',
    },
  });
