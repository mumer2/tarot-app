import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

export default function EditProfileScreen() {
  const { theme } = useContext(ThemeContext);
  const { user, updateProfile } = useContext(AuthContext);
  const isDark = theme === 'dark';

  const [name, setName] = useState(user.name || '');
  const [image, setImage] = useState(user.profilePic || null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('❌ Error', 'Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ name: name.trim(), profilePic: image });
      Alert.alert('✅', 'Profile updated!');
    } catch (err) {
      Alert.alert('❌', 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles(isDark).container}>
      <Text style={styles(isDark).title}>Edit Profile</Text>

      <TouchableOpacity onPress={pickImage} style={styles(isDark).avatarWrapper}>
        <Image
          source={image ? { uri: image } : require('../assets/avatar.png')}
          style={styles(isDark).avatar}
        />
        <Text style={styles(isDark).changeText}>Change Picture</Text>
      </TouchableOpacity>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor="#888"
        style={styles(isDark).input}
      />

      <TouchableOpacity style={styles(isDark).button} onPress={saveProfile} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles(isDark).buttonText}>Save</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = (isDark) => StyleSheet.create({
  container: {
    flexGrow: 1, padding: 20,
    backgroundColor: isDark ? '#1e1e1e' : '#fff',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: isDark ? '#f8e1c1' : '#2c2c4e', marginBottom: 20 },
  avatarWrapper: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: '#aaa' },
  changeText: { marginTop: 10, color: isDark ? '#aaa' : '#444' },
  input: {
    width: '100%', backgroundColor: isDark ? '#333' : '#eee',
    color: isDark ? '#fff' : '#000',
    padding: 12, borderRadius: 10, marginBottom: 20,
  },
  button: {
    backgroundColor: '#f8e1c1',
    paddingVertical: 14, borderRadius: 20,
    alignItems: 'center', width: '100%',
  },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: '#2c2c4e' },
});
