import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';

const signs = [
  { name: 'Aries', emoji: '♈', color: '#FF6B6B', luckyColor: 'Red', luckyNumber: 9 },
  { name: 'Taurus', emoji: '♉', color: '#9DC183', luckyColor: 'Green', luckyNumber: 6 },
  { name: 'Gemini', emoji: '♊', color: '#FFC93C', luckyColor: 'Yellow', luckyNumber: 5 },
  { name: 'Cancer', emoji: '♋', color: '#87CEFA', luckyColor: 'White', luckyNumber: 2 },
  { name: 'Leo', emoji: '♌', color: '#F7A440', luckyColor: 'Orange', luckyNumber: 1 },
  { name: 'Virgo', emoji: '♍', color: '#B0A8B9', luckyColor: 'Brown', luckyNumber: 5 },
  { name: 'Libra', emoji: '♎', color: '#6C5CE7', luckyColor: 'Pink', luckyNumber: 6 },
  { name: 'Scorpio', emoji: '♏', color: '#D16BA5', luckyColor: 'Black', luckyNumber: 9 },
  { name: 'Sagittarius', emoji: '♐', color: '#FFD93D', luckyColor: 'Purple', luckyNumber: 3 },
  { name: 'Capricorn', emoji: '♑', color: '#8D99AE', luckyColor: 'Gray', luckyNumber: 8 },
  { name: 'Aquarius', emoji: '♒', color: '#00B8A9', luckyColor: 'Blue', luckyNumber: 4 },
  { name: 'Pisces', emoji: '♓', color: '#6FB1FC', luckyColor: 'Sea Green', luckyNumber: 7 },
];

const HoroscopeScreen = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [selectedSign, setSelectedSign] = useState('Aries');
  const [period, setPeriod] = useState('daily'); // daily | weekly | monthly
  const [horoscope, setHoroscope] = useState('');
  const [loading, setLoading] = useState(false);

  const [luckyColor, setLuckyColor] = useState('');
  const [luckyNumber, setLuckyNumber] = useState('');

  const fetchHoroscope = async (sign, duration) => {
    setLoading(true);
    try {
       const res = await axios.get(
        `https://api.api-ninjas.com/v1/horoscope?zodiac=${sign.toLowerCase()}`,
        {
          headers: {
            'X-Api-Key': 'iPwm0h9xldJl6fDxkn9vqw==K9nuOxL2I8OQ5K7y',
          },
        }
      );
      setHoroscope(res.data.horoscope);

      const current = signs.find((s) => s.name === sign);
      setLuckyColor(current?.luckyColor || 'N/A');
      setLuckyNumber(current?.luckyNumber || 'N/A');
    } catch (err) {
      console.error(err);
      setHoroscope('⚠️ Unable to fetch horoscope. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoroscope(selectedSign, period);
  }, [selectedSign, period]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDark ? "#1e1e1e" : "#f8f8f8", padding: 16 }}>
      <Text style={[styles.title, { color: isDark ? '#f8e1c1' : '#333' }]}>🔮 Horoscope</Text>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {['daily', 'weekly', 'monthly'].map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.periodButton,
              period === p && { backgroundColor: '#f8e1c1' },
            ]}
            onPress={() => setPeriod(p)}
          >
            <Text style={{ color: period === p ? '#000' : '#fff', fontWeight: '600' }}>
              {p.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Selector */}
      <Text style={[styles.subtitle, { color: isDark ? '#ccc' : '#555' }]}>
        Select Your Zodiac Sign:
      </Text>
      <View style={styles.signsContainer}>
        {signs.map(({ name, emoji, color }) => (
          <TouchableOpacity
            key={name}
            style={[
              styles.signCard,
              { backgroundColor: color },
              selectedSign === name && styles.activeSign,
            ]}
            onPress={() => setSelectedSign(name)}
          >
            <Text style={styles.signEmoji}>{emoji}</Text>
            <Text style={styles.signText}>{name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Horoscope Result */}
      <View style={[styles.resultBox, { backgroundColor: isDark ? '#333' : '#eee' }]}>
        {loading ? (
          <ActivityIndicator size="large" color="#f8e1c1" />
        ) : (
          <>
            <Text style={[styles.resultText, { color: isDark ? '#fff' : '#000' }]}>
              {horoscope}
            </Text>
            <Text style={[styles.metaText, { color: isDark ? '#f8e1c1' : '#444' }]}>
              🎨 Lucky Color: {luckyColor}
            </Text>
            <Text style={[styles.metaText, { color: isDark ? '#f8e1c1' : '#444' }]}>
              🔢 Lucky Number: {luckyNumber}
            </Text>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  periodButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#444',
    marginHorizontal: 6,
    borderRadius: 8,
  },
  signsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  signCard: {
    width: '28%',
    margin: 6,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeSign: {
    borderWidth: 2,
    borderColor: '#f8e1c1',
  },
  signEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  signText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  resultBox: {
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 15,
    marginTop: 4,
  },
});

export default HoroscopeScreen;

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
// } from 'react-native';
// import axios from 'axios';
// import { useContext } from 'react';
// import { ThemeContext } from '../context/ThemeContext';

// const signs = [
//   { name: 'Aries', emoji: '♈', color: '#FF6B6B' },
//   { name: 'Taurus', emoji: '♉', color: '#9DC183' },
//   { name: 'Gemini', emoji: '♊', color: '#FFC93C' },
//   { name: 'Cancer', emoji: '♋', color: '#87CEFA' },
//   { name: 'Leo', emoji: '♌', color: '#F7A440' },
//   { name: 'Virgo', emoji: '♍', color: '#B0A8B9' },
//   { name: 'Libra', emoji: '♎', color: '#6C5CE7' },
//   { name: 'Scorpio', emoji: '♏', color: '#D16BA5' },
//   { name: 'Sagittarius', emoji: '♐', color: '#FFD93D' },
//   { name: 'Capricorn', emoji: '♑', color: '#8D99AE' },
//   { name: 'Aquarius', emoji: '♒', color: '#00B8A9' },
//   { name: 'Pisces', emoji: '♓', color: '#6FB1FC' },
// ];

// export default function HoroscopeScreen() {
//   const [selectedSign, setSelectedSign] = useState('Aries');
//   const [horoscope, setHoroscope] = useState('');
//   const [loading, setLoading] = useState(false);

//   const { theme } = useContext(ThemeContext);
// const isDark = theme === 'dark';

//   const fetchDaily = async (sign) => {
//     setLoading(true);
//     try {
//       const res = await axios.get(
//         `https://api.api-ninjas.com/v1/horoscope?zodiac=${sign.toLowerCase()}`,
//         {
//           headers: {
//             'X-Api-Key': 'iPwm0h9xldJl6fDxkn9vqw==K9nuOxL2I8OQ5K7y',
//           },
//         }
//       );
//       setHoroscope(res.data.horoscope);
//     } catch (err) {
//       console.error(err);
//       setHoroscope('⚠️ Unable to fetch horoscope. Try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDaily(selectedSign);
//   }, [selectedSign]);

//   return (
//     <ScrollView style={{flex: 1, backgroundColor: isDark ? "#1e1e1e" : "#f8f8f8",padding: 16}}>
//       <Text style={styles.title}>🔮 Daily Horoscope</Text>

//       <Text style={styles.subtitle}>Select Your Zodiac Sign:</Text>
//       <View style={styles.signsContainer}>
//         {signs.map(({ name, emoji, color }) => (
//           <TouchableOpacity
//             key={name}
//             style={[
//               styles.signCard,
//               { backgroundColor: color },
//               selectedSign === name && styles.activeSign,
//             ]}
//             onPress={() => setSelectedSign(name)}
//           >
//             <Text style={styles.signEmoji}>{emoji}</Text>
//             <Text style={styles.signText}>{name}</Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <View style={styles.resultBox}>
//         {loading ? (
//           <ActivityIndicator size="large" color="#f8e1c1" />
//         ) : (
//           <Text style={styles.resultText}>{horoscope}</Text>
//         )}
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   title: {
//     fontSize: 26,
//     color: '#f8e1c1',
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginVertical: 16,
//   },
//   subtitle: {
//     color: '#ccc',
//     fontSize: 16,
//     marginBottom: 12,
//     textAlign: 'center',
//   },
//   signsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//   },
//   signCard: {
//     width: '28%',
//     margin: 6,
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   activeSign: {
//     borderWidth: 2,
//     borderColor: '#f8e1c1',
//   },
//   signEmoji: {
//     fontSize: 28,
//     marginBottom: 4,
//   },
//   signText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 13,
//     textAlign: 'center',
//   },
//   resultBox: {
//     marginTop: 20,
//     marginBottom: 20,
//     padding: 16,
//     backgroundColor: '#333',
//     borderRadius: 12,
//   },
//   resultText: {
//     color: '#fff',
//     fontSize: 16,
//     lineHeight: 22,
//   },
// });
