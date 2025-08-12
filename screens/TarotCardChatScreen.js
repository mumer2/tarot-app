// NewChatScreen.js
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import {
  View, Text, TextInput, Button, ScrollView,
  StyleSheet, ActivityIndicator, TouchableOpacity, Modal, Alert,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import i18n from '../utils/i18n'; // i18n instance with changeLanguage and t()
import { ThemeContext } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';


// AsyncStorage keys
const HISTORY_KEY = '@chat_history';
const CURRENT_SESSION_KEY = '@current_session';
const LANG_KEY = '@app_language';
const THEME_KEY = '@app_theme';

export default function TarotCardChatScreen({ navigation }) {
  // UI State
  const [stage, setStage] = useState('issue'); // 'issue' | 'pool' | 'draw' | 'chat'
  const [issue, setIssue] = useState('');
  const [cardPool, setCardPool] = useState([]);
  const [drawnCards, setDrawnCards] = useState([]);
  const [messages, setMessages] = useState([]); // { role, type, text?, card? }
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Billing/session controls
  const [timer, setTimer] = useState(180);
  const [wallet, setWallet] = useState(0);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(true);
   const [isTarotSession, setIsTarotSession] = useState(false);

  // Theme & language
  const { theme, setThemeOverride } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const [lang, setLang] = useState(i18n.language || 'en');

  // Session ID for this chat instance
  const [sessionId, setSessionId] = useState(null);
  const scrollRef = useRef(null);

  const billingRate = 6; // RMB per minute

  // Tarot deck (example subset)
const tarotDeck = [
  {
    nameKey: 'TheFool_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg',
    meaningKey: 'TheFool_meaning',
  },
  {
    nameKey: 'TheMagician_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg',
    meaningKey: 'TheMagician_meaning',
  },
  {
    nameKey: 'TheHighPriestess_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/88/RWS_Tarot_02_High_Priestess.jpg',
    meaningKey: 'TheHighPriestess_meaning',
  },
  {
    nameKey: 'TheEmpress_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/RWS_Tarot_03_Empress.jpg',
    meaningKey: 'TheEmpress_meaning',
  },
  {
    nameKey: 'TheEmperor_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/RWS_Tarot_04_Emperor.jpg',
    meaningKey: 'TheEmperor_meaning',
  },
  {
    nameKey: 'TheHierophant_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/RWS_Tarot_05_Hierophant.jpg',
    meaningKey: 'TheHierophant_meaning',
  },
  {
    nameKey: 'TheLovers_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/TheLovers.jpg',
    meaningKey: 'TheLovers_meaning',
  },
  {
    nameKey: 'TheChariot_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg',
    meaningKey: 'TheChariot_meaning',
  },
  {
    nameKey: 'Strength_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg',
    meaningKey: 'Strength_meaning',
  },
  {
    nameKey: 'TheHermit_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/RWS_Tarot_09_Hermit.jpg',
    meaningKey: 'TheHermit_meaning',
  },
  {
    nameKey: 'WheelOfFortune_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg',
    meaningKey: 'WheelOfFortune_meaning',
  },
  {
    nameKey: 'Justice_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/RWS_Tarot_11_Justice.jpg',
    meaningKey: 'Justice_meaning',
  },
  {
    nameKey: 'TheHangedMan_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/RWS_Tarot_12_Hanged_Man.jpg',
    meaningKey: 'TheHangedMan_meaning',
  },
  {
    nameKey: 'Death_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/RWS_Tarot_13_Death.jpg',
    meaningKey: 'Death_meaning',
  },
  {
    nameKey: 'Temperance_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/RWS_Tarot_14_Temperance.jpg',
    meaningKey: 'Temperance_meaning',
  },
  {
    nameKey: 'TheDevil_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/55/RWS_Tarot_15_Devil.jpg',
    meaningKey: 'TheDevil_meaning',
  },
  {
    nameKey: 'TheTower_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg',
    meaningKey: 'TheTower_meaning',
  },
  {
    nameKey: 'TheStar_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_17_Star.jpg',
    meaningKey: 'TheStar_meaning',
  },
  {
    nameKey: 'TheMoon_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/RWS_Tarot_18_Moon.jpg',
    meaningKey: 'TheMoon_meaning',
  },
  {
    nameKey: 'TheSun_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg',
    meaningKey: 'TheSun_meaning',
  },
  {
    nameKey: 'Judgement_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/RWS_Tarot_20_Judgement.jpg',
    meaningKey: 'Judgement_meaning',
  },
  {
    nameKey: 'TheWorld_name',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/RWS_Tarot_21_World.jpg',
    meaningKey: 'TheWorld_meaning',
  },
];


  // Initialization: load wallet, language, theme, sessionId
  useEffect(() => {
    (async () => {
      try {
        // Load wallet balance
        const storedBalance = await AsyncStorage.getItem("@wallet_balance");
        if (storedBalance) setWallet(parseInt(storedBalance, 10));

        // Load language
        const sLang = await AsyncStorage.getItem(LANG_KEY);
        if (sLang) {
          setLang(sLang);
          i18n.changeLanguage(sLang);
        }

        // Load theme override
        const sTheme = await AsyncStorage.getItem(THEME_KEY);
        if (sTheme) setThemeOverride(sTheme);

        // Generate new session id and store it
        const newSessionId = `s_${Date.now()}`;
        setSessionId(newSessionId);
        await AsyncStorage.setItem(CURRENT_SESSION_KEY, newSessionId);
      } catch (err) {
        console.warn('Initialization error:', err);
      }
    })();
  }, []);

  // Load session messages if sessionId exists
  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(`session_${sessionId}`);
        if (stored) {
          setMessages(JSON.parse(stored));
        }
      } catch (err) {
        console.warn('Load session error:', err);
      }
    })();
  }, [sessionId]);

  // Timer countdown and session management

  useEffect(() => {
  if (!isSessionActive) return;

  const interval = setInterval(() => {
    setTimer(prev => {
      if (prev <= 1) {
        clearInterval(interval);
        setIsSessionActive(false);
        setShowRechargeModal(true);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [isSessionActive]);

  // useEffect(() => {
  //   let interval;
  //   if (stage === 'chat' && isSessionActive) {
  //     interval = setInterval(() => {
  //       setTimer(prev => {
  //         if (prev <= 1) {
  //           clearInterval(interval);
  //           setIsSessionActive(false);
  //           setShowRechargeModal(true);
  //           return 0;
  //         }
  //         return prev - 1;
  //       });
  //     }, 1000);
  //   }
  //   return () => clearInterval(interval);
  // }, [stage, isSessionActive]);

  // Persist session messages when they change
  const persistSession = useCallback(async (sId, msgs) => {
    if (!sId) return;
    try {
      await AsyncStorage.setItem(`session_${sId}`, JSON.stringify(msgs));
    } catch (err) {
      console.warn('Persist session error:', err);
    }
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    persistSession(sessionId, messages);
    // Auto-scroll to bottom on new message
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, sessionId, persistSession]);

  // Save chat history metadata to storage
  const saveHistory = useCallback(async () => {
    try {
      if ((!messages || messages.length === 0) && (!drawnCards || drawnCards.length === 0)) return;

      const existingJson = await AsyncStorage.getItem(HISTORY_KEY);
      const arr = existingJson ? JSON.parse(existingJson) : [];

      const meta = {
        id: sessionId || `s_${Date.now()}`,
        timestamp: new Date().toISOString(),
        issue,
        messagesCount: messages.length,
        drawnCards: drawnCards.map(c => c.name),
        preview: (
          messages.find(m => m.type === 'text' && m.role === 'assistant')?.text
          || messages.find(m => m.type === 'text')?.text
          || drawnCards.map(c => c.name).join(', ')
          || ''
        ).slice(0, 300),
      };

      if (sessionId) {
        await AsyncStorage.setItem(`session_${sessionId}`, JSON.stringify(messages));
      }

      const existingIndex = arr.findIndex(h => h.id === meta.id);
      if (existingIndex >= 0) {
        arr[existingIndex] = meta;
      } else {
        arr.unshift(meta);
      }

      const MAX = 200;
      if (arr.length > MAX) arr.splice(MAX);

      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
    } catch (err) {
      console.warn('saveHistory error:', err);
    }
  }, [messages, drawnCards, issue, sessionId]);

  // Save history on navigation blur
  useEffect(() => {
    if (!navigation) return;
    const unsub = navigation.addListener('blur', () => {
      saveHistory();
    });
    return unsub;
  }, [navigation, saveHistory]);

  // Save history on unmount (best effort)
  useEffect(() => {
    return () => {
      saveHistory();
    };
  }, [saveHistory]);

  // Save and close button handler
  const handleSaveAndClose = async () => {
    await saveHistory();
    if (navigation) navigation.goBack();
  };

  // Deduct wallet balance from backend API
  const deductBalanceFromBackend = async (amount) => {
    try {
      const userId = await AsyncStorage.getItem("@user_id");
      if (!userId) {
        Alert.alert(i18n.t('MissingUserID'));
        return false;
      }
      const res = await axios.post(
        "https://backend-tarot-app.netlify.app/.netlify/functions/deduct-balance",
        { userId, amount }
      );
      if (res.data?.balance !== undefined) {
        await AsyncStorage.setItem("@wallet_balance", res.data.balance.toString());
        setWallet(res.data.balance);
        return true;
      } else {
        Alert.alert(i18n.t('Error'), res.data.error || i18n.t('DeductFail'));
        return false;
      }
    } catch (err) {
      Alert.alert(i18n.t('Error'), err.message || i18n.t('DeductFail'));
      return false;
    }
  };

  // Recharge wallet timer by deducting balance
  const handleRecharge = async () => {
    if (wallet < billingRate) {
      Alert.alert(i18n.t('NotEnough'), i18n.t('RechargePrompt'));
      return;
    }
    const ok = await deductBalanceFromBackend(billingRate);
    if (ok) {
      setTimer(60);
      setIsSessionActive(true);
      setShowRechargeModal(false);
      Alert.alert(i18n.t('Charged'), i18n.t('MinuteAdded'));
    }
  };

  // Push message helper
  const pushMessage = (msg) => {
    setMessages(prev => [...prev, msg]);
  };

  // Message helpers
  const sendBotMessage = (text) => {
    pushMessage({ role: 'assistant', type: 'text', text });
  };
  const sendUserMessage = (text) => {
    pushMessage({ role: 'user', type: 'text', text });
  };
  const sendCardMessage = (card) => {
    pushMessage({ role: 'assistant', type: 'card', card });
  };

  // Issue selection handler
  const handleIssueSelect = (selectedIssue) => {
    setIssue(selectedIssue);
    sendBotMessage(i18n.t('ChosenIssue') + ` ${selectedIssue}`);
    sendBotMessage(i18n.t('ShufflePrompt'));
    setStage('pool');
  };

  // Card pool shuffle handler
  const handlePoolSelect = (count) => {
    const shuffled = [...tarotDeck].sort(() => Math.random() - 0.5).slice(0, count);
    setCardPool(shuffled);
    sendBotMessage(i18n.t('PoolShuffled') + ` (${count})`);
    sendBotMessage(i18n.t('DrawPrompt'));
    setStage('draw');
  };

  // Card draw handler
  const handleDrawSelect = (drawCount) => {
    const drawn = [...cardPool].sort(() => Math.random() - 0.5).slice(0, drawCount);
    setDrawnCards(drawn);

   sendBotMessage(i18n.t('CardsDrawn') + ` ${drawn.map(c => i18n.t(c.nameKey)).join(', ')}`);

drawn.forEach(card => sendCardMessage({ 
  nameKey: card.nameKey, 
  meaningKey: card.meaningKey, 
  image: card.image 
}));

      askAI(`${i18n.t('InterpretFor')} ${issue}: ${drawn.map(c => i18n.t(c.nameKey)).join(', ')}`);

    setStage('chat');
  };

  const detectLanguage = (text) => {
  const chineseCharPattern = /[\u4e00-\u9fff]/;  // matches any CJK unified ideographs
  if (chineseCharPattern.test(text)) {
    return 'zh';
  }
  return 'en';
};


  // Ask AI backend
const askAI = async (question) => {
  if (!isSessionActive) return;
  setLoading(true);
  sendUserMessage(question);

  // Detect language from user input
  const detectedLang = detectLanguage(question);

  // Set system prompt based on detected language
  let systemPrompt;
  if (detectedLang === 'zh') {
    systemPrompt = "你是Luna，一位充满爱意和浪漫风格的塔罗牌占卜师。请始终用中文回复。";
  } else {
    systemPrompt = "You are Luna, a mystical tarot reader with a poetic and magical style. Keep your answers short and romantic like a fortune teller.";
  }

  try {
    const res = await axios.post(
      'https://backend-tarot-app.netlify.app/.netlify/functions/tarot-bot',
      {
        question,
        system: systemPrompt,
        lang: detectedLang,
      }
    );
    const answer = res?.data?.answer ?? i18n.t('BotSilent');
    sendBotMessage(answer);
  } catch (err) {
    sendBotMessage(i18n.t('BotSilent'));
  } finally {
    setLoading(false);
  }
};


  // Format timer display mm:ss
  const formatTime = (sec) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;

  // Helper to render option buttons
const renderOptions = (options, onSelect) => (
  <View style={themeStyles.optionGroup}>
    {options.map((option, idx) => (
      <TouchableOpacity
        key={idx}
        style={themeStyles.optionButton}
        activeOpacity={0.8}
        onPress={() => onSelect(option)}
      >
        <Text style={themeStyles.optionText}>{option}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

 // UI for simple chat (no tarot session stages)
  const renderSimpleChat = () => (
    <>
      <View style={{ marginVertical: 12, alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => {
            setIsTarotSession(true);
            setStage('issue');  // reset tarot session to first stage
            // optionally clear tarot-specific states if you want a fresh start:
            setIssue('');
            setCardPool([]);
            setDrawnCards([]);
            setMessages([]);
          }}
          style={{
            backgroundColor: isDark ? '#6a3af3' : '#4b0082',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 25,
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>{i18n.t('StartTarotSession')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} style={themeStyles.chat} contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 12 }}>
        {messages.map((msg, i) => (
          <View
            key={i}
            style={[
              msg.role === 'user' ? themeStyles.userMessage : themeStyles.botMessage,
              { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 4 },
            ]}
          >
            {msg.role !== 'user' && <Text style={{ marginRight: 8 }}>🔮</Text>}
            <Text style={{ flexShrink: 1, color: msg.role === 'user' ? '#4b0082' : isDark ? '#d1c1ff' : '#4b0082' }}>
              {msg.text}
            </Text>
            {msg.role === 'user' && <Text style={{ marginLeft: 8 }}>🧑</Text>}
          </View>
        ))}
      </ScrollView>

      <View style={themeStyles.inputRow}>
        <TextInput
          style={themeStyles.input}
          value={input}
          editable={isSessionActive}
          onChangeText={setInput}
          placeholder={isSessionActive ? i18n.t("AskPrompt") : i18n.t("SessionEnded")}
          placeholderTextColor={isDark ? '#88a605ff' : '#FF0000'}
        />
        <TouchableOpacity
          style={themeStyles.sendButton}
          onPress={() => {
            if (input.trim() && isSessionActive) {
              askAI(input.trim());
              setInput('');
            }
          }}
        >
          <Text style={themeStyles.sendButtonText}>{i18n.t("Send")}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  // Determine styles object based on theme context
  const themeStyles = isDark ? darkStyles : lightStyles;

 // Now, in your return, conditionally render:
  return (
    <LinearGradient colors={isDark ? ['#0f0b1d', '#2c003e'] : ['#fffaf6', '#e9dbf7']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom','left','right']}>
      <View style={themeStyles.container}>
        <View style={styles.headerRow}>
          <Text style={themeStyles.header}>🔮 {i18n.t('TarotChatWithLuna')}</Text>

          {/* <TouchableOpacity
    style={styles.toggleSessionButton}
    onPress={() => {
      if (stage === 'chat') {
        // Start session - reset session data and move to issue selection
        setStage('issue');
        setIssue('');
        setCardPool([]);
        setDrawnCards([]);
        sendBotMessage(i18n.t('SessionStarted'));
      } else {
        // Back to normal chat
        setStage('chat');
        setIssue('');
        setCardPool([]);
        setDrawnCards([]);
        sendBotMessage(i18n.t('BackToNormalChat'));
      }
    }}
  >
    <Text style={themeStyles.toggleSessionButtonText}>
      {stage === 'chat' ? i18n.t('StartSession') : i18n.t('BackToChat')}
    </Text>
  </TouchableOpacity> */}
        </View>

        {/* Timer */}
<Text style={themeStyles.billing}>
  ⏱ {timer > 0 ? `${i18n.t("TimeLeft")}: ${formatTime(timer)}` : i18n.t("RechargeRequired")}
</Text>



        {isTarotSession
          ? (
            <>
              {/* Your existing tarot session UI depending on stage */}
              {stage === 'issue' && (
                <View style={themeStyles.section}>
                  <Text style={themeStyles.headingText}>{i18n.t("WhatToDivine")}</Text>
                  {renderOptions([i18n.t('Love'), i18n.t('Work'), i18n.t('Marriage'), i18n.t('Studies'), i18n.t('Interpersonal')], handleIssueSelect)}
                </View>
              )}

              {stage === 'pool' && (
                <View style={themeStyles.section}>
                  <Text style={themeStyles.headingText}>{i18n.t("ShuffleCount")}</Text>
                  {renderOptions([5, 7, 10, 22], handlePoolSelect)}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                    {cardPool.map((c, idx) => (
                      <View key={idx} style={styles.poolThumb}>
                        <Image source={{ uri: c.image }} style={styles.poolImage} />
                        <Text numberOfLines={1} style={styles.poolLabel}>{i18n.t(c.nameKey)}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {stage === 'draw' && (
                <View style={themeStyles.section}>
                  <Text style={themeStyles.headingText}>{i18n.t("DrawCount")}</Text>
                  {renderOptions([3, 5, 7, 10], handleDrawSelect)}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                    {cardPool.map((c, idx) => (
                      <View key={idx} style={styles.cardBack}>
                        <Image source={{ uri: c.image }} style={styles.cardBackImage} />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

             {stage === 'chat' && (
        <View style={themeStyles.section}>
        <ScrollView ref={scrollRef} style={themeStyles.chat} contentContainerStyle={{ paddingBottom: 20 }}>
             {messages.map((msg, i) => {
                 if (msg.type === 'text') {
                   return (
                     <View
                       key={i}
                      style={[
                       msg.role === 'user' ? themeStyles.userMessage : themeStyles.botMessage,
                         { flexDirection: 'row', alignItems: 'flex-start' }
                       ]}
                     >
                       {msg.role !== 'user' && <Text style={styles.icon}>🔮</Text>}
                      <Text style={[msg.role === 'user' ? themeStyles.userMessageText : themeStyles.botMessageText, { flexShrink: 1 }]}>                         {msg.text}
                       </Text>
                       {msg.role === 'user' && <Text style={styles.icon}>🧑</Text>}
                     </View>
                   );
                 }

                 if (msg.type === 'card' && msg.card) {
                   return (
                     <View key={i} style={styles.cardMessageWrap}>
                       <View style={styles.cardMessage}>
                         <Image source={{ uri: msg.card.image }} style={styles.cardImageLarge} />
                         <View style={styles.cardMeta}>
                         <Text style={styles.cardName}>{i18n.t(msg.card.nameKey)}</Text>
           <Text style={styles.cardMeaning}>{i18n.t(msg.card.meaningKey)}</Text>
                         </View>
                       </View>
                     </View>
                   );
                 }
                 return null;
               })}
             </ScrollView>

             {loading ? (
               <ActivityIndicator size="large" color={isDark ? "#ffd700" : "#8a2be2"} />
             ) : (
             <View style={themeStyles.inputRow}>
                 <TextInput
                   style={themeStyles.input}
                   value={input}
                   editable={isSessionActive}
                  onChangeText={setInput}
                   placeholder={isSessionActive ? i18n.t("AskPrompt") : i18n.t("SessionEnded")}
                   placeholderTextColor={isDark ? '#7fbf09ff' : '#FF0000'}
                 />
                 <TouchableOpacity
                   style={themeStyles.sendButton}
                   onPress={() => {
                     if (input.trim() && isSessionActive) {
                       askAI(input.trim());
                       setInput('');
                     }
                   }}
                 >
                   <Text style={themeStyles.sendButtonText}>{i18n.t("Send")}</Text>
                 </TouchableOpacity>
            </View>
             )}
         </View>
              )}
            </>
          )
          : renderSimpleChat()
        }

       <Modal visible={showRechargeModal} transparent animationType="slide">
  <View style={[themeStyles.modalContainer, {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  }]}>
    <View style={[themeStyles.modalBox, {
      backgroundColor: isDark ? '#ffffffff' : '#fff',
      borderRadius: 12,
      padding: 20,
      width: '100%',
      maxWidth: 320,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
      alignItems: 'center',
    }]}>
      <Text style={[themeStyles.text, { fontSize: 20, marginBottom: 12, fontWeight: '600' }]}>
        💰 {i18n.t("RechargeRequired")}
      </Text>
      <Text style={{ marginBottom: 20, fontSize: 16 }}>
        {i18n.t("WalletBalance")}: ¥{wallet}
      </Text>
      <TouchableOpacity
        onPress={handleRecharge}
        style={{
          backgroundColor: isDark ? '#4B0082' : '#FF0000', // Indigo in dark, Red in light
          paddingVertical: 12,
          paddingHorizontal: 40,
          borderRadius: 25,
        }}
        activeOpacity={0.8}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
          {i18n.t("Use6RMB")}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

      </View>
      </SafeAreaView>
    </LinearGradient>
  );
}


// // NewChatScreen.js
// import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
// import {
//   View, Text, TextInput, Button, ScrollView,
//   StyleSheet, ActivityIndicator, TouchableOpacity, Modal, Alert,
//   Image
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import i18n from '../utils/i18n'; // i18n instance with changeLanguage and t()
// import { ThemeContext } from '../context/ThemeContext';

// // AsyncStorage keys
// const HISTORY_KEY = '@chat_history';
// const CURRENT_SESSION_KEY = '@current_session';
// const LANG_KEY = '@app_language';
// const THEME_KEY = '@app_theme';

// export default function NewChatScreen({ navigation }) {
//   // UI State
//   const [stage, setStage] = useState('issue'); // 'issue' | 'pool' | 'draw' | 'chat'
//   const [issue, setIssue] = useState('');
//   const [cardPool, setCardPool] = useState([]);
//   const [drawnCards, setDrawnCards] = useState([]);
//   const [messages, setMessages] = useState([]); // { role, type, text?, card? }
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Billing/session controls
//   const [timer, setTimer] = useState(180);
//   const [wallet, setWallet] = useState(0);
//   const [showRechargeModal, setShowRechargeModal] = useState(false);
//   const [isSessionActive, setIsSessionActive] = useState(true);

//   // Theme & language
//   const { theme, setThemeOverride } = useContext(ThemeContext);
//   const isDark = theme === 'dark';

//   const [lang, setLang] = useState(i18n.language || 'en');

//   // Session ID for this chat instance
//   const [sessionId, setSessionId] = useState(null);
//   const scrollRef = useRef(null);

//   const billingRate = 6; // RMB per minute

//   // Tarot deck (example subset)
// const tarotDeck = [
//   {
//     nameKey: 'TheFool_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg',
//     meaningKey: 'TheFool_meaning',
//   },
//   {
//     nameKey: 'TheMagician_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg',
//     meaningKey: 'TheMagician_meaning',
//   },
//   {
//     nameKey: 'TheHighPriestess_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/8/88/RWS_Tarot_02_High_Priestess.jpg',
//     meaningKey: 'TheHighPriestess_meaning',
//   },
//   {
//     nameKey: 'TheEmpress_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/RWS_Tarot_03_Empress.jpg',
//     meaningKey: 'TheEmpress_meaning',
//   },
//   {
//     nameKey: 'TheEmperor_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/RWS_Tarot_04_Emperor.jpg',
//     meaningKey: 'TheEmperor_meaning',
//   },
//   {
//     nameKey: 'TheHierophant_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/RWS_Tarot_05_Hierophant.jpg',
//     meaningKey: 'TheHierophant_meaning',
//   },
//   {
//     nameKey: 'TheLovers_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/TheLovers.jpg',
//     meaningKey: 'TheLovers_meaning',
//   },
//   {
//     nameKey: 'TheChariot_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg',
//     meaningKey: 'TheChariot_meaning',
//   },
//   {
//     nameKey: 'Strength_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg',
//     meaningKey: 'Strength_meaning',
//   },
//   {
//     nameKey: 'TheHermit_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/RWS_Tarot_09_Hermit.jpg',
//     meaningKey: 'TheHermit_meaning',
//   },
//   {
//     nameKey: 'WheelOfFortune_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg',
//     meaningKey: 'WheelOfFortune_meaning',
//   },
//   {
//     nameKey: 'Justice_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/RWS_Tarot_11_Justice.jpg',
//     meaningKey: 'Justice_meaning',
//   },
//   {
//     nameKey: 'TheHangedMan_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/RWS_Tarot_12_Hanged_Man.jpg',
//     meaningKey: 'TheHangedMan_meaning',
//   },
//   {
//     nameKey: 'Death_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/RWS_Tarot_13_Death.jpg',
//     meaningKey: 'Death_meaning',
//   },
//   {
//     nameKey: 'Temperance_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/RWS_Tarot_14_Temperance.jpg',
//     meaningKey: 'Temperance_meaning',
//   },
//   {
//     nameKey: 'TheDevil_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/5/55/RWS_Tarot_15_Devil.jpg',
//     meaningKey: 'TheDevil_meaning',
//   },
//   {
//     nameKey: 'TheTower_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg',
//     meaningKey: 'TheTower_meaning',
//   },
//   {
//     nameKey: 'TheStar_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_17_Star.jpg',
//     meaningKey: 'TheStar_meaning',
//   },
//   {
//     nameKey: 'TheMoon_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/RWS_Tarot_18_Moon.jpg',
//     meaningKey: 'TheMoon_meaning',
//   },
//   {
//     nameKey: 'TheSun_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg',
//     meaningKey: 'TheSun_meaning',
//   },
//   {
//     nameKey: 'Judgement_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/RWS_Tarot_20_Judgement.jpg',
//     meaningKey: 'Judgement_meaning',
//   },
//   {
//     nameKey: 'TheWorld_name',
//     image: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/RWS_Tarot_21_World.jpg',
//     meaningKey: 'TheWorld_meaning',
//   },
// ];


//   // Initialization: load wallet, language, theme, sessionId
//   useEffect(() => {
//     (async () => {
//       try {
//         // Load wallet balance
//         const storedBalance = await AsyncStorage.getItem("@wallet_balance");
//         if (storedBalance) setWallet(parseInt(storedBalance, 10));

//         // Load language
//         const sLang = await AsyncStorage.getItem(LANG_KEY);
//         if (sLang) {
//           setLang(sLang);
//           i18n.changeLanguage(sLang);
//         }

//         // Load theme override
//         const sTheme = await AsyncStorage.getItem(THEME_KEY);
//         if (sTheme) setThemeOverride(sTheme);

//         // Generate new session id and store it
//         const newSessionId = `s_${Date.now()}`;
//         setSessionId(newSessionId);
//         await AsyncStorage.setItem(CURRENT_SESSION_KEY, newSessionId);
//       } catch (err) {
//         console.warn('Initialization error:', err);
//       }
//     })();
//   }, []);

//   // Load session messages if sessionId exists
//   useEffect(() => {
//     if (!sessionId) return;
//     (async () => {
//       try {
//         const stored = await AsyncStorage.getItem(`session_${sessionId}`);
//         if (stored) {
//           setMessages(JSON.parse(stored));
//         }
//       } catch (err) {
//         console.warn('Load session error:', err);
//       }
//     })();
//   }, [sessionId]);

//   // Timer countdown and session management
//   useEffect(() => {
//     let interval;
//     if (stage === 'chat' && isSessionActive) {
//       interval = setInterval(() => {
//         setTimer(prev => {
//           if (prev <= 1) {
//             clearInterval(interval);
//             setIsSessionActive(false);
//             setShowRechargeModal(true);
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [stage, isSessionActive]);

//   // Persist session messages when they change
//   const persistSession = useCallback(async (sId, msgs) => {
//     if (!sId) return;
//     try {
//       await AsyncStorage.setItem(`session_${sId}`, JSON.stringify(msgs));
//     } catch (err) {
//       console.warn('Persist session error:', err);
//     }
//   }, []);

//   useEffect(() => {
//     if (!sessionId) return;
//     persistSession(sessionId, messages);
//     // Auto-scroll to bottom on new message
//     if (scrollRef.current) {
//       scrollRef.current.scrollToEnd({ animated: true });
//     }
//   }, [messages, sessionId, persistSession]);

//   // Save chat history metadata to storage
//   const saveHistory = useCallback(async () => {
//     try {
//       if ((!messages || messages.length === 0) && (!drawnCards || drawnCards.length === 0)) return;

//       const existingJson = await AsyncStorage.getItem(HISTORY_KEY);
//       const arr = existingJson ? JSON.parse(existingJson) : [];

//       const meta = {
//         id: sessionId || `s_${Date.now()}`,
//         timestamp: new Date().toISOString(),
//         issue,
//         messagesCount: messages.length,
//         drawnCards: drawnCards.map(c => c.name),
//         preview: (
//           messages.find(m => m.type === 'text' && m.role === 'assistant')?.text
//           || messages.find(m => m.type === 'text')?.text
//           || drawnCards.map(c => c.name).join(', ')
//           || ''
//         ).slice(0, 300),
//       };

//       if (sessionId) {
//         await AsyncStorage.setItem(`session_${sessionId}`, JSON.stringify(messages));
//       }

//       const existingIndex = arr.findIndex(h => h.id === meta.id);
//       if (existingIndex >= 0) {
//         arr[existingIndex] = meta;
//       } else {
//         arr.unshift(meta);
//       }

//       const MAX = 200;
//       if (arr.length > MAX) arr.splice(MAX);

//       await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
//     } catch (err) {
//       console.warn('saveHistory error:', err);
//     }
//   }, [messages, drawnCards, issue, sessionId]);

//   // Save history on navigation blur
//   useEffect(() => {
//     if (!navigation) return;
//     const unsub = navigation.addListener('blur', () => {
//       saveHistory();
//     });
//     return unsub;
//   }, [navigation, saveHistory]);

//   // Save history on unmount (best effort)
//   useEffect(() => {
//     return () => {
//       saveHistory();
//     };
//   }, [saveHistory]);

//   // Save and close button handler
//   const handleSaveAndClose = async () => {
//     await saveHistory();
//     if (navigation) navigation.goBack();
//   };

//   // Deduct wallet balance from backend API
//   const deductBalanceFromBackend = async (amount) => {
//     try {
//       const userId = await AsyncStorage.getItem("@user_id");
//       if (!userId) {
//         Alert.alert(i18n.t('MissingUserID'));
//         return false;
//       }
//       const res = await axios.post(
//         "https://backend-tarot-app.netlify.app/.netlify/functions/deduct-balance",
//         { userId, amount }
//       );
//       if (res.data?.balance !== undefined) {
//         await AsyncStorage.setItem("@wallet_balance", res.data.balance.toString());
//         setWallet(res.data.balance);
//         return true;
//       } else {
//         Alert.alert(i18n.t('Error'), res.data.error || i18n.t('DeductFail'));
//         return false;
//       }
//     } catch (err) {
//       Alert.alert(i18n.t('Error'), err.message || i18n.t('DeductFail'));
//       return false;
//     }
//   };

//   // Recharge wallet timer by deducting balance
//   const handleRecharge = async () => {
//     if (wallet < billingRate) {
//       Alert.alert(i18n.t('NotEnough'), i18n.t('RechargePrompt'));
//       return;
//     }
//     const ok = await deductBalanceFromBackend(billingRate);
//     if (ok) {
//       setTimer(60);
//       setIsSessionActive(true);
//       setShowRechargeModal(false);
//       Alert.alert(i18n.t('Charged'), i18n.t('MinuteAdded'));
//     }
//   };

//   // Push message helper
//   const pushMessage = (msg) => {
//     setMessages(prev => [...prev, msg]);
//   };

//   // Message helpers
//   const sendBotMessage = (text) => {
//     pushMessage({ role: 'assistant', type: 'text', text });
//   };
//   const sendUserMessage = (text) => {
//     pushMessage({ role: 'user', type: 'text', text });
//   };
//   const sendCardMessage = (card) => {
//     pushMessage({ role: 'assistant', type: 'card', card });
//   };

//   // Issue selection handler
//   const handleIssueSelect = (selectedIssue) => {
//     setIssue(selectedIssue);
//     sendBotMessage(i18n.t('ChosenIssue') + ` ${selectedIssue}`);
//     sendBotMessage(i18n.t('ShufflePrompt'));
//     setStage('pool');
//   };

//   // Card pool shuffle handler
//   const handlePoolSelect = (count) => {
//     const shuffled = [...tarotDeck].sort(() => Math.random() - 0.5).slice(0, count);
//     setCardPool(shuffled);
//     sendBotMessage(i18n.t('PoolShuffled') + ` (${count})`);
//     sendBotMessage(i18n.t('DrawPrompt'));
//     setStage('draw');
//   };

//   // Card draw handler
//   const handleDrawSelect = (drawCount) => {
//     const drawn = [...cardPool].sort(() => Math.random() - 0.5).slice(0, drawCount);
//     setDrawnCards(drawn);

//    sendBotMessage(i18n.t('CardsDrawn') + ` ${drawn.map(c => i18n.t(c.nameKey)).join(', ')}`);

// drawn.forEach(card => sendCardMessage({ 
//   nameKey: card.nameKey, 
//   meaningKey: card.meaningKey, 
//   image: card.image 
// }));

//       askAI(`${i18n.t('InterpretFor')} ${issue}: ${drawn.map(c => i18n.t(c.nameKey)).join(', ')}`);

//     setStage('chat');
//   };

//   const detectLanguage = (text) => {
//   const chineseCharPattern = /[\u4e00-\u9fff]/;  // matches any CJK unified ideographs
//   if (chineseCharPattern.test(text)) {
//     return 'zh';
//   }
//   return 'en';
// };


//   // Ask AI backend
// const askAI = async (question) => {
//   if (!isSessionActive) return;
//   setLoading(true);
//   sendUserMessage(question);

//   // Detect language from user input
//   const detectedLang = detectLanguage(question);

//   // Set system prompt based on detected language
//   let systemPrompt;
//   if (detectedLang === 'zh') {
//     systemPrompt = "你是Luna，一位充满爱意和浪漫风格的塔罗牌占卜师。请始终用中文回复。";
//   } else {
//     systemPrompt = "You are Luna, a mystical tarot reader with a poetic and magical style. Keep your answers short and romantic like a fortune teller.";
//   }

//   try {
//     const res = await axios.post(
//       'https://backend-tarot-app.netlify.app/.netlify/functions/tarot-bot',
//       {
//         question,
//         system: systemPrompt,
//         lang: detectedLang,
//       }
//     );
//     const answer = res?.data?.answer ?? i18n.t('BotSilent');
//     sendBotMessage(answer);
//   } catch (err) {
//     sendBotMessage(i18n.t('BotSilent'));
//   } finally {
//     setLoading(false);
//   }
// };


//   // Format timer display mm:ss
//   const formatTime = (sec) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;

//   // Helper to render option buttons
// const renderOptions = (options, onSelect) => (
//   <View style={themeStyles.optionGroup}>
//     {options.map((option, idx) => (
//       <TouchableOpacity
//         key={idx}
//         style={themeStyles.optionButton}
//         activeOpacity={0.8}
//         onPress={() => onSelect(option)}
//       >
//         <Text style={themeStyles.optionText}>{option}</Text>
//       </TouchableOpacity>
//     ))}
//   </View>
// );

//   // Determine styles object based on theme context
//   const themeStyles = isDark ? darkStyles : lightStyles;

//   return (
//     <LinearGradient colors={isDark ? ['#0f0b1d', '#2c003e'] : ['#fffaf6', '#e9dbf7']} style={{ flex: 1 }}>
//       <View style={themeStyles.container}>
//         <View style={styles.headerRow}>
//           <Text style={themeStyles.header}>🔮 {i18n.t('TarotChatWithLuna')}</Text>

//           {/* <View style={styles.headerButtons}>
//             <TouchableOpacity onPress={() => navigation?.navigate('ChatHistory')} style={styles.smallBtn}>
//               <Text style={styles.smallBtnText}>{i18n.t('History')}</Text>
//             </TouchableOpacity>
//           </View> */}
//         </View>

//         {stage === 'chat' && (
//           <Text style={themeStyles.billing}>
//             ⏱ {timer > 0 ? `${i18n.t("TimeLeft")}: ${formatTime(timer)}` : i18n.t("RechargeRequired")}
//           </Text>
//         )}

//         {stage === 'issue' && (
//           <View style={themeStyles.section}>
//             <Text style={themeStyles.headingText}>{i18n.t("WhatToDivine")}</Text>
//             {renderOptions([i18n.t('Love'), i18n.t('Work'), i18n.t('Marriage'), i18n.t('Studies'), i18n.t('Interpersonal')], handleIssueSelect)}
//           </View>
//         )}

//         {stage === 'pool' && (
//           <View style={themeStyles.section}>
//             <Text style={themeStyles.headingText}>{i18n.t("ShuffleCount")}</Text>
//             {renderOptions([5, 7, 10, 22], handlePoolSelect)}
//             <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
//               {cardPool.map((c, idx) => (
//                 <View key={idx} style={styles.poolThumb}>
//                   <Image source={{ uri: c.image }} style={styles.poolImage} />
//                   <Text numberOfLines={1} style={styles.poolLabel}>{i18n.t(c.nameKey)}</Text>

//                 </View>
//               ))}
//             </ScrollView>
//           </View>
//         )}

//         {stage === 'draw' && (
//           <View style={themeStyles.section}>
//             <Text style={themeStyles.headingText}>{i18n.t("DrawCount")}</Text>
//             {renderOptions([3, 5, 7, 10], handleDrawSelect)}
//             <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
//               {cardPool.map((c, idx) => (
//                 <View key={idx} style={styles.cardBack}>
//                   <Image source={{ uri: c.image }} style={styles.cardBackImage} />
//                 </View>
//               ))}
//             </ScrollView>
//           </View>
//         )}

//         {stage === 'chat' && (
//           <View style={themeStyles.section}>
//             <ScrollView ref={scrollRef} style={themeStyles.chat} contentContainerStyle={{ paddingBottom: 20 }}>
//               {messages.map((msg, i) => {
//                 if (msg.type === 'text') {
//                   return (
//                     <View
//                       key={i}
//                       style={[
//                         msg.role === 'user' ? themeStyles.userMessage : themeStyles.botMessage,
//                         { flexDirection: 'row', alignItems: 'flex-start' }
//                       ]}
//                     >
//                       {msg.role !== 'user' && <Text style={styles.icon}>🔮</Text>}
//                       <Text style={[msg.role === 'user' ? themeStyles.userMessageText : themeStyles.botMessageText, { flexShrink: 1 }]}>
//                         {msg.text}
//                       </Text>
//                       {msg.role === 'user' && <Text style={styles.icon}>🧑</Text>}
//                     </View>
//                   );
//                 }

//                 if (msg.type === 'card' && msg.card) {
//                   return (
//                     <View key={i} style={styles.cardMessageWrap}>
//                       <View style={styles.cardMessage}>
//                         <Image source={{ uri: msg.card.image }} style={styles.cardImageLarge} />
//                         <View style={styles.cardMeta}>
//                         <Text style={styles.cardName}>{i18n.t(msg.card.nameKey)}</Text>
//           <Text style={styles.cardMeaning}>{i18n.t(msg.card.meaningKey)}</Text>
//                         </View>
//                       </View>
//                     </View>
//                   );
//                 }
//                 return null;
//               })}
//             </ScrollView>

//             {loading ? (
//               <ActivityIndicator size="large" color={isDark ? "#ffd700" : "#8a2be2"} />
//             ) : (
//               <View style={themeStyles.inputRow}>
//                 <TextInput
//                   style={themeStyles.input}
//                   value={input}
//                   editable={isSessionActive}
//                   onChangeText={setInput}
//                   placeholder={isSessionActive ? i18n.t("AskPrompt") : i18n.t("SessionEnded")}
//                   placeholderTextColor={isDark ? '#4B0082' : '#FF0000'}
//                 />
//                 <TouchableOpacity
//                   style={themeStyles.sendButton}
//                   onPress={() => {
//                     if (input.trim() && isSessionActive) {
//                       askAI(input.trim());
//                       setInput('');
//                     }
//                   }}
//                 >
//                   <Text style={themeStyles.sendButtonText}>{i18n.t("Send")}</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </View>
//         )}

//        <Modal visible={showRechargeModal} transparent animationType="slide">
//   <View style={[themeStyles.modalContainer, {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   }]}>
//     <View style={[themeStyles.modalBox, {
//       backgroundColor: isDark ? '#ffffffff' : '#fff',
//       borderRadius: 12,
//       padding: 20,
//       width: '100%',
//       maxWidth: 320,
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.3,
//       shadowRadius: 4,
//       elevation: 5,
//       alignItems: 'center',
//     }]}>
//       <Text style={[themeStyles.text, { fontSize: 20, marginBottom: 12, fontWeight: '600' }]}>
//         💰 {i18n.t("RechargeRequired")}
//       </Text>
//       <Text style={{ marginBottom: 20, fontSize: 16 }}>
//         {i18n.t("WalletBalance")}: ¥{wallet}
//       </Text>
//       <TouchableOpacity
//         onPress={handleRecharge}
//         style={{
//           backgroundColor: isDark ? '#4B0082' : '#FF0000', // Indigo in dark, Red in light
//           paddingVertical: 12,
//           paddingHorizontal: 40,
//           borderRadius: 25,
//         }}
//         activeOpacity={0.8}
//       >
//         <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
//           {i18n.t("Use6RMB")}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   </View>
// </Modal>

//       </View>
//     </LinearGradient>
//   );
// }


/* Styles (light/dark + common) */
const commonStyles = {
  container: { flex: 1, padding: 20, paddingTop: 18 },
  header: { fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'left' },
  billing: { textAlign: 'center', marginBottom: 8, fontSize: 15 },
  section: { flex: 1, alignItems: 'center', paddingHorizontal: 10 },
  headingText: { fontSize: 20, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  chat: { flex: 1, alignSelf: 'stretch', marginBottom: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 25, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8 },
  input: { flex: 1, paddingHorizontal: 10, paddingVertical: 6, fontSize: 15 },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#f3e8ff', padding: 10, borderRadius: 14, marginVertical: 6, maxWidth: '80%' },
  botMessage: { alignSelf: 'flex-start', backgroundColor: 'rgba(102,51,153,0.95)', padding: 10, borderRadius: 14, marginVertical: 6, maxWidth: '80%' },
  userMessageText: { color: '#2b2b2b' },
  botMessageText: { color: '#fff' },
  optionGroup: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 },
  optionButton: { paddingVertical: 12, paddingHorizontal: 18, margin: 6, borderRadius: 25, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 },
  optionText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  text: { fontSize: 16, textAlign: 'center', marginBottom: 12 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalBox: { padding: 22, borderRadius: 14, alignItems: 'center', width: '82%' }
};

const lightStyles = StyleSheet.create({
  ...commonStyles,
  container: { ...commonStyles.container, backgroundColor: 'transparent' },
  header: { ...commonStyles.header, color: '#4b0170' },
  billing: { ...commonStyles.billing, color: '#b22222' },
  headingText: { ...commonStyles.headingText, color: '#333' },
  userMessage: { ...commonStyles.userMessage, backgroundColor: '#eef2ff' },
  botMessage: { ...commonStyles.botMessage, backgroundColor: '#6a0dad' },
  userMessageText: { color: '#222' },
  botMessageText: { color: '#fff' },
  optionButton: { ...commonStyles.optionButton, backgroundColor: '#9c27b0' },
  inputRow: { ...commonStyles.inputRow, backgroundColor: 'rgba(255,255,255,0.9)' },
  input: { ...commonStyles.input, color: '#111' },
  sendButton: { backgroundColor: '#6a0dad', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18, marginLeft: 8 },
  sendButtonText: { color: '#fff', fontWeight: '700' },
  modalBox: { ...commonStyles.modalBox, backgroundColor: 'white',color:'red' },
});

const darkStyles = StyleSheet.create({
  ...commonStyles,
  container: { ...commonStyles.container, backgroundColor: 'transparent' },
  header: { ...commonStyles.header, color: '#ffd700' },
  billing: { ...commonStyles.billing, color: '#ff8a80' },
  headingText: { ...commonStyles.headingText, color: '#ddd' },
  userMessage: { ...commonStyles.userMessage, backgroundColor: '#d5c26dff' },
  botMessage: { ...commonStyles.botMessage, backgroundColor: '#663399' },
  userMessageText: { color: '#fff' },
  botMessageText: { color: '#fff' },
  optionButton: { ...commonStyles.optionButton, backgroundColor: '#663399' },
  inputRow: { ...commonStyles.inputRow, backgroundColor: 'rgba(255,255,255,0.06)' },
  input: { ...commonStyles.input, color: '#fff' },
  sendButton: { backgroundColor: '#ffd700', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18, marginLeft: 8 },
  sendButtonText: { color: '#2a2a2a', fontWeight: '700' },
  modalBox: { ...commonStyles.modalBox, backgroundColor: '#ffffffff' },
});

/* local styles */
const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  headerButtons: { flexDirection: 'row', alignItems: 'center' },
  smallBtn: { paddingHorizontal: 8, paddingVertical: 6, marginLeft: 8, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.06)' },
  smallBtnText: { fontSize: 12, fontWeight: '700' },
  icon: { marginHorizontal: 6, fontSize: 18 },
  poolThumb: { width: 68, marginRight: 8, alignItems: 'center' },
  poolImage: { width: 60, height: 100, borderRadius: 6, borderWidth: 1, borderColor: '#ddd' },
  poolLabel: { fontSize: 11, marginTop: 4, textAlign: 'center', width: 68 },
  cardBack: { width: 90, height: 140, marginRight: 10, borderRadius: 8, overflow: 'hidden' },
  cardBackImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  cardMessageWrap: { alignItems: 'center', marginVertical: 8 },
  cardMessage: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 8, maxWidth: '95%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, elevation: 3 },
  cardImageLarge: { width: 96, height: 156, borderRadius: 6, marginRight: 10 },
  cardMeta: { flexShrink: 1 },
  cardName: { fontWeight: '800', fontSize: 16, marginBottom: 4 },
  cardMeaning: { fontSize: 13, color: '#444' },
    toggleSessionButton: {
    paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: '#8a2be2', borderRadius: 6,
  },
  toggleSessionButtonText: {
    color: '#fff', fontWeight: '600', fontSize: 14,
  },
});



