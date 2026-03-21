// filepath: src/App.js

import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/common/Header";

// Auth
import LoginPage from "./components/auth/LoginPage";

// Admin
import AdminDashboard from "./components/admin/AdminDashboard";
import ManageDoctors from "./components/admin/ManageDoctors";
import AdminLayout from "./components/admin/AdminLayout";
import Analytics from "./components/admin/Analytics";
import PatientsPage from "./components/admin/PatientsPage";
import PredictionsPage from "./components/admin/PredictionsPage";
import ChatPage from "./components/admin/ChatPage";
// Doctor
import DoctorDashboard from "./components/doctor/DoctorDashboard";
import CreatePatient from "./components/doctor/CreatePatient";
import UploadCephalogram from "./components/doctor/UploadCephalogram";
import AutoLandmark from "./components/doctor/AutoLandmark";
import ManualAdjust from "./components/doctor/ManualAdjust";
import ClassificationView from "./components/doctor/ClassificationView";

// General
import CephalometricModel from "./components/CephalometricModel";
import Lm from "./components/Learnmore";
import { AuthContext } from "./context/AuthContext";
import "./index.css";

export default function App() {
 
  
const { currentUser, loading } = useContext(AuthContext);
if (loading) {
  return (
    <div className="h-screen flex items-center justify-center text-lg">
      Loading Application...
    </div>
  );
}console.log(currentUser)
  // ==============================
  // PROTECTED ROUTE COMPONENT
 const ProtectedRoute = ({ role, children }) => {

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (role && currentUser.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};
  return (
    <BrowserRouter>
      <Header />

      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<CephalometricModel />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/lm" element={<Lm />} />

        <Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute role="admin">
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    </ProtectedRoute>
  }
/>
        

        <Route
  path="/admin/manage-doctors"
  element={
    <ProtectedRoute role="admin">
      <AdminLayout>
        <ManageDoctors />
      </AdminLayout>
    </ProtectedRoute>
  }
/>
        <Route
  path="/admin/analytics"
  element={
    <ProtectedRoute role="admin">
      <AdminLayout>
        <Analytics />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/patients"
  element={
    <ProtectedRoute role="admin">
      <AdminLayout>
        <PatientsPage />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/predictions"
  element={
    <ProtectedRoute role="admin">
      <AdminLayout>
        <PredictionsPage />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/chat"
  element={
    <ProtectedRoute role="admin">
      <AdminLayout>
        <ChatPage />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

        {/* ================= DOCTOR ================= */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute role="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/create-patient"
          element={
            <ProtectedRoute role="doctor">
              <CreatePatient />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/upload-cephalogram"
          element={
            <ProtectedRoute role="doctor">
              <UploadCephalogram />
            </ProtectedRoute>
          }
        />

        {/* ==== LANDMARK FLOW ==== */}
        <Route
          path="/doctor/landmark/:id"
          element={
            <ProtectedRoute role="doctor">
              <AutoLandmark />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/manual-adjust/:id"
          element={
            <ProtectedRoute role="doctor">
              <ManualAdjust />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/classification/:id"
          element={
            <ProtectedRoute role="doctor">
              <ClassificationView />
            </ProtectedRoute>
          }
        />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}