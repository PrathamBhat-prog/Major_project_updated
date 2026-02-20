import os
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image,
    Table,
    TableStyle
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.styles import getSampleStyleSheet


def generate_ceph_report(
    patient_id,
    angles,
    skeletal_class,
    image_path,
    save_path,
    maxilla_status=None,
    mandible_status=None,
    divergence_status=None,
    airway=None
):
    """
    Generates PDF report for cephalometric analysis.
    """

    doc = SimpleDocTemplate(
        save_path,
        pagesize=A4
    )

    elements = []

    styles = getSampleStyleSheet()

    title_style = styles["Heading1"]
    normal_style = styles["Normal"]

    # ==========================================
    # Title
    # ==========================================
    elements.append(Paragraph("Cephalometric Analysis Report", title_style))
    elements.append(Spacer(1, 0.3 * inch))

    # ==========================================
    # Patient Info
    # ==========================================
    elements.append(Paragraph(f"<b>Patient ID:</b> {patient_id}", normal_style))
    elements.append(Paragraph(f"<b>Skeletal Class:</b> {skeletal_class}", normal_style))

    if maxilla_status:
        elements.append(Paragraph(f"<b>Maxilla Status:</b> {maxilla_status}", normal_style))

    if mandible_status:
        elements.append(Paragraph(f"<b>Mandible Status:</b> {mandible_status}", normal_style))

    if divergence_status:
        elements.append(Paragraph(f"<b>Divergence Pattern:</b> {divergence_status}", normal_style))

    elements.append(Spacer(1, 0.3 * inch))

    # ==========================================
    # Angles Table
    # ==========================================
    if angles:
        elements.append(Paragraph("<b>Cephalometric Angles</b>", styles["Heading2"]))
        elements.append(Spacer(1, 0.2 * inch))

        table_data = [["Angle", "Value"]]

        for k, v in angles.items():
            table_data.append([k, str(v)])

        table = Table(table_data, colWidths=[2.5 * inch, 2 * inch])

        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ALIGN", (1, 1), (-1, -1), "CENTER")
        ]))

        elements.append(table)
        elements.append(Spacer(1, 0.3 * inch))

    # ==========================================
    # Airway Section
    # ==========================================
    if airway:
        elements.append(Paragraph("<b>Airway Measurements</b>", styles["Heading2"]))
        elements.append(Spacer(1, 0.2 * inch))

        airway_table_data = [
            ["Upper Airway Width", airway.get("upper_airway_width", "")],
            ["Lower Airway Width", airway.get("lower_airway_width", "")],
            ["Airway Area", airway.get("airway_area", "")]
        ]

        airway_table = Table(airway_table_data, colWidths=[2.5 * inch, 2 * inch])

        airway_table.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ALIGN", (1, 0), (-1, -1), "CENTER")
        ]))

        elements.append(airway_table)
        elements.append(Spacer(1, 0.3 * inch))

    # ==========================================
    # Image Section
    # ==========================================
    if image_path and os.path.exists(image_path):
        elements.append(Paragraph("<b>Annotated Cephalogram</b>", styles["Heading2"]))
        elements.append(Spacer(1, 0.2 * inch))

        img = Image(image_path)
        img.drawHeight = 4 * inch
        img.drawWidth = 4 * inch

        elements.append(img)

    # ==========================================
    # Footer Note
    # ==========================================
    elements.append(Spacer(1, 0.5 * inch))
    elements.append(Paragraph(
        "This report is generated automatically using CephAI system.",
        normal_style
    ))

    # Build PDF
    doc.build(elements)