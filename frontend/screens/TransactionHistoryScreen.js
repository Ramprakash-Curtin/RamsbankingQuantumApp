import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

// Scaling helpers
const baseWidth = 390;
const baseHeight = 844;
const scale = (size, width) => Math.min((width / baseWidth) * size, size * 1.2);
const vscale = (size, height) => Math.min((height / baseHeight) * size, size * 1.2);
const mscale = (size, width, factor = 0.5) =>
  size + (scale(size, width) - size) * factor;

export default function TransactionHistoryScreen() {
  const { width, height } = useWindowDimensions();
  const [transactions, setTransactions] = useState([]);
  const [emailMap, setEmailMap] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTransactions = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const sentQuery = query(
        collection(db, "transactions"),
        where("from_user", "==", user.uid),
        orderBy("timestamp", "desc")
      );

      const receivedQuery = query(
        collection(db, "transactions"),
        where("to_user", "==", user.uid),
        orderBy("timestamp", "desc")
      );

      const [sentSnap, receivedSnap] = await Promise.all([
        getDocs(sentQuery),
        getDocs(receivedQuery),
      ]);

      const combined = [
        ...sentSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "sent",
        })),
        ...receivedSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "received",
        })),
      ];

      combined.sort((a, b) => b.timestamp?.toMillis?.() - a.timestamp?.toMillis?.());

      // Fetch related emails
      const uids = new Set(combined.map(t => t.type === "sent" ? t.to_user : t.from_user));
      const emailMapTemp = {};
      await Promise.all(Array.from(uids).map(async (uid) => {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          emailMapTemp[uid] = userDoc.data().email || "Unknown";
        }
      }));

      setEmailMap(emailMapTemp);
      setTransactions(combined);
    };

    fetchTransactions();
  }, []);

  const renderItem = ({ item }) => {
    const label = item.type === "sent" ? "To" : "From";
    const email = emailMap[item.type === "sent" ? item.to_user : item.from_user] || "Unknown";
    const amountPrefix = item.type === "sent" ? "-" : "+";
    const amountColor = item.type === "sent" ? "#e74c3c" : "#2ecc71";

    return (
      <Animated.View 
        entering={FadeIn.duration(300)}
        style={[
          styles.card,
          {
            marginBottom: vscale(12, height),
            padding: scale(16, width),
          }
        ]}
      >
        <Text style={[styles.cardText, { fontSize: mscale(15, width) }]}>
          {label}: {email}
        </Text>
        <Text
          style={[
            styles.cardText,
            {
              fontSize: mscale(14, width),
              color: amountColor,
              fontWeight: "bold",
            },
          ]}
        >
          {amountPrefix}${item.amount}
        </Text>
        <Text style={[styles.timestamp, { fontSize: mscale(12, width) }]}>
          {item.timestamp?.toDate?.().toLocaleString?.() ?? "Pending"}
        </Text>
      </Animated.View>
    );
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(500)}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: vscale(60, height) }]}>
        <TouchableOpacity 
          onPress={() => !isTransitioning && router.replace("/dashboard")} 
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { fontSize: mscale(24, width) }]}>
          Transaction History
        </Text>
      </View>

      {transactions.length === 0 ? (
        <Animated.View 
          entering={FadeIn.duration(500)}
          style={styles.emptyContainer}
        >
          <Text style={[styles.emptyText, { fontSize: mscale(16, width) }]}>
            No transactions yet.
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            { padding: scale(20, width) }
          ]}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003c46",
  },
  header: {
    backgroundColor: "#003c46",
    paddingBottom: vscale(20, 844),
    alignItems: "center",
    borderBottomLeftRadius: scale(30, 390),
    borderBottomRightRadius: scale(30, 390),
  },
  backButton: {
    alignSelf: "flex-start",
    marginLeft: scale(20, 390),
    marginBottom: vscale(10, 844),
  },
  backText: {
    color: "#fff",
    fontWeight: "600",
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  listContainer: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: scale(12, 390),
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  cardText: {
    fontWeight: "500",
    marginBottom: 4,
    color: "#003c46",
  },
  timestamp: {
    color: "#666",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#fff",
    textAlign: "center",
  },
});
