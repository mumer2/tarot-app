import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  useWindowDimensions,
  Platform,
} from 'react-native';
import tarotDeck from '../assets/data/tarotDeck.json';
import { Ionicons } from '@expo/vector-icons';
import { tarotImages } from '../assets/data/tarotImages';
import i18n from '../utils/i18n';
import { ThemeContext } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TarotCardScreen() {
  const [cards, setCards] = useState([]);
  const [revealedCards, setRevealedCards] = useState([]);

  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const styles = getStyles(isDark, width, insets);

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
            <Image
              source={tarotImages[item.image]}
              style={styles.cardImage}
              resizeMode="contain"
            />
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
        ) : (
          <View style={styles.cardBack}>
            <Ionicons name="eye-off" size={48} color={isDark ? '#ccc' : '#444'} />
            <Text style={styles.tapText}>{i18n.t('tarot.tapToReveal')}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🔮 {i18n.t('tarot.heading')}</Text>
      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        horizontal
        contentContainerStyle={styles.cardList}
        showsHorizontalScrollIndicator={false}
      />
      <TouchableOpacity style={styles.shuffleBtn} onPress={shuffleDeck}>
        <Ionicons name="refresh" size={20} color="#fff" />
        <Text style={styles.shuffleText}>{i18n.t('tarot.shuffleAgain')}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ✅ Dynamic styles with light/dark mode and responsive sizing
const getStyles = (isDark, width, insets) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#f2f2f2',
      paddingHorizontal: 20,
      paddingTop: insets.top + 10,
      paddingBottom: insets.bottom + 10,
      justifyContent: 'center',
    },
    heading: {
      fontSize: width < 360 ? 20 : 24,
      color: isDark ? '#fce38a' : '#333',
      textAlign: 'center',
      marginBottom: 20,
      fontWeight: '600',
    },
    cardList: {
      justifyContent: 'center',
    },
    cardContainer: {
      marginHorizontal: 10,
      width: width * 0.6,
    },
    cardBack: {
      backgroundColor: isDark ? '#1e1e1e' : '#ddd',
      borderRadius: 12,
      height: 300,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    tapText: {
      marginTop: 10,
      color: isDark ? '#aaa' : '#555',
      fontSize: 14,
    },
    revealedCard: {
      backgroundColor: isDark ? '#fff' : '#fff',
      borderRadius: 12,
      padding: 10,
      alignItems: 'center',
      elevation: 5,
    },
    cardImage: {
      width: width * 0.45,
      height: 240,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 10,
      color: '#333',
    },
    cardDescription: {
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
      marginTop: 6,
    },
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
    shuffleText: {
      color: '#fff',
      marginLeft: 8,
      fontWeight: '500',
    },
  });


// // TarotCardScreen.js
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   FlatList,
// } from 'react-native';
// import tarotDeck from '../assets/data/tarotDeck.json';
// import { Ionicons } from '@expo/vector-icons';
// import { tarotImages } from '../assets/data/tarotImages';

// export default function TarotCardScreen() {
//   const [cards, setCards] = useState([]);
//   const [revealedCards, setRevealedCards] = useState([]);

//   useEffect(() => {
//     shuffleDeck();
//   }, []);

//   const shuffleDeck = () => {
//     const shuffled = [...tarotDeck].sort(() => 0.5 - Math.random()).slice(0, 3);
//     setCards(shuffled);
//     setRevealedCards([false, false, false]);
//   };

//   const revealCard = (index) => {
//     const updated = [...revealedCards];
//     updated[index] = true;
//     setRevealedCards(updated);
//   };

//   const renderCard = ({ item, index }) => {
//     const isRevealed = revealedCards[index];

//     return (
//       <TouchableOpacity
//         style={styles.cardContainer}
//         onPress={() => !isRevealed && revealCard(index)}
//       >
//         {isRevealed ? (
//           <View style={styles.revealedCard}>
//             {/* <Image
//               source={require(`../assets/tarot/${item.image}`)}
//               style={styles.cardImage}
//               resizeMode="contain"
//             /> */}
//             <Image
//   source={tarotImages[item.image]}
//   style={{ width: 200, height: 300 }}
//   resizeMode="contain"
// />
//             <Text style={styles.cardTitle}>{item.name}</Text>
//             <Text style={styles.cardDescription}>{item.description}</Text>
//           </View>
//         ) : (
//           <View style={styles.cardBack}>
//             <Ionicons name="eye-off" size={48} color="#fff" />
//             <Text style={styles.tapText}>Tap to Reveal</Text>
//           </View>
//         )}
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.heading}>\uD83D\uDD2E Choose Your Tarot Cards</Text>
//       <FlatList
//         data={cards}
//         renderItem={renderCard}
//         keyExtractor={(item, index) => `${item.name}-${index}`}
//         horizontal
//         contentContainerStyle={{ justifyContent: 'center' }}
//         showsHorizontalScrollIndicator={false}
//       />
//       <TouchableOpacity style={styles.shuffleBtn} onPress={shuffleDeck}>
//         <Ionicons name="refresh" size={20} color="#fff" />
//         <Text style={styles.shuffleText}>Shuffle & Draw Again</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#141414', padding: 20, justifyContent: 'center' },
//   heading: { fontSize: 22, color: '#fce38a', textAlign: 'center', marginBottom: 20 },
//   cardContainer: { marginHorizontal: 10, width: 240 },
//   cardBack: {
//     backgroundColor: '#222',
//     borderRadius: 12,
//     height: 300,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 5,
//   },
//   tapText: { marginTop: 10, color: '#aaa', fontSize: 14 },
//   revealedCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 10,
//     alignItems: 'center',
//     elevation: 5,
//   },
//   cardImage: { width: 180, height: 240 },
//   cardTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
//   cardDescription: { fontSize: 14, color: '#333', textAlign: 'center', marginTop: 6 },
//   shuffleBtn: {
//     marginTop: 30,
//     backgroundColor: '#f08a5d',
//     flexDirection: 'row',
//     padding: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 10,
//     alignSelf: 'center',
//   },
//   shuffleText: { color: '#fff', marginLeft: 8 },
// });
