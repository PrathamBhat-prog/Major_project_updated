# 🧠 AI-Based Cephalometric Landmark Detection & Automated Report Generation Backend

## 📌 Project Overview

This project is an AI-powered Cephalometric Analysis Backend System built using FastAPI.
It allows orthodontists to upload lateral cephalogram X-ray images and automatically:

- Detect anatomical landmarks using Deep Learning
- Calculate cephalometric measurements
- Generate annotated images
- Produce structured PDF reports
- Store patient & doctor records securely
- Maintain a master Excel dataset

The system is designed for clinical use, research purposes, and academic projects.

---

## 🏗 Technology Stack

- Backend Framework: FastAPI
- Language: Python 3.9+
- Database: PostgreSQL / SQLite (SQLAlchemy ORM)
- Authentication: JWT-based authentication
- Machine Learning: PyTorch / TensorFlow
- Image Processing: OpenCV
- Report Generation: Custom PDF Generator
- Data Logging: Excel automation

---

## 📂 Project Structure

backend/
│
├── app/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── auth.py
│   ├── utils.py
│   ├── ml_inference.py
│   ├── report_generator.py
│   ├── master_excel.py
│   ├── static/
│   └── uploads/
│
├── requirements.txt
└── README.md

---

## 🚀 Key Features

### Role-Based Access
- Admin
- Doctor

### Automatic Landmark Detection
- Deep Learning-based prediction
- Landmark coordinate scaling
- OpenCV-based visualization

### Cephalometric Measurements
- SNA
- SNB
- ANB
- FMA
- IMPA
- Facial Axis

### Automated PDF Report
- Patient information
- Landmark coordinates
- Measurement results
- Diagnostic interpretation
- Downloadable PDF

### Master Excel Dataset
- Automatically appends each patient analysis
- Useful for research and retraining

---

## ⚙️ Installation Guide

1. Clone Repository
git clone <repository-url>
cd backend

2. Create Virtual Environment
python -m venv venv

Activate (Windows):
venv\Scripts\activate

3. Install Dependencies
pip install -r requirements.txt

4. Setup Environment Variables (.env file)
DATABASE_URL=sqlite:///./ceph.db
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

5. Run Server
uvicorn app.main:app --reload

Server:
http://127.0.0.1:8000

Swagger:
http://127.0.0.1:8000/docs

---

## 🔄 System Workflow

1. Doctor logs in
2. Create patient
3. Upload cephalogram
4. ML predicts landmarks
5. Measurements calculated
6. Annotated image generated
7. PDF report generated
8. Data stored
9. Master Excel updated

---

## 🔐 Authentication & Security

- JWT-based authentication
- Role-based access
- Secure password hashing

---

## 🎯 Target Users

- Orthodontists
- Dental Clinics
- Hospitals
- Research Institutions

---

## 👨‍💻 Author

Gurunathagouda M Biradar  
B.E. Artificial Intelligence & Machine Learning  
AI-Based Cephalometric Analysis System

