import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../utils/i18n';
import { WebView } from 'react-native-webview';

export default function AlipayScreen({ route, navigation }) {
  const { amount } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [webHtml, setWebHtml] = useState(null);

  useEffect(() => {
    const startAlipay = async () => {
      if (!amount || isNaN(amount) || amount < 10) {
        Alert.alert(i18n.t('invalidAmount'), i18n.t('minimumAmount') + ' 10 RMB.');
        navigation.goBack();
        return;
      }
      try {
        setLoading(true);
        const userId = await AsyncStorage.getItem('@user_id');
        if (!userId) {
          Alert.alert(i18n.t('error'), i18n.t('userIdMissing'));
          navigation.goBack();
          return;
        }
        const res = await axios.post(
          'https://backend-tarot-app.netlify.app/.netlify/functions/alipay-pay',
          { amount, userId }
        );
      // ...inside startAlipay...
if (res.data?.url && res.data.url.trim().startsWith('<form')) {
  await AsyncStorage.setItem('@last_order_amount', amount.toString());
  setWebHtml(res.data.url);
} else {
  Alert.alert('Alipay', res.data.error || i18n.t('missingPaymentUrl'));
  navigation.goBack();
}
      } catch (err) {
        console.error('Alipay error:', err);
        Alert.alert(i18n.t('error'), err.message || i18n.t('unexpectedError'));
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    startAlipay();
  }, [amount, navigation]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Ionicons name="logo-alipay" size={64} color="#1677FF" style={{ marginBottom: 20 }} />
        <Text style={styles.title}>Alipay</Text>
        <Text style={styles.amount}>{amount} {i18n.t('currency')}</Text>
        <ActivityIndicator size="large" color="#1677FF" style={{ marginTop: 20 }} />
        <Text style={styles.info}>{i18n.t('verifyingAlipay')}</Text>
      </View>
    );
  }

  if (webHtml) {
    return (
      <WebView
        originWhitelist={['*']}
        source={{ html: webHtml }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        style={{ flex: 1 }}
      />
    );
  }

  // Fallback UI
  return (
    <View style={styles.container}>
      <Ionicons name="logo-alipay" size={64} color="#1677FF" style={{ marginBottom: 20 }} />
      <Text style={styles.title}>Alipay</Text>
      <Text style={styles.amount}>{amount} {i18n.t('currency')}</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>{i18n.t('back') || '返回'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1677FF',
    marginBottom: 10
  },
  amount: {
    fontSize: 22,
    color: '#333',
    marginBottom: 30
  },
  info: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  button: {
    marginTop: 40,
    backgroundColor: '#1677FF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});

