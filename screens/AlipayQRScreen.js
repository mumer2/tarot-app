import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AlipayScreen({ route }) {
  const { amount } = route.params || {};
  const navigation = useNavigation();

  const confirmPayment = async () => {
    try {
      const current = await AsyncStorage.getItem('@wallet_balance');
      const newBalance = (parseInt(current) || 0) + amount;
      await AsyncStorage.setItem('@wallet_balance', newBalance.toString());
      Alert.alert('✅ Success', `Recharged ${amount} RMB`);
      navigation.goBack();
    } catch (e) {
      Alert.alert('❌ Failed', 'Could not update wallet balance.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔄 Scan with Alipay</Text>
      <Text style={styles.amount}>Amount: {amount} RMB</Text>

      {/* Replace icon.png with real QR image */}
      <Image
        source={require('../assets/icon.png')}
        style={styles.qr}
        resizeMode="contain"
      />

      <Text style={styles.tip}>
        Open the Alipay app and scan this QR code to pay.
      </Text>

      <TouchableOpacity style={styles.payButton} onPress={confirmPayment}>
        <Text style={styles.payText}>✅ I Have Paid</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    color: '#f8e1c1',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  amount: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
  },
  qr: {
    width: 240,
    height: 240,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#f8e1c1',
  },
  tip: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 24,
  },
  payButton: {
    backgroundColor: '#f8e1c1',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 16,
    width: '80%',
    alignItems: 'center',
  },
  payText: {
    color: '#2c2c4e',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    borderColor: '#f8e1c1',
    borderWidth: 1,
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
  },
  backText: {
    color: '#f8e1c1',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
