import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useRouter } from "expo-router";
import quantumLogo from "../assets/images/Quantum_Logo_1000x1000.png";
import Alert from "../components/Alert";

// Scaling helpers
const baseWidth = 390;
const baseHeight = 844;
const scale = (size, width) => Math.min((width / baseWidth) * size, size * 1.2);
const vscale = (size, height) => Math.min((height / baseHeight) * size, size * 1.2);
const mscale = (size, width, factor = 0.5) =>
  size + (scale(size, width) - size) * factor;

export default function LoginScreen() {
  const { width, height } = useWindowDimensions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState({ visible: false, message: "", type: "info" });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  const showAlert = (message, type = "info") => {
    setAlert({ visible: true, message, type });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert("Please enter both email and password.", "error");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const response = await fetch("http://localhost:5000/session-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.warn("Quantum key generation failed:", result);
      }

      showAlert("Login successful!", "success");
      setIsTransitioning(true);
      
      // Add a slight delay before navigation to allow the success alert to be visible
      setTimeout(() => {
        router.replace({
          pathname: "/dashboard",
          params: { transition: "fade" }
        });
      }, 1000);
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";
      if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      }
      showAlert(errorMessage, "error");
    }
  };

  // Calculate responsive dimensions
  const logoSize = Math.min(width * 0.4, height * 0.3);
  const cardWidth = Math.min(width * 0.9, 360);
  const cardPadding = scale(24, width);
  const inputHeight = vscale(50, height);
  const buttonHeight = vscale(50, height);
  const spacing = vscale(20, height);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Alert
        visible={alert.visible}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
      
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
            Bank App
          </Text>
          <Text style={[styles.subtitle, { fontSize: mscale(16, width) }]}>
            Please enter your details
          </Text>

          <View style={[styles.inputContainer, { marginTop: spacing }]}>
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

          <TouchableOpacity 
            style={[
              styles.loginButton, 
              { 
                height: buttonHeight,
                marginTop: spacing,
                opacity: isTransitioning ? 0.7 : 1
              }
            ]} 
            onPress={handleLogin}
            disabled={isTransitioning}
          >
            <Text style={[styles.loginText, { fontSize: mscale(16, width) }]}>
              {isTransitioning ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.helperText, { fontSize: mscale(14, width), marginTop: spacing }]}>
            Don't have an account?{" "}
            <Text style={styles.link} onPress={() => !isTransitioning && router.push("/signup")}>
              Create one
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
  loginButton: {
    backgroundColor: "#003c46",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
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
