import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../context/ThemeContext';
import i18n from '../utils/i18n';

export default function SessionView({ route }) {
  const { sessionId } = route.params;
  const [messages, setMessages] = useState([]);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { width } = useWindowDimensions();
  const styles = getStyles(isDark, width);

  useEffect(() => {
    const loadSession = async () => {
      const data = await AsyncStorage.getItem(sessionId);
      if (data) setMessages(JSON.parse(data));
    };
    loadSession();
  }, []);

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageRow,
        item.sender === 'user' ? styles.userRow : styles.botRow,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.sender === 'user' ? styles.userText : styles.botText,
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {i18n.t('session.empty')}
          </Text>
        }
      />
    </View>
  );
}

// 💡 Responsive + theme-aware styles
const getStyles = (isDark, width) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
    },
    listContainer: {
      padding: 16,
    },
    messageRow: {
      marginBottom: 10,
    },
    userRow: {
      alignSelf: 'flex-end',
    },
    botRow: {
      alignSelf: 'flex-start',
    },
    messageText: {
      fontSize: width < 360 ? 14 : 16,
      padding: 12,
      borderRadius: 10,
      maxWidth: '80%',
    },
    userText: {
      backgroundColor: '#7D5A50',
      color: '#fff',
    },
    botText: {
      backgroundColor: '#4e446e',
      color: '#fff',
    },
    emptyText: {
      fontSize: 16,
      color: isDark ? '#ccc' : '#555',
      textAlign: 'center',
      marginTop: 40,
    },
  });


// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useContext } from 'react';
// import { ThemeContext } from '../context/ThemeContext';

// export default function SessionView({ route }) {
//   const { sessionId } = route.params;
//   const [messages, setMessages] = useState([]);
//   const { theme } = useContext(ThemeContext);
// const isDark = theme === 'dark';

//   useEffect(() => {
//     const loadSession = async () => {
//       const data = await AsyncStorage.getItem(sessionId);
//       if (data) setMessages(JSON.parse(data));
//     };
//     loadSession();
//   }, []);

//   const renderItem = ({ item }) => (
//     <View
//       style={[
//         styles.messageRow,
//         item.sender === 'user' ? styles.userRow : styles.botRow,
//       ]}
//     >
//       <Text
//         style={[
//           styles.messageText,
//           item.sender === 'user' ? styles.userText : styles.botText,
//         ]}
//       >
//         {item.text}
//       </Text>
//     </View>
//   );

//   return (
//     <View style={{ flex: 1, backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }}>
//       <FlatList
//         data={messages}
//         renderItem={renderItem}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={{ padding: 16 }}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   messageRow: {
//     marginBottom: 10,
//   },
//   userRow: {
//     alignSelf: 'flex-end',
//   },
//   botRow: {
//     alignSelf: 'flex-start',
//   },
//   messageText: {
//     fontSize: 15,
//     padding: 10,
//     borderRadius: 10,
//     maxWidth: '80%',
//   },
//   userText: {
//     backgroundColor: '#7D5A50',
//     color: '#fff',
//   },
//   botText: {
//     backgroundColor: '#4e446e',
//     color: '#fff',
//   },
// });
