import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "../context/AuthContext";
import i18n from "../utils/i18n"; // same as HomeScreen
import { LanguageContext } from "../context/LanguageContext"; // language state

export default function EditProfileScreen({ navigation }) {
  const { user, updateProfile } = useContext(AuthContext);
  const { language } = useContext(LanguageContext); // detect active language

  const [name, setName] = useState(user?.name || "");
  const [profilePic, setProfilePic] = useState(user?.profilePic || null);
  const [birthday, setBirthday] = useState(user?.birthday || "");
  const [zodiacSign, setZodiacSign] = useState(user?.zodiacSign || "");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Change i18n language when context updates
   i18n.locale = language;

  useEffect(() => {
    if (birthday) {
      setZodiacSign(getZodiacSignFromDate(birthday));
    }
  }, [birthday, language]); // re-calc on language change

  const getZodiacSignFromDate = (dateString) => {
    if (!dateString) return "";

    const [year, monthStr, dayStr] = dateString.split("-");
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);

    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return i18n.t("aquarius");
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return i18n.t("pisces");
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return i18n.t("aries");
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return i18n.t("taurus");
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return i18n.t("gemini");
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return i18n.t("cancer");
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return i18n.t("leo");
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return i18n.t("virgo");
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return i18n.t("libra");
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return i18n.t("scorpio");
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return i18n.t("sagittarius");
    return i18n.t("capricorn");
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(i18n.t("errors.gallery_permission"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    const profileData = {
      name,
      profilePic,
      birthday,
      zodiacSign,
    };
    await updateProfile(profileData);
    Alert.alert(i18n.t("profileSuccess.title"), i18n.t("profileSuccess.profile_updated"));
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Profile Picture */}
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={profilePic ? { uri: profilePic } : require("../assets/avatar.png")}
          style={styles.avatar}
        />
      </TouchableOpacity>

      {/* Name */}
      <TextInput
        style={styles.input}
        placeholder={i18n.t("placeholders.name")}
        value={name}
        onChangeText={setName}
      />

      {/* Birthday Picker */}
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>
          {birthday
            ? new Date(birthday).toLocaleDateString()
            : i18n.t("buttons.select_birthday")}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={birthday ? new Date(birthday) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            if (event.type === "set" && selectedDate) {
              const formattedDate = selectedDate.toISOString().split("T")[0];
              setBirthday(formattedDate);
            }
            setShowDatePicker(false);
          }}
        />
      )}

      {/* Zodiac Sign */}
      {zodiacSign ? (
        <Text style={styles.zodiacText}>
          {i18n.t("labels.zodiac")}: {zodiacSign}
        </Text>
      ) : null}

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
        <Text style={styles.saveText}>{i18n.t("buttons.save")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "80%",
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  dateButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  zodiacText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#444",
  },
  saveButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
  },
});


// import React, { useState, useContext } from 'react';
// import {
//   View, Text, TextInput, TouchableOpacity, Image,
//   StyleSheet, ActivityIndicator, Alert, ScrollView,
// } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import { ThemeContext } from '../context/ThemeContext';
// import { AuthContext } from '../context/AuthContext';
// import i18n from '../utils/i18n'; // import your i18n instance

// export default function EditProfileScreen() {
//   const { theme } = useContext(ThemeContext);
//   const { user, updateProfile } = useContext(AuthContext);
//   const isDark = theme === 'dark';

//   const [name, setName] = useState(user.name || '');
//   const [image, setImage] = useState(user.profilePic || null);
//   const [loading, setLoading] = useState(false);

//   const pickImage = async () => {
//     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!permission.granted) return;

//     const result = await ImagePicker.launchImageLibraryAsync({
//       allowsEditing: true,
//       quality: 0.5,
//     });

//     if (!result.canceled && result.assets?.length > 0) {
//       setImage(result.assets[0].uri);
//     }
//   };

//   const saveProfile = async () => {
//     if (!name.trim()) {
//       Alert.alert(i18n.t('error'), i18n.t('nameCannotBeEmpty'));
//       return;
//     }

//     setLoading(true);
//     try {
//       await updateProfile({ name: name.trim(), profilePic: image });
//       Alert.alert('✅', i18n.t('profileUpdated'));
//     } catch (err) {
//       Alert.alert('❌', i18n.t('failedToSave'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles(isDark).container}>
//       <Text style={styles(isDark).title}>{i18n.t('editProfile')}</Text>

//       <TouchableOpacity onPress={pickImage} style={styles(isDark).avatarWrapper}>
//         <Image
//           source={image ? { uri: image } : require('../assets/avatar.png')}
//           style={styles(isDark).avatar}
//         />
//         <Text style={styles(isDark).changeText}>{i18n.t('changePicture')}</Text>
//       </TouchableOpacity>

//       <TextInput
//         value={name}
//         onChangeText={setName}
//         placeholder={i18n.t('yourName')}
//         placeholderTextColor="#888"
//         style={styles(isDark).input}
//       />

//       <TouchableOpacity style={styles(isDark).button} onPress={saveProfile} disabled={loading}>
//         {loading ? (
//           <ActivityIndicator color="#000" />
//         ) : (
//           <Text style={styles(isDark).buttonText}>{i18n.t('save')}</Text>
//         )}
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = (isDark) => StyleSheet.create({
//   container: {
//     flexGrow: 1, padding: 20,
//     backgroundColor: isDark ? '#1e1e1e' : '#fff',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24, fontWeight: 'bold',
//     color: isDark ? '#f8e1c1' : '#2c2c4e', marginBottom: 20
//   },
//   avatarWrapper: { alignItems: 'center', marginBottom: 20 },
//   avatar: {
//     width: 120, height: 120, borderRadius: 60,
//     borderWidth: 2, borderColor: '#aaa'
//   },
//   changeText: {
//     marginTop: 10,
//     color: isDark ? '#aaa' : '#444'
//   },
//   input: {
//     width: '100%',
//     backgroundColor: isDark ? '#333' : '#eee',
//     color: isDark ? '#fff' : '#000',
//     padding: 12, borderRadius: 10, marginBottom: 20,
//   },
//   button: {
//     backgroundColor: '#f8e1c1',
//     paddingVertical: 14, borderRadius: 20,
//     alignItems: 'center', width: '100%',
//   },
//   buttonText: {
//     fontSize: 16, fontWeight: 'bold',
//     color: '#2c2c4e'
//   },
// });
