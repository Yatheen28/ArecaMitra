from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
import shutil, os, uuid

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"],
  allow_methods=["*"], allow_headers=["*"])

IMG_SIZE = (380, 380)
CLASS_NAMES = ["Healthy_Nut", "healthy_leaf",
               "mahali_kolerega", "yellow_leaf"]
DISPLAY_EN = {
  "Healthy_Nut": "Healthy Arecanut",
  "healthy_leaf": "Healthy Leaf",
  "mahali_kolerega": "Koleroga (Mahali)",
  "yellow_leaf": "Yellow Leaf Disease"
}
DISPLAY_KN = {
  "Healthy_Nut": "ಆರೋಗ್ಯಕರ ಅಡಿಕೆ",
  "healthy_leaf": "ಆರೋಗ್ಯಕರ ಎಲೆ",
  "mahali_kolerega": "ಕೊಳೆರೋಗ (ಮಹಾಲಿ)",
  "yellow_leaf": "ಹಳದಿ ಎಲೆ ರೋಗ"
}
TREATMENT_EN = {
  "mahali_kolerega": [
    "Remove and destroy infected plant parts immediately",
    "Apply Bordeaux mixture (1%) spray on affected areas",
    "Improve drainage around the plant base",
    "Contact KVK Mangaluru: +918242220761"
  ],
  "yellow_leaf": [
    "Check for root rot and improve soil drainage",
    "Apply balanced NPK fertilizer",
    "Remove severely yellowed leaves",
    "Contact KVK for soil testing"
  ]
}

model = None
def load_model():
  global model
  if model is None:
    model = tf.keras.models.load_model("areca_leaf_model.h5")
  return model

@app.on_event("startup")
async def startup():
  load_model()

@app.get("/")
def health():
  return {"status": "ArecaMitra API running"}

@app.post("/predict")
async def predict(image: UploadFile = File(...)):
  ext = os.path.splitext(image.filename or "img.jpg")[1] or ".jpg"
  tmp = f"tmp_{uuid.uuid4().hex}{ext}"
  with open(tmp, "wb") as f:
    shutil.copyfileobj(image.file, f)
  try:
    img = tf.keras.utils.load_img(tmp, target_size=IMG_SIZE)
    arr = tf.keras.utils.img_to_array(img)
    arr = tf.expand_dims(arr, 0)
    preds = load_model().predict(arr)[0]
    idx = int(np.argmax(preds))
    cls = CLASS_NAMES[idx]
    conf = float(np.max(preds))
    is_healthy = cls in ["Healthy_Nut", "healthy_leaf"]
    return {
      "class": cls,
      "display_en": DISPLAY_EN[cls],
      "display_kn": DISPLAY_KN[cls],
      "confidence": round(conf * 100, 1),
      "is_healthy": is_healthy,
      "treatment": TREATMENT_EN.get(cls, [])
    }
  finally:
    if os.path.exists(tmp):
      os.remove(tmp)
