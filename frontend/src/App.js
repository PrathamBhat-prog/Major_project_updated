// filepath: src/App.js

import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/common/Header";

// Auth
import LoginPage from "./components/auth/LoginPage";

// Admin
import AdminDashboard from "./components/admin/AdminDashboard";
import CreateDoctor from "./components/admin/CreateDoctor";
import ManageDoctors from "./components/admin/ManageDoctors";

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
  const { currentUser } = useContext(AuthContext);

  // ==============================
  // PROTECTED ROUTE COMPONENT
  // ==============================
  const ProtectedRoute = ({ role, children }) => {
    if (!currentUser) return <Navigate to="/login" />;
    if (role && currentUser.role !== role)
      return <Navigate to="/" />;
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

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/create-doctor"
          element={
            <ProtectedRoute role="admin">
              <CreateDoctor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/manage-doctors"
          element={
            <ProtectedRoute role="admin">
              <ManageDoctors />
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