from fastapi import FastAPI, UploadFile, File
import tensorflow as tf
import numpy as np
from PIL import Image
import json
import io
import os

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(BASE_DIR, "models", "stockella_model.keras")
CLASSES_PATH = os.path.join(BASE_DIR, "models", "class_names.json")

model = tf.keras.models.load_model(MODEL_PATH)

with open(CLASSES_PATH, "r", encoding="utf-8") as f:
    class_names = json.load(f)

IMG_SIZE = (224, 224)

def preprocess(image):
    image = image.resize(IMG_SIZE)
    image = np.array(image).astype("float32")
    image = np.expand_dims(image, axis=0)
    return image

@app.get("/")
def root():
    return {"message": "ML Service activo"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    img = preprocess(image)

    predictions = model.predict(img)[0]

    top_indices = predictions.argsort()[-3:][::-1]

    top_predictions = [
        {
            "producto": class_names[i],
            "confidence": round(float(predictions[i]), 4)
        }
        for i in top_indices
    ]

    return {
        "producto": top_predictions[0]["producto"],
        "confidence": top_predictions[0]["confidence"],
        "top_3": top_predictions
    }