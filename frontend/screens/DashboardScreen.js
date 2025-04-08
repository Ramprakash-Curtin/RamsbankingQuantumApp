import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  Clipboard,
  Alert,
} from "react-native";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, { 
  FadeIn, 
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// Scaling helpers
const baseWidth = 390;
const baseHeight = 844;
const scale = (size, width) => Math.min((width / baseWidth) * size, size * 1.2);
const vscale = (size, height) => Math.min((height / baseHeight) * size, size * 1.2);
const mscale = (size, width, factor = 0.5) =>
  size + (scale(size, width) - size) * factor;

export default function DashboardScreen() {
  const { width, height } = useWindowDimensions();
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);
  const [quantumKey, setQuantumKey] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();

  const menuTranslateY = useSharedValue(height);
  const tabTranslateY = useSharedValue(0);
  const buttonOpacity = useSharedValue(1);
  const overlayTranslateY = useSharedValue(height);

  const menuStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: menuTranslateY.value }],
    };
  });

  const tabStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: tabTranslateY.value }],
      opacity: buttonOpacity.value,
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: overlayTranslateY.value }],
      opacity: withTiming(showMenu ? 0.3 : 0, { duration: 200 }),
    };
  });

  const toggleMenu = (show = !showMenu) => {
    if (!show) {
      menuTranslateY.value = withSpring(height, {
        damping: 20,
        stiffness: 90,
      });
      overlayTranslateY.value = withSpring(height, {
        damping: 20,
        stiffness: 90,
      });
      tabTranslateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
      buttonOpacity.value = withSpring(1);
    } else {
      menuTranslateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
      overlayTranslateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
      tabTranslateY.value = withSpring(-60, {
        damping: 20,
        stiffness: 90,
      });
      buttonOpacity.value = withSpring(0);
    }
    setShowMenu(show);
  };

  useEffect(() => {
    let fetchedKey = false;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.username || "");
          setBalance(data.balance || 0);

          if (!fetchedKey) {
            fetchedKey = true;
            try {
              const response = await fetch("http://localhost:5000/session-key", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: user.uid }),
              });
              const result = await response.json();
              setQuantumKey(result.quantum_key || "");
            } catch (err) {
              console.error("Quantum key fetch error:", err);
            }
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const user = auth.currentUser;
    if (user) {
      await fetch("http://localhost:5000/delete-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.uid }),
      });
    }
    await signOut(auth);
    router.replace("/");
  };

  const copyToClipboard = () => {
    Clipboard.setString(quantumKey);
    Alert.alert("Copied", "Quantum key copied to clipboard!");
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(500)}
      style={[styles.container, { paddingBottom: vscale(20, height) }]}
    >
      {/* Dismissible Overlay */}
      <Animated.View 
        style={[styles.overlay, overlayStyle]}
      >
        <TouchableOpacity 
          style={[
            styles.closeButton,
            {
              top: vscale(40, height),
              right: scale(20, width),
              width: scale(40, width),
              height: scale(40, width),
              borderRadius: scale(20, width),
            }
          ]}
          onPress={() => toggleMenu(false)}
        >
          <Text style={[styles.closeButtonText, { fontSize: mscale(20, width) }]}>×</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: vscale(60, height),
            paddingBottom: vscale(20, height),
            borderBottomLeftRadius: scale(30, width),
            borderBottomRightRadius: scale(30, width),
          },
        ]}
      >
        <TouchableOpacity onPress={() => toggleMenu(true)}>
          <View
            style={[
              styles.avatar,
              {
                width: scale(100, width),
                height: scale(100, width),
                borderRadius: scale(100, width),
                backgroundColor: "#0f5c67", // elegant dark-teal
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 6,
                elevation: 6,
              },
            ]}
          >
            <Text
              style={{
                fontSize: mscale(26, width),
                fontWeight: "700",
                color: "#fff",
                letterSpacing: 1,
              }}
            >
              {username?.charAt(0)?.toUpperCase() || "?"}
            </Text>
          </View>
        </TouchableOpacity>
        <Text style={[styles.greeting, { fontSize: mscale(20, width) }]}>
          Hi, {username || "..."}
        </Text>
      </View>

      {/* Menu Tab Button */}
      <Animated.View 
        style={[
          styles.menuTab,
          tabStyle,
          {
            bottom: vscale(80, height),
            width: scale(80, width),
            height: scale(50, width),
            borderTopLeftRadius: scale(12, width),
            borderTopRightRadius: scale(12, width),
            alignSelf: 'center',
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.menuTabButton}
          onPress={() => toggleMenu(true)}
        >
          <Text style={styles.menuTabIcon}>☰</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Sheet Menu */}
      <Animated.View 
        style={[
          styles.menuContainer,
          menuStyle,
          {
            bottom: vscale(0, height),
            paddingBottom: vscale(40, height),
            borderTopLeftRadius: scale(30, width),
            borderTopRightRadius: scale(30, width),
          }
        ]}
      >
        <View style={styles.menuContent}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              toggleMenu(false);
              router.push("/profile-edit");
            }}
          >
            <Text style={[styles.menuItemText, { fontSize: mscale(16, width) }]}>
              👤 Edit Profile
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutItem]}
            onPress={() => {
              toggleMenu(false);
              handleLogout();
            }}
          >
            <Text style={[styles.logoutText, { fontSize: mscale(16, width) }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Balance Box */}
      <View
        style={[
          styles.balanceContainer,
          {
            paddingVertical: vscale(30, height),
            paddingHorizontal: scale(20, width),
            marginTop: vscale(40, height),
            borderRadius: scale(20, width),
            width: scale(320, width),
          },
        ]}
      >
        <Text
          style={{
            fontSize: mscale(14, width),
            color: "#666",
            marginBottom: 10,
          }}
        >
          Personal · DOLLARS
        </Text>
        <Text
          style={{
            fontSize: mscale(32, width),
            fontWeight: "bold",
            color: "#003c46",
          }}
        >
          ${balance.toFixed(2)}
        </Text>
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              marginTop: vscale(20, height),
              paddingVertical: vscale(10, height),
              paddingHorizontal: scale(30, width),
              borderRadius: scale(20, width),
            },
          ]}
        >
          <Text style={styles.addButtonText}>+ add</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Quantum Key */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quantum Session Key</Text>
            <Text style={styles.keyText}>{quantumKey || "No key available."}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
              <Text style={styles.copyText}>Copy Key</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Nav */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => setModalVisible(true)}>
          <Text style={styles.navIcon}>🔐</Text>
          <Text style={styles.navLabel}>Key</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/transfer")}>
          <Text style={styles.navIcon}>💸</Text>
          <Text style={styles.navLabel}>Transfer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/transactions")}>
          <Text style={styles.navIcon}>📜</Text>
          <Text style={styles.navLabel}>History</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#003c46",
    alignItems: "center",
    width: "100%",
  },
  avatar: {
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#003c46",
    borderWidth: 2,
    marginBottom: 10,
  },
  greeting: {
    color: "#fff",
  },
  menuTab: {
    position: 'absolute',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    elevation: 4,
  },
  menuTabButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTabIcon: {
    color: '#003c46',
    fontSize: scale(24, 390),
    fontWeight: 'bold',
  },
  menuContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 8,
    elevation: 6,
    zIndex: 99,
  },
  menuContent: {
    paddingTop: scale(20, 390),
    paddingHorizontal: scale(20, 390),
  },
  menuItem: {
    paddingVertical: scale(16, 390),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    color: '#003c46',
    fontWeight: '500',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  balanceContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  addButton: {
    backgroundColor: "#003c46",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    paddingVertical: 14,
    position: "absolute",
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 8,
    elevation: 5,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  navIcon: {
    fontSize: 24,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
    color: "#003c46",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    width: "80%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003c46",
    marginBottom: 12,
  },
  keyText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
    width: "100%",
    flexWrap: "wrap",
    wordBreak: "break-all",
    paddingHorizontal: 10,
  },
  copyButton: {
    backgroundColor: "#003c46",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  copyText: {
    color: "#fff",
    fontWeight: "bold",
  },
  closeText: {
    color: "#003c46",
    fontWeight: "bold",
    marginTop: 5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 98,
  },
  closeButton: {
    position: 'absolute',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  closeButtonText: {
    color: '#003c46',
    fontWeight: 'bold',
    marginTop: -2, // Optical alignment for the × symbol
  },
});
