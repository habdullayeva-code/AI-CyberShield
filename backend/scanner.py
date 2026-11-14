import re
from urllib.parse import urlparse

SUSPICIOUS_WORDS = [
    "login", "verify", "bank", "update", "free", "gift",
    "urgent", "password", "account", "bloklanmaq", "tesdiqleyin", "hediyye"
]


def analyze_url(url: str) -> dict:
    parsed = urlparse(url if url.startswith("http") else f"http://{url}")
    domain = parsed.netloc or parsed.path

    has_https = url.startswith("https://")
    is_ip = bool(re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain))
    found_words = [word for word in SUSPICIOUS_WORDS if word in url.lower()]

    base_score = 0
    if not has_https:
        base_score += 30
    if is_ip:
        base_score += 40
    if len(domain) > 35:
        base_score += 15
    base_score += len(found_words) * 10

    return {
        "base_score": min(base_score, 100),
        "details": {
            "has_https": has_https,
            "suspicious_keywords": found_words,
            "domain_length": len(domain),
            "is_ip_address": is_ip,
        },
    }


def analyze_text(text: str) -> dict:
    found_words = [word for word in SUSPICIOUS_WORDS if word in text.lower()]
    base_score = min(len(found_words) * 15, 100)
    return {
        "base_score": base_score,
        "details": {
            "suspicious_keywords": found_words,
        },
    }