import cv2
import numpy as np
import base64
import os
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv

load_dotenv()

# --- Import your modules ---
try:
    from main.face_detector import get_landmarks, NoFaceFoundError, MultipleFacesFoundError
    from main.ratio_calculator import calculate_ratios
except ImportError:
    from src.face_detector import get_landmarks, NoFaceFoundError, MultipleFacesFoundError
    from src.ratio_calculator import calculate_ratios

class ImagePayload(BaseModel):
    image_data: str

app = FastAPI(title="Facial Phi Analyzer API")

# --- CORS ---
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost",
    "https://phi-ratio-analyzer.onrender.com",
    "https://phi-ratio-analyzer.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helper Functions ---
def base64_to_image(base64_string):
    try:
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
        img_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception as e:
        print(f"Error decoding base64: {e}")
        return None

def image_toZX_base64(image):
    _, buffer = cv2.imencode('.jpg', image)
    base64_image = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{base64_image}"

# --- Core Logic ---
def process_and_annotate(image):
    try:
        landmarks = get_landmarks(image)
        results = calculate_ratios(landmarks)
        annotated_img = image.copy()
        for (x, y) in landmarks:
            cv2.circle(annotated_img, (x, y), 3, (0, 255, 0), -1)
        return results, annotated_img, None
    except (NoFaceFoundError, MultipleFacesFoundError) as e:
        return None, None, str(e)
    except Exception as e:
        return None, None, f"An unexpected error occurred: {str(e)}"

# =========================================
# NEW: Keep-Alive / Health Check Endpoint
# =========================================
@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check():
    """
    A simple endpoint that can be pinged by an uptime service
    to prevent the Render free tier from spinning down.
    """
    return {"status": "Server is healthy"}

# =========================================
# WebSocket Endpoint
# =========================================
@app.websocket("/ws/realtime-face")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            image = base64_to_image(data)
            if image is None: continue

            try:
                landmarks = get_landmarks(image)
                await websocket.send_json({"landmarks": landmarks.tolist()})
            except:
                await websocket.send_json({"landmarks": []})
    except WebSocketDisconnect:
        print("Client disconnected from WebSocket")
    except Exception as e:
        print(f"WS Error: {e}")

# --- Standard HTTP Endpoint ---
@app.post("/analyze-phi-ratio")
async def analyze_image(payload: ImagePayload):
    image = base64_to_image(payload.image_data)
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image data.")

    results, annotated_img, error = process_and_annotate(image)

    if error:
        raise HTTPException(status_code=400, detail=error)

    return {
        "success": True,
        "results": results,
        "annotated_image": image_toZX_base64(annotated_img)
    }

if __name__ == "__main__":
    host = os.getenv("APP_HOST", "127.0.0.1")
    port = int(os.getenv("APP_PORT", 8000))
    print(f"Starting server on http://{host}:{port}")
    uvicorn.run(app, host=host, port=port)
