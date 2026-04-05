import os
import io
import datetime
import numpy as np

from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image,
    Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.pagesizes import A4

# =========================
# UI COLORS
# =========================
header_bg_color = colors.HexColor("#e0ecff")
primary_color = colors.HexColor("#1e40af")
soft_bg = colors.HexColor("#f8fafc")
highlight_bg = colors.HexColor("#ecfdf5")
note_bg = colors.HexColor("#fefce8")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
logo_path = os.path.join(BASE_DIR, "assets", "logo.png")

# =========================
# COMMON STYLES & HEADER
# =========================
def get_styles():
    s = getSampleStyleSheet()
    title_style = ParagraphStyle(name="Title", parent=s["Heading1"], fontSize=16, alignment=1, textColor=colors.HexColor("#0f172a"))
    subtitle_style = ParagraphStyle(name="Subtitle", parent=s["Normal"], fontSize=10, alignment=1, textColor=colors.grey)
    section_style = ParagraphStyle(name="Section", parent=s["Heading2"], fontSize=13, textColor=primary_color, spaceAfter=6)
    normal_style = ParagraphStyle(name="NormalCustom", parent=s["Normal"], fontSize=10, spaceAfter=4)
    return s, title_style, subtitle_style, section_style, normal_style

def create_header(title_text):
    _, title_style, subtitle_style, _, _ = get_styles()
    logo = ""
    if os.path.exists(logo_path):
        logo = Image(logo_path, width=1.0*inch, height=1.0*inch)

    header_text = [
        Paragraph("<b>Dayananda Sagar College of Dental Sciences</b>", title_style),
        Paragraph("Department of Orthodontics", subtitle_style),
        Paragraph(f"<b>CephAI {title_text}</b>", subtitle_style),
        Paragraph(f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}", subtitle_style),
    ]

    table = Table([[logo, header_text]], colWidths=[1.2*inch, 5.0*inch])
    table.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("BACKGROUND", (0,0), (-1,-1), header_bg_color),
        ("BOX", (0,0), (-1,-1), 1.2, primary_color),
    ]))
    return table

# =========================
# ADVANCED ANALYTICS REPORT
# =========================
def generate_advanced_report(save_path, source_type, data):
    doc = SimpleDocTemplate(save_path, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    elements = []
    _, _, _, section_style, normal_style = get_styles()

    source_label = "Live Database" if source_type == "db" else "Master Excel Dataset"
    elements.append(create_header(f"Insights Report ({source_label})"))
    elements.append(Spacer(1, 0.2*inch))

    # Basic Info
    elements.append(Paragraph(f"Dataset Size: {len(data)} Records analyzed from {source_label}", section_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=soft_bg))
    elements.append(Spacer(1, 0.2*inch))

    # Calculate Correlations
    metrics = ["SNB", "SNA", "YEN", "SN_GoGn"]
    # Fix casing for SN_GoGn if it's from Excel
    for row in data:
        if "SN_GOGN" in row and "SN_GoGn" not in row:
            row["SN_GoGn"] = row["SN_GOGN"]

    corr_data = [["Metric", "Pearson (r)", "Correlation Strength"]]
    
    for metric in metrics:
        pairs = []
        for d in data:
            # Check airway
            airway = None
            if "airway" in d and isinstance(d["airway"], dict):
                airway = d["airway"].get("upper_airway")
            elif "upper_airway" in d:
                airway = d["upper_airway"]
            elif "airway_width" in d:
                airway = d["airway_width"]
                
            # Check metric
            val = None
            if "angles" in d and isinstance(d["angles"], dict):
                val = d["angles"].get(metric)
            else:
                val = d.get(metric)
            
            try:
                airway = float(airway) if airway is not None else None
                val = float(val) if val is not None else None
            except:
                airway, val = None, None

            if airway is not None and val is not None and not np.isnan(airway) and not np.isnan(val):
                pairs.append((val, airway))
        
        if len(pairs) > 1:
            x = [p[0] for p in pairs]
            y = [p[1] for p in pairs]
            # Avoid division by zero warnings
            if np.std(x) == 0 or np.std(y) == 0:
                r_val = 0.0
            else:
                r_val = np.corrcoef(x, y)[0, 1]
            
            abs_r = abs(r_val)
            if abs_r > 0.7: strength = "Strong Positive" if r_val > 0 else "Strong Negative"
            elif abs_r > 0.3: strength = "Moderate Positive" if r_val > 0 else "Moderate Negative"
            elif abs_r > 0.1: strength = "Weak Positive" if r_val > 0 else "Weak Negative"
            else: strength = "No Correlation"
            
            corr_data.append([metric, f"{r_val:.3f}", strength])
        else:
            corr_data.append([metric, "N/A", "Insufficient Data"])

    elements.append(Paragraph("Global Airway Correlations", section_style))
    t1 = Table(corr_data, colWidths=[2.0*inch, 2.0*inch, 3.0*inch])
    t1.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), primary_color),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
        ("ALIGN", (1,0), (1,-1), "CENTER"),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.whitesmoke, colors.white]),
    ]))
    elements.append(t1)
    elements.append(Spacer(1, 0.4*inch))

    # Phenotype Groupings
    elements.append(Paragraph("Phenotype Averages (Class II vs III)", section_style))
    pheno_data = [["Skeletal Class", "Airway (mm)", "SNB (°)", "SNA (°)"]]
    
    classes = ["Class I", "Class II", "Class III"]
    for cls in classes:
        airways = []
        snbs = []
        snas = []
        
        for d in data:
            if d.get("skeletal_class") == cls:
                # robust extraction
                airway = d.get("airway", {}).get("upper_airway") if isinstance(d.get("airway"), dict) else d.get("upper_airway")
                snb = d.get("angles", {}).get("SNB") if isinstance(d.get("angles"), dict) else d.get("SNB")
                sna = d.get("angles", {}).get("SNA") if isinstance(d.get("angles"), dict) else d.get("SNA")
                
                try: airways.append(float(airway))
                except: pass
                try: snbs.append(float(snb))
                except: pass
                try: snas.append(float(sna))
                except: pass
                
        avg_air = f"{np.mean(airways):.2f}" if airways else "N/A"
        avg_snb = f"{np.mean(snbs):.2f}" if snbs else "N/A"
        avg_sna = f"{np.mean(snas):.2f}" if snas else "N/A"
        
        pheno_data.append([cls, avg_air, avg_snb, avg_sna])

    t2 = Table(pheno_data, colWidths=[2.0*inch, 1.5*inch, 1.5*inch, 1.5*inch])
    t2.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), primary_color),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
        ("ALIGN", (1,0), (-1,-1), "CENTER"),
    ]))
    elements.append(t2)

    doc.build(elements)

# =========================
# SIMPLE ANALYTICS REPORT
# =========================
def generate_simple_report(save_path, stats_data):
    doc = SimpleDocTemplate(save_path, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    elements = []
    _, _, _, section_style, normal_style = get_styles()

    elements.append(create_header("Activity Report"))
    elements.append(Spacer(1, 0.3*inch))

    # Core Stats
    elements.append(Paragraph("System Statistics", section_style))
    sys_data = [
        ["Total Patients", str(stats_data.get("total_patients", 0))],
        ["Total Scans", str(stats_data.get("total_predictions", 0))],
        ["Registered Doctors", str(stats_data.get("total_doctors", 0))]
    ]
    t1 = Table(sys_data, colWidths=[3.0*inch, 2.0*inch])
    t1.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
        ("BACKGROUND", (0,0), (0,-1), colors.whitesmoke),
        ("ALIGN", (1,0), (1,-1), "CENTER"),
    ]))
    elements.append(t1)
    elements.append(Spacer(1, 0.4*inch))

    # Class Distribution
    elements.append(Paragraph("Skeletal Pattern Diagnostics", section_style))
    class_dist = stats_data.get("class_distribution", {})
    dist_data = [["Class I Base", "Class II Overjet", "Class III Underbite", "Pending"]]
    dist_data.append([
        str(class_dist.get("Class I", 0)),
        str(class_dist.get("Class II", 0)),
        str(class_dist.get("Class III", 0)),
        str(class_dist.get("Unknown", 0))
    ])
    
    t2 = Table(dist_data, colWidths=[1.8*inch, 1.8*inch, 1.8*inch, 1.6*inch])
    t2.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), primary_color),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
    ]))
    elements.append(t2)

    doc.build(elements)
