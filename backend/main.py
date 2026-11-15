from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import ScanRequest, ScanResponse, TechnicalDetails
from scanner import analyze_url, analyze_text
from ai_client import get_ai_verdict

app = FastAPI(title="AI CyberShield API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "online", "message": "CyberShield Backend işləyir"}

@app.post("/api/scan", response_model=ScanResponse)
async def scan_target(request: ScanRequest):
    if request.scan_type == "url":
        tech_result = analyze_url(request.target)
    elif request.scan_type == "text":
        tech_result = analyze_text(request.target)
    else:
        raise HTTPException(status_code=400, detail="Dəstəklənməyən scan_type. 'url' və ya 'text' göndərin.")

    ai_result = await get_ai_verdict(request.target, request.scan_type, tech_result["details"])
    
    final_score = tech_result["base_score"]
    if ai_result.get("ai_score") is not None:
        final_score = int((tech_result["base_score"] + ai_result["ai_score"]) / 2)

    if final_score >= 70:
        status = "malicious"
    elif final_score >= 35:
        status = "suspicious"
    else:
        status = "safe"

    return ScanResponse(
        status=status,
        risk_score=final_score,
        technical_details=TechnicalDetails(**tech_result["details"]),
        ai_analysis=ai_result["explanation"]
    )