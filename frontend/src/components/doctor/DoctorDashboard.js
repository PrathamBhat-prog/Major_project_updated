import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";


export default function DoctorDashboard() {

  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const [profile, setProfile] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [patients, setPatients] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePatientId, setDeletePatientId] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");

  // 🔥 NEW STATES (ADDED ONLY)
  const [showScanner, setShowScanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // =====================================================
  // SAFE NAVIGATION (FIX LOGIN REDIRECT ISSUE)
  // =====================================================
  const navigateSafe = (path) => {
    if (!path) return;
    if (path.startsWith("http")) {
      const url = new URL(path);
      navigate(url.pathname, { replace: false });
    } else {
      navigate(path, { replace: false });
    }
  };

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================
  useEffect(() => {
    if (token) {
      fetchDashboardData();
      fetchProfile();
    }
  }, [token]);
  const fetchProfile = async () => {
  try {
    const res = await fetch(`${API_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setProfile(data);

  } catch (err) {
    console.error("Profile fetch error", err);
  }
};
  // =====================================================
  // FETCH DATA
  // =====================================================
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const patientRes = await fetch(`${API_URL}/patients/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!patientRes.ok) throw new Error("Failed to fetch patients");

      const patientData = await patientRes.json();
      setPatients(Array.isArray(patientData) ? patientData : []);

      const predRes = await fetch(`${API_URL}/doctor/predictions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!predRes.ok) {
        setPredictions([]);
        return;
      }

      const predData = await predRes.json();
      setPredictions(Array.isArray(predData) ? predData : []);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================
  const requestDeletePatient = async (patientId) => {
    try {
      const res = await fetch(
        `${API_URL}/patients/${patientId}/send-delete-code`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to request delete");

      setDeletePatientId(patientId);
      setShowDeleteModal(true);

    } catch (err) {
      alert(err.message);
    }
  };

  const confirmDeletePatient = async () => {
    try {
      const res = await fetch(
        `${API_URL}/patients/${deletePatientId}?code=${verificationCode}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Invalid verification code");

      setShowDeleteModal(false);
      setVerificationCode("");
      setDeletePatientId(null);
      fetchDashboardData();

    } catch (err) {
      alert(err.message);
    }
  };

  // =====================================================
  // FILTER WITH SEARCH (ADDED)
  // =====================================================
  const filteredPredictions =
    selectedPatient
      ? predictions.filter(
          (p) =>
            p.patient_id === selectedPatient.id &&
            p.id.toString().includes(searchTerm)
        )
      : [];

  // =====================================================
  // QR SCANNER (FIXED)
  // =====================================================
  const startScanner = () => {
  const scanner = new Html5Qrcode("qr-reader");

  scanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    async (decodedText) => {

      console.log("QR:", decodedText);

      let patientId = null;

      try {
        // URL case
        if (decodedText.includes("/")) {
          const parts = decodedText.split("/");
          patientId = parts[parts.length - 1];
        }

        // patient_id=5 case
        if (decodedText.includes("patient_id")) {
          patientId = decodedText.split("=")[1];
        }

      } catch (err) {
        console.error(err);
      }

      if (!patientId) {
        alert("Invalid QR");
        return;
      }

      try {
        // 🔥 CALL YOUR FULL HISTORY API
        const res = await fetch(
          `${API_URL}/patients/${patientId}/full-history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();

        // ✅ IMPORTANT
        setSelectedPatient(data.patient);
        setPredictions(data.predictions);

      } catch (err) {
        alert("Patient load failed");
      }

      scanner.stop();
      setShowScanner(false);
    }
  );
};

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 to-slate-200">

      {/* ================= SIDEBAR ================= */}
      <div className="w-80 bg-white/80 backdrop-blur-lg shadow-xl p-6 flex flex-col border-r">
      {/* ================= PROFILE ================= */}
{profile && (
  <div className="mb-6 relative">

    <div
      onClick={() => setShowMenu(!showMenu)}
      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer border"
    >
      {/* AVATAR */}
      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
        {profile.full_name?.[0] || profile.username?.[0]}
      </div>

      {/* INFO */}
      <div className="flex-1 overflow-hidden">
        <p className="font-semibold text-sm truncate">
          {profile.full_name || profile.username}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {profile.email}
        </p>
      </div>
    </div>

    {/* DROPDOWN */}
    {showMenu && (
      <div className="absolute left-0 top-full mt-2 w-full bg-white shadow-lg rounded-xl border z-50">

        <button
          onClick={() => navigate("/doctor/profile")}
          className="w-full text-left px-4 py-3 hover:bg-gray-100 text-sm"
        >
          ✏️ Edit Profile
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="w-full text-left px-4 py-3 hover:bg-gray-100 text-sm text-red-600"
        >
          🚪 Logout
        </button>

      </div>
    )}
  </div>
)}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">
            Patients
          </h2>

          <button
            onClick={() => navigateSafe("/doctor/create-patient")}
            className="bg-indigo-600 text-white w-10 h-10 rounded-xl shadow-md hover:bg-indigo-700 transition"
          >
            +
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {patients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => setSelectedPatient(patient)}
              className={`p-4 rounded-2xl cursor-pointer border transition-all duration-200
                ${
                  selectedPatient?.id === patient.id
                    ? "bg-indigo-50 border-indigo-400 shadow-md"
                    : "bg-white hover:shadow-md hover:-translate-y-1"
                }`}
            >
              <div className="font-semibold text-gray-800">
                {patient.name}
              </div>

              <div className="text-xs text-gray-400 mt-1">
                {new Date(patient.created_at).toLocaleDateString()}
              </div>

              <div className="flex gap-3 mt-3 text-xs">
                <button
                  onClick={(e) => {
  e.stopPropagation();
  navigate("/doctor/create-patient", {
    state: { patientData: patient }
  });
}}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    requestDeletePatient(patient.id);
                  }}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 🔥 QR BUTTON */}
        <div className="mt-6 pt-4 border-t flex justify-center">
          <button
            onClick={() => {
              if (!token) {
                alert("Login required");
                return;
              }
              setShowScanner(true);
              setTimeout(startScanner, 300);
            }}
            className="flex items-center gap-2 px-4 py-2 
                       bg-gradient-to-r from-green-600 to-green-700
                       text-white rounded-xl shadow-md hover:scale-105 transition"
          >
            📷 Scan QR
          </button>
        </div>
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 p-10 overflow-y-auto">

        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}

        {selectedPatient && (
          <div className="bg-white rounded-3xl shadow-xl p-10 border">

            <div className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {selectedPatient.name}
                </h1>

                <div className="mt-3">
                  <span className="bg-indigo-100 text-indigo-700 px-4 py-1 text-sm rounded-full font-medium">
                    Patient ID: {selectedPatient.id}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  navigateSafe("/doctor/upload-cephalogram")
                }
                className="bg-gradient-to-r from-indigo-600 to-indigo-700
                           text-white px-8 py-3 rounded-2xl shadow-lg"
              >
                Upload Cephalogram
              </button>
            </div>

            {/* 🔥 SEARCH */}
            <input
              placeholder="Search Cephalogram ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 mb-6 border rounded-xl"
            />

            <div className="space-y-5">
              {filteredPredictions.map((pred) => (
                <div
                  key={pred.id}
                  onClick={() =>
                    navigateSafe(`/doctor/landmark/${pred.id}`)
                  }
                  className="p-6 border rounded-xl cursor-pointer hover:shadow"
                >
                  Cephalogram #{pred.id}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= SCANNER MODAL ================= */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-md">

            <h2 className="text-lg font-semibold mb-4 text-center">
              Scan Patient QR
            </h2>

            <div id="qr-reader" className="w-full h-[300px]" />

            <button
              onClick={() => setShowScanner(false)}
              className="mt-4 w-full bg-red-500 text-white py-2 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* DELETE MODAL (UNCHANGED) */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-3xl w-96">
            <input
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="border p-3 w-full mb-4"
            />
            <button
              onClick={confirmDeletePatient}
              className="w-full bg-red-600 text-white py-3 rounded-xl"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}

    </div>
  );
}