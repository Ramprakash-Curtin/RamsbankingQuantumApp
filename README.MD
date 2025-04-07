
# 🔐 Quantum-Secured Mobile Banking App

This is a cross-platform mobile banking demo built with **React Native (Expo)**, **Firebase**, **Flask**, and **Qiskit**. The app uses quantum-generated session keys to authorize transactions, enhancing security using quantum cryptography.

---

## 📦 Tech Stack

- **Frontend:** React Native (Expo), Reanimated, Firebase Auth + Firestore
- **Backend:** Flask (Python), Firestore, Qiskit (Quantum Key Generation)
- **Features:**  
  ✅ Login / Signup  
  ✅ Firestore balance tracking  
  ✅ Quantum key generation  
  ✅ Transfer with key validation  
  ✅ Transaction history  
  ✅ Secure UI with alerts & modal animations

---

## 🛠️ Requirements

### 📱 Frontend (Expo)
- [Node.js](https://nodejs.org/) (>= 16.x)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- `yarn` or `npm`
- Android Studio or Xcode (for simulators)
- Firebase project setup

### 🐍 Backend (Flask + Qiskit)
- Python 3.8–3.11 recommended
- `pip` (Python package manager)
- Firebase Admin SDK service account key

---

## ⚙️ Installation

### 🔹 1. Firebase Setup

- Go to [Firebase Console](https://console.firebase.google.com)
- Create a new project (or use existing)
- Enable **Authentication > Email/Password**
- Create **Cloud Firestore**, in test mode for development
- Download your **service account key** from:  
  `Project Settings > Service Accounts > Generate new private key`
- Save it as: `firebase_credentails.json` inside the backend folder

### 🔹 2. Frontend (React Native)

```bash
# Clone this repo
git clone https://github.com/yourusername/quantum-banking-app.git
cd quantum-banking-app

# Install Expo CLI if not already
npm install -g expo-cli

# Install dependencies
cd frontend
yarn install
# or
npm install

# Start Expo
expo start
```

### 🔹 3. Backend (Flask + Qiskit)

```bash
# Move to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 🔸 `requirements.txt`
```
Flask
Flask-Cors
firebase-admin
qiskit
```

### Start the backend
```bash
python app.py
```

Flask server will run on `http://localhost:5000`.

---

## 🔑 Firestore Collections

| Collection        | Purpose                        |
|------------------|--------------------------------|
| `users`          | Stores user info + balance     |
| `session_keys`   | Temporary quantum keys         |
| `transactions`   | Logs of each transaction       |

---

## 🔌 React Native Dependencies

```jsonc
// package.json
{
  "dependencies": {
    "expo": "...",
    "firebase": "^9.x",
    "react-native-reanimated": "^3.x",
    "react-native-bouncy-checkbox": "^2.x",
    "expo-clipboard": "^4.x",
    "expo-router": "^3.x",
    ...
  }
}
```

To install:
```bash
yarn add firebase react-native-reanimated react-native-bouncy-checkbox expo-clipboard expo-router
```

Also install pods for iOS:
```bash
npx expo prebuild
cd ios
pod install
```

---

## 🧪 Testing

- Use Expo Go on your device or an Android/iOS simulator.
- Flask runs locally (`localhost:5000`) so ensure device/emulator can access the local server:
  - If testing on a **physical phone**, replace `localhost` with your computer's IP (e.g. `http://192.168.1.x:5000`).

---

## ✅ Firebase Firestore Rules (for production)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /session_keys/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /transactions/{docId} {
      allow read: if request.auth != null 
                  && (resource.data.from_user == request.auth.uid 
                      || resource.data.to_user == request.auth.uid);
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🧠 Quantum Key Generation

`generate_quantum_key()` is defined using Qiskit:

```python
from qiskit import QuantumCircuit, Aer, transpile, assemble
import random

def generate_quantum_key(length=128):
    backend = Aer.get_backend("qasm_simulator")
    key = ""

    for _ in range(length):
        qc = QuantumCircuit(1, 1)
        if random.choice([True, False]):
            qc.h(0)
        qc.measure(0, 0)
        qobj = assemble(transpile(qc, backend))
        result = backend.run(qobj).result()
        counts = result.get_counts()
        key += max(counts, key=counts.get)
    return key
```

---

## 📷 Screenshots

| Login | Dashboard | Transfer | Key Modal |
|-------|-----------|----------|-----------|
| ✅    | ✅         | ✅        | ✅         |

---

## ✨ Credits

Built by [Your Name] as part of a university quantum banking demo.
