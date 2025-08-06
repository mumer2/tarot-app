import React, { useEffect, useState, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './utils/i18n';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { StripeProvider } from '@stripe/stripe-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';


// Screens
import HomeScreen from './screens/HomeScreen';
import HoroscopeScreen from './screens/HoroscopeScreen';
import ChatScreen from './screens/ChatScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import MyBotScreen from './screens/MyBotScreen';
import RechargeScreen from './screens/RechargeScreen';
import HistoryScreen from './screens/HistoryScreen';
import SessionView from './screens/SessionView';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import TermsScreen from './screens/TermsScreen';
import AlipayScreen from './screens/AlipayQRScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import WalletHistoryScreen from './screens/WalletHistoryScreen';
import PaypalSuccess from './screens/PaypalSuccess';
import EditProfileScreen from './screens/EditProfileScreen';
import CoinsRewardScreen from './screens/CoinsRewardScreen';
import ZodiacSelectionScreen from './screens/ZodiacSelectionScreen';
import TarotGame from './screens/TarotGame';
import DailyCheckInScreen from './screens/DailyCheckInScreen';




const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { authToken } = useContext(AuthContext);
  const [isReady, setIsReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

//   useEffect(() => {
//   WeChat.registerApp('wx93d1e0549bc5203d', 'universalLink'); // universalLink can be empty or for Apple
// }, []);

  useEffect(() => {
    const initApp = async () => {
      try {
        const lang = await AsyncStorage.getItem('@lang');
        if (lang) i18n.locale = lang;

        const firstLogin = await AsyncStorage.getItem('@first_login');
        setShowWelcome(firstLogin === 'true');
      } catch (e) {
        console.warn('Initialization error:', e);
      } finally {
        setIsReady(true);
      }
    };
    initApp();
  }, []);

  if (!isReady) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={!authToken ? 'Login' : showWelcome ? 'Welcome' : 'Home'}>
        {/* Auth Screens */}
        {!authToken && (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign Up' }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset Password' }} />
          </>
        )}

        {/* First-time Welcome Screen */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />

        {/* Main App Screens */}
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Tarot Station'}} />
        <Stack.Screen name="Horoscope" component={HoroscopeScreen} options={{ title: 'Horoscope' }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Tarot Chat' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
        <Stack.Screen name="MyBot" component={MyBotScreen} options={{ title: 'My Bot' }} />
        <Stack.Screen name="Recharge" component={RechargeScreen} options={{ title: 'Recharge' }} />
        <Stack.Screen name="WalletHistory" component={WalletHistoryScreen} options={{ title: 'Wallet Hostory' }} />
<Stack.Screen name="ZodiacSelection" component={ZodiacSelectionScreen} options={{ title: 'Zodiac Selection' }} />
<Stack.Screen name="TarotGame" component={TarotGame} options={{ title: 'Fortune Teller' }}/>
<Stack.Screen name="DailyCheckIn" component={DailyCheckInScreen} options={{ title: 'Daily Check In' }}/>


        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Chat History' }} />
        <Stack.Screen name="SessionView" component={SessionView} options={{ title: 'Chat History View' }} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Privacy Policy' }} />
        <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Terms of Service' }} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Reset Password' }} />
<Stack.Screen name="CoinsReward" component={CoinsRewardScreen} />
        <Stack.Screen name="Alipay" component={AlipayScreen} />
        <Stack.Screen name="PaypalSuccess" component={PaypalSuccess} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
    <StripeProvider publishableKey="pk_test_51RZ5xeD1MsDkTkjjPUM3jGl7wZMhXlkiF4iGc5Jdey3SvcpmtmT2TcucP00QLjHd97wCI38RM35noeM1UO3GPqTa00YrvE9E0e">
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
    </StripeProvider>
    </SafeAreaProvider>
  );
}
