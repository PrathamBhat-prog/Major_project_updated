import tensorflow as tf
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import io
import os
import pandas as pd
import joblib
from shapely.geometry import Polygon
from huggingface_hub import hf_hub_download
from dotenv import load_dotenv

load_dotenv()

# ==================================================
# GLOBAL CONFIG
# ==================================================
IMG_SIZE = 256
NUM_LANDMARKS = 19

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "downloaded_models")
os.makedirs(MODEL_DIR, exist_ok=True)

# ==================================================
# MODEL PATHS (HF)
# ==================================================
SEG_MODEL_PATH = hf_hub_download(
    repo_id="gurunathasmb/cepha-models",
    filename="segmentation_model.h5",
    local_dir=MODEL_DIR
)

REG_MODEL_PATH = hf_hub_download(
    repo_id="gurunathasmb/cepha-models",
    filename="landmark_regressor.h5",
    local_dir=MODEL_DIR
)

GB_MODEL_PATH = hf_hub_download(
    repo_id="gurunathasmb/cepha-models",
    filename="GradientBoosting.joblib",
    local_dir=MODEL_DIR
)

SCALER_PATH = hf_hub_download(
    repo_id="gurunathasmb/cepha-models",
    filename="scaler.joblib",
    local_dir=MODEL_DIR
)

_seg_model = None
_reg_model = None
_gb = None
_scaler = None


# ==================================================
# LOAD MODELS (ONCE)
# ==================================================
def load_models():
    global _seg_model, _reg_model
    if _seg_model is None:
        _seg_model = tf.keras.models.load_model(SEG_MODEL_PATH, compile=False)
    if _reg_model is None:
        _reg_model = tf.keras.models.load_model(REG_MODEL_PATH, compile=False)
    return _seg_model, _reg_model


def load_gb():
    global _gb, _scaler
    if _gb is None:
        _gb = joblib.load(GB_MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
    return _gb, _scaler


# ==================================================
# PREPROCESS
# ==================================================
def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("L")
    img = img.resize((IMG_SIZE, IMG_SIZE))
    arr = np.array(img, dtype=np.float32) / 255.0
    return arr.reshape(1, IMG_SIZE, IMG_SIZE, 1)


# ==================================================
# LANDMARK PREDICTION
# ==================================================
def predict_landmarks(image_bytes):
    seg_model, reg_model = load_models()
    x = preprocess_image(image_bytes)

    mask = seg_model.predict(x, verbose=0)
    x_masked = x * mask

    preds = reg_model.predict(x_masked, verbose=0)[0]

    landmarks = []
    for i in range(0, len(preds), 2):
        landmarks.append({
            "name": f"P{i//2 + 1}",
            "x": float(preds[i]),
            "y": float(preds[i + 1])
        })

    return landmarks


# ==================================================
# ANGLE COMPUTATION
# ==================================================
def angle(v1, v2):
    return np.degrees(
        np.arccos(
            np.clip(
                np.dot(v1, v2) /
                (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-9),
                -1, 1
            )
        )
    )


def compute_angles(landmarks):
    P = {p["name"]: np.array([p["x"], p["y"]]) for p in landmarks}

    SN = P["P1"] - P["P2"]

    angles = {
        "SNA": angle(P["P5"] - P["P2"], SN),
        "SNB": angle(P["P6"] - P["P2"], SN),
    }

    angles["ANB"] = angles["SNA"] - angles["SNB"]
    angles["FMA"] = angle(P["P4"] - P["P3"], P["P10"] - P["P8"])
    angles["SN_GoGn"] = angle(SN, P["P8"] - P["P10"])
    angles["U1_SN"] = angle(P["P12"] - P["P11"], SN)
    angles["L1_MP"] = angle(P["P11"] - P["P12"], P["P10"] - P["P8"])
    angles["Interincisal"] = angle(P["P12"] - P["P11"], P["P11"] - P["P12"])

    return angles


# ==================================================
# AIRWAY
# ==================================================
def compute_airway(landmarks):
    P = {p["name"]: np.array([p["x"], p["y"]]) for p in landmarks}
    try:
        upper = np.linalg.norm(P["P7"] - P["P13"])
        lower = np.linalg.norm(P["P17"] - P["P18"])
        area = Polygon([P["P15"], P["P13"], P["P14"], P["P16"]]).area

        return {
            "upper_airway_width": float(upper),
            "lower_airway_width": float(lower),
            "airway_area": float(area)
        }
    except:
        return {
            "upper_airway_width": None,
            "lower_airway_width": None,
            "airway_area": None
        }


# ==================================================
# CLINICAL INTERPRETATION
# ==================================================
def clinical_classify(angles):
    SNA = angles.get("SNA")
    SNB = angles.get("SNB")
    ANB = angles.get("ANB")
    FMA = angles.get("FMA")
    SN_MP = angles.get("SN_GoGn")

    if ANB is None:
        skeletal = "Unknown"
    elif ANB < 1:
        skeletal = "Class III"
    elif ANB > 3:
        skeletal = "Class II"
    else:
        skeletal = "Class I"

    if SNA is None:
        maxilla = "Unknown"
    elif SNA > 84:
        maxilla = "Prognathic Maxilla"
    elif SNA < 80:
        maxilla = "Retrognathic Maxilla"
    else:
        maxilla = "Normal Maxilla"

    if SNB is None:
        mandible = "Unknown"
    elif SNB > 82:
        mandible = "Prognathic Mandible"
    elif SNB < 78:
        mandible = "Retrognathic Mandible"
    else:
        mandible = "Normal Mandible"

    if FMA is None or SN_MP is None:
        divergence = "Unknown"
    elif FMA > 29 or SN_MP > 36:
        divergence = "Hyperdivergent"
    elif FMA < 21 or SN_MP < 28:
        divergence = "Hypodivergent"
    else:
        divergence = "Normodivergent"

    return {
        "skeletal_class": skeletal,
        "maxilla_status": maxilla,
        "mandible_status": mandible,
        "divergence_status": divergence
    }


# ==================================================
# ML SKELETAL CLASSIFIER
# ==================================================
def ml_classify(angles):
    gb, scaler = load_gb()

    feature_order = [
        "SNA", "SNB", "ANB",
        "FMA", "SN_GoGn",
        "U1_SN", "L1_MP", "Interincisal"
    ]

    values = [angles.get(f, 0) for f in feature_order]
    X = scaler.transform([values])
    pred = gb.predict(X)[0]

    class_map = {0: "Class I", 1: "Class II", 2: "Class III"}
    return class_map.get(pred, "Unknown")


# ==================================================
# DRAW IMAGE
# ==================================================
def save_labeled_image(image_bytes, landmarks, path):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    w, h = img.size
    draw = ImageDraw.Draw(img)

    r = max(1, int(min(w, h) * 0.006))
    lw = max(1, int(min(w, h) * 0.003))
    fs = max(8, int(min(w, h) * 0.015))

    try:
        font = ImageFont.truetype("arial.ttf", fs)
    except:
        font = ImageFont.load_default()

    def pt(p):
        return int(p["x"] * w), int(p["y"] * h)

    # ===============================
    # DRAW LANDMARKS
    # ===============================
    for p in landmarks:
        x, y = pt(p)

        draw.ellipse((x-r-1, y-r-1, x+r+1, y+r+1), fill="white")
        draw.ellipse((x-r, y-r, x+r, y+r), fill="red")

        draw.text((x + r + 2, y - r - 2), p["name"],
                  fill="yellow", font=font)

    # ===============================
    # DRAW IMPORTANT LINES
    # ===============================
    L = {p["name"]: pt(p) for p in landmarks}

    def draw_line(a, b, color):
        if a in L and b in L:
            draw.line((L[a], L[b]), fill=color, width=lw)

    # Cephalometric reference lines
    draw_line("P1", "P2", "#22c55e")   # SN
    draw_line("P2", "P5", "#3b82f6")   # NA
    draw_line("P2", "P6", "#ef4444")   # NB
    draw_line("P10", "P8", "#f59e0b")  # Mandibular plane

    # Airway references
    draw_line("P7", "P13", "cyan")
    draw_line("P15", "P14", "yellow")
    draw_line("P17", "P18", "magenta")

    img.save(path, quality=95)
    return path

# ==================================================
# 1️⃣ CLINICAL FULL PIPELINE
# ==================================================
def process_clinical(image_bytes, ceph_id):
    landmarks = predict_landmarks(image_bytes)
    angles = compute_angles(landmarks)
    clinical_results = clinical_classify(angles)
    airway = compute_airway(landmarks)

    os.makedirs("outputs", exist_ok=True)

    img_path = f"outputs/ceph_{ceph_id}_clinical.jpg"
    save_labeled_image(image_bytes, landmarks, img_path)

    excel_path = f"outputs/ceph_{ceph_id}_clinical.xlsx"
    pd.DataFrame(landmarks).to_excel(excel_path, index=False)

    return {
        "landmarks": landmarks,
        "angles": angles,
        "mode_used": "clinical",
        "skeletal_class": clinical_results["skeletal_class"],
        "maxilla_status": clinical_results["maxilla_status"],
        "mandible_status": clinical_results["mandible_status"],
        "divergence_status": clinical_results["divergence_status"],
        "airway": airway,
        "output_image": img_path,
        "excel_file": excel_path
    }


# ==================================================
# 2️⃣ ML STAGE 1 – LANDMARK ONLY
# ==================================================
def predict_landmarks_only(image_bytes, ceph_id):
    landmarks = predict_landmarks(image_bytes)

    os.makedirs("outputs", exist_ok=True)
    preview_path = f"outputs/ceph_{ceph_id}_preview.jpg"
    save_labeled_image(image_bytes, landmarks, preview_path)

    return {
        "landmarks": landmarks,
        "preview_image": preview_path
    }


# ==================================================
# 3️⃣ ML STAGE 2 – FINALIZE
# ==================================================
def process_ml_finalize(image_bytes, ceph_id, landmarks):
    angles = compute_angles(landmarks)

    clinical_results = clinical_classify(angles)

    airway = compute_airway(landmarks)

    os.makedirs("outputs", exist_ok=True)

    img_path = f"outputs/ceph_{ceph_id}_ml.jpg"
    save_labeled_image(image_bytes, landmarks, img_path)

    excel_path = f"outputs/ceph_{ceph_id}_ml.xlsx"
    pd.DataFrame(landmarks).to_excel(excel_path, index=False)

    return {
        "landmarks": landmarks,
        "angles": angles,
        "mode_used": "ml",
        "skeletal_class": clinical_results["skeletal_class"],
        "maxilla_status": clinical_results["maxilla_status"],
        "mandible_status": clinical_results["mandible_status"],
        "divergence_status": clinical_results["divergence_status"],
        "airway": airway,
        "output_image": img_path,
        "excel_file": excel_path
    }