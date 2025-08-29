import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../utils/i18n';
import { ThemeContext } from '../context/ThemeContext';

const DEDUCT_POINTS_URL = 'https://backend-tarot-app.netlify.app/.netlify/functions/update-points';

export default function TarotGame({ route }) {
  const { zodiac: zodiacParam, free = false } = route.params || {};
  const zodiac = zodiacParam || ''; // fallback to empty string
  const { user, updateProfile } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const tarotReadings = [
    i18n.t('readings.path'),
    i18n.t('readings.opportunity'),
    i18n.t('readings.pastReturn'),
    i18n.t('readings.risk'),
    i18n.t('readings.rest'),
    i18n.t('readings.love'),
    i18n.t('readings.success'),
    i18n.t('readings.beginning'),
    i18n.t('readings.intuition'),
    i18n.t('readings.change'),
    i18n.t('readings.energy'),
    i18n.t('readings.fear'),
    i18n.t('readings.letGo'),
    i18n.t('readings.protection'),
    i18n.t('readings.patience'),
  ];

  const [shuffledCards, setShuffledCards] = useState(shuffle([...tarotReadings]).slice(0, 9));
  const [hasPlayed, setHasPlayed] = useState(false);
  const [reading, setReading] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const scaleAnim = new Animated.Value(1);

  function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  const handleShuffle = () => {
    if (hasPlayed) return;
    setShuffledCards(shuffle([...tarotReadings]).slice(0, 9));
    setReading('');
    setSelectedIndex(null);
  };

  const handleCardSelect = async (index) => {
    // ✅ Skip deduction if free session
    if (!free && user.points < 100) {
      Alert.alert(i18n.t('noCoin'), i18n.t('needCoin'));
      return;
    }

    if (hasPlayed) {
      Alert.alert(i18n.t('tarot.alreadyPlayed'), i18n.t('tarot.comeBack'));
      return;
    }

    const updatedPoints = free ? user.points : user.points - 100;
    setLoading(true);
    setSelectedIndex(index);

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 300, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    try {
      if (!free) {
        const response = await fetch(DEDUCT_POINTS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.userId,
            points: updatedPoints,
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          Alert.alert(i18n.t('tarot.error'), result.message || i18n.t('tarot.deductionFailed'));
          return;
        }
      }

      setTimeout(() => {
        setReading(shuffledCards[index]);
        setHasPlayed(true);
        if (!free) updateProfile({ points: updatedPoints });
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Deduction error:', err);
      Alert.alert(i18n.t('tarot.error'), i18n.t('tarot.serverError'));
      setLoading(false);
    }
  };

  const styles = getStyles(isDark);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <LinearGradient
        colors={isDark ? ['#2c2c54', '#4b4b7e'] : ['#e0c3fc', '#8ec5fc']}
        style={styles.container}
      >
        <Text style={styles.title}>
          🔮 {zodiac ? i18n.t(`zodiac.signs.${zodiac.toLowerCase()}`) : ''} {i18n.t('tarot.readingTitle')}
        </Text>

        <Text style={styles.subtitle}>{i18n.t('tarot.pickCard')}</Text>

        <FlatList
          data={shuffledCards}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 12 }}
          renderItem={({ index }) => (
            <TouchableOpacity
              disabled={hasPlayed || loading}
              onPress={() => handleCardSelect(index)}
              style={[styles.card, selectedIndex === index && styles.cardSelected]}
            >
              <Animated.Text
                style={[styles.cardText, selectedIndex === index && { transform: [{ scale: scaleAnim }] }]}
              >
                🃏
              </Animated.Text>
            </TouchableOpacity>
          )}
        />

        {!hasPlayed && !loading && (
          <TouchableOpacity style={styles.shuffleButton} onPress={handleShuffle}>
            <Text style={styles.shuffleText}>🔁 {i18n.t('tarot.shuffle')}</Text>
          </TouchableOpacity>
        )}

        {loading && <ActivityIndicator size="large" color="#7f5af0" style={{ marginTop: 20 }} />}

        {reading && (
          <View style={styles.readingBox}>
            <Text style={styles.result}>✨ {reading}</Text>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}


// 🧠 Dynamic styling with theme
const getStyles = (isDark) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: isDark ? '#111' : '#fff',
    },
    container: {
      flex: 1,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      marginBottom: 10,
      color: isDark ? '#fce38a' : '#1e1e1e',
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? '#ccc' : '#333',
      marginBottom: 20,
    },
    card: {
      width: 90,
      height: 120,
      backgroundColor: isDark ? '#333' : '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 10,
      borderRadius: 16,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
    },
    cardSelected: {
      backgroundColor: isDark ? '#7f5af0' : '#f1f0ff',
      borderWidth: 2,
      borderColor: '#7f5af0',
    },
    cardText: {
      fontSize: 36,
      color: isDark ? '#fff' : '#000',
    },
    shuffleButton: {
      marginTop: 20,
      backgroundColor: '#7f5af0',
      paddingVertical: 12,
      paddingHorizontal: 28,
      borderRadius: 30,
    },
    shuffleText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    readingBox: {
      marginTop: 24,
      padding: 20,
      borderRadius: 12,
      backgroundColor: isDark ? '#222' : '#fff',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
    },
    result: {
      fontSize: 18,
      color: '#7f5af0',
      textAlign: 'center',
      fontWeight: '600',
    },
  });


// // File: screens/TarotGame.js
// import React, { useState, useContext } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   Animated,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { AuthContext } from '../context/AuthContext';
// import { SafeAreaView } from 'react-native-safe-area-context';


// const DEDUCT_POINTS_URL = 'https://backend-tarot-app.netlify.app/.netlify/functions/update-points';

// const fullTarotReadings = [
//   'You are on the right path. 🌟',
//   'An opportunity is coming. 💼',
//   'Someone from your past will return. 👤',
//   'Take a risk today. 🎲',
//   'You need rest and reflection. 🛌',
//   'Love is near. 💖',
//   'Success is ahead. 🏆',
//   'A new beginning awaits. 🌅',
//   'Trust your intuition. 🔮',
//   'Change is inevitable. 🌀',
//   'Your energy is magnetic. ✨',
//   'Face your fears. 👁️',
//   'Let go of the past. 🔚',
//   'You are protected. 🛡️',
//   'Patience will pay off. ⏳',
// ];

// export default function TarotGame({ route }) {
//   const { zodiac } = route.params;
//   const { user, updateProfile } = useContext(AuthContext);
//   const [shuffledCards, setShuffledCards] = useState(shuffle([...fullTarotReadings]).slice(0, 9));
//   const [hasPlayed, setHasPlayed] = useState(false);
//   const [reading, setReading] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [selectedIndex, setSelectedIndex] = useState(null);
//   const scaleAnim = new Animated.Value(1);

//   function shuffle(array) {
//     return [...array].sort(() => Math.random() - 0.5);
//   }

//   const handleShuffle = () => {
//     if (hasPlayed) return;
//     setShuffledCards(shuffle([...fullTarotReadings]).slice(0, 9));
//     setReading('');
//     setSelectedIndex(null);
//   };

//   const handleCardSelect = async (index) => {
//     if (user.points < 5) {
//       Alert.alert('Not enough coins', 'You need at least 5 coins to play.');
//       return;
//     }

//     if (hasPlayed) {
//       Alert.alert('Already Played', 'Come back tomorrow to play again!');
//       return;
//     }

//     const updatedPoints = user.points - 5;
//     setLoading(true);
//     setSelectedIndex(index);

//     Animated.sequence([
//       Animated.timing(scaleAnim, { toValue: 1.3, duration: 300, useNativeDriver: true }),
//       Animated.timing(scaleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
//     ]).start();

//     try {
//       const response = await fetch(DEDUCT_POINTS_URL, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           userId: user.userId,
//           points: updatedPoints,
//         }),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         Alert.alert('Error', result.message || 'Could not deduct points.');
//         return;
//       }

//       setTimeout(() => {
//         setReading(shuffledCards[index]);
//         setHasPlayed(true);
//         updateProfile({ points: updatedPoints });
//         setLoading(false);
//       }, 1000);
//     } catch (err) {
//       console.error('Deduction error:', err);
//       Alert.alert('Error', 'Server error while deducting points.');
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom', 'left', 'right']}>
//     <LinearGradient colors={["#e0c3fc", "#8ec5fc"]} style={styles.container}>
//       <Text style={styles.title}>🔮 {zodiac} Tarot Reading</Text>
//       <Text style={styles.subtitle}>Pick a card to reveal your fortune ✨</Text>

//       <FlatList
//         data={shuffledCards}
//         keyExtractor={(item, index) => index.toString()}
//         numColumns={3}
//         scrollEnabled={false}
//         contentContainerStyle={{ paddingBottom: 12 }}
//         renderItem={({ index }) => (
//           <TouchableOpacity
//             disabled={hasPlayed || loading}
//             onPress={() => handleCardSelect(index)}
//             style={[styles.card, selectedIndex === index && styles.cardSelected]}
//           >
//             <Animated.Text
//               style={[styles.cardText, selectedIndex === index && { transform: [{ scale: scaleAnim }] }]}
//             >
//               🃏
//             </Animated.Text>
//           </TouchableOpacity>
//         )}
//       />

//       {!hasPlayed && !loading && (
//         <TouchableOpacity style={styles.shuffleButton} onPress={handleShuffle}>
//           <Text style={styles.shuffleText}>🔁 Shuffle Cards</Text>
//         </TouchableOpacity>
//       )}

//       {loading && <ActivityIndicator size="large" color="#7f5af0" style={{ marginTop: 20 }} />}

//       {reading && (
//         <View style={styles.readingBox}>
//           <Text style={styles.result}>✨ {reading}</Text>
//         </View>
//       )}
//     </LinearGradient>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' },
//   title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10, color: '#1e1e1e' },
//   subtitle: { fontSize: 16, color: '#333', marginBottom: 20 },
//   card: {
//     width: 90,
//     height: 120,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     margin: 10,
//     borderRadius: 16,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//   },
//   cardSelected: {
//     backgroundColor: '#f1f0ff',
//     borderWidth: 2,
//     borderColor: '#7f5af0',
//   },
//   cardText: { fontSize: 36 },
//   shuffleButton: {
//     marginTop: 20,
//     backgroundColor: '#7f5af0',
//     paddingVertical: 12,
//     paddingHorizontal: 28,
//     borderRadius: 30,
//   },
//   shuffleText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   readingBox: {
//     marginTop: 24,
//     padding: 20,
//     borderRadius: 12,
//     backgroundColor: '#fff',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//   },
//   result: {
//     fontSize: 18,
//     color: '#7f5af0',
//     textAlign: 'center',
//     fontWeight: '600',
//   },
// });