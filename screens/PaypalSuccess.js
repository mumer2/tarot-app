import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PaypalSuccess({ route, navigation }) {
  const { orderId } = route.params || {};

  useEffect(() => {
    if (orderId) {
      captureOrder(orderId);
    } else {
      Alert.alert('Missing order ID');
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

        Alert.alert('✅ Payment Success', `Wallet recharged with ${amount} RMB`);
        navigation.replace('Recharge');
      } else {
        Alert.alert('⚠️ Payment Failed', data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Capture Error:', err);
      Alert.alert('❌ Error', err.message || 'Something went wrong');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 20 }}>Verifying PayPal payment...</Text>
    </View>
  );
}
