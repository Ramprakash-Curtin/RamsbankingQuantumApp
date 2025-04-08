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
  ActivityIndicator,
} from "react-native";
import { auth } from "../firebase";
import { useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import Alert from "../components/Alert"; // Make sure this path is correct

// Scaling helpers
const baseWidth = 390;
const baseHeight = 844;
const scale = (size, width) => Math.min((width / baseWidth) * size, size * 1.2);
const vscale = (size, height) => Math.min((height / baseHeight) * size, size * 1.2);
const mscale = (size, width, factor = 0.5) =>
  size + (scale(size, width) - size) * factor;

export default function TransferScreen() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();

  const [toEmail, setToEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [quantumKey, setQuantumKey] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [alert, setAlert] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  const handleTransfer = async () => {
    const currentUser = auth.currentUser;

    if (!toEmail || !amount || !quantumKey) {
      setAlert({
        visible: true,
        message: "All fields are required.",
        type: "error",
      });
      return;
    }

    if (!currentUser) {
      setAlert({
        visible: true,
        message: "You must be logged in to transfer.",
        type: "error",
      });
      return;
    }

    try {
      setIsTransitioning(true);
      const response = await fetch("http://localhost:5000/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_user: currentUser.uid,
          to_email: toEmail,
          amount: parseFloat(amount),
          quantum_key: quantumKey,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setAlert({
          visible: true,
          message: "Transfer completed successfully!",
          type: "success",
        });
        setTimeout(() => {
          router.replace({
            pathname: "/dashboard",
            params: { transition: "fade" },
          });
        }, 1000);
      } else {
        setAlert({
          visible: true,
          message: result.error || "Transfer failed.",
          type: "error",
        });
        setIsTransitioning(false);
      }
    } catch (err) {
      console.error("Transfer error:", err);
      setAlert({
        visible: true,
        message: "Unable to reach the server.",
        type: "error",
      });
      setIsTransitioning(false);
    }
  };

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
        entering={FadeIn.duration(500)}
        style={[
          styles.content,
          {
            opacity: isTransitioning ? 0.5 : 1,
          },
        ]}
      >
        <View style={[styles.card, { width: Math.min(width * 0.9, 360) }]}>
          <TouchableOpacity
            onPress={() => !isTransitioning && router.replace("/dashboard")}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={[styles.cardTitle, { fontSize: mscale(24, width) }]}>
            Send Funds Securely
          </Text>
          <Text style={[styles.subtitle, { fontSize: mscale(16, width) }]}>
            Transfer money using your quantum key.
          </Text>

          <View style={[styles.inputContainer, { marginTop: vscale(20, height) }]}>
            <TextInput
              style={[
                styles.input,
                {
                  height: vscale(50, height),
                  fontSize: mscale(15, width),
                },
              ]}
              placeholder="Recipient Email"
              placeholderTextColor="#999"
              value={toEmail}
              onChangeText={setToEmail}
              editable={!isTransitioning}
              autoCapitalize="none"
            />

            <TextInput
              style={[
                styles.input,
                {
                  height: vscale(50, height),
                  fontSize: mscale(15, width),
                },
              ]}
              placeholder="Amount"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              editable={!isTransitioning}
            />

            <TextInput
              style={[
                styles.input,
                {
                  height: vscale(50, height),
                  fontSize: mscale(15, width),
                },
              ]}
              placeholder="Quantum Key"
              placeholderTextColor="#999"
              value={quantumKey}
              onChangeText={setQuantumKey}
              secureTextEntry
              editable={!isTransitioning}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.transferButton,
              {
                height: vscale(50, height),
                marginTop: vscale(20, height),
                opacity: isTransitioning ? 0.7 : 1,
              },
            ]}
            onPress={handleTransfer}
            disabled={isTransitioning}
          >
            <Text style={[styles.buttonText, { fontSize: mscale(16, width) }]}>
              {isTransitioning ? "Processing..." : "Transfer"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {isTransitioning && (
        <View style={styles.spinnerOverlay}>
          <ActivityIndicator size="large" color="#003c46" />
        </View>
      )}
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: scale(24, 390),
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: vscale(12, 844),
  },
  backText: {
    color: "#003c46",
    fontWeight: "600",
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  transferButton: {
    backgroundColor: "#003c46",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  spinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
});
