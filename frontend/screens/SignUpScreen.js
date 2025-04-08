import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase.js";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import quantumLogo from "../assets/images/Quantum_Logo_1000x1000.png";

// Scaling helpers
const baseWidth = 390;
const baseHeight = 844;
const scale = (size, width) => Math.min((width / baseWidth) * size, size * 1.2);
const vscale = (size, height) => Math.min((height / baseHeight) * size, size * 1.2);
const mscale = (size, width, factor = 0.5) =>
  size + (scale(size, width) - size) * factor;

export default function SignUpScreen() {
  const { width, height } = useWindowDimensions();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  // Calculate responsive dimensions
  const logoSize = Math.min(width * 0.3, height * 0.25);
  const cardWidth = Math.min(width * 0.9, 360);
  const cardPadding = scale(24, width);
  const inputHeight = vscale(45, height);
  const buttonHeight = vscale(45, height);
  const spacing = vscale(16, height);

  const handleSignUp = async () => {
    if (!username || !email || !password || !acceptedTerms) {
      Alert.alert("Error", "Please fill all fields and accept terms.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        phone: phone || null,
        balance: 10000.0,
      });

      Alert.alert("Success", "Account created!");
      setIsTransitioning(true);
      
      // Add a slight delay before navigation to allow the success alert to be visible
      setTimeout(() => {
        router.replace({
          pathname: "/dashboard",
          params: { transition: "fade" }
        });
      }, 1000);

    } catch (error) {
      console.error("SignUp Error:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: isTransitioning ? 0 : 1,
            transform: [
              {
                scale: isTransitioning ? 0.95 : 1
              }
            ]
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <Image 
            source={quantumLogo} 
            style={[
              styles.logo,
              { 
                width: logoSize,
                height: logoSize,
              }
            ]} 
          />
        </View>

        <View style={[
          styles.card, 
          { 
            width: cardWidth,
            padding: cardPadding,
          }
        ]}>
          <Text style={[styles.cardTitle, { fontSize: mscale(24, width) }]}>
            Create Account
          </Text>
          <Text style={[styles.subtitle, { fontSize: mscale(16, width) }]}>
            Join us and get secure quantum banking
          </Text>

          <View style={[styles.inputContainer, { marginTop: spacing }]}>
            <TextInput
              placeholder="Username"
              placeholderTextColor="#999"
              style={[
                styles.input, 
                { 
                  height: inputHeight,
                  fontSize: mscale(15, width),
                }
              ]}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#999"
              style={[
                styles.input, 
                { 
                  height: inputHeight,
                  fontSize: mscale(15, width),
                }
              ]}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="#999"
              style={[
                styles.input, 
                { 
                  height: inputHeight,
                  fontSize: mscale(15, width),
                }
              ]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#999"
              style={[
                styles.input, 
                { 
                  height: inputHeight,
                  fontSize: mscale(15, width),
                }
              ]}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={[styles.checkboxContainer, { marginTop: spacing }]}>
            <BouncyCheckbox
              size={mscale(20, width)}
              fillColor="#003c46"
              unfillColor="#fff"
              isChecked={acceptedTerms}
              text="I accept the Terms and Conditions"
              textStyle={{
                fontSize: mscale(13, width),
                textDecorationLine: "none",
                color: "#555",
              }}
              disableBuiltInState
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.signupButton, 
              { 
                height: buttonHeight,
                marginTop: spacing,
                opacity: acceptedTerms ? (isTransitioning ? 0.7 : 1) : 0.6,
              }
            ]} 
            onPress={handleSignUp}
            disabled={!acceptedTerms || isTransitioning}
          >
            <Text style={[styles.signupText, { fontSize: mscale(16, width) }]}>
              {isTransitioning ? "Creating account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.helperText, { fontSize: mscale(14, width), marginTop: spacing }]}>
            Already have an account?{" "}
            <Text style={styles.link} onPress={() => !isTransitioning && router.replace("/")}>
              Login
            </Text>
          </Text>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003c46",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    resizeMode: "contain",
    tintColor: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  cardTitle: {
    fontWeight: "bold",
    color: "#003c46",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginTop: 8,
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    backgroundColor: "#f0f2f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 16,
  },
  checkboxContainer: {
    width: "100%",
  },
  signupButton: {
    backgroundColor: "#003c46",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  signupText: {
    color: "#fff",
    fontWeight: "bold",
  },
  helperText: {
    textAlign: "center",
    color: "#444",
  },
  link: {
    color: "#003c46",
    fontWeight: "600",
  },
});
