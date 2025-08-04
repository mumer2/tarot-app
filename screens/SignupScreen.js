import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import Icon from "react-native-vector-icons/Ionicons";

const REQUEST_OTP_URL =
  "https://backend-tarot-app.netlify.app/.netlify/functions/send-code";
const VERIFY_OTP_URL =
  "https://backend-tarot-app.netlify.app/.netlify/functions/verify-code";
const SIGNUP_URL =
  "https://backend-tarot-app.netlify.app/.netlify/functions/signup";

export default function SignupScreen() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const navigation = useNavigation();

  const [stage, setStage] = useState(1);
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(false);

  const isPhoneNumber = (input) => /^1[3-9]\d{9}$/.test(input);
  const isEmail = (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

  useEffect(() => {
    const loadReferral = async () => {
      const code = await AsyncStorage.getItem("referralCode");
      if (code) setReferralCode(code);
    };
    loadReferral();
  }, []);

  const handleContactSubmit = async () => {
    if (!contact)
      return Alert.alert("❌ Error", "Please enter email or phone number");

    if (isPhoneNumber(contact)) {
      setIsPhone(true);
      setLoading(true);
      try {
        const res = await axios.post(REQUEST_OTP_URL, { phone: contact });
        if (res.data.success) {
          Alert.alert("📩 OTP Sent", "Please check your phone");
          setStage(2);
        } else {
          Alert.alert("❌ Error", res.data.message || "Failed to send OTP");
        }
      } catch (err) {
        console.error(err);
        Alert.alert("❌ Error", "Failed to send OTP");
      } finally {
        setLoading(false);
      }
    } else if (isEmail(contact)) {
      setIsPhone(false);
      setStage(3);
    } else {
      Alert.alert("❌ Error", "Please enter a valid phone number or email");
    }
  };

  const handleOTPVerify = async () => {
    if (!otp) return Alert.alert("❌ Error", "Please enter OTP");

    setLoading(true);
    try {
      const res = await axios.post(VERIFY_OTP_URL, {
        phone: contact,
        code: otp,
      });
      if (res.data.success) {
        setIsOTPVerified(true);
        setStage(3);
      } else {
        Alert.alert("❌ Error", res.data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Error", "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (isPhone && !isOTPVerified) {
      Alert.alert("❌ Error", "Please verify OTP first.");
      return;
    }

    if (!name || !password) {
      Alert.alert("❌ Error", "Name and password are required.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("❌ Error", "Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(SIGNUP_URL, {
        name,
        password,
        email: isPhone ? "" : contact,
        phone: isPhone ? contact : "",
        referralCode: referralCode.trim(),
      });

      if (res.data?.userId) {
        await AsyncStorage.setItem("userName", name.trim());
        await AsyncStorage.setItem("userId", res.data.userId);
        Alert.alert("✅ Registered", "You can now log in.");
        navigation.navigate("Login");
      } else {
        Alert.alert("❌ Error", res.data?.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("❌ Error", error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (stage === 2) {
      setStage(1);
      setOtp("");
    } else if (stage === 3) {
      setStage(isPhone ? 2 : 1);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles(isDark).container}
    >
      <ScrollView contentContainerStyle={styles(isDark).scrollContainer}>
        <View style={styles(isDark).card}>
          <Text style={styles(isDark).title}>📝 Sign Up</Text>

          {stage === 1 && (
            <>
              <TextInput
                placeholder="Email or Phone"
                placeholderTextColor="#999"
                style={styles(isDark).input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={contact}
                onChangeText={setContact}
              />
              <TouchableOpacity
                style={[styles(isDark).button, loading && { opacity: 0.7 }]}
                onPress={handleContactSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#2c2c4e" />
                ) : (
                  <Text style={styles(isDark).buttonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {stage === 2 && (
            <>
              <TextInput
                placeholder="Enter OTP"
                placeholderTextColor="#999"
                style={styles(isDark).input}
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
              />
              <TouchableOpacity
                style={[styles(isDark).button, loading && { opacity: 0.7 }]}
                onPress={handleOTPVerify}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#2c2c4e" />
                ) : (
                  <Text style={styles(isDark).buttonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBack}>
                <Text style={styles(isDark).link}>← Back</Text>
              </TouchableOpacity>
            </>
          )}

          {stage === 3 && (
            <>
              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#999"
                style={styles(isDark).input}
                value={name}
                onChangeText={setName}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#999"
                style={styles(isDark).input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TextInput
                placeholder="Referral Code (optional)"
                placeholderTextColor="#999"
                style={styles(isDark).input}
                value={referralCode}
                onChangeText={setReferralCode}
              />
              <TouchableOpacity
                style={[styles(isDark).button, loading && { opacity: 0.7 }]}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#2c2c4e" />
                ) : (
                  <Text style={styles(isDark).buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBack}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Icon
                    name="arrow-back"
                    size={20}
                    color={isDark ? "#aaa" : "#555"}
                  />
                  <Text style={[styles(isDark).link, { marginLeft: 6 }]}>
                    Back
                  </Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles(isDark).link}>
              Already have an account? Login
            </Text>
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
      backgroundColor: isDark ? "#1e1e1e" : "#fff",
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 40,
    },
    card: {
      width: "100%",
      maxWidth: 420,
      backgroundColor: isDark ? "#2d2b4e" : "#fff",
      borderRadius: 16,
      padding: 24,
      elevation: 3,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 30,
      color: isDark ? "#f8e1c1" : "#2c2c4e",
    },
    input: {
      backgroundColor: isDark ? "#3e3c5e" : "#eee",
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
      marginTop: 5,
    },
  });

// import React, { useState, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
//   ActivityIndicator,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import axios from 'axios';
// import { ThemeContext } from '../context/ThemeContext';

// export default function SignupScreen() {
//   const { theme } = useContext(ThemeContext);
//   const isDark = theme === 'dark';
//   const navigation = useNavigation();

//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSignup = async () => {
//     if (!name || !email || !password) {
//       Alert.alert('❌ Error', 'Please fill in all fields');
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await axios.post(
//         'https://backend-tarot.netlify.app/.netlify/functions/signup',
//         {
//           name,
//           email,
//           password,
//         }
//       );

//       if (res.data?.success || res.status === 200) {
//         Alert.alert('✅ Registered', 'You can now log in.');
//         navigation.navigate('Login');
//       } else {
//         Alert.alert('❌ Error', res.data?.message || 'Signup failed');
//       }
//     } catch (error) {
//       console.error('Signup error:', error);
//       Alert.alert('❌ Error', error.response?.data?.message || 'Signup failed. Try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles(isDark).container}>
//       <Text style={styles(isDark).title}>📝 Sign Up</Text>

//       <TextInput
//         placeholder="Full Name"
//         placeholderTextColor="#999"
//         style={styles(isDark).input}
//         value={name}
//         onChangeText={setName}
//       />
//       <TextInput
//         placeholder="Email"
//         placeholderTextColor="#999"
//         style={styles(isDark).input}
//         keyboardType="email-address"
//         autoCapitalize="none"
//         value={email}
//         onChangeText={setEmail}
//       />
//       <TextInput
//         placeholder="Password"
//         placeholderTextColor="#999"
//         style={styles(isDark).input}
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />

//       <TouchableOpacity
//         style={[styles(isDark).button, loading && { opacity: 0.7 }]}
//         onPress={handleSignup}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator size="small" color="#2c2c4e" />
//         ) : (
//           <Text style={styles(isDark).buttonText}>Create Account</Text>
//         )}
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//         <Text style={styles(isDark).link}>Already have an account? Login</Text>
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
//       fontSize: 28,
//       fontWeight: 'bold',
//       textAlign: 'center',
//       marginBottom: 30,
//       color: isDark ? '#f8e1c1' : '#2c2c4e',
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
