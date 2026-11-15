import re
import joblib
from urllib.parse import urlparse

MODEL_PATH = "ai_model/saved_models/url_model.pkl"
model = joblib.load(MODEL_PATH)


def extract_features(url):
    parsed = urlparse(url)
    domain = parsed.netloc.lower()

    return [
        len(url),
        url.count("."),
        url.count("-"),
        sum(char.isdigit() for char in url),
        url.count("@"),
        int(parsed.scheme == "https"),
        len(domain.split(".")),
        int(bool(re.search(r"\d+\.\d+\.\d+\.\d+", domain))),
        sum(word in url.lower() for word in [
            "login", "verify", "account",
            "password", "secure", "update"
        ])
    ]


def analyze_url(url):
    if not url.startswith(("http://", "https://")):
        url = "http://" + url

    parsed_url = urlparse(url)
    domain = parsed_url.netloc.lower()
    reasons = []

    features = [extract_features(url)]
    ai_prob = model.predict_proba(features)[0][1]
    risk_score = int(ai_prob * 100)

    if parsed_url.scheme != "https":
        risk_score += 10
        reasons.append("URL does not use HTTPS")

    if re.search(r"\d+\.\d+\.\d+\.\d+", domain):
        risk_score += 20
        reasons.append("IP address used instead of domain")

    if "@" in url:
        risk_score += 15
        reasons.append("Contains '@' symbol")

    suspicious_words = ["login", "verify", "account", "password", "secure", "update", "bank"]
    for word in suspicious_words:
        if word in url.lower():
            risk_score += 5
            reasons.append(f"Suspicious keyword: {word}")

    risk_score = min(max(risk_score, 0), 100)

    if risk_score >= 70:
        status = "phishing"
        if not reasons:
            reasons.append("High phishing probability detected by AI model")
    elif risk_score >= 50:
        status = "suspicious"
        if not reasons:
            reasons.append("Moderate risk pattern detected by AI model")
    else:
        status = "safe"
        reasons = ["No significant threats detected"]

    return {
        "status": status,
        "risk_score": risk_score,
        "reasons": reasons
    }


if __name__ == "__main__":
    print(analyze_url("http://example-login.com/verify"))