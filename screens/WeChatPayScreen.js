import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function WeChatPayScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { amount } = route.params;
  const [loading, setLoading] = useState(true);

  const startPayment = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("@user_id");
      if (!userId) return Alert.alert("Error", "User ID missing");

      const res = await axios.post(
        "https://backend-tarot-app.netlify.app/.netlify/functions/wechat-pay",
        { amount: Math.round(Number(amount) * 100), userId } // RMB to cents
      );

      if (res.data?.paymentUrl) {
        await AsyncStorage.setItem("@last_order_amount", amount.toString());
        const supported = await Linking.canOpenURL(res.data.paymentUrl);
        supported
          ? Linking.openURL(res.data.paymentUrl)
          : Alert.alert("WeChat Pay", "Cannot open payment page");
      } else {
        Alert.alert("WeChat Pay", res.data.error || "Payment URL missing");
      }
    } catch (err) {
      console.error("WeChat Pay Error:", err);
      Alert.alert("WeChat Pay Error", err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startPayment();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <>
          <ActivityIndicator size="large" color="#07C160" />
          <Text style={styles.text}>Redirecting to WeChat Pay...</Text>
        </>
      ) : (
        <>
          <Text style={styles.heading}>WeChat Payment</Text>
          <Text style={styles.subText}>
            If the payment page did not open automatically, you can retry below.
          </Text>

          <TouchableOpacity style={styles.primaryButton} onPress={startPayment}>
            <Text style={styles.primaryButtonText}>Retry Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
    color: "#111827",
    textAlign: "center",
  },
  subText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  text: {
    marginTop: 15,
    textAlign: "center",
    fontSize: 16,
    color: "#374151",
  },
  primaryButton: {
    backgroundColor: "#07C160", // WeChat green
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: width * 0.8,
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: width * 0.8,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "500",
  },
});



// import React, { useEffect, useState } from "react";
// import { View, Text, ActivityIndicator, Alert, StyleSheet, Button, Linking } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";

// export default function WeChatPayScreen() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { amount } = route.params;
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const startPayment = async () => {
//       try {
//         const userId = await AsyncStorage.getItem("@user_id");
//         if (!userId) return Alert.alert("Error", "User ID missing");

//         const res = await axios.post(
//           "https://backend-tarot-app.netlify.app/.netlify/functions/wechat-pay",
//           { amount: amount * 100, userId } // convert RMB to cents
//         );

//         if (res.data?.paymentUrl) {
//           await AsyncStorage.setItem("@last_order_amount", amount.toString());

//           const supported = await Linking.canOpenURL(res.data.paymentUrl);
//           supported
//             ? Linking.openURL(res.data.paymentUrl)
//             : Alert.alert("WeChat Pay", "Cannot open payment page");
//         } else {
//           Alert.alert("WeChat Pay", res.data.error || "Payment URL missing");
//         }
//       } catch (err) {
//         console.error("WeChat Pay Error:", err);
//         Alert.alert("WeChat Pay Error", err.message || "Unexpected error");
//       } finally {
//         setLoading(false);
//       }
//     };

//     startPayment();
//   }, []);

//   return (
//     <View style={styles.container}>
//       {loading ? (
//         <>
//           <ActivityIndicator size="large" color="#7bb32e" />
//           <Text style={styles.text}>Redirecting to WeChat Pay...</Text>
//         </>
//       ) : (
//         <>
//           <Text style={styles.text}>If payment did not open, press below to retry.</Text>
//           <Button title="Go Back" onPress={() => navigation.goBack()} />
//         </>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
//   text: { marginTop: 20, textAlign: "center", fontSize: 16 },
// });
