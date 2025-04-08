import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Scaling helpers
const baseWidth = 390;
const baseHeight = 844;
const scale = (size, width) => Math.min((width / baseWidth) * size, size * 1.2);
const vscale = (size, height) => Math.min((height / baseHeight) * size, size * 1.2);
const mscale = (size, width, factor = 0.5) =>
  size + (scale(size, width) - size) * factor;

export default function ProfileEditScreen() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUsername(data.username || '');
            setEmail(user.email || '');
            setPhoneNumber(data.phoneNumber || '');
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    // Validate username
    if (!username.trim()) {
      Alert.alert(
        "Validation Error",
        "Username cannot be empty",
        [{ text: "OK" }]
      );
      return;
    }

    // Validate phone number format (basic validation)
    if (phoneNumber.trim() && !/^\+?[\d\s-]{10,}$/.test(phoneNumber.trim())) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid phone number",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const changes = [];
          
          if (data.username !== username.trim()) {
            changes.push("username");
          }
          if (data.phoneNumber !== phoneNumber.trim()) {
            changes.push("phone number");
          }

          if (changes.length === 0) {
            Alert.alert(
              "No Changes",
              "No changes were made to your profile",
              [{ text: "OK" }]
            );
            return;
          }

          await updateDoc(docRef, {
            username: username.trim(),
            phoneNumber: phoneNumber.trim(),
          });

          Alert.alert(
            "Success",
            `Profile updated successfully!\nChanges made: ${changes.join(", ")}`,
            [
              {
                text: "OK",
                onPress: () => router.back()
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Error",
        "Failed to update profile. Please try again later.",
        [{ text: "OK" }]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: '#f9f9f9' }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#f9f9f9' }]}>
      {/* Header */}
      <View style={[
        styles.header,
        {
          paddingTop: vscale(60, height),
          paddingBottom: vscale(20, height),
          backgroundColor: '#003c46',
        }
      ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: mscale(24, width) }]}>
          Edit Profile
        </Text>
      </View>

      {/* Profile Content */}
      <View style={styles.content}>
        {/* Username Field */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { fontSize: mscale(14, width) }]}>
            Username
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                fontSize: mscale(16, width),
                height: vscale(50, height),
                borderRadius: scale(12, width),
              }
            ]}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            placeholderTextColor="#999"
          />
        </View>

        {/* Email Field (Read-only) */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { fontSize: mscale(14, width) }]}>
            Email
          </Text>
          <View style={[
            styles.input,
            styles.readOnlyInput,
            {
              height: vscale(50, height),
              borderRadius: scale(12, width),
            }
          ]}>
            <Text style={[styles.readOnlyText, { fontSize: mscale(16, width) }]}>
              {email}
            </Text>
          </View>
        </View>

        {/* Phone Number Field */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { fontSize: mscale(14, width) }]}>
            Phone Number
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                fontSize: mscale(16, width),
                height: vscale(50, height),
                borderRadius: scale(12, width),
              }
            ]}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter your phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              marginTop: vscale(30, height),
              backgroundColor: '#003c46',
              borderRadius: scale(12, width),
            }
          ]}
          onPress={handleSave}
        >
          <Text style={[
            styles.saveButtonText,
            { fontSize: mscale(16, width) }
          ]}>
            Save Changes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: '100%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#003c46',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#003c46',
  },
  readOnlyInput: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  readOnlyText: {
    color: '#666',
  },
  saveButton: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 