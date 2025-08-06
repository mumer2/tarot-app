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
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import i18n from '../utils/i18n';

export default function RechargeScreen() {
  const [balance, setBalance] = useState(0);
  const [manualAmount, setManualAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const fetchBalanceFromServer = async () => {
    try {
      const userId = await AsyncStorage.getItem('@user_id');
      if (!userId) return;

      const res = await axios.post(
        'https://backend-tarot-app.netlify.app/.netlify/functions/get-balance',
        { userId }
      );

      if (res.data?.balance !== undefined) {
        await AsyncStorage.setItem('@wallet_balance', res.data.balance.toString());
        setBalance(res.data.balance);
      }
    } catch (err) {
      console.error('❌ Error fetching wallet balance:', err.message);
    }
  };

  useEffect(() => {
    const loadLocalBalance = async () => {
      const value = await AsyncStorage.getItem('@wallet_balance');
      setBalance(value ? parseFloat(value) : 0);
    };

    loadLocalBalance();
    fetchBalanceFromServer(); // Fetch latest balance from server on mount or focus
  }, [isFocused]);

  const handleWeChatH5Pay = async (amount) => {
    if (!amount || isNaN(amount) || amount < 10) {
      return Alert.alert('⚠️ Invalid amount', 'Please enter an amount ≥ 6 RMB.');
    }

    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('@user_id');
      if (!userId) return Alert.alert('❌ Error', 'User ID not found');

      const res = await axios.post(
        'https://backend-tarot-app.netlify.app/.netlify/functions/wechat-pay',
        { total_fee: amount * 100, userId }
      );

      if (res.data?.paymentUrl) {
        await AsyncStorage.setItem('@last_order_amount', amount.toString());
        const supported = await Linking.canOpenURL(res.data.paymentUrl);
        supported
          ? Linking.openURL(res.data.paymentUrl)
          : Alert.alert('Cannot open WeChat payment page');
      } else {
        Alert.alert('WeChat Pay Error', res.data.error || 'Missing payment URL');
      }
    } catch (err) {
      console.error('WeChat error:', err);
      Alert.alert('❌ Error', err.message || 'Unexpected WeChat payment error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaypalPay = async (amount) => {
    if (!amount || isNaN(amount) || amount < 10) {
      return Alert.alert('⚠️ Invalid amount', 'Please enter an amount ≥ 6 RMB.');
    }

    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('@user_id');
      if (!userId) return Alert.alert('❌ Error', 'User ID not found');

      const res = await axios.post(
        'https://backend-tarot-app.netlify.app/.netlify/functions/paypal-pay',
        { amount, userId }
      );

      if (res.data?.approvalUrl) {
        await AsyncStorage.setItem('@last_order_amount', amount.toString());
        const supported = await Linking.canOpenURL(res.data.approvalUrl);
        supported
          ? Linking.openURL(res.data.approvalUrl)
          : Alert.alert('Cannot open PayPal payment page');
      } else {
        Alert.alert('PayPal Error', res.data.error || 'Missing approval URL');
      }
    } catch (err) {
      console.error('PayPal error:', err);
      Alert.alert('❌ Error', err.message || 'Unexpected PayPal error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplePay = async (amount) => {
    if (!amount || isNaN(amount) || amount < 10) {
      return Alert.alert('⚠️ Invalid amount', 'Please enter an amount ≥ 1 USD.');
    }

    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('@user_id');
      if (!userId) return Alert.alert('❌ Error', 'User ID not found');

      const res = await axios.post(
        'https://backend-tarot-app.netlify.app/.netlify/functions/apple-pay',
        { amount, userId }
      );

      if (res.data?.paymentUrl) {
        await AsyncStorage.setItem('@last_order_amount', amount.toString());
        const supported = await Linking.canOpenURL(res.data.paymentUrl);
        supported
          ? Linking.openURL(res.data.paymentUrl)
          : Alert.alert('Cannot open Apple Pay checkout page');
      } else {
        Alert.alert('Apple Pay Error', res.data.error || 'Missing session URL');
      }
    } catch (err) {
      console.error('Apple Pay error:', err);
      Alert.alert('❌ Error', err.message || 'Unexpected Apple Pay error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles(isDark).container}>
      <Ionicons name="wallet-outline" size={64} color={isDark ? '#f8e1c1' : '#2c2c4e'} style={styles(isDark).icon} />
      <Text style={styles(isDark).title}>💰 {i18n.t('walletRecharge')}</Text>
      <Text style={styles(isDark).label}>Current Balance</Text>
      <Text style={styles(isDark).balance}>{balance} RMB</Text>
      <Text style={styles(isDark).label}>Enter amount (RMB)</Text>

      <TextInput
        placeholder="Enter amount"
        placeholderTextColor={isDark ? '#888' : '#999'}
        keyboardType="numeric"
        style={styles(isDark).input}
        value={manualAmount}
        onChangeText={setManualAmount}
      />

      <TouchableOpacity
        style={[styles(isDark).button, { backgroundColor: '#7bb32e' }]}
        onPress={() => handleWeChatH5Pay(Number(manualAmount || 0))}
        disabled={loading}
      >
        <Text style={[styles(isDark).buttonText, { color: '#fff' }]}>
          WeChat Pay {manualAmount || '...'} RMB
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles(isDark).button, { backgroundColor: '#0070BA' }]}
        onPress={() => handlePaypalPay(Number(manualAmount || 0))}
        disabled={loading}
      >
        <Text style={[styles(isDark).buttonText, { color: '#fff' }]}>
          PayPal {manualAmount || '...'} RMB
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles(isDark).button, { backgroundColor: '#000' }]}
        onPress={() => handleApplePay(Number(manualAmount || 0))}
        disabled={loading}
      >
        <Text style={[styles(isDark).buttonText, { color: '#fff' }]}>
           Apple Pay {manualAmount || '...'} RMB
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles(isDark).button, { backgroundColor: '#2c2c4e', marginTop: 20 }]}
        onPress={() => navigation.navigate('WalletHistory')}
      >
        <Text style={[styles(isDark).buttonText, { color: '#f8e1c1', fontSize: 14 }]}>
          📜 View Recharge History
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#f8e1c1" style={{ marginTop: 20 }} />}

      <Text style={styles(isDark).note}>💡 6 RMB = 1 minute of chat time with the Tarot AI.</Text>
    </ScrollView>
  );
}

const styles = (isDark) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      alignItems: 'center',
      padding: 24
    },
    icon: {
      marginBottom: 20
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#f8e1c1' : '#2c2c4e',
      marginBottom: 8
    },
    label: {
      fontSize: 16,
      color: isDark ? '#ccc' : '#666',
      marginBottom: 8
    },
    balance: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#f8e1c1' : '#2c2c4e',
      marginBottom: 24
    },
    button: {
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
      elevation: 6
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold'
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
      marginTop: 10
    },
    note: {
      marginTop: 30,
      fontSize: 14,
      color: isDark ? '#aaa' : '#444',
      textAlign: 'center',
      paddingHorizontal: 10
    }
  });




// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
//   TextInput,
//   Linking
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { ThemeContext } from '../context/ThemeContext';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import axios from 'axios';
// import i18n from '../utils/i18n';

// export default function RechargeScreen() {
//   const [balance, setBalance] = useState(0);
//   const [manualAmount, setManualAmount] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { theme } = useContext(ThemeContext);
//   const isDark = theme === 'dark';
//   const navigation = useNavigation();

//   useEffect(() => {
//     const loadBalance = async () => {
//       try {
//         const value = await AsyncStorage.getItem('@wallet_balance');
//         setBalance(value ? parseFloat(value) : 0);
//       } catch (e) {
//         console.error('Error loading balance:', e);
//       }
//     };
//     loadBalance();
//   }, []);

//   const updateHistory = async (amount) => {
//     try {
//       const old = await AsyncStorage.getItem('@wallet_history');
//       const history = old ? JSON.parse(old) : [];
//       history.push({ createdAt: new Date().toISOString(), amount });
//       await AsyncStorage.setItem('@wallet_history', JSON.stringify(history));
//     } catch (err) {
//       console.error('Failed to update history:', err);
//     }
//   };

//   const handleWeChatH5Pay = async (amount) => {
//     if (!amount || isNaN(amount) || amount < 1) {
//       return Alert.alert('⚠️ Invalid amount', 'Please enter an amount ≥ 1 RMB.');
//     }

//     try {
//       setLoading(true);
//       const userId = await AsyncStorage.getItem('@user_id');
//       if (!userId) return Alert.alert('❌ Error', 'User ID not found');

//       const res = await axios.post(
//         'https://backend-tarot-app.netlify.app/.netlify/functions/wechat-pay',
//         { total_fee: amount * 100, userId }
//       );

//       if (res.data && res.data.paymentUrl) {
//         await AsyncStorage.setItem('@last_order_amount', amount.toString());

//         // ✅ Open WeChat payment page in external browser
//         const supported = await Linking.canOpenURL(res.data.paymentUrl);
//         if (supported) {
//           Linking.openURL(res.data.paymentUrl);
//         } else {
//           Alert.alert('Cannot open WeChat payment page');
//         }
//       } else {
//         Alert.alert('WeChat Error', res.data.error || 'Missing payment URL');
//       }
//     } catch (err) {
//       console.error('WeChat H5 error:', err);
//       Alert.alert('❌ Error', err.message || 'Unexpected payment error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles(isDark).container}>
//       <Ionicons name="wallet-outline" size={64} color={isDark ? '#f8e1c1' : '#2c2c4e'} style={styles(isDark).icon} />
//       <Text style={styles(isDark).title}>💰 {i18n.t('walletRecharge')}</Text>
//       <Text style={styles(isDark).label}>Current Balance</Text>
//       <Text style={styles(isDark).balance}>{balance} RMB</Text>
//       <Text style={styles(isDark).label}>Enter amount (RMB)</Text>

//       <TextInput
//         placeholder="Enter amount"
//         placeholderTextColor={isDark ? '#888' : '#999'}
//         keyboardType="numeric"
//         style={styles(isDark).input}
//         value={manualAmount}
//         onChangeText={setManualAmount}
//       />

//       <TouchableOpacity
//         style={[styles(isDark).button, { backgroundColor: '#7bb32e' }]}
//         onPress={() => handleWeChatH5Pay(Number(manualAmount || 0))}
//         disabled={loading}
//       >
//         <Text style={[styles(isDark).buttonText, { color: '#fff' }]}>
//           WeChat Pay {manualAmount || '...'} RMB
//         </Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[styles(isDark).button, { backgroundColor: '#2c2c4e', marginTop: 20 }]}
//         onPress={() => navigation.navigate('WalletHistory')}
//       >
//         <Text style={[styles(isDark).buttonText, { color: '#f8e1c1', fontSize: 14 }]}>
//           📜 View Recharge History
//         </Text>
//       </TouchableOpacity>

//       {loading && <ActivityIndicator size="large" color="#f8e1c1" style={{ marginTop: 20 }} />}

//       <Text style={styles(isDark).note}>💡 5 RMB = 1 minute of chat time with the Tarot AI.</Text>
//     </ScrollView>
//   );
// }

// const styles = (isDark) =>
//   StyleSheet.create({
//     container: {
//       flexGrow: 1,
//       backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
//       alignItems: 'center',
//       padding: 24
//     },
//     icon: {
//       marginBottom: 20
//     },
//     title: {
//       fontSize: 28,
//       fontWeight: 'bold',
//       color: isDark ? '#f8e1c1' : '#2c2c4e',
//       marginBottom: 8
//     },
//     label: {
//       fontSize: 16,
//       color: isDark ? '#ccc' : '#666',
//       marginBottom: 8
//     },
//     balance: {
//       fontSize: 24,
//       fontWeight: 'bold',
//       color: isDark ? '#f8e1c1' : '#2c2c4e',
//       marginBottom: 24
//     },
//     button: {
//       backgroundColor: '#f8e1c1',
//       paddingVertical: 14,
//       paddingHorizontal: 40,
//       borderRadius: 25,
//       marginVertical: 8,
//       width: '80%',
//       alignItems: 'center',
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 4 },
//       shadowOpacity: 0.2,
//       shadowRadius: 5,
//       elevation: 6
//     },
//     buttonText: {
//       fontSize: 16,
//       fontWeight: 'bold',
//       color: '#2c2c4e'
//     },
//     input: {
//       borderColor: '#ccc',
//       borderWidth: 1,
//       borderRadius: 10,
//       padding: 10,
//       width: '80%',
//       fontSize: 16,
//       color: isDark ? '#fff' : '#000',
//       backgroundColor: isDark ? '#333' : '#f9f9f9',
//       marginTop: 10
//     },
//     note: {
//       marginTop: 30,
//       fontSize: 14,
//       color: isDark ? '#aaa' : '#444',
//       textAlign: 'center',
//       paddingHorizontal: 10
//     }
//   });
