import os
import pandas as pd
from datetime import datetime

# Path where master sheet is stored
MASTER_PATH = "local_storage/master_sheet.xlsx"


def append_to_master_excel(
    filename,
    result,
    extra_landmarks=None   # optional for extra custom points
):
    """
    filename example:
    ADARSH M_15_20250426_223628.jpg
    """

    # ==========================================
    # Parse filename metadata
    # ==========================================
    base = os.path.splitext(filename)[0]

    try:
        name_part, age, date_part, time_part = base.split("_")
    except:
        name_part = base
        age = ""
        date_part = ""
        time_part = ""

    # Format date
    analysis_date = ""
    analysis_time = ""

    if len(date_part) == 8:
        analysis_date = f"{date_part[:4]}-{date_part[4:6]}-{date_part[6:]}"
    if len(time_part) == 6:
        analysis_time = f"{time_part[:2]}:{time_part[2:4]}:{time_part[4:]}"

    # ==========================================
    # Base row information
    # ==========================================
    row = {
        "patient_name": name_part,
        "age": age,
        "analysis_date": analysis_date,
        "analysis_time": analysis_time,
        "skeletal_class": result.get("skeletal_class"),
        "maxilla_status": result.get("maxilla_status"),
        "mandible_status": result.get("mandible_status"),
        "divergence_status": result.get("divergence_status"),
    }

    # ==========================================
    # Angles
    # ==========================================
    angles = result.get("angles", {})
    for k, v in angles.items():
        row[k] = v

    # ==========================================
    # Airway
    # ==========================================
    airway = result.get("airway", {})
    row["upper_airway"] = airway.get("upper_airway")
    row["airway_class"] = result.get("airway_class")

    # ==========================================
    # Core Landmarks
    # ==========================================
    landmarks = result.get("landmarks", [])

    for lm in landmarks:
        name = lm.get("name")
        if name:
            row[f"{name}_x"] = lm.get("x")
            row[f"{name}_y"] = lm.get("y")

    # ==========================================
    # Extra Landmarks (if any)
    # ==========================================
    if extra_landmarks:
        for lm in extra_landmarks:
            name = lm.get("name")
            if name:
                row[f"{name}_x"] = lm.get("x")
                row[f"{name}_y"] = lm.get("y")

    # ==========================================
    # Save to Excel
    # ==========================================
    df_new = pd.DataFrame([row])

    if os.path.exists(MASTER_PATH):
        try:
            df_existing = pd.read_excel(MASTER_PATH)
            df_final = pd.concat([df_existing, df_new], ignore_index=True)
        except Exception:
            df_final = df_new
    else:
        df_final = df_new

    # Ensure directory exists
    os.makedirs(os.path.dirname(MASTER_PATH), exist_ok=True)

    df_final.to_excel(MASTER_PATH, index=False)

    return MASTER_PATH