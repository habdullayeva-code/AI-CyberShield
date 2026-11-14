import re
import joblib

MODEL_PATH = "ai_model/saved_models/message_model.pkl"
model = joblib.load(MODEL_PATH)


def analyze_message(text):
    reasons = []
    ai_prob = model.predict_proba([text])[0][1]
    risk_score = int(ai_prob * 100)

    urgent_words = ["urgent", "immediately", "suspended", "verify", "click here", "winner", "prize", "bank", "password"]
    for word in urgent_words:
        if word in text.lower():
            risk_score += 5
            reasons.append(f"Suspicious phrase: {word}")

    if re.search(r"http[s]?://|www\.", text.lower()):
        risk_score += 10
        reasons.append("Contains external link")

    risk_score = min(max(risk_score, 0), 100)

    if risk_score >= 70:
        status = "phishing"
        if not reasons:
            reasons.append("Phishing pattern detected in message")
    elif risk_score >= 50:
        status = "suspicious"
        if not reasons:
            reasons.append("Potentially suspicious wording")
    else:
        status = "safe"
        reasons = ["Message appears safe"]

    return {
        "status": status,
        "risk_score": risk_score,
        "reasons": reasons
    }
