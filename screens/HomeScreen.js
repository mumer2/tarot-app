import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

export default function HomeScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      padding: 16,
      paddingTop: 0,
    },
    header: {
      fontSize: 26,
      color: isDark ? '#f8e1c1' : '#2c2c2c',
      fontWeight: 'bold',
      textAlign: 'center',
      marginVertical: 20,
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    avatar: {
      width: 150,
      height: 150,
      borderRadius: 75,
      borderWidth: 3,
      borderColor: '#A26769',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    card: {
      backgroundColor: isDark ? '#2D2B4E' : '#f3f3f3',
      width: '48%',
      marginBottom: 20,
      paddingVertical: 30,
      borderRadius: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
      borderWidth: 1,
      borderColor: isDark ? '#4e446e' : '#ddd',
    },
    cardText: {
      marginTop: 10,
      color: isDark ? '#f8e1c1' : '#333',
      fontSize: 15,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>🔮 Tarot Station</Text>

        <View style={styles.avatarContainer}>
          <Image
            source={require('../assets/avatar.png')}
            style={styles.avatar}
          />
        </View>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Horoscope')}>
            <MaterialCommunityIcons name="zodiac-aquarius" size={32} color={isDark ? "#fff" : "#000"} />
            <Text style={styles.cardText}>Horoscope</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Chat')}>
            <Ionicons name="chatbubble-ellipses-outline" size={32} color={isDark ? "#fff" : "#000"} />
            <Text style={styles.cardText}>Tarot Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MyBot')}>
            <Ionicons name="person-circle-outline" size={32} color={isDark ? "#fff" : "#000"} />
            <Text style={styles.cardText}>My Bot</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Recharge')}>
            <Ionicons name="wallet-outline" size={32} color={isDark ? "#fff" : "#000"} />
            <Text style={styles.cardText}>Recharge</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('History')}>
            <FontAwesome5 name="history" size={28} color={isDark ? "#fff" : "#000"} />
            <Text style={styles.cardText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={30} color={isDark ? "#fff" : "#000"} />
            <Text style={styles.cardText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
