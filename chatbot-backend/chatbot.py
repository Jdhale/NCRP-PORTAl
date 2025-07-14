from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
import os, re, tempfile
import google.generativeai as genai
from dotenv import load_dotenv
from nlp_pdf import load_trained_model, preprocess_text, create_pdf_report

# Load env vars & configure Gemini
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

# Load trained ML model once
pipeline = load_trained_model()

# Chat session
chat_model = genai.GenerativeModel("gemini-2.0-flash")
chat_session = chat_model.start_chat(history=[])
session_active = True

class ComplaintForm(BaseModel):
    complaint: str
    name: str
    email: str
    date: str
    time: str
    location: str

from fastapi import Form  # ✅ ADD this import if not already present

@app.post("/generate-pdf")
async def generate_pdf(
    complaint: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    date: str = Form(...),
    time: str = Form(...),
    location: str = Form(...)
):
    processed = preprocess_text(complaint)
    category = pipeline.predict([processed])[0]
    complaint_info = {
        "complaint": complaint,
        "name": name,
        "email": email,
        "date": date,
        "time": time,
        "location": location
    }

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        filename = tmp.name

    create_pdf_report(complaint_info, category, filename)
    return FileResponse(filename, media_type="application/pdf", filename="cybercrime_report.pdf")


@app.post("/chat")
async def chat(msg: str = Form(...)):
    global session_active
    if not session_active:
        return JSONResponse({"response": "Session ended. Restart chat."})
    if msg.lower() in ["exit", "quit", "bye"]:
        session_active = False
        return JSONResponse({"response": "Goodbye! Chat closed."})
    try:
        response = chat_session.send_message(msg)
        plain = re.sub(r'[*_`>#-]+', '', response.text).strip()
        return JSONResponse({"response": plain})
    except Exception as e:
        return JSONResponse({"response": f"Error: {str(e)}"})

@app.get("/")
def read_root():
    return {"message": "✅ NCRP backend running"}
