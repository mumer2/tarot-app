import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { zodiacSigns } from '../assets/data/zodiacSigns';
import { LinearGradient } from 'expo-linear-gradient';

export default function ZodiacSelectionScreen({ navigation }) {
  const handleZodiacPress = (sign) => {
    navigation.navigate('TarotGame', { zodiac: sign.name });
  };

  return (
    <LinearGradient colors={['#e4e8f5', '#f6f9ff']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeContainer}>
        <Text style={styles.heading}>✨ Choose Your Zodiac Sign</Text>

        <FlatList
          data={zodiacSigns}
          numColumns={3}
          keyExtractor={(item) => item.name}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleZodiacPress(item)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name={item.icon} size={40} color="#7f5af0" />
              <Text style={styles.name}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  listContainer: {
    paddingBottom: 24,
  },
  card: {
    width: '30%',
    aspectRatio: 1,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  name: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    textAlign: 'center',
  },
});
