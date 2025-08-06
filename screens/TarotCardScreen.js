// TarotCardScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import tarotDeck from '../assets/data/tarotDeck.json';
import { Ionicons } from '@expo/vector-icons';
import { tarotImages } from '../assets/data/tarotImages';

export default function TarotCardScreen() {
  const [cards, setCards] = useState([]);
  const [revealedCards, setRevealedCards] = useState([]);

  useEffect(() => {
    shuffleDeck();
  }, []);

  const shuffleDeck = () => {
    const shuffled = [...tarotDeck].sort(() => 0.5 - Math.random()).slice(0, 3);
    setCards(shuffled);
    setRevealedCards([false, false, false]);
  };

  const revealCard = (index) => {
    const updated = [...revealedCards];
    updated[index] = true;
    setRevealedCards(updated);
  };

  const renderCard = ({ item, index }) => {
    const isRevealed = revealedCards[index];

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => !isRevealed && revealCard(index)}
      >
        {isRevealed ? (
          <View style={styles.revealedCard}>
            {/* <Image
              source={require(`../assets/tarot/${item.image}`)}
              style={styles.cardImage}
              resizeMode="contain"
            /> */}
            <Image
  source={tarotImages[item.image]}
  style={{ width: 200, height: 300 }}
  resizeMode="contain"
/>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
        ) : (
          <View style={styles.cardBack}>
            <Ionicons name="eye-off" size={48} color="#fff" />
            <Text style={styles.tapText}>Tap to Reveal</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>\uD83D\uDD2E Choose Your Tarot Cards</Text>
      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        horizontal
        contentContainerStyle={{ justifyContent: 'center' }}
        showsHorizontalScrollIndicator={false}
      />
      <TouchableOpacity style={styles.shuffleBtn} onPress={shuffleDeck}>
        <Ionicons name="refresh" size={20} color="#fff" />
        <Text style={styles.shuffleText}>Shuffle & Draw Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414', padding: 20, justifyContent: 'center' },
  heading: { fontSize: 22, color: '#fce38a', textAlign: 'center', marginBottom: 20 },
  cardContainer: { marginHorizontal: 10, width: 240 },
  cardBack: {
    backgroundColor: '#222',
    borderRadius: 12,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  tapText: { marginTop: 10, color: '#aaa', fontSize: 14 },
  revealedCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    elevation: 5,
  },
  cardImage: { width: 180, height: 240 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  cardDescription: { fontSize: 14, color: '#333', textAlign: 'center', marginTop: 6 },
  shuffleBtn: {
    marginTop: 30,
    backgroundColor: '#f08a5d',
    flexDirection: 'row',
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    alignSelf: 'center',
  },
  shuffleText: { color: '#fff', marginLeft: 8 },
});
