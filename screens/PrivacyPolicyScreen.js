import React, { useContext } from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import i18n from '../utils/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { theme } = useContext(ThemeContext); // ✅ FIXED: added useContext
  const isDark = theme === 'dark';

  const styles = getStyles(isDark, width, insets); // ✅ FIXED: renamed to isDark

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🔐 {i18n.t('privacy.title')}</Text>
      <Text style={styles.text}>{i18n.t('privacy.body')}</Text>
    </ScrollView>
  );
}

// ✅ FIXED: make sure styles use correct values
const getStyles = (isDark, width, insets) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      paddingHorizontal: 20,
      paddingTop: insets.top + 5,
    },
    content: {
      paddingBottom: insets.bottom + 20,
    },
    title: {
      fontSize: width < 360 ? 22 : 26,
      color: isDark ? '#f8e1c1' : '#222222',
      fontWeight: 'bold',
      marginBottom: 20,
    },
    text: {
      fontSize: width < 360 ? 14 : 16,
      color: isDark ? '#ffffff' : '#333333',
      lineHeight: 24,
    },
  });



// // screens/PrivacyPolicyScreen.js
// import React from 'react';
// import { ScrollView, Text, StyleSheet } from 'react-native';

// export default function PrivacyPolicyScreen() {
//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>🔐 Privacy Policy</Text>
//       <Text style={styles.text}>
//         Tarot Station ("we", "our", "us") respects your privacy. This Privacy Policy describes how we collect, use, and protect your data.

//         {"\n\n"}1. **Data We Collect**
//         - App usage data
//         - Optional bot customization data
//         - Wallet balance stored locally

//         {"\n\n"}2. **How We Use Data**
//         - To personalize your experience
//         - To maintain chat history on your device only

//         {"\n\n"}3. **No Third-Party Sharing**
//         - We do not sell or share your data with third parties.

//         {"\n\n"}4. **Security**
//         - Data is stored securely on your device using AsyncStorage.

//         {"\n\n"}5. **Contact**
//         For any questions, email: support@tarotstation.app
//       </Text>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#1e1e1e',
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     color: '#f8e1c1',
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   text: {
//     fontSize: 16,
//     color: '#fff',
//     lineHeight: 24,
//   },
// });
