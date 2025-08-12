import React, { useState, useEffect, useCallback, useRef, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import i18n from "../utils/i18n";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { Modal } from "react-native";

export default function ChatScreen() {
  const [messages, setMessages] = useState("");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [showFreeCardOffer, setShowFreeCardOffer] = useState(false);
   const navigation = useNavigation(); // ✅ so navigation works
  const [userZodiac, setUserZodiac] = useState(null); // ✅ store zodiac
const [lastClaimTime, setLastClaimTime] = useState(null);
  const [meetChatCondition, setMeetChatCondition] = useState(false);
  const [chatTime, setChatTime] = useState(0); // minutes chatting

  const flatListRef = useRef();

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const timerRef = useRef(null);

  const SESSION_LIMIT = 180;

  const generateSessionId = () => `session_${Date.now()}`;

  useEffect(() => {
    const createSession = async () => {
      const id = generateSessionId();
      setSessionId(id);
      await AsyncStorage.setItem("@current_session_id", id);
    };
    createSession();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadSession = async () => {
        const id = await AsyncStorage.getItem("@current_session_id");
        if (id) {
          const saved = await AsyncStorage.getItem(id);
          if (saved && isMounted) {
            setMessages(JSON.parse(saved));
          }
          setSessionId(id);
        }

        const balance = await AsyncStorage.getItem("@wallet_balance");
        setWalletBalance(balance ? parseInt(balance) : 0);

        const hasUsedFree = await AsyncStorage.getItem("@has_used_free_session");
        const storedElapsed = await AsyncStorage.getItem("@elapsed_seconds");

        const previouslyElapsed = storedElapsed ? parseInt(storedElapsed) : 0;
        setElapsedSeconds(previouslyElapsed);

        if (!hasUsedFree) {
          await AsyncStorage.setItem("@has_used_free_session", "true");
          await AsyncStorage.setItem("@elapsed_seconds", "0");
          setElapsedSeconds(0);
          setIsSessionActive(true);
          setShowPaymentPopup(false);
        } else if (previouslyElapsed >= SESSION_LIMIT) {
          setIsSessionActive(false);
          setShowPaymentPopup(true);
        } else {
          setIsSessionActive(true);
          setShowPaymentPopup(false);
        }

        startTimer();
      };

      loadSession();

      return () => {
        isMounted = false;
        stopTimer();
      };
    }, [])
  );

    useEffect(() => {
    // Load user's zodiac from storage or API
    AsyncStorage.getItem("@user_zodiac").then(zodiac => {
      if (zodiac) setUserZodiac(zodiac);
    });
  }, []);

    // Example: Simulate chat time increase
  useEffect(() => {
    const timer = setInterval(() => {
      setChatTime(prev => prev + 1);
    }, 60000); // 1 minute
    return () => clearInterval(timer);
  }, []);

  // Check condition when chat time changes
  useEffect(() => {
    if (chatTime >= 10 && !meetChatCondition) {
      setShowFreeCardOffer(true);
      setMeetChatCondition(true); // prevents it from showing again immediately
    }
  }, [chatTime, meetChatCondition]);

  const handleClaimNow = () => {
    navigation.navigate('TarotGame', {
      zodiac: 'aries', // replace with your userZodiac
      free: true,
    });
    setShowFreeCardOffer(false);
    // Reset so it can show again later if condition meets again
    setMeetChatCondition(false);
    setChatTime(0);
  };

  const startTimer = () => {
    if (timerRef.current) return;

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const updated = prev + 1;
        AsyncStorage.setItem("@elapsed_seconds", updated.toString());


        if (updated >= SESSION_LIMIT) {
          stopTimer();
          setIsSessionActive(false);
          setShowPaymentPopup(true);
        }

        return updated;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

const sendMessage = async () => {
  if (!inputText.trim() || !isSessionActive) return;

  const userMsg = {
    id: Date.now().toString(),
    sender: "user",
    text: inputText,
  };

  const updatedUserMsgs = [...messages, userMsg];
  setMessages(updatedUserMsgs);
  saveSession(updatedUserMsgs);
  setInputText("");
  setLoading(true);

  try {
    // Detect input language dynamically
    const detectLang = (text) => {
      const hasChinese = /[\u4e00-\u9fff]/.test(text);
      return hasChinese ? "zh" : "en";
    };
    const langCode = detectLang(inputText);
    console.log("🌐 Detected language:", langCode);

    // Get bot profile from storage
    let customPromptEn = "You are Luna, a tarot bot with a Love style. Always reply in that tone.";
    let customPromptZh = "你是露娜，一位神秘的爱情塔罗占卜师。请始终用中文回答，风格要温柔浪漫，像是在倾诉爱情的诗人。";

    try {
      const botProfile = await AsyncStorage.getItem("@tarot_bot");
      if (botProfile) {
        const parsed = JSON.parse(botProfile);
        if (langCode === "en") {
          customPromptEn = `You are ${parsed.name}, a tarot bot with a ${parsed.style} style. Always reply in that tone.`;
        } else {
          customPromptZh = `你是${parsed.name}，一位${parsed.style}的塔罗占卜师。请始终用中文回答，并保持这种语气。`;
        }
      }
    } catch (err) {
      console.warn("⚠️ Could not load custom bot profile:", err);
    }

    const systemPrompt = langCode === "en" ? customPromptEn : customPromptZh;

    const payload = {
      lang: langCode,
      question: inputText,
      system: systemPrompt,
    };

    console.log("🔍 Sending payload to API:", payload);

    const response = await axios.post(
      "https://backend-tarot-app.netlify.app/.netlify/functions/tarot-bot",
      payload
    );

    const botText =
      (response?.data?.answer && String(response.data.answer).trim()) ||
      (response?.data?.reply && String(response.data.reply).trim()) ||
      (response?.data?.message && String(response.data.message).trim()) ||
      // "🤖 No response from the Tarot bot.";
      i18n.t("no_response");

    const botMsg = {
      id: Date.now().toString() + "-bot",
      sender: "bot",
      text: botText,
    };

    const updatedBotMsgs = [...updatedUserMsgs, botMsg];
    setMessages(updatedBotMsgs);
    saveSession(updatedBotMsgs);
  } catch (error) {
    console.error("[API Error]", error.response?.data || error.message);
    // Alert.alert("Error", "Failed to get a reply from the Tarot AI.");
    Alert.alert(i18n.t("error"), i18n.t("failed_reply"));
  } finally {
    setLoading(false);
  }
};



  const saveSession = async (updatedMessages) => {
    try {
      await AsyncStorage.setItem(sessionId, JSON.stringify(updatedMessages));
      const raw = await AsyncStorage.getItem("@chat_sessions");
      const sessions = raw ? JSON.parse(raw) : [];
      const exists = sessions.find((s) => s.id === sessionId);
      if (!exists) {
        const firstLine =
          inputText.length > 40 ? inputText.slice(0, 40) + "…" : inputText;
        sessions.push({
          id: sessionId,
          title: firstLine || "Untitled Tarot Chat",
        });
        await AsyncStorage.setItem("@chat_sessions", JSON.stringify(sessions));
      }
    } catch (e) {
      console.error("Failed to save session:", e);
    }
  };

  // 🔁 Deduct balance from backend, not just locally
  const deductBalanceFromBackend = async (amount) => {
    try {
      const userId = await AsyncStorage.getItem("@user_id");
      if (!userId) {
        // Alert.alert("Missing User ID");
        Alert.alert(i18n.t("missing_user_id"));
        return false;
      }

      const res = await axios.post(
        "https://backend-tarot-app.netlify.app/.netlify/functions/deduct-balance",
        { userId, amount }
      );

      if (res.data?.balance !== undefined) {
        await AsyncStorage.setItem("@wallet_balance", res.data.balance.toString());
        setWalletBalance(res.data.balance);
        return true;
      } else {
        // Alert.alert("❌ Error", res.data.error || "Failed to deduct balance");
        Alert.alert(i18n.t("error"), res.data.error || i18n.t("deduct_failed"));
        return false;
      }
    } catch (err) {
      console.error("❌ Deduction error:", err.message);
      // Alert.alert("❌ Error", err.message || "Deduction failed");
      Alert.alert(i18n.t("error"), err.message || i18n.t("deduct_failed"));
      return false;
    }
  };

  const handleRecharge = async () => {
    try {
      const success = await deductBalanceFromBackend(6);

      if (success) {
        const newElapsed = elapsedSeconds - 60;
        const updatedElapsed = newElapsed < 0 ? 0 : newElapsed;

        setElapsedSeconds(updatedElapsed);
        await AsyncStorage.setItem("@elapsed_seconds", updatedElapsed.toString());

        setIsSessionActive(true);
        setShowPaymentPopup(false);

        startTimer();

        // Alert.alert("✅ 6 RMB Used", "1 more minute added.");
        Alert.alert(i18n.t("recharged"), i18n.t("minute_added"));
      } else {
        // Alert.alert("💰 Not Enough Balance", "Please recharge to continue.");
        Alert.alert(i18n.t("noBalance"), i18n.t("recahargeit"));
      }
    } catch (e) {
      console.error("Recharge error:", e);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageRow,
        item.sender === "user" ? styles.userRow : styles.botRow,
      ]}
    >
      <View style={styles.avatarCircle}>
        <Text style={{ fontSize: 20 }}>
          {item.sender === "user" ? "🧑" : "🔮"}
        </Text>
      </View>
      <View
        style={[
          styles.messageBubble,
          item.sender === "user" ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: isDark ? "#1e1e1e" : "#f8f8f8" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {isSessionActive && (
        <Text style={{ textAlign: "center", color: "#aaa", marginTop: 10 }}>
          ⏳ {Math.max(0, SESSION_LIMIT - elapsedSeconds)}s {i18n.t("left_in_session")}
        </Text>
      )}

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
      />

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#f8e1c1" />
          <Text style={{ color: "#aaa", marginLeft: 10 }}>
           {i18n.t("thinking")}
          </Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={i18n.t("ask_placeholder")}
          placeholderTextColor="#aaa"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={[styles.sendButton, !isSessionActive && { opacity: 0.5 }]}
          disabled={!isSessionActive}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>

{/* Inside your component */}
 <Modal
        visible={showFreeCardOffer}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFreeCardOffer(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 10,
              alignItems: 'center',
              width: '80%',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              🎁 {i18n.t("free_tarot_title")}
            </Text>
            <Text style={{ marginBottom: 20 }}>
              {i18n.t("free_tarot_desc")}
            </Text>

            <TouchableOpacity
              onPress={handleClaimNow}
              style={{
                backgroundColor: '#8e44ad',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{i18n.t("claim_now")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      </View>

      {showPaymentPopup && (
        <View style={styles.popup}>
          <Text style={styles.popupText}>🔮 {i18n.t("session_ended")}</Text>
          <Text style={styles.popupText}>{i18n.t("recharge_prompt")}</Text>
          <Text style={[styles.popupText, { marginTop: 6 }]}>
            {i18n.t("wallet_balance")} {walletBalance} RMB
          </Text>
          <TouchableOpacity
            style={styles.rechargeButton}
            onPress={handleRecharge}
          >
            <Text style={styles.rechargeText}>{i18n.t("recharge_now")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  messagesContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-end",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  botRow: {
    justifyContent: "flex-start",
  },
  avatarCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#3b3857",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 14,
  },
  userBubble: {
    backgroundColor: "#7D5A50",
    alignSelf: "flex-end",
  },
  botBubble: {
    backgroundColor: "#4e446e",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingLeft: 20,
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "#2d2b4e",
    paddingHorizontal: 12,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: "#444",
    alignItems: "center",
    width: "100%",
    height: 100,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#3b3857",
    borderRadius: 20,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#A26769",
    padding: 10,
    borderRadius: 20,
  },
  popup: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    backgroundColor: "#2c2c4e",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    zIndex: 99,
  },
  popupText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 5,
  },
  rechargeButton: {
    backgroundColor: "#f8e1c1",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 12,
  },
  rechargeText: {
    color: "#2c2c4e",
    fontWeight: "bold",
  },
  freeCardOffer: {
  backgroundColor: "#f8e1c1",
  padding: 15,
  borderRadius: 12,
  margin: 12,
  alignItems: "center",
  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
},
freeCardTitle: {
  fontSize: 18,
  fontWeight: "bold",
  color: "#2c2c4e",
  marginBottom: 6,
},
freeCardDesc: {
  fontSize: 14,
  color: "#444",
  textAlign: "center",
},

});


// import React, { useState, useEffect, useCallback, useRef, useContext } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useFocusEffect } from "@react-navigation/native";
// import i18n from "../utils/i18n";
// import { ThemeContext } from "../context/ThemeContext";

// export default function ChatScreen() {
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [elapsedSeconds, setElapsedSeconds] = useState(0);
//   const [isSessionActive, setIsSessionActive] = useState(false);
//   const [showPaymentPopup, setShowPaymentPopup] = useState(false);
//   const [walletBalance, setWalletBalance] = useState(0);
//   const [sessionId, setSessionId] = useState("");

//   const { theme } = useContext(ThemeContext);
//   const isDark = theme === "dark";
//   const timerRef = useRef(null);

//   const SESSION_LIMIT = 180;

//   const generateSessionId = () => `session_${Date.now()}`;

//   useEffect(() => {
//     const createSession = async () => {
//       const id = generateSessionId();
//       setSessionId(id);
//       await AsyncStorage.setItem("@current_session_id", id);
//     };
//     createSession();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       let isMounted = true;

//       const loadSession = async () => {
//         const id = await AsyncStorage.getItem("@current_session_id");
//         if (id) {
//           const saved = await AsyncStorage.getItem(id);
//           if (saved && isMounted) {
//             setMessages(JSON.parse(saved));
//           }
//           setSessionId(id);
//         }

//         const balance = await AsyncStorage.getItem("@wallet_balance");
//         setWalletBalance(balance ? parseInt(balance) : 0);

//         const hasUsedFree = await AsyncStorage.getItem("@has_used_free_session");
//         const storedElapsed = await AsyncStorage.getItem("@elapsed_seconds");

//         const previouslyElapsed = storedElapsed ? parseInt(storedElapsed) : 0;
//         setElapsedSeconds(previouslyElapsed);

//         if (!hasUsedFree) {
//           await AsyncStorage.setItem("@has_used_free_session", "true");
//           await AsyncStorage.setItem("@elapsed_seconds", "0");
//           setElapsedSeconds(0);
//           setIsSessionActive(true);
//           setShowPaymentPopup(false);
//         } else if (previouslyElapsed >= SESSION_LIMIT) {
//           setIsSessionActive(false);
//           setShowPaymentPopup(true);
//         } else {
//           setIsSessionActive(true);
//           setShowPaymentPopup(false);
//         }

//         startTimer();
//       };

//       loadSession();

//       return () => {
//         isMounted = false;
//         stopTimer();
//       };
//     }, [])
//   );

//   const startTimer = () => {
//     if (timerRef.current) return;

//     timerRef.current = setInterval(() => {
//       setElapsedSeconds((prev) => {
//         const updated = prev + 1;
//         AsyncStorage.setItem("@elapsed_seconds", updated.toString());

//         if (updated >= SESSION_LIMIT) {
//           stopTimer();
//           setIsSessionActive(false);
//           setShowPaymentPopup(true);
//         }

//         return updated;
//       });
//     }, 1000);
//   };

//   const stopTimer = () => {
//     if (timerRef.current) {
//       clearInterval(timerRef.current);
//       timerRef.current = null;
//     }
//   };

//   const sendMessage = async () => {
//     if (!inputText.trim() || !isSessionActive) return;

//     const userMsg = {
//       id: Date.now().toString(),
//       sender: "user",
//       text: inputText,
//     };

//     const updatedUserMsgs = [...messages, userMsg];
//     setMessages(updatedUserMsgs);
//     saveSession(updatedUserMsgs);
//     setInputText("");
//     setLoading(true);

//     let customPrompt = "You are a wise tarot reader.";
//     try {
//       const botProfile = await AsyncStorage.getItem("@tarot_bot");
//       if (botProfile) {
//         const parsed = JSON.parse(botProfile);
//         customPrompt = `You are ${parsed.name}, a tarot bot with a ${parsed.style} style. Always reply in that tone.`;
//       }
//     } catch {}

//     try {
//       const response = await axios.post(
//         "https://backend-tarot.netlify.app/.netlify/functions/tarot-bot",
//         {
//           prompt: inputText,
//           system: customPrompt,
//         }
//       );

//       const botMsg = {
//         id: Date.now().toString() + "-bot",
//         sender: "bot",
//         text: response.data.reply,
//       };

//       const updatedBotMsgs = [...updatedUserMsgs, botMsg];
//       setMessages(updatedBotMsgs);
//       saveSession(updatedBotMsgs);
//     } catch (error) {
//       console.error("[API Error]", error.message);
//       Alert.alert("Error", "Failed to get a reply from the Tarot AI.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const saveSession = async (updatedMessages) => {
//     try {
//       await AsyncStorage.setItem(sessionId, JSON.stringify(updatedMessages));
//       const raw = await AsyncStorage.getItem("@chat_sessions");
//       const sessions = raw ? JSON.parse(raw) : [];
//       const exists = sessions.find((s) => s.id === sessionId);
//       if (!exists) {
//         const firstLine =
//           inputText.length > 40 ? inputText.slice(0, 40) + "…" : inputText;
//         sessions.push({
//           id: sessionId,
//           title: firstLine || "Untitled Tarot Chat",
//         });
//         await AsyncStorage.setItem("@chat_sessions", JSON.stringify(sessions));
//       }
//     } catch (e) {
//       console.error("Failed to save session:", e);
//     }
//   };

//   // 🔁 Deduct balance from backend, not just locally
//   const deductBalanceFromBackend = async (amount) => {
//     try {
//       const userId = await AsyncStorage.getItem("@user_id");
//       if (!userId) {
//         Alert.alert("Missing User ID");
//         return false;
//       }

//       const res = await axios.post(
//         "https://backend-tarot-app.netlify.app/.netlify/functions/deduct-balance",
//         { userId, amount }
//       );

//       if (res.data?.balance !== undefined) {
//         await AsyncStorage.setItem("@wallet_balance", res.data.balance.toString());
//         setWalletBalance(res.data.balance);
//         return true;
//       } else {
//         Alert.alert("❌ Error", res.data.error || "Failed to deduct balance");
//         return false;
//       }
//     } catch (err) {
//       console.error("❌ Deduction error:", err.message);
//       Alert.alert("❌ Error", err.message || "Deduction failed");
//       return false;
//     }
//   };

//   const handleRecharge = async () => {
//     try {
//       const success = await deductBalanceFromBackend(6);

//       if (success) {
//         const newElapsed = elapsedSeconds - 60;
//         const updatedElapsed = newElapsed < 0 ? 0 : newElapsed;

//         setElapsedSeconds(updatedElapsed);
//         await AsyncStorage.setItem("@elapsed_seconds", updatedElapsed.toString());

//         setIsSessionActive(true);
//         setShowPaymentPopup(false);

//         startTimer();

//         Alert.alert("✅ 6 RMB Used", "1 more minute added.");
//       } else {
//         Alert.alert("💰 Not Enough Balance", "Please recharge to continue.");
//       }
//     } catch (e) {
//       console.error("Recharge error:", e);
//     }
//   };

//   const renderMessage = ({ item }) => (
//     <View
//       style={[
//         styles.messageRow,
//         item.sender === "user" ? styles.userRow : styles.botRow,
//       ]}
//     >
//       <View style={styles.avatarCircle}>
//         <Text style={{ fontSize: 20 }}>
//           {item.sender === "user" ? "🧑" : "🔮"}
//         </Text>
//       </View>
//       <View
//         style={[
//           styles.messageBubble,
//           item.sender === "user" ? styles.userBubble : styles.botBubble,
//         ]}
//       >
//         <Text style={styles.messageText}>{item.text}</Text>
//       </View>
//     </View>
//   );

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, backgroundColor: isDark ? "#1e1e1e" : "#f8f8f8" }}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       {isSessionActive && (
//         <Text style={{ textAlign: "center", color: "#aaa", marginTop: 10 }}>
//           ⏳ {Math.max(0, SESSION_LIMIT - elapsedSeconds)}s left in this session
//         </Text>
//       )}

//       <FlatList
//         data={messages}
//         renderItem={renderMessage}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.messagesContainer}
//       />

//       {loading && (
//         <View style={styles.loadingRow}>
//           <ActivityIndicator size="small" color="#f8e1c1" />
//           <Text style={{ color: "#aaa", marginLeft: 10 }}>
//             Tarot Bot is thinking...
//           </Text>
//         </View>
//       )}

//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder={i18n.t("ask_placeholder")}
//           placeholderTextColor="#aaa"
//           value={inputText}
//           onChangeText={setInputText}
//         />
//         <TouchableOpacity
//           onPress={sendMessage}
//           style={[styles.sendButton, !isSessionActive && { opacity: 0.5 }]}
//           disabled={!isSessionActive}
//         >
//           <Ionicons name="send" size={20} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {showPaymentPopup && (
//         <View style={styles.popup}>
//           <Text style={styles.popupText}>🔮 Your session has ended.</Text>
//           <Text style={styles.popupText}>Recharge 6 RMB to continue.</Text>
//           <Text style={[styles.popupText, { marginTop: 6 }]}>
//             Wallet Balance: {walletBalance} RMB
//           </Text>
//           <TouchableOpacity
//             style={styles.rechargeButton}
//             onPress={handleRecharge}
//           >
//             <Text style={styles.rechargeText}>Recharge Now</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   messagesContainer: {
//     padding: 16,
//     paddingBottom: 80,
//   },
//   messageRow: {
//     flexDirection: "row",
//     marginBottom: 10,
//     alignItems: "flex-end",
//   },
//   userRow: {
//     justifyContent: "flex-end",
//   },
//   botRow: {
//     justifyContent: "flex-start",
//   },
//   avatarCircle: {
//     width: 35,
//     height: 35,
//     borderRadius: 18,
//     backgroundColor: "#3b3857",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 8,
//   },
//   messageBubble: {
//     maxWidth: "75%",
//     padding: 12,
//     borderRadius: 14,
//   },
//   userBubble: {
//     backgroundColor: "#7D5A50",
//     alignSelf: "flex-end",
//   },
//   botBubble: {
//     backgroundColor: "#4e446e",
//     alignSelf: "flex-start",
//   },
//   messageText: {
//     color: "#fff",
//     fontSize: 16,
//     lineHeight: 22,
//   },
//   loadingRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 12,
//     paddingLeft: 20,
//   },
//   inputContainer: {
//     position: "absolute",
//     bottom: 0,
//     flexDirection: "row",
//     backgroundColor: "#2d2b4e",
//     paddingHorizontal: 12,
//     paddingVertical: 20,
//     borderTopWidth: 1,
//     borderColor: "#444",
//     alignItems: "center",
//     width: "100%",
//     height: 100,
//   },
//   input: {
//     flex: 1,
//     color: "#fff",
//     fontSize: 16,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     backgroundColor: "#3b3857",
//     borderRadius: 20,
//     marginRight: 8,
//   },
//   sendButton: {
//     backgroundColor: "#A26769",
//     padding: 10,
//     borderRadius: 20,
//   },
//   popup: {
//     position: "absolute",
//     top: "30%",
//     left: "10%",
//     right: "10%",
//     backgroundColor: "#2c2c4e",
//     padding: 20,
//     borderRadius: 10,
//     alignItems: "center",
//     zIndex: 99,
//   },
//   popupText: {
//     color: "#fff",
//     fontSize: 16,
//     textAlign: "center",
//     marginVertical: 5,
//   },
//   rechargeButton: {
//     backgroundColor: "#f8e1c1",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//     marginTop: 12,
//   },
//   rechargeText: {
//     color: "#2c2c4e",
//     fontWeight: "bold",
//   },
// });


// import React, { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useFocusEffect } from "@react-navigation/native";
// import i18n from '../utils/i18n';
// import { useContext } from 'react';
// import { ThemeContext } from '../context/ThemeContext';

// export default function ChatScreen() {
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [secondsElapsed, setSecondsElapsed] = useState(0);
//   const [timer, setTimer] = useState(null);
//   const [showPaymentPopup, setShowPaymentPopup] = useState(false);
//   const [isSessionActive, setIsSessionActive] = useState(true);
//   const [walletBalance, setWalletBalance] = useState(0);
//   const [sessionId, setSessionId] = useState("");

//   const { theme } = useContext(ThemeContext);
// const isDark = theme === 'dark';

//   const generateSessionId = () => `session_${Date.now()}`;

//   // Setup new session on first load
//   useEffect(() => {
//     const startSession = async () => {
//       const id = generateSessionId();
//       setSessionId(id);
//       await AsyncStorage.setItem("@current_session_id", id);
//     };
//     startSession();
//   }, []);

//   // Load session messages
//   useFocusEffect(
//     useCallback(() => {
//       const loadSession = async () => {
//         const currentId = await AsyncStorage.getItem("@current_session_id");
//         if (currentId) {
//           const saved = await AsyncStorage.getItem(currentId);
//           if (saved) setMessages(JSON.parse(saved));
//           setSessionId(currentId);
//         }
//       };
//       loadSession();
//     }, [])
//   );

//   // Stop after 60 seconds
//   useEffect(() => {
//     if (secondsElapsed >= 60) {
//       clearInterval(timer);
//       setIsSessionActive(false);
//       setShowPaymentPopup(true);
//     }
//   }, [secondsElapsed]);

//   // Show wallet
//   useEffect(() => {
//     if (showPaymentPopup) {
//       const fetchWallet = async () => {
//         const val = await AsyncStorage.getItem("@wallet_balance");
//         setWalletBalance(val ? parseInt(val) : 0);
//       };
//       fetchWallet();
//     }
//   }, [showPaymentPopup]);

//   const startSessionTimer = () => {
//     if (!timer) {
//       const newTimer = setInterval(() => {
//         setSecondsElapsed((prev) => prev + 1);
//       }, 1000);
//       setTimer(newTimer);
//     }
//   };

//   const saveSession = async (updatedMessages) => {
//     try {
//       await AsyncStorage.setItem(sessionId, JSON.stringify(updatedMessages));

//       // Update session list
//       const raw = await AsyncStorage.getItem("@chat_sessions");
//       const sessions = raw ? JSON.parse(raw) : [];
//       const exists = sessions.find((s) => s.id === sessionId);
//       if (!exists) {
//         const firstLine =
//           inputText.length > 40 ? inputText.slice(0, 40) + "…" : inputText;
//         sessions.push({
//           id: sessionId,
//           title: firstLine || "Untitled Tarot Chat",
//         });
//         await AsyncStorage.setItem("@chat_sessions", JSON.stringify(sessions));
//       }
//     } catch (e) {
//       console.error("Failed to save session:", e);
//     }
//   };

//   const sendMessage = async () => {
//     if (!inputText.trim() || !isSessionActive) return;

//     const userMsg = {
//       id: Date.now().toString(),
//       sender: "user",
//       text: inputText,
//     };

//     const updatedUserMsgs = [...messages, userMsg];
//     setMessages(updatedUserMsgs);
//     saveSession(updatedUserMsgs);
//     setInputText("");
//     setLoading(true);

//     startSessionTimer();

//     let customPrompt = "You are a wise tarot reader.";
//     try {
//       const botProfile = await AsyncStorage.getItem("@tarot_bot");
//       if (botProfile) {
//         const parsed = JSON.parse(botProfile);
//         customPrompt = `You are ${parsed.name}, a tarot bot with a ${parsed.style} style. Always reply in that tone.`;
//       }
//     } catch {
//       console.warn("No custom prompt found.");
//     }

//     try {
//       const response = await axios.post(
//         "https://backend-tarot.netlify.app/.netlify/functions/tarot-bot",
//         {
//           prompt: inputText,
//           system: customPrompt,
//         }
//       );

//       const botMsg = {
//         id: Date.now().toString() + "-bot",
//         sender: "bot",
//         text: response.data.reply,
//       };

//       const updatedBotMsgs = [...updatedUserMsgs, botMsg];
//       setMessages(updatedBotMsgs);
//       saveSession(updatedBotMsgs);
//     } catch (error) {
//       console.error("[API Error]", error.message);
//       Alert.alert("Error", "Failed to get a reply from the Tarot AI.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRecharge = async () => {
//     try {
//       const val = await AsyncStorage.getItem("@wallet_balance");
//       const balance = val ? parseInt(val) : 0;

//       if (balance >= 1) {
//         const newBalance = balance - 5;
//         await AsyncStorage.setItem("@wallet_balance", newBalance.toString());
//         setWalletBalance(newBalance);

//         setShowPaymentPopup(false);
//         setIsSessionActive(true);
//         setSecondsElapsed(0);

//         const newTimer = setInterval(() => {
//           setSecondsElapsed((prev) => prev + 1);
//         }, 1000);
//         setTimer(newTimer);

//         Alert.alert("✅ 5 RMB Used", "1 more minute added.");
//       } else {
//         Alert.alert("💰 Not Enough Balance", "Please recharge to continue.");
//       }
//     } catch (e) {
//       console.error("Recharge error:", e);
//     }
//   };

//   const renderMessage = ({ item }) => (
//     <View
//       style={[
//         styles.messageRow,
//         item.sender === "user" ? styles.userRow : styles.botRow,
//       ]}
//     >
//       <View style={styles.avatarCircle}>
//         <Text style={{ fontSize: 20 }}>
//           {item.sender === "user" ? "🧑" : "🔮"}
//         </Text>
//       </View>
//       <View
//         style={[
//           styles.messageBubble,
//           item.sender === "user" ? styles.userBubble : styles.botBubble,
//         ]}
//       >
//         <Text style={styles.messageText}>{item.text}</Text>
//       </View>
//     </View>
//   );

//   return (
//     <KeyboardAvoidingView  style={{flex: 1, backgroundColor: isDark ? "#1e1e1e" : "#f8f8f8"}}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       {isSessionActive && (
//         <Text style={{ textAlign: "center", color: "#aaa", marginTop: 10 }}>
//           ⏳ {60 - secondsElapsed}s left in this session
//         </Text>
//       )}

//       <FlatList
//         data={messages}
//         renderItem={renderMessage}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.messagesContainer}
//       />

//       {loading && (
//         <View style={styles.loadingRow}>
//           <ActivityIndicator size="small" color="#f8e1c1" />
//           <Text style={{ color: "#aaa", marginLeft: 10 }}>
//             Tarot Bot is thinking...
//           </Text>
//         </View>
//       )}

//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder={i18n.t('ask_placeholder')}
//           placeholderTextColor="#aaa"
//           value={inputText}
//           onChangeText={setInputText}
//         />
//         <TouchableOpacity
//           onPress={sendMessage}
//           style={[styles.sendButton, !isSessionActive && { opacity: 0.5 }]}
//           disabled={!isSessionActive}
//         >
//           <Ionicons name="send" size={20} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {showPaymentPopup && (
//         <View style={styles.popup}>
//           <Text style={styles.popupText}>🔮 Your free session has ended.</Text>
//           <Text style={styles.popupText}>Recharge to continue chatting.</Text>
//           <Text style={[styles.popupText, { marginTop: 6 }]}>
//             Wallet Balance: {walletBalance} RMB
//           </Text>
//           <TouchableOpacity
//             style={styles.rechargeButton}
//             onPress={handleRecharge}
//           >
//             <Text style={styles.rechargeText}>Recharge Now</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   messagesContainer: {
//     padding: 16,
//     paddingBottom: 80,
//   },
//   messageRow: {
//     flexDirection: "row",
//     marginBottom: 10,
//     alignItems: "flex-end",
//   },
//   userRow: {
//     justifyContent: "flex-end",
//   },
//   botRow: {
//     justifyContent: "flex-start",
//   },
//   avatarCircle: {
//     width: 35,
//     height: 35,
//     borderRadius: 18,
//     backgroundColor: "#3b3857",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 8,
//   },
//   messageBubble: {
//     maxWidth: "75%",
//     padding: 12,
//     borderRadius: 14,
//   },
//   userBubble: {
//     backgroundColor: "#7D5A50",
//     alignSelf: "flex-end",
//   },
//   botBubble: {
//     backgroundColor: "#4e446e",
//     alignSelf: "flex-start",
//   },
//   messageText: {
//     color: "#fff",
//     fontSize: 16,
//     lineHeight: 22,
//   },
//   loadingRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 12,
//     paddingLeft: 20,
//   },
//   inputContainer: {
//     position: "absolute",
//     bottom: 0,
//     flexDirection: "row",
//     backgroundColor: "#2d2b4e",
//     paddingHorizontal: 12,
//     paddingVertical: 20,
//     borderTopWidth: 1,
//     borderColor: "#444",
//     alignItems: "center",
//     width: "100%",
//     height: 100,
//   },
//   input: {
//     flex: 1,
//     color: "#fff",
//     fontSize: 16,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     backgroundColor: "#3b3857",
//     borderRadius: 20,
//     marginRight: 8,
//   },
//   sendButton: {
//     backgroundColor: "#A26769",
//     padding: 10,
//     borderRadius: 20,
//   },
//   popup: {
//     position: "absolute",
//     top: "30%",
//     left: "10%",
//     right: "10%",
//     backgroundColor: "#2c2c4e",
//     padding: 20,
//     borderRadius: 10,
//     alignItems: "center",
//     zIndex: 99,
//   },
//   popupText: {
//     color: "#fff",
//     fontSize: 16,
//     textAlign: "center",
//     marginVertical: 5,
//   },
//   rechargeButton: {
//     backgroundColor: "#f8e1c1",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//     marginTop: 12,
//   },
//   rechargeText: {
//     color: "#2c2c4e",
//     fontWeight: "bold",
//   },
// });
