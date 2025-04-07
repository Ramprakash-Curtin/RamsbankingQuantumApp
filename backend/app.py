from flask import Flask, request, jsonify
from flask_cors import CORS
from quantum_qkd import generate_quantum_key
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate("firebase_credentails.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Create Flask app
app = Flask(__name__)
CORS(app)


@app.route("/session-key", methods=["POST"])
def generate_session_key():
    try:
        data = request.get_json()
        uid = data.get("uid")

        if not uid:
            return jsonify({"error": "Missing user ID"}), 400

        # Generate a longer quantum key
        quantum_key = generate_quantum_key(length=8)

        # ✅ Set (with merge=True) instead of update
        user_ref = db.collection("users").document(uid)
        user_ref.set({
            "quantum_key": quantum_key
        }, merge=True)

        return jsonify({"quantum_key": quantum_key})

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/delete-key", methods=["POST"])
def delete_key():
    try:
        data = request.get_json()
        uid = data.get("uid")

        if not uid:
            return jsonify({"error": "User ID is required"}), 400

        db.collection("users").document(uid).update({
            "quantum_key": firestore.DELETE_FIELD
        })

        return jsonify({"success": True})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/generate-key", methods=["POST"])
def generate_key():
    try:
        data = request.get_json()

        from_user = data.get("from_user")
        to_user = data.get("to_user")
        amount = data.get("amount")

        if not all([from_user, to_user, amount]):
            return jsonify({"error": "Missing required fields"}), 400

        key = generate_quantum_key()

        doc_data = {
            "from_user": from_user,
            "to_user": to_user,
            "amount": amount,
            "quantum_key": key,
            "timestamp": firestore.SERVER_TIMESTAMP
        }

        db.collection("transactions").add(doc_data)

        response_data = {
            "from_user": from_user,
            "to_user": to_user,
            "amount": amount,
            "quantum_key": key
        }

        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/transfer", methods=["POST"])
def transfer_money():
    try:
        data = request.get_json()
        sender_uid = data.get("from_user")
        amount = float(data.get("amount"))
        submitted_key = data.get("quantum_key")

        # 🔁 Accept email or UID for recipient
        recipient_uid = None
        if "to_user" in data:
            recipient_uid = data["to_user"]
        elif "to_email" in data:
            to_email = data["to_email"]
            users_ref = db.collection("users")
            query = users_ref.where("email", "==", to_email).limit(1).stream()
            recipient_doc = next(query, None)

            if recipient_doc:
                recipient_uid = recipient_doc.id
            else:
                return jsonify({"error": "Recipient not found"}), 404

        if not all([sender_uid, recipient_uid, amount, submitted_key]):
            return jsonify({"error": "Missing required fields"}), 400

        # Validate Quantum Key
        user_doc = db.collection("users").document(sender_uid).get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        stored_key = user_doc.to_dict().get("quantum_key")
        if stored_key != submitted_key:
            return jsonify({"error": "Invalid quantum key"}), 403

        # Check balances
        sender_ref = db.collection("users").document(sender_uid)
        recipient_ref = db.collection("users").document(recipient_uid)

        sender_data = sender_ref.get().to_dict()
        recipient_data = recipient_ref.get().to_dict()

        if sender_data["balance"] < amount:
            return jsonify({"error": "Insufficient balance"}), 400

        # Update balances
        sender_ref.update({"balance": sender_data["balance"] - amount})
        recipient_ref.update({"balance": recipient_data["balance"] + amount})

        # Log transaction
        db.collection("transactions").add({
            "from_user": sender_uid,
            "to_user": recipient_uid,
            "amount": amount,
            "timestamp": firestore.SERVER_TIMESTAMP
        })

        return jsonify({"success": True, "message": "Transfer completed successfully."})

    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == "__main__":
    app.run(debug=True)
