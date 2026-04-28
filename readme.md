# CephAI – Intelligent Automated Cephalometric Analysis System

⚠️ CONFIDENTIAL PROJECT – ALL RIGHTS RESERVED

CephAI is a proprietary AI-powered system developed for automated cephalometric analysis of lateral cephalograms.

This project includes:

- Automated landmark detection
- Skeletal classification
- Cephalometric angle computation
- Airway analysis
- AI-assisted manual landmark correction
- Clinical PDF report generation
- Master Excel logging system

---

## 🔒 Confidential Notice
**⚠️ CONFIDENTIAL PROJECT – ALL RIGHTS RESERVED**

This repository contains proprietary intellectual property.

Unauthorized copying, distribution, modification, reverse engineering, or use of this code, models, or system design is strictly prohibited.

This project is intended for:

- Academic submission
- Patent filing
- Controlled research usage

It is NOT open-source software.

---

## 🧠 Technical Overview

System Components:

- FastAPI backend
- React frontend
- TensorFlow/Keras deep learning models
- Scikit-learn classification models
- Secure authentication system
- Structured clinical output generation

Core Innovations Include:

- Hybrid AI + Manual Landmark Refinement Workflow
- Dynamic Landmark Extension System
- Automated Skeletal Classification Pipeline
- Integrated Clinical Reporting Engine

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 3. Environment Configuration
Create a `.env` file in `backend/`:
```env
DATABASE_URL=sqlite:///./ceph.db
SECRET_KEY=your_secure_random_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

---

## 🧪 Demo Mode
A public **Demo Mode** is available for evaluation:
1. Navigate to `/demo`.
2. Upload a cephalogram or use the **"Use Sample X-Ray"** dataset.
3. Observe real-time AI labeling and anatomical measurements.

---

## 👨‍💻 Project Authors
**Abhay Vijay Goudar | Gurunathagouda M Biradar | Mohith Anand | Pratham Bhat**  
*B.E. Artificial Intelligence & Machine Learning – Major Project*

---

## 📜 Intellectual Property Status
This project is intended for patent protection. Any reproduction or usage without written permission from the authors is strictly prohibited.

**License**: Proprietary License. See LICENSE file for details.