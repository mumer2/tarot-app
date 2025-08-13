import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext'; // adjust path as needed
import i18n from '../utils/i18n'; // adjust path as needed

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

// Utility function to detect if string contains Chinese characters
const isChinese = (text) => /[\u4e00-\u9fff]/.test(text);

const periods = ['daily', 'weekly', 'monthly'];

const BACKEND_URL = 'https://backend-tarot-app.netlify.app/.netlify/functions/horoscope'; // your backend URL

const HoroscopeScreen = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [selectedSign, setSelectedSign] = useState('Aries');
  const [period, setPeriod] = useState('daily');
  const [horoscope, setHoroscope] = useState('');
  const [loading, setLoading] = useState(false);

  // We'll track the language for the current zodiac sign here
  const [signLanguage, setSignLanguage] = useState('en');

  // Fetch horoscope from backend with language included
  const fetchHoroscopeFromBackend = async (sign, period, language) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/horoscope`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sign, period, language }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch horoscope');
      }
      setHoroscope(data.horoscope);
    } catch (error) {
      Alert.alert(i18n.t('error'), error.message);
      setHoroscope('');
    } finally {
      setLoading(false);
    }
  };

  // When user clicks a sign, detect language and fetch horoscope immediately
  const handleSignChange = (sign) => {
    setSelectedSign(sign);

    const detectedLang = isChinese(sign) ? 'zh' : 'en';
    setSignLanguage(detectedLang);

    fetchHoroscopeFromBackend(sign, period, detectedLang);
  };

  // Fetch horoscope when period changes, use current signLanguage & selectedSign
  useEffect(() => {
    fetchHoroscopeFromBackend(selectedSign, period, signLanguage);
  }, [period]);

  // Find the selected sign object for lucky info (using English name matching)
  const selectedSignObj = signs.find(s => s.name === selectedSign || i18n.t(s.name.toLowerCase()) === selectedSign);

  // Render horoscope text and meta info
  const renderHoroscope = () => {
    if (!horoscope) return null;

    const lines = horoscope.split('\n').map(line => line.trim());
    const contentLines = [];
    const metaLines = [];

    for (const line of lines) {
      if (
        line.startsWith('Date:') ||
        line.startsWith('Lucky Color:') ||
        line.startsWith('Lucky Number:')
      ) {
        metaLines.push(line);
      } else if (line !== '---') {
        contentLines.push(line);
      }
    }

    return (
      <>
        <Text style={[styles.horoscopeText, { color: isDark ? '#fff' : '#000' }]}>
          {contentLines.join('\n\n')}
        </Text>
        <View style={styles.metaContainer}>
          {/* Show AI meta lines if any */}
          {metaLines.map((line, index) => (
            <Text
              key={index}
              style={[styles.metaText, { color: isDark ? '#f8e1c1' : '#666' }]}
            >
              {line}
            </Text>
          ))}
          {/* Show translated lucky color & number */}
          {selectedSignObj && (
            <>
              <Text
                style={[
                  styles.metaText,
                  { color: isDark ? '#f8e1c1' : '#666', marginTop: 10 },
                ]}
              >
                {i18n.t('luckyColor')}: {i18n.t(selectedSignObj.luckyColor.toLowerCase())}
              </Text>
              <Text style={[styles.metaText, { color: isDark ? '#f8e1c1' : '#666' }]}>
                {i18n.t('luckyNumber')}: {selectedSignObj.luckyNumber}
              </Text>
            </>
          )}
        </View>
      </>
    );
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: isDark ? '#1e1e1e' : '#f8f8f8',
        padding: 16,
      }}
    >
      <Text style={[styles.title, { color: isDark ? '#f8e1c1' : '#333' }]}>
        {i18n.t('horoscopeTitle')}
      </Text>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {periods.map(p => (
          <TouchableOpacity
            key={p}
            style={[
              styles.periodButton,
              period === p && { backgroundColor: '#f8e1c1' },
            ]}
            onPress={() => setPeriod(p)}
          >
            <Text style={{ color: period === p ? '#000' : '#fff', fontWeight: '600' }}>
              {i18n.t(p)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Selector */}
      <Text style={[styles.subtitle, { color: isDark ? '#ccc' : '#555' }]}>
        {i18n.t('selectSign')}
      </Text>
      <View style={styles.signsContainer}>
        {signs.map(({ name, emoji, color }) => {
          // Display sign name either in current i18n language or raw name, depending on your i18n setup
          const displayedName = i18n.t(name.toLowerCase());

          return (
            <TouchableOpacity
              key={name}
              style={[
                styles.signCard,
                { backgroundColor: color },
                selectedSign === name && styles.activeSign,
              ]}
              onPress={() => handleSignChange(displayedName)}
            >
              <Text style={styles.signEmoji}>{emoji}</Text>
              <Text style={styles.signText}>{displayedName}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Horoscope Result */}
      <View style={[styles.resultBox, { backgroundColor: isDark ? '#333' : '#eee' }]}>
        {loading ? (
          <ActivityIndicator size="large" color="#f8e1c1" />
        ) : (
          renderHoroscope() || (
            <Text style={[styles.resultText, { color: isDark ? '#fff' : '#000' }]}>
              {i18n.t('noHoroscope')}
            </Text>
          )
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
    minHeight: 150,
  },
  horoscopeText: {
    fontSize: 16,
    lineHeight: 22,
  },
  metaContainer: {
    marginTop: 12,
  },
  metaText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 22,
  },
});

export default HoroscopeScreen;


// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { ThemeContext } from '../context/ThemeContext'; // adjust path as needed
// import i18n from '../utils/i18n'; // adjust path as needed

// const signs = [
//   { name: 'Aries', emoji: '♈', color: '#FF6B6B', luckyColor: 'Red', luckyNumber: 9 },
//   { name: 'Taurus', emoji: '♉', color: '#9DC183', luckyColor: 'Green', luckyNumber: 6 },
//   { name: 'Gemini', emoji: '♊', color: '#FFC93C', luckyColor: 'Yellow', luckyNumber: 5 },
//   { name: 'Cancer', emoji: '♋', color: '#87CEFA', luckyColor: 'White', luckyNumber: 2 },
//   { name: 'Leo', emoji: '♌', color: '#F7A440', luckyColor: 'Orange', luckyNumber: 1 },
//   { name: 'Virgo', emoji: '♍', color: '#B0A8B9', luckyColor: 'Brown', luckyNumber: 5 },
//   { name: 'Libra', emoji: '♎', color: '#6C5CE7', luckyColor: 'Pink', luckyNumber: 6 },
//   { name: 'Scorpio', emoji: '♏', color: '#D16BA5', luckyColor: 'Black', luckyNumber: 9 },
//   { name: 'Sagittarius', emoji: '♐', color: '#FFD93D', luckyColor: 'Purple', luckyNumber: 3 },
//   { name: 'Capricorn', emoji: '♑', color: '#8D99AE', luckyColor: 'Gray', luckyNumber: 8 },
//   { name: 'Aquarius', emoji: '♒', color: '#00B8A9', luckyColor: 'Blue', luckyNumber: 4 },
//   { name: 'Pisces', emoji: '♓', color: '#6FB1FC', luckyColor: 'Sea Green', luckyNumber: 7 },
// ];

// const periods = ['daily', 'weekly', 'monthly'];

// const BACKEND_URL = 'https://backend-tarot-app.netlify.app/.netlify/functions/horoscope'; // your backend URL

// const HoroscopeScreen = () => {
//   const { theme } = useContext(ThemeContext);
//   const isDark = theme === 'dark';

//   const [selectedSign, setSelectedSign] = useState('Aries');
//   const [period, setPeriod] = useState('daily');
//   const [horoscope, setHoroscope] = useState('');
//   const [loading, setLoading] = useState(false);

//   const fetchHoroscopeFromBackend = async (sign, period) => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${BACKEND_URL}/api/horoscope`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ sign, period }),
//       });
//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to fetch horoscope');
//       }
//       setHoroscope(data.horoscope);
//     } catch (error) {
//       Alert.alert('Error', error.message);
//       setHoroscope('');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchHoroscopeFromBackend(selectedSign, period);
//   }, [selectedSign, period]);

//   // Find the selected sign object for lucky info
//   const selectedSignObj = signs.find(s => s.name === selectedSign);

//   // Separate AI text and meta info (Date, Lucky Color, Lucky Number)
//   const renderHoroscope = () => {
//     if (!horoscope) return null;

//     const lines = horoscope.split('\n').map(line => line.trim());
//     const contentLines = [];
//     const metaLines = [];

//     for (const line of lines) {
//       if (
//         line.startsWith('Date:') ||
//         line.startsWith('Lucky Color:') ||
//         line.startsWith('Lucky Number:')
//       ) {
//         metaLines.push(line);
//       } else if (line !== '---') {
//         contentLines.push(line);
//       }
//     }

//     return (
//       <>
//         <Text style={[styles.horoscopeText, { color: isDark ? '#fff' : '#000' }]}>
//           {contentLines.join('\n\n')}
//         </Text>
//         <View style={styles.metaContainer}>
//           {/* Show AI meta lines if any */}
//           {metaLines.map((line, index) => (
//             <Text
//               key={index}
//               style={[styles.metaText, { color: isDark ? '#f8e1c1' : '#666' }]}
//             >
//               {line}
//             </Text>
//           ))}
//           {/* Also show static lucky color & number from your data */}
//           {selectedSignObj && (
//             <>
//               <Text style={[styles.metaText, { color: isDark ? '#f8e1c1' : '#666', marginTop: 10 }]}>
//                 Lucky Color: {selectedSignObj.luckyColor}
//               </Text>
//               <Text style={[styles.metaText, { color: isDark ? '#f8e1c1' : '#666' }]}>
//                 Lucky Number: {selectedSignObj.luckyNumber}
//               </Text>
//             </>
//           )}
//         </View>
//       </>
//     );
//   };

//   return (
//     <ScrollView
//       style={{
//         flex: 1,
//         backgroundColor: isDark ? '#1e1e1e' : '#f8f8f8',
//         padding: 16,
//       }}
//     >
//       <Text style={[styles.title, { color: isDark ? '#f8e1c1' : '#333' }]}>
//         {i18n.t('horoscopeTitle') || 'Your Horoscope'}
//       </Text>

//       {/* Period Selector */}
//       <View style={styles.periodSelector}>
//         {periods.map((p) => (
//           <TouchableOpacity
//             key={p}
//             style={[
//               styles.periodButton,
//               period === p && { backgroundColor: '#f8e1c1' },
//             ]}
//             onPress={() => setPeriod(p)}
//           >
//             <Text style={{ color: period === p ? '#000' : '#fff', fontWeight: '600' }}>
//               {i18n.t(p) || p.charAt(0).toUpperCase() + p.slice(1)}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Sign Selector */}
//       <Text style={[styles.subtitle, { color: isDark ? '#ccc' : '#555' }]}>
//         {i18n.t('selectSign') || 'Select your Zodiac Sign'}
//       </Text>
//          <View style={styles.signsContainer}>
//          {signs.map(({ name, emoji, color }) => (
//            <TouchableOpacity
//            key={name}
//             style={[
//               styles.signCard,
//               { backgroundColor: color },
//               selectedSign === name && styles.activeSign,
//             ]}
//             onPress={() => setSelectedSign(name)}
//           >
//            <Text style={styles.signEmoji}>{emoji}</Text>
//            <Text style={styles.signText}>{name}</Text>
//          </TouchableOpacity>
//        ))}
//      </View>
      

//       {/* Horoscope Result */}
//       <View style={[styles.resultBox, { backgroundColor: isDark ? '#333' : '#eee' }]}>
//         {loading ? (
//           <ActivityIndicator size="large" color="#f8e1c1" />
//         ) : (
//           renderHoroscope() || (
//             <Text style={[styles.resultText, { color: isDark ? '#fff' : '#000' }]}>
//               {i18n.t('noHoroscope') || 'No horoscope available.'}
//             </Text>
//           )
//         )}
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   title: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 16,
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   periodSelector: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginBottom: 16,
//   },
//   periodButton: {
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     backgroundColor: '#444',
//     marginHorizontal: 6,
//     borderRadius: 8,
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
//   signText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 14,
//     textAlign: 'center',
//   },
//     signsContainer: {
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
//     borderRadius: 12,
//     minHeight: 150,
//   },
//   horoscopeText: {
//     fontSize: 16,
//     lineHeight: 22,
//   },
//   metaContainer: {
//     marginTop: 12,
//   },
//   metaText: {
//     fontSize: 14,
//     fontStyle: 'italic',
//     marginTop: 4,
//   },
//   resultText: {
//     fontSize: 16,
//     lineHeight: 22,
//   },
// });

// export default HoroscopeScreen;



// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
// } from 'react-native';
// import axios from 'axios';
// import { ThemeContext } from '../context/ThemeContext';
// import i18n from '../utils/i18n'; // adjust path as necessary

// const signs = [
//   { name: 'Aries', emoji: '♈', color: '#FF6B6B', luckyColor: 'Red', luckyNumber: 9 },
//   { name: 'Taurus', emoji: '♉', color: '#9DC183', luckyColor: 'Green', luckyNumber: 6 },
//   { name: 'Gemini', emoji: '♊', color: '#FFC93C', luckyColor: 'Yellow', luckyNumber: 5 },
//   { name: 'Cancer', emoji: '♋', color: '#87CEFA', luckyColor: 'White', luckyNumber: 2 },
//   { name: 'Leo', emoji: '♌', color: '#F7A440', luckyColor: 'Orange', luckyNumber: 1 },
//   { name: 'Virgo', emoji: '♍', color: '#B0A8B9', luckyColor: 'Brown', luckyNumber: 5 },
//   { name: 'Libra', emoji: '♎', color: '#6C5CE7', luckyColor: 'Pink', luckyNumber: 6 },
//   { name: 'Scorpio', emoji: '♏', color: '#D16BA5', luckyColor: 'Black', luckyNumber: 9 },
//   { name: 'Sagittarius', emoji: '♐', color: '#FFD93D', luckyColor: 'Purple', luckyNumber: 3 },
//   { name: 'Capricorn', emoji: '♑', color: '#8D99AE', luckyColor: 'Gray', luckyNumber: 8 },
//   { name: 'Aquarius', emoji: '♒', color: '#00B8A9', luckyColor: 'Blue', luckyNumber: 4 },
//   { name: 'Pisces', emoji: '♓', color: '#6FB1FC', luckyColor: 'Sea Green', luckyNumber: 7 },
// ];

// const HoroscopeScreen = () => {
//   const { theme } = useContext(ThemeContext);
//   const isDark = theme === 'dark';

//   const [selectedSign, setSelectedSign] = useState('Aries');
//   const [period, setPeriod] = useState('daily'); // daily | weekly | monthly
//   const [horoscope, setHoroscope] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [luckyColor, setLuckyColor] = useState('');
//   const [luckyNumber, setLuckyNumber] = useState('');

//   const fetchHoroscope = async (sign, duration) => {
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

//       const current = signs.find((s) => s.name === sign);
//       setLuckyColor(current?.luckyColor || 'N/A');
//       setLuckyNumber(current?.luckyNumber || 'N/A');
//     } catch (err) {
//       console.error(err);
//       setHoroscope(i18n.t('fetchingError'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchHoroscope(selectedSign, period);
//   }, [selectedSign, period]);

//   return (
//     <ScrollView style={{ flex: 1, backgroundColor: isDark ? "#1e1e1e" : "#f8f8f8", padding: 16 }}>
//       <Text style={[styles.title, { color: isDark ? '#f8e1c1' : '#333' }]}>
//         {i18n.t('horoscopeTitle')}
//       </Text>

//       {/* Period Selector */}
//       <View style={styles.periodSelector}>
//         {['daily', 'weekly', 'monthly'].map((p) => (
//           <TouchableOpacity
//             key={p}
//             style={[
//               styles.periodButton,
//               period === p && { backgroundColor: '#f8e1c1' },
//             ]}
//             onPress={() => setPeriod(p)}
//           >
//             <Text style={{ color: period === p ? '#000' : '#fff', fontWeight: '600' }}>
//               {i18n.t(p)}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Sign Selector */}
//       <Text style={[styles.subtitle, { color: isDark ? '#ccc' : '#555' }]}>
//         {i18n.t('selectSign')}
//       </Text>
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

//       {/* Horoscope Result */}
//       <View style={[styles.resultBox, { backgroundColor: isDark ? '#333' : '#eee' }]}>
//         {loading ? (
//           <ActivityIndicator size="large" color="#f8e1c1" />
//         ) : (
//           <>
//             <Text style={[styles.resultText, { color: isDark ? '#fff' : '#000' }]}>
//               {horoscope}
//             </Text>
//             <Text style={[styles.metaText, { color: isDark ? '#f8e1c1' : '#444' }]}>
//               {i18n.t('luckyColor')}: {luckyColor}
//             </Text>
//             <Text style={[styles.metaText, { color: isDark ? '#f8e1c1' : '#444' }]}>
//               {i18n.t('luckyNumber')}: {luckyNumber}
//             </Text>
//           </>
//         )}
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   title: {
//     fontSize: 26,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 16,
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   periodSelector: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginBottom: 16,
//   },
//   periodButton: {
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     backgroundColor: '#444',
//     marginHorizontal: 6,
//     borderRadius: 8,
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
//     borderRadius: 12,
//   },
//   resultText: {
//     fontSize: 16,
//     lineHeight: 22,
//     marginBottom: 12,
//   },
//   metaText: {
//     fontSize: 15,
//     marginTop: 4,
//   },
// });

// export default HoroscopeScreen;


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
