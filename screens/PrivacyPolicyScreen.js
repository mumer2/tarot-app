// screens/PrivacyPolicyScreen.js
import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔐 Privacy Policy</Text>
      <Text style={styles.text}>
        Tarot Station ("we", "our", "us") respects your privacy. This Privacy Policy describes how we collect, use, and protect your data.

        {"\n\n"}1. **Data We Collect**
        - App usage data
        - Optional bot customization data
        - Wallet balance stored locally

        {"\n\n"}2. **How We Use Data**
        - To personalize your experience
        - To maintain chat history on your device only

        {"\n\n"}3. **No Third-Party Sharing**
        - We do not sell or share your data with third parties.

        {"\n\n"}4. **Security**
        - Data is stored securely on your device using AsyncStorage.

        {"\n\n"}5. **Contact**
        For any questions, email: support@tarotstation.app
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#f8e1c1',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
});
