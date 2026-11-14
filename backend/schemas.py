from pydantic import BaseModel, HttpUrl
from typing import List, Optional

class ScanRequest(BaseModel):
    target: str          
    scan_type: str       

class TechnicalDetails(BaseModel):
    has_https: Optional[bool] = None
    suspicious_keywords: List[str] = []
    domain_length: Optional[int] = None
    is_ip_address: Optional[bool] = None

class ScanResponse(BaseModel):
    status: str                  
    risk_score: int             
    technical_details: TechnicalDetails
    ai_analysis: str            