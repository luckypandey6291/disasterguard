from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from google import genai
import os
import json
import re

app = FastAPI(title="DisasterGuard AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyCJg8EQ1CmOa3KrTQ4ro9qQPwaNDIM4WrU")
client = genai.Client(api_key=GEMINI_API_KEY)

# ---- Models ----

class PredictionRequest(BaseModel):
    latitude: float
    longitude: float
    temperature: Optional[float] = 30.0
    humidity: Optional[float] = 70.0
    wind_speed: Optional[float] = 20.0
    rainfall: Optional[float] = 50.0
    season: Optional[str] = "monsoon"

class SOSClassifyRequest(BaseModel):
    emergency_type: str
    latitude: float
    longitude: float
    description: Optional[str] = ""

# ---- Helper ----

def extract_json(text: str) -> dict:
    try:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return json.loads(match.group())
    except:
        pass
    return {}

def gemini_generate(prompt: str) -> str:
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt
    )
    return response.text

# ---- Endpoints ----

@app.get("/")
def root():
    return {"status": "DisasterGuard AI Service running", "version": "2.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/predict")
async def predict(req: PredictionRequest):
    prompt = f"""
You are a disaster prediction AI for India. Analyze this weather data and predict disaster risk.

Data:
- Location: {req.latitude}, {req.longitude}
- Temperature: {req.temperature}°C
- Humidity: {req.humidity}%
- Wind Speed: {req.wind_speed} km/h
- Rainfall: {req.rainfall} mm
- Season: {req.season}

Respond ONLY with valid JSON in this exact format, no extra text:
{{
  "disaster_type": "FLOOD or CYCLONE or HEATWAVE or EARTHQUAKE or GENERAL",
  "confidence": 0.85,
  "risk_level": "HIGH or MEDIUM or LOW",
  "recommendations": ["tip1", "tip2", "tip3", "tip4"]
}}
"""
    try:
        text = gemini_generate(prompt)
        result = extract_json(text)
        if result:
            return result
    except Exception as e:
        print(f"Gemini error: {e}")

    # Fallback
    return {
        "disaster_type": "FLOOD" if req.rainfall > 80 else "GENERAL",
        "confidence": 0.72,
        "risk_level": "HIGH" if req.rainfall > 80 else "MEDIUM",
        "recommendations": [
            "Stay indoors during heavy rain",
            "Keep emergency contacts ready",
            "Stock 3 days of water and food",
            "Follow official announcements",
        ]
    }

@app.post("/classify-sos")
async def classify_sos(req: SOSClassifyRequest):
    prompt = f"""
You are an emergency response AI. Classify this SOS alert and recommend response.

SOS Details:
- Emergency Type: {req.emergency_type}
- Location: {req.latitude}, {req.longitude}
- Description: {req.description or 'No description provided'}

Respond ONLY with valid JSON in this exact format, no extra text:
{{
  "category": "FLOOD_EMERGENCY or FIRE_EMERGENCY or MEDICAL_EMERGENCY or CYCLONE_EMERGENCY or GENERAL_EMERGENCY",
  "priority": "CRITICAL or HIGH or MEDIUM or LOW",
  "recommended_response": "specific action to take",
  "estimated_response_time": "X-Y minutes"
}}
"""
    try:
        text = gemini_generate(prompt)
        result = extract_json(text)
        if result:
            return result
    except Exception as e:
        print(f"Gemini error: {e}")

    # Fallback
    return {
        "category": "GENERAL_EMERGENCY",
        "priority": "HIGH",
        "recommended_response": "Dispatch nearest available responder immediately",
        "estimated_response_time": "8-12 minutes",
    }

@app.get("/risk-summary")
async def risk_summary():
    prompt = """
You are a disaster risk AI for Kolkata, India. Generate a current risk summary.

Respond ONLY with valid JSON in this exact format, no extra text:
{
  "region": "Kolkata",
  "overall_risk": "HIGH or MEDIUM or LOW",
  "active_warnings": [
    {"type": "disaster type", "confidence": 0.85, "area": "area name"}
  ],
  "safe_zones": ["zone1", "zone2"],
  "ai_message": "one sentence summary for civilians"
}
"""
    try:
        text = gemini_generate(prompt)
        result = extract_json(text)
        if result:
            return result
    except Exception as e:
        print(f"Gemini error: {e}")

    return {
        "region": "Kolkata",
        "overall_risk": "MEDIUM",
        "active_warnings": [
            {"type": "FLOOD", "confidence": 0.76, "area": "North Kolkata"},
        ],
        "safe_zones": ["South Kolkata", "Salt Lake"],
        "ai_message": "Stay alert and follow official disaster management updates.",
    }