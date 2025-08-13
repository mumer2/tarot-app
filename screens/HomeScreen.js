import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  FontAwesome,
} from "@expo/vector-icons";

import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import i18n from "../utils/i18n";
import { LanguageContext } from "../context/LanguageContext";

export default function HomeScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const isDark = theme === "dark";
  const { language } = useContext(LanguageContext);
i18n.locale = language;


  const profileImageUri = user?.profilePic || null;
  const [localName, setLocalName] = useState("User");

  useEffect(() => {
    const fetchUserName = async () => {
      const storedName = await AsyncStorage.getItem("userName");
      if (storedName) {
        setLocalName(storedName.trim());
      }
    };
    fetchUserName();
  }, []);

  const username = user?.name?.trim() || localName;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1e1e1e" : "#ffffff" },
      ]}
      edges={["left", "right", "bottom"]}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.leftHeader}>
          {/* <Image
            source={
              profileImageUri
                ? { uri: profileImageUri }
                : require("../assets/avatar.png")
            }
            style={styles.profileImage}
          /> */}
          <Text
            style={[
              styles.headerText,
              { color: isDark ? "#f8e1c1" : "#2c2c4e" },
            ]}
          >
            {i18n.t("hiUser", { name: username })}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("DailyCheckIn")}
          style={styles.coinButton}
        >
          <Ionicons
            name="gift-outline"
            size={26}
            color={isDark ? "#f8e1c1" : "#2c2c4e"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("CoinsReward")}
          style={styles.coinButton}
        >
          <FontAwesome
            name="bitcoin"
            size={26}
            color={isDark ? "#f8e1c1" : "#2c2c4e"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
         <View style={styles.avatarContainer}>
          <Image
            source={
              profileImageUri
                ? { uri: profileImageUri }
                : require("../assets/avatar.png")
            }
            style={styles.avatar}
          />
        </View>
        {/* <View style={styles.avatarContainer}>
          <Image
            source={require("../assets/avatar.png")}
            style={styles.avatar}
          />
        </View> */}

        {/* Grid Buttons */}
        <View style={styles.grid}>
          {menuItems.map(({ nameKey, icon, screen, lib }) => (
            <TouchableOpacity
              key={screen}
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? "#2D2B4E" : "#f3f3f3",
                  borderColor: isDark ? "#4e446e" : "#ddd",
                },
              ]}
              onPress={() => navigation.navigate(screen)}
            >
              {getIcon(lib, icon, isDark)}
              <Text
                style={[
                  styles.cardText,
                  { color: isDark ? "#f8e1c1" : "#333" },
                ]}
              >
                {i18n.t(nameKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Grid Menu Items with i18n keys
const menuItems = [
  { nameKey: "horoscope", icon: "star-outline", screen: "Horoscope", lib: "Ionicons" },
  { nameKey: "tarotCard", icon: "cards-outline", screen: "NewChat", lib: "MaterialCommunityIcons" },
  
  { nameKey: "chat", icon: "chatbubbles-outline", screen: "Chat", lib: "Ionicons" },
  { nameKey: "myBot", icon: "robot", screen: "MyBot", lib: "MaterialCommunityIcons" },

  { nameKey: "fortuneTeller", icon: "crystal-ball", screen: "ZodiacSelection", lib: "MaterialCommunityIcons" },
  { nameKey: "recharge", icon: "wallet-outline", screen: "Recharge", lib: "Ionicons" },

  { nameKey: "cardHistory", icon: "history", screen: "ChatHistory", lib: "MaterialCommunityIcons" },
  { nameKey: "chatHistory", icon: "history", screen: "History", lib: "FontAwesome5" },
  
  { nameKey: "dailyCheckIn", icon: "calendar-check-outline", screen: "DailyCheckIn", lib: "MaterialCommunityIcons" },
  { nameKey: "settings", icon: "cog-outline", screen: "Settings", lib: "MaterialCommunityIcons" },
];

function getIcon(lib, icon, isDark) {
  const color = isDark ? "#fff" : "#000";
  switch (lib) {
    case "Ionicons":
      return <Ionicons name={icon} size={32} color={color} />;
    case "MaterialCommunityIcons":
      return <MaterialCommunityIcons name={icon} size={32} color={color} />;
    case "FontAwesome5":
      return <FontAwesome5 name={icon} size={28} color={color} />;
    case "FontAwesome":
      return <FontAwesome name={icon} size={28} color={color} />;
    default:
      return null;
  }
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  leftHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  coinButton: {
    padding: 6,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "#A26769",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    marginBottom: 20,
    paddingVertical: 30,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
  },
  cardText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
});



// // File: screens/HomeScreen.js
// import React, { useContext, useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   ScrollView,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import {
//   Ionicons,
//   MaterialCommunityIcons,
//   FontAwesome5,
//   FontAwesome,
// } from "@expo/vector-icons";

// import { ThemeContext } from "../context/ThemeContext";
// import { AuthContext } from "../context/AuthContext";

// export default function HomeScreen({ navigation }) {
//   const { theme } = useContext(ThemeContext);
//   const { user } = useContext(AuthContext);
//   const isDark = theme === "dark";

//   const profileImageUri = user?.profilePic || null;
//   const [localName, setLocalName] = useState("User");

//   useEffect(() => {
//     const fetchUserName = async () => {
//       const storedName = await AsyncStorage.getItem("userName");
//       if (storedName) {
//         setLocalName(storedName.trim());
//       }
//     };
//     fetchUserName();
//   }, []);

//   const username = user?.name?.trim() || localName;

//   return (
//     <SafeAreaView
//       style={[
//         styles.container,
//         { backgroundColor: isDark ? "#1e1e1e" : "#ffffff" },
//       ]}
//       edges={["left", "right", "bottom"]}
//     >
//       {/* Header */}
//       <View style={styles.headerContainer}>
//         <View style={styles.leftHeader}>
//           <Image
//             source={
//               profileImageUri
//                 ? { uri: profileImageUri }
//                 : require("../assets/avatar.png")
//             }
//             style={styles.profileImage}
//           />
//           <Text
//             style={[
//               styles.headerText,
//               { color: isDark ? "#f8e1c1" : "#2c2c4e" },
//             ]}
//           >
//             Hi, {username}
//           </Text>
//         </View>

//         <TouchableOpacity
//           onPress={() => navigation.navigate("DailyCheckIn")}
//           style={styles.coinButton}
//         >
//           <Ionicons
//             name="gift-outline"
//             size={26}
//             color={isDark ? "#f8e1c1" : "#2c2c4e"}
//           />
//         </TouchableOpacity>
//         <TouchableOpacity
//           onPress={() => navigation.navigate("CoinsReward")}
//           style={styles.coinButton}
//         >
//           <FontAwesome
//             name="bitcoin"
//             size={26}
//             color={isDark ? "#f8e1c1" : "#2c2c4e"}
//           />
//         </TouchableOpacity>
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false}>

//         {/* Avatar */}
//         <View style={styles.avatarContainer}>
//           <Image
//             source={require("../assets/avatar.png")}
//             style={styles.avatar}
//           />
//         </View>

//         {/* Grid Buttons */}
//         <View style={styles.grid}>
//           {menuItems.map(({ name, icon, screen, lib }) => (
//             <TouchableOpacity
//               key={screen}
//               style={[
//                 styles.card,
//                 {
//                   backgroundColor: isDark ? "#2D2B4E" : "#f3f3f3",
//                   borderColor: isDark ? "#4e446e" : "#ddd",
//                 },
//               ]}
//               onPress={() => navigation.navigate(screen)}
//             >
//               {getIcon(lib, icon, isDark)}
//               <Text
//                 style={[
//                   styles.cardText,
//                   { color: isDark ? "#f8e1c1" : "#333" },
//                 ]}
//               >
//                 {name}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// // Grid Menu Items with matching icons
// const menuItems = [
//   {
//     name: "Horoscope",
//     icon: "star-outline",
//     screen: "Horoscope",
//     lib: "Ionicons",
//   },
//   {
//     name: "Tarot Chat",
//     icon: "chatbubbles-outline",
//     screen: "Chat",
//     lib: "Ionicons",
//   },
//   {
//     name: "My Bot",
//     icon: "robot",
//     screen: "MyBot",
//     lib: "MaterialCommunityIcons",
//   },
//   {
//     name: "Fortune Teller",
//     icon: "crystal-ball",
//     screen: "ZodiacSelection",
//     lib: "MaterialCommunityIcons",
//   },
//   {
//     name: "Recharge",
//     icon: "wallet-outline",
//     screen: "Recharge",
//     lib: "Ionicons",
//   },
//   {
//     name: "History",
//     icon: "history",
//     screen: "History",
//     lib: "FontAwesome5",
//   },
//    {
//     name: "Daily Check-In",
//     icon: "calendar-check-outline",
//     screen: "DailyCheckIn",
//     lib: "MaterialCommunityIcons",
//   },
//   {
//     name: "Settings",
//     icon: "cog-outline",
//     screen: "Settings",
//     lib: "MaterialCommunityIcons",
//   },
// ];

// // Dynamically return icons
// function getIcon(lib, icon, isDark) {
//   const color = isDark ? "#fff" : "#000";
//   switch (lib) {
//     case "Ionicons":
//       return <Ionicons name={icon} size={32} color={color} />;
//     case "MaterialCommunityIcons":
//       return <MaterialCommunityIcons name={icon} size={32} color={color} />;
//     case "FontAwesome5":
//       return <FontAwesome5 name={icon} size={28} color={color} />;
//     case "FontAwesome":
//       return <FontAwesome name={icon} size={28} color={color} />;
//     default:
//       return null;
//   }
// }

// // Styles
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     paddingTop: 0,
//   },
//   headerContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   leftHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   profileImage: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: 10,
//   },
//   headerText: {
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   coinButton: {
//     padding: 6,
//   },
//   avatarContainer: {
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   avatar: {
//     width: 150,
//     height: 150,
//     borderRadius: 75,
//     borderWidth: 3,
//     borderColor: "#A26769",
//   },
//   dailyCheckinCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 16,
//     borderRadius: 16,
//     marginBottom: 24,
//     borderWidth: 1,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   checkinText: {
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   grid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },
//   card: {
//     width: "48%",
//     marginBottom: 20,
//     paddingVertical: 30,
//     borderRadius: 20,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 8,
//     borderWidth: 1,
//   },
//   cardText: {
//     marginTop: 10,
//     fontSize: 15,
//     fontWeight: "bold",
//     textAlign: "center",
//   },
// });
