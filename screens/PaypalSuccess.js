import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../utils/i18n';

export default function PaypalSuccess({ route, navigation }) {
  const { orderId } = route.params || {};

  useEffect(() => {
    if (orderId) {
      captureOrder(orderId);
    } else {
      Alert.alert(i18n.t('missingOrderId'));
    }
  }, [orderId]);

  const captureOrder = async (orderId) => {
    try {
      const res = await fetch(
        `https://backend-tarot-app.netlify.app/.netlify/functions/paypal-pay?orderId=${orderId}`
      );
      const data = await res.json();

      if (data.status === 'COMPLETED') {
        const amount = parseFloat(data.amount);
        const current = await AsyncStorage.getItem('@wallet_balance');
        const newBalance = (parseFloat(current || 0) + amount).toFixed(2);

        await AsyncStorage.setItem('@wallet_balance', newBalance);
        await AsyncStorage.setItem('@wallet_history', JSON.stringify([
          ...(JSON.parse(await AsyncStorage.getItem('@wallet_history')) || []),
          { amount, createdAt: new Date().toISOString(), method: 'PayPal' }
        ]));

        Alert.alert(
          i18n.t('paymentSuccessTitle'),
          i18n.t('walletRecharged', { amount })
        );
        navigation.replace('Recharge');
      } else {
        Alert.alert(i18n.t('paymentFailedTitle'), data.error || i18n.t('unknownError'));
      }
    } catch (err) {
      console.error('Capture Error:', err);
      Alert.alert(i18n.t('error'), err.message || i18n.t('somethingWentWrong'));
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 20 }}>{i18n.t('verifyingPaypal')}</Text>
    </View>
  );
}
