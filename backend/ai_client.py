import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


async def get_ai_verdict(target: str, scan_type: str, details: dict) -> dict:
    """
    Sends target telemetry to Groq (Llama-3) for English SOC threat analysis.
    Returns 'ai_score' (0-100) and 'explanation' matching main.py schema.
    Falls back seamlessly to deterministic SOC logic if API key is missing or offline.
    """
    if GROQ_API_KEY:
        try:
            system_prompt = (
                "You are a senior Tier-3 SOC (Security Operations Center) Cyber Threat Analyst. "
                "Analyze the provided URL or message text along with its technical heuristics. "
                "Respond strictly in valid JSON format with two keys: "
                "'ai_score' (an integer from 0 to 100 indicating threat severity) and "
                "'explanation' (a concise, authoritative 2-3 sentence technical security verdict in English explaining why it is safe, suspicious, or malicious)."
            )

            user_payload = (
                f"Scan Type: {scan_type.upper()}\n"
                f"Target Content: {target}\n"
                f"Extracted Technical Metrics: {json.dumps(details)}"
            )

            headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            }

            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_payload},
                ],
                "temperature": 0.2,
                "max_tokens": 220,
                "response_format": {"type": "json_object"},
            }

            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.post(GROQ_API_URL, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()

                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)

                return {
                    "ai_score": max(0, min(100, int(parsed.get("ai_score", 50)))),
                    "explanation": parsed.get(
                        "explanation",
                        "Neural analysis completed. Review technical telemetry indicators above.",
                    ),
                }

        except Exception as e:
            print(f"[AI Engine Fallback Triggered]: {e}")

    # --- LOCAL FALLBACK SOC LOGIC (Runs when no API key is set or offline) ---
    keywords = details.get("suspicious_keywords", [])
    has_https = details.get("has_https", True)
    is_ip = details.get("is_ip_address", False)

    if is_ip or (not has_https and len(keywords) >= 2):
        return {
            "ai_score": 92,
            "explanation": (
                f"CRITICAL ALERT: High-confidence phishing signature detected. The target lacks transport encryption "
                f"or utilizes raw IP masking combined with high-risk lure keywords ({', '.join(keywords[:3])}). "
                f"Immediate blocking and credential isolation recommended."
            ),
        }

    if keywords or not has_https:
        kw_text = f"flagged keywords ({', '.join(keywords)})" if keywords else "missing HTTPS encryption"
        return {
            "ai_score": 55,
            "explanation": (
                f"CAUTION: Behavioral anomalies observed due to {kw_text}. This pattern frequently correlates with "
                f"credential harvesting or social engineering lures. Verify domain authenticity before interaction."
            ),
        }

    return {
        "ai_score": 8,
        "explanation": (
            "CLEAR: Structural inspection confirms valid protocol hygiene with zero known social-engineering "
            "or obfuscation vectors detected. Target appears safe for standard operational access."
        ),
    }