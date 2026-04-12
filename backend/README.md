# 🧠 AI-Based Cephalometric Landmark Detection & Automated Report Generation Backend

---

# 📌 Project Overview

This project is an AI-powered Cephalometric Analysis Backend System developed using FastAPI and Deep Learning.

The system allows orthodontists to:

• Upload lateral cephalogram X-ray images  
• Automatically detect anatomical landmarks  
• Calculate cephalometric measurements  
• Generate annotated landmark images  
• Produce structured PDF reports  
• Store patient & doctor records securely  
• Maintain a centralized Master Excel dataset  

This system is suitable for:

- Clinical Usage
- Academic Research
- AI Model Development
- Hospital Deployment

---

# 🏗 Technology Stack

Backend Framework: FastAPI  
Language: Python 3.9+  
Database: PostgreSQL / SQLite  
ORM: SQLAlchemy  
Authentication: JWT-based authentication  
Machine Learning: PyTorch / TensorFlow  
Image Processing: OpenCV  
Report Generation: Custom PDF Generator  
Data Logging: Excel Automation  
Deployment Ready: Uvicorn / Gunicorn  

---

# 📂 Project Structure

backend/
│
├── app/
│   ├── main.py                  # FastAPI entry point
│   ├── models.py                # Database models
│   ├── schemas.py               # Pydantic schemas
│   ├── database.py              # Database connection
│   ├── auth.py                  # JWT authentication logic
│   ├── utils.py                 # Utility functions
│   ├── ml_inference.py          # ML prediction pipeline
│   ├── report_generator.py      # PDF generation
│   ├── master_excel.py          # Excel logging
│   ├── static/                  # Generated reports & images
│   └── uploads/                 # Uploaded X-ray images
│
├── requirements.txt
├── .env
└── README.md

---

# 🚀 Core Features

## 👨‍⚕️ Role-Based Access
• Admin  
• Doctor  

## 📍 Automatic Landmark Detection
• Deep Learning model inference  
• Landmark coordinate scaling  
• OpenCV-based annotation  
• JSON coordinate output  

## 📊 Cephalometric Measurements
Automatically calculates:

• SNA  
• SNB  
• ANB  
• FMA  
• IMPA  
• Facial Axis  
• Y-Axis  
• Mandibular Plane Angle  
• Additional angular & linear measurements  

## 📄 Automated PDF Report
Each report contains:

• Patient details  
• Landmark coordinate table  
• Measurement table  
• Diagnostic summary  
• Annotated X-ray image  
• Downloadable PDF file  

## 📈 Master Excel Logging
• Automatically appends patient analysis  
• Central dataset for research  
• Can be used for retraining models  

---

# 🔄 System Workflow

1. Doctor logs in using JWT authentication  
2. Create new patient record  
3. Upload lateral cephalogram image  
4. ML model predicts landmarks  
5. Coordinates scaled to original resolution  
6. Cephalometric measurements computed  
7. Annotated image generated  
8. PDF report generated  
9. Data stored in database  
10. Master Excel updated  

---

# 🧠 ML Inference Pipeline

1. Image preprocessing (resize, normalize)  
2. Landmark detection model inference  
3. Coordinate transformation  
4. OpenCV visualization  
5. Measurement calculation  
6. Report generation  

---

# 🔐 Authentication & Security

• JWT Token-based authentication  
• Password hashing  
• Role-based route protection  
• Token expiration  
• Secure API endpoints  

---

# 📊 API Endpoints

Authentication:
POST   /login  

Patients:
POST   /patients  
GET    /patients  
GET    /patients/{id}  

Prediction:
POST   /predict  

Reports:
GET    /report/{id}  

---

# ⚙️ Installation Guide (Windows)

## 1️⃣ Clone Repository

git clone <repository-url>  
cd backend  

## 2️⃣ Create Virtual Environment

python -m venv venv  

Activate:

venv\Scripts\activate  

## 3️⃣ Install Dependencies

pip install -r requirements.txt  

## 4️⃣ Create .env File

DATABASE_URL=sqlite:///./ceph.db  
SECRET_KEY=your_secret_key  
ALGORITHM=HS256  
ACCESS_TOKEN_EXPIRE_MINUTES=60  

## 5️⃣ Run Server

uvicorn app.main:app --reload  

Server URL:
http://127.0.0.1:8000  

Swagger Documentation:
http://127.0.0.1:8000/docs  

---

# 🐳 Docker Deployment (Optional)

docker build -t ceph-backend .  
docker run -p 8000:8000 ceph-backend  

---

# ☁ Cloud Deployment Ready

• AWS EC2  
• GPU-enabled inference server  
• Docker containerization  
• Production-ready with Gunicorn  

---

# 🎯 Target Users

• Orthodontists  
• Dental Clinics  
• Hospitals  
• Research Institutions  
• AI Research Labs  

---

# 🔮 Future Enhancements

• Multi-model ensemble  
• PINN-based anatomical correction  
• AutoCeph comparison module  
• Active learning retraining  
• Cloud-based dashboard  
• Multi-hospital integration  

---

# 📜 License

This project is developed for academic and research purposes.  
Commercial deployment requires proper licensing and validation.

---

# 👨‍💻 Authors

Abhay Vijay Goudar,Gurunathagouda M Biradar,Mohith Anand,Pratham Bhat
B.E. Artificial Intelligence & Machine Learning  
AI-Based Cephalometric Analysis System  

---

# 📢 Acknowledgment

GPU resources and research infrastructure support acknowledged where applicable.

