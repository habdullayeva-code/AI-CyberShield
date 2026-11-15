import re
from ai_model.url_model.url_detector import analyze_url
from ai_model.message_model.message_detector import analyze_message


def is_url(user_input):
    user_input = user_input.strip()
    if " " in user_input:
        return False
    url_pattern = re.compile(r"^(https?://|www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(/.*)?$")
    return bool(url_pattern.match(user_input))


def analyze(user_input):
    if not user_input or not str(user_input).strip():
        return {
            "status": "safe",
            "risk_score": 0,
            "reasons": ["Empty input"]
        }

    if is_url(str(user_input)):
        return analyze_url(str(user_input).strip())
    else:
        return analyze_message(str(user_input).strip())


if __name__ == "__main__":
    print("URL Test:", analyze("http://example-login.com/verify"))
    print("Message Test:", analyze("URGENT! Your bank account is suspended. Click here to verify password."))
    print("Safe Test:", analyze("Hey, are we meeting tomorrow at 3 PM?"))
