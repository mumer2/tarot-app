import React, { useState, useEffect, useCallback } from "react";
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
import i18n from '../utils/i18n';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timer, setTimer] = useState(null);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [sessionId, setSessionId] = useState("");

  const { theme } = useContext(ThemeContext);
const isDark = theme === 'dark';

  const generateSessionId = () => `session_${Date.now()}`;

  // Setup new session on first load
  useEffect(() => {
    const startSession = async () => {
      const id = generateSessionId();
      setSessionId(id);
      await AsyncStorage.setItem("@current_session_id", id);
    };
    startSession();
  }, []);

  // Load session messages
  useFocusEffect(
    useCallback(() => {
      const loadSession = async () => {
        const currentId = await AsyncStorage.getItem("@current_session_id");
        if (currentId) {
          const saved = await AsyncStorage.getItem(currentId);
          if (saved) setMessages(JSON.parse(saved));
          setSessionId(currentId);
        }
      };
      loadSession();
    }, [])
  );

  // Stop after 60 seconds
  useEffect(() => {
    if (secondsElapsed >= 60) {
      clearInterval(timer);
      setIsSessionActive(false);
      setShowPaymentPopup(true);
    }
  }, [secondsElapsed]);

  // Show wallet
  useEffect(() => {
    if (showPaymentPopup) {
      const fetchWallet = async () => {
        const val = await AsyncStorage.getItem("@wallet_balance");
        setWalletBalance(val ? parseInt(val) : 0);
      };
      fetchWallet();
    }
  }, [showPaymentPopup]);

  const startSessionTimer = () => {
    if (!timer) {
      const newTimer = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
      setTimer(newTimer);
    }
  };

  const saveSession = async (updatedMessages) => {
    try {
      await AsyncStorage.setItem(sessionId, JSON.stringify(updatedMessages));

      // Update session list
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

    startSessionTimer();

    let customPrompt = "You are a wise tarot reader.";
    try {
      const botProfile = await AsyncStorage.getItem("@tarot_bot");
      if (botProfile) {
        const parsed = JSON.parse(botProfile);
        customPrompt = `You are ${parsed.name}, a tarot bot with a ${parsed.style} style. Always reply in that tone.`;
      }
    } catch {
      console.warn("No custom prompt found.");
    }

    try {
      const response = await axios.post(
        "https://backend-tarot.netlify.app/.netlify/functions/tarot-bot",
        {
          prompt: inputText,
          system: customPrompt,
        }
      );

      const botMsg = {
        id: Date.now().toString() + "-bot",
        sender: "bot",
        text: response.data.reply,
      };

      const updatedBotMsgs = [...updatedUserMsgs, botMsg];
      setMessages(updatedBotMsgs);
      saveSession(updatedBotMsgs);
    } catch (error) {
      console.error("[API Error]", error.message);
      Alert.alert("Error", "Failed to get a reply from the Tarot AI.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    try {
      const val = await AsyncStorage.getItem("@wallet_balance");
      const balance = val ? parseInt(val) : 0;

      if (balance >= 1) {
        const newBalance = balance - 5;
        await AsyncStorage.setItem("@wallet_balance", newBalance.toString());
        setWalletBalance(newBalance);

        setShowPaymentPopup(false);
        setIsSessionActive(true);
        setSecondsElapsed(0);

        const newTimer = setInterval(() => {
          setSecondsElapsed((prev) => prev + 1);
        }, 1000);
        setTimer(newTimer);

        Alert.alert("✅ 5 RMB Used", "1 more minute added.");
      } else {
        Alert.alert("💰 Not Enough Balance", "Please recharge to continue.");
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
    <KeyboardAvoidingView  style={{flex: 1, backgroundColor: isDark ? "#1e1e1e" : "#f8f8f8"}}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {isSessionActive && (
        <Text style={{ textAlign: "center", color: "#aaa", marginTop: 10 }}>
          ⏳ {60 - secondsElapsed}s left in this session
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
            Tarot Bot is thinking...
          </Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={i18n.t('ask_placeholder')}
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
      </View>

      {showPaymentPopup && (
        <View style={styles.popup}>
          <Text style={styles.popupText}>🔮 Your free session has ended.</Text>
          <Text style={styles.popupText}>Recharge to continue chatting.</Text>
          <Text style={[styles.popupText, { marginTop: 6 }]}>
            Wallet Balance: {walletBalance} RMB
          </Text>
          <TouchableOpacity
            style={styles.rechargeButton}
            onPress={handleRecharge}
          >
            <Text style={styles.rechargeText}>Recharge Now</Text>
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
});
