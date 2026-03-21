// filepath: src/App.js

import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/common/Header";

// Auth
import LoginPage from "./components/auth/LoginPage";
import ProfileSetup from "./components/common/ProfileSetup";

// Admin
import AdminDashboard from "./components/admin/AdminDashboard";
import ManageDoctors from "./components/admin/ManageDoctors";
import AdminLayout from "./components/admin/AdminLayout";
import Analytics from "./components/admin/Analytics";
import PatientsPage from "./components/admin/PatientsPage";
import PredictionsPage from "./components/admin/PredictionsPage";
import ChatPage from "./components/admin/ChatPage";
import Adminprofile from "./components/common/ProfilePage";

// Doctor
import DoctorDashboard from "./components/doctor/DoctorDashboard";
import CreatePatient from "./components/doctor/CreatePatient";
import UploadCephalogram from "./components/doctor/UploadCephalogram";
import AutoLandmark from "./components/doctor/AutoLandmark";
import ManualAdjust from "./components/doctor/ManualAdjust";
import ClassificationView from "./components/doctor/ClassificationView";
import DoctorProfile from "./components/common/ProfilePage";

// General
import CephalometricModel from "./components/CephalometricModel";
import Lm from "./components/Learnmore";

import { AuthContext } from "./context/AuthContext";
import "./index.css";

export default function App() {

  const { currentUser, profile, loading } = useContext(AuthContext);

  // 🔥 WAIT UNTIL EVERYTHING LOADED
  if (loading || (currentUser && !profile)) {
    return (
      <div className="h-screen flex items-center justify-center text-lg">
        Loading Application...
      </div>
    );
  }

  // ==============================
  // 🔥 PROTECTED ROUTE
  const ProtectedRoute = ({ role, children }) => {

    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }

    // 🔥 PROFILE CHECK
    if (!profile?.is_profile_complete) {
      return <Navigate to="/profile-setup" replace />;
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

        {/* 🔥 PROFILE SETUP */}
        <Route
          path="/profile-setup"
          element={
            currentUser ? <ProfileSetup /> : <Navigate to="/login" replace />
          }
        />

        {/* ================= ADMIN ================= */}
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
          path="/admin/profile"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <Adminprofile />
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
          path="/doctor/profile"
          element={
            <ProtectedRoute role="doctor">
                <DoctorProfile />
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