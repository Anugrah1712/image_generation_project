#main.py

import os
import shutil
import uuid
from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from image import process_images  # Import your image generation pipeline
import traceback

app = FastAPI()

# Allow frontend (React) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/generate")
async def generate(
    prompt: str = Form(None),
    image1: UploadFile = None,
    image2: UploadFile = None,
    face_swap: bool = Form(False)
):
    saved_paths = []

    for img in [image1, image2]:
        if img:
            file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{img.filename}")
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(img.file, buffer)
            saved_paths.append(file_path)

    img1 = saved_paths[0] if len(saved_paths) > 0 else None
    img2 = saved_paths[1] if len(saved_paths) > 1 else None

    try:
        output_path = process_images(prompt, img1, img2, face_swap=face_swap)
    except Exception as e:
        print("❌ ERROR in /generate endpoint:")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

    return FileResponse(output_path, media_type="image/jpeg")

@app.get("/")
def home():
    return {"message": "Backend is running 🚀"}
