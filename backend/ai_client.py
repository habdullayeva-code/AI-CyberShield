import os
import httpx
from dotenv import load_dotenv

load_dotenv()
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "") # Məsələn: http://localhost:8001/predict

async def get_ai_verdict(target: str, scan_type: str, tech_details: dict) -> dict:
    # Əgər qrup yoldaşının AI servisi qoşulubsa, ora sorğu göndər
    if AI_SERVICE_URL:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(AI_SERVICE_URL, json={
                    "target": target,
                    "type": scan_type,
                    "technical_context": tech_details
                })
                if response.status_code == 200:
                    return response.json() # Gözlənilən: {"ai_score": 85, "explanation": "..."}
        except Exception as e:
            print(f"AI servisinə qoşulma xətası: {e}")

    # AI hələ hazır deyilsə və ya cavab vermirsə, müvəqqəti standart cavab
    return {
        "ai_score": None,
        "explanation": "Texniki analiz tamamlandı. AI modulu qoşulduqda dərin məzmun analizi də burada görünəcək."
    }