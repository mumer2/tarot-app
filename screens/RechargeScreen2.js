import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CardField, useStripe, useConfirmPayment } from '@stripe/stripe-react-native';
import axios from 'axios';
import i18n from '../utils/i18n';


export default function RechargeScreen() {
  const [balance, setBalance] = useState(0);
  const [amountToRecharge, setAmountToRecharge] = useState(null);
  const [manualAmount, setManualAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { confirmPayment } = useStripe();
  const navigation = useNavigation();
  const [cardDetails, setCardDetails] = useState();

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const value = await AsyncStorage.getItem('@wallet_balance');
        setBalance(value ? parseFloat(value) : 0);
      } catch (e) {
        console.error('Error loading balance:', e);
      }
    };
    loadBalance();
  }, []);

  const updateHistory = async (amount) => {
    try {
      const old = await AsyncStorage.getItem('@wallet_history');
      const history = old ? JSON.parse(old) : [];
      history.push({
        createdAt: new Date().toISOString(),
        amount,
      });
      await AsyncStorage.setItem('@wallet_history', JSON.stringify(history));
    } catch (err) {
      console.error('Failed to update history:', err);
    }
  };

  const handleRecharge = async (amount) => {
    if (!amount || isNaN(amount) || amount <= 0) {
      return Alert.alert('⚠️ Invalid amount', 'Please enter a valid recharge amount.');
    }

    if (!cardDetails?.complete) {
      return Alert.alert('⚠️ Invalid Card', 'Please enter complete card details.');
    }

    try {
      setLoading(true);
      setAmountToRecharge(amount);

      const userId = await AsyncStorage.getItem('@user_id');
      if (!userId) {
        return Alert.alert('❌ Error', 'User ID not found');
      }

      const res = await axios.post(
        'https://backend-tarot.netlify.app/.netlify/functions/createPaymentIntent',
        { amount, userId }
      );

      const clientSecret = res.data.clientSecret;

      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        Alert.alert('❌ Payment failed', error.message);
      } else if (paymentIntent && paymentIntent.status === 'Succeeded') {
        const newBalance = balance + amount;

        await AsyncStorage.setItem('@wallet_balance', String(newBalance));
        await updateHistory(amount);
        setBalance(newBalance);
        setManualAmount('');
        setCardDetails(undefined);

        Alert.alert('✅ Recharge Successful', `Added ${amount} RMB to your wallet.`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      Alert.alert('⚠️ Error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles(isDark).container}>
      <Ionicons
        name="wallet-outline"
        size={64}
        color={isDark ? '#f8e1c1' : '#2c2c4e'}
        style={styles(isDark).icon}
      />

      <Text style={styles(isDark).title}>💰 {i18n.t('walletRecharge')}</Text>
      <Text style={styles(isDark).label}>Current Balance</Text>
      <Text style={styles(isDark).balance}>{balance} RMB</Text>

      <Text style={[styles(isDark).label, { marginTop: 20 }]}>💳 Enter Card Details</Text>
      <CardField
        postalCodeEnabled={false}
        style={{ height: 50, width: '100%', marginBottom: 20 }}
        onCardChange={(details) => setCardDetails(details)}
      />

      <View style={styles(isDark).buttonsWrapper}>
        {[100, 500, 1000].map((amount) => (
          <TouchableOpacity
            key={amount}
            style={styles(isDark).button}
            onPress={() => handleRecharge(amount)}
            disabled={loading}
          >
            <Text style={styles(isDark).buttonText}>
              {loading && amount === amountToRecharge
                ? 'Processing...'
                : `Recharge ${amount} RMB`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles(isDark).label}>Or enter custom amount (RMB)</Text>
      <TextInput
        placeholder="Enter amount"
        placeholderTextColor={isDark ? '#888' : '#999'}
        keyboardType="numeric"
        style={styles(isDark).input}
        value={manualAmount}
        onChangeText={setManualAmount}
      />
      <TouchableOpacity
        style={[styles(isDark).button, { marginTop: 10 }]}
        onPress={() => handleRecharge(Number(manualAmount))}
        disabled={loading}
      >
        <Text style={styles(isDark).buttonText}>
          {loading && amountToRecharge === Number(manualAmount)
            ? 'Processing...'
            : `Recharge ${manualAmount || '...'} RMB`}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles(isDark).button, { backgroundColor: '#2c2c4e', marginTop: 20 }]}
        onPress={() => navigation.navigate('WalletHistory')}
      >
        <Text style={[styles(isDark).buttonText, { color: '#f8e1c1',fontSize:14 }]}>
          📜 View Recharge History
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color="#f8e1c1" style={{ marginTop: 20 }} />
      )}

      <Text style={styles(isDark).note}>
        💡 5 RMB = 1 minute of chat time with the Tarot AI.
      </Text>
    </ScrollView>
  );
}

const styles = (isDark) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      alignItems: 'center',
      padding: 24,
    },
    icon: {
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#f8e1c1' : '#2c2c4e',
      marginBottom: 8,
    },
    label: {
      fontSize: 16,
      color: isDark ? '#ccc' : '#666',
      marginBottom: 8,
    },
    balance: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#f8e1c1' : '#2c2c4e',
      marginBottom: 24,
    },
    buttonsWrapper: {
      width: '100%',
      alignItems: 'center',
    },
    button: {
      backgroundColor: '#f8e1c1',
      paddingVertical: 14,
      paddingHorizontal: 40,
      borderRadius: 25,
      marginVertical: 8,
      width: '80%',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 6,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#2c2c4e',
    },
    input: {
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 10,
      padding: 10,
      width: '80%',
      fontSize: 16,
      color: isDark ? '#fff' : '#000',
      backgroundColor: isDark ? '#333' : '#f9f9f9',
      marginTop: 10,
    },
    note: {
      marginTop: 30,
      fontSize: 14,
      color: isDark ? '#aaa' : '#444',
      textAlign: 'center',
      paddingHorizontal: 10,
    },
  });