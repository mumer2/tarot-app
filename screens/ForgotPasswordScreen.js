import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";
import i18n from "../utils/i18n"; // make sure this is correctly imported

export default function ForgotPasswordScreen() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const navigation = useNavigation();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const isPhone = /^\d{10,15}$/.test(input);
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

  const handleReset = async () => {
    const trimmed = input.trim();

    if (!trimmed) {
      Alert.alert(i18n.t("error"), i18n.t("enterEmailOrPhone"));
      return;
    }

    if (!isEmail && !isPhone) {
      Alert.alert(i18n.t("error"), i18n.t("invalidEmailOrPhone"));
      return;
    }

    const payload = isPhone
      ? { phone: trimmed }
      : { email: trimmed.toLowerCase() };

    setLoading(true);
    try {
      const response = await axios.post(
        "https://backend-tarot-app.netlify.app/.netlify/functions/requestReset",
        payload
      );

      if (response.data?.success && response.data?.token) {
        Alert.alert(i18n.t("codeSent"), i18n.t("checkInboxOrSms"));

        navigation.navigate("ResetPassword", {
          email: response.data.email || "",
          phone: response.data.phone || "",
          token: response.data.token,
        });
      } else {
        Alert.alert(
          i18n.t("error"),
          response.data?.message || i18n.t("sendResetFailed")
        );
      }
    } catch (error) {
      console.error("Reset error:", error);
      Alert.alert(
        i18n.t("error"),
        error.response?.data?.message || i18n.t("generalError")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles(isDark).container}>
      <Text style={styles(isDark).title}>🔑 {i18n.t("forgotPassword")}</Text>

      <TextInput
        placeholder={i18n.t("enterEmailOrPhone")}
        placeholderTextColor="#999"
        style={styles(isDark).input}
        keyboardType="default"
        autoCapitalize="none"
        value={input}
        onChangeText={setInput}
      />

      <TouchableOpacity
        style={styles(isDark).button}
        onPress={handleReset}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#2c2c4e" />
        ) : (
          <Text style={styles(isDark).buttonText}>
            {i18n.t("sendResetCode")}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon name="arrow-back" size={20} color={isDark ? "#aaa" : "#555"} />
          <Text style={[styles(isDark).link, { marginLeft: 6 }]}>
            {i18n.t("back")}
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = (isDark) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: isDark ? "#1e1e1e" : "#fff",
      justifyContent: "center",
      padding: 24,
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      color: isDark ? "#f8e1c1" : "#2c2c4e",
      textAlign: "center",
      marginBottom: 30,
    },
    input: {
      backgroundColor: isDark ? "#2d2b4e" : "#eee",
      color: isDark ? "#fff" : "#000",
      padding: 12,
      borderRadius: 10,
      marginBottom: 15,
    },
    button: {
      backgroundColor: "#f8e1c1",
      paddingVertical: 14,
      borderRadius: 20,
      alignItems: "center",
      marginBottom: 20,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#2c2c4e",
    },
    link: {
      textAlign: "center",
      color: isDark ? "#aaa" : "#555",
      fontSize: 14,
    },
  });

// import React, { useState, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { ThemeContext } from '../context/ThemeContext';
// import axios from 'axios';

// export default function ForgotPasswordScreen() {
//   const { theme } = useContext(ThemeContext);
//   const isDark = theme === 'dark';
//   const navigation = useNavigation();

//   const [email, setEmail] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleReset = async () => {
//     if (!email.trim()) {
//       Alert.alert('❌ Error', 'Please enter your email address');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post(
//         'https://backend-tarot.netlify.app/.netlify/functions/requestReset',
//         { email }
//       );

//       if (response.data?.success && response.data?.token) {
//         Alert.alert('📩 Email Sent', 'Check your inbox for the reset code.');

//         // 👇 Navigate to ResetPasswordScreen with token & email
//         navigation.navigate('ResetPassword', {
//           email: response.data.email,
//           token: response.data.token,
//         });
//       } else {
//         Alert.alert('❌ Error', response.data?.message || 'Failed to send reset email');
//       }
//     } catch (error) {
//       console.error('Reset error:', error);
//       Alert.alert(
//         '❌ Error',
//         error.response?.data?.message || 'An error occurred. Try again later.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles(isDark).container}>
//       <Text style={styles(isDark).title}>🔑 Forgot Password</Text>

//       <TextInput
//         placeholder="Enter your email"
//         placeholderTextColor="#999"
//         style={styles(isDark).input}
//         keyboardType="email-address"
//         autoCapitalize="none"
//         value={email}
//         onChangeText={setEmail}
//       />

//       <TouchableOpacity
//         style={styles(isDark).button}
//         onPress={handleReset}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#2c2c4e" />
//         ) : (
//           <Text style={styles(isDark).buttonText}>Send Reset Link</Text>
//         )}
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => navigation.goBack()}>
//         <Text style={styles(isDark).link}>← Back to Login</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = (isDark) =>
//   StyleSheet.create({
//     container: {
//       flexGrow: 1,
//       backgroundColor: isDark ? '#1e1e1e' : '#fff',
//       justifyContent: 'center',
//       padding: 24,
//     },
//     title: {
//       fontSize: 26,
//       fontWeight: 'bold',
//       color: isDark ? '#f8e1c1' : '#2c2c4e',
//       textAlign: 'center',
//       marginBottom: 30,
//     },
//     input: {
//       backgroundColor: isDark ? '#2d2b4e' : '#eee',
//       color: isDark ? '#fff' : '#000',
//       padding: 12,
//       borderRadius: 10,
//       marginBottom: 15,
//     },
//     button: {
//       backgroundColor: '#f8e1c1',
//       paddingVertical: 14,
//       borderRadius: 20,
//       alignItems: 'center',
//       marginBottom: 20,
//     },
//     buttonText: {
//       fontSize: 16,
//       fontWeight: 'bold',
//       color: '#2c2c4e',
//     },
//     link: {
//       textAlign: 'center',
//       color: isDark ? '#aaa' : '#555',
//       fontSize: 14,
//     },
//   });
