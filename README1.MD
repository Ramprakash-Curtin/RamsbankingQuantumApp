pip install qiskit[visualization]
pip install qiskit-aer
npx expo install react-native-bouncy-checkbox

# Core Firebase SDK for web (auth + firestore)
npm install firebase

# React Navigation core
npm install @react-navigation/native

# Required peer dependencies
npm install react-native-screens react-native-safe-area-context

# Native stack navigation for screen transitions
npm install @react-navigation/native-stack



## 💼 Quantum-Secured Mobile Banking App Plan

This project is a cross-platform mobile banking app prototype that integrates **Quantum Key Distribution (QKD)** using IBM's Qiskit to simulate secure financial transfers. The app supports mobile (iOS/Android) and web, powered by Firebase and a custom Flask-based quantum backend.

---

### 📦 Tech Stack

| Layer              | Tool/Library         | Purpose                            |
|--------------------|----------------------|------------------------------------|
| Mobile Frontend    | React Native + Expo  | Cross-platform app UI              |
| Authentication     | Firebase Auth        | Login, account security            |
| Backend DB         | Firebase Firestore   | Store users, balances, keys        |
| Quantum Engine     | Flask + Qiskit       | Generate QKD keys, run crypto      |
| Local Testing API  | Flask (localhost)    | Simulate quantum system securely   |
| Optional Hosting   | Render / Railway     | Deploy Flask if needed             |

---

### 🧠 Project Plan

#### 🎯 Goal

Build a cross-platform banking app that:
- Uses Firebase for authentication and user data.
- Uses Flask and Qiskit to simulate Quantum Key Distribution (BB84).
- Enables secure money transfers with quantum keys.
- Demonstrates integration of quantum cryptography in real-world apps.

---

#### 🧱 Architecture

```
+-----------------------+       +------------------+
|   React Native App    |<----->|   Firebase Auth   |
|  (Expo, cross-platform)|       +------------------+
|                       |                |
| 1. Login              |                | Auth Token
| 2. View Balance       |                |
| 3. Transfer Money     |                v
| 4. Fetch QKD Key   +---------->+----------------------+
|                   |  Flask API |  /generate-key        |
|                   | (Qiskit)   |  -> Runs BB84         |
+-------------------+-----------+  -> Returns Quantum Key|
                                      |
                                      v
                              Firebase Firestore
                              (Store users, balances,
                               transfers, keys)
```

---

#### 📲 App Features

##### 🔐 1. Authentication (Firebase)
- Email/password login
- Optional biometric support

##### 💰 2. Account & Balance (Firestore)
```json
{
  "uid": "123",
  "name": "Alice",
  "balance": 5000,
  "quantum_keys": [ ... ]
}
```

##### 🔒 3. Secure Money Transfer Flow
1. User selects recipient & amount
2. App calls `/generate-key` (Flask)
3. QKD key generated via Qiskit
4. Key used to verify/secure transfer
5. Transfer stored in Firestore

##### 📜 4. Transaction History
Each transaction stores:
```json
{
  "from": "Alice",
  "to": "Bob",
  "amount": 200,
  "timestamp": "2025-04-06",
  "quantum_key_used": "01101100"
}
```

---

#### 🛠 Development Phases

##### ✅ Phase 1: QKD Logic
- Simulate BB84 with Qiskit

##### 🔌 Phase 2: Flask API
- `/generate-key` endpoint returns quantum key

##### 🔐 Phase 3: Firebase Setup
- Auth + Firestore schema

##### 📲 Phase 4: React Native Frontend
- Login, Dashboard, Transfers, History

---

#### 🧪 Testing

- Test QKD logic with Python scripts
- Test API with Postman or mobile app
- View Firebase Firestore/console for data

---

#### 🏁 Final Deliverable

- Working Expo mobile app (iOS/Android/Web)
- Local Flask API for quantum logic
- Firebase setup for real-time backend
- Screenshots for thesis/demo
- Optional: Deploy Flask app on Render

---

### 🔗 Author

Ram Prekash | 2025 Final Year Project
