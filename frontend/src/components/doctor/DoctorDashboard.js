import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function DoctorDashboard() {

  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const [patients, setPatients] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePatientId, setDeletePatientId] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // =====================================================
  // FETCH DATA
  // =====================================================
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const patientRes = await fetch(`${API_URL}/patients`, {
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
  // REQUEST DELETE (SEND OTP)
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

  // =====================================================
  // CONFIRM DELETE
  // =====================================================
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

  const filteredPredictions =
    selectedPatient
      ? predictions.filter((p) => p.patient_id === selectedPatient.id)
      : [];

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 to-slate-200">

      {/* ================= SIDEBAR ================= */}
      <div className="w-80 bg-white/80 backdrop-blur-lg shadow-xl p-6 flex flex-col border-r">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">
            Patients
          </h2>

          <button
            onClick={() => navigate("/doctor/create-patient")}
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
                    navigate(`/doctor/edit-patient/${patient.id}`);
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
      </div>


      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 p-10 overflow-y-auto">

        {loading && <div className="text-gray-500">Loading...</div>}
        {error && <div className="text-red-500">{error}</div>}

        {selectedPatient && (
          <div className="bg-white rounded-3xl shadow-xl p-10 border">

            {/* Header */}
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

              {/* UPDATED UPLOAD BUTTON */}
              <button
                onClick={() =>
                  navigate("/doctor/upload-cephalogram")
                }
                className="bg-gradient-to-r from-indigo-600 to-indigo-700
                           hover:from-indigo-700 hover:to-indigo-800
                           text-white font-semibold
                           px-8 py-3 rounded-2xl
                           shadow-lg hover:shadow-xl
                           transition-all duration-200
                           hover:-translate-y-1"
              >
                Upload Cephalogram
              </button>
            </div>


            {/* Predictions */}
            <div className="space-y-5">

              {filteredPredictions.length === 0 && (
                <div className="text-gray-400 text-sm italic">
                  No cephalograms uploaded yet.
                </div>
              )}

              {filteredPredictions.map((pred) => (
                <div
                  key={pred.id}
                  onClick={() =>
                    navigate(`/doctor/landmark/${pred.id}`)
                  }
                  className="p-6 bg-gradient-to-r from-white to-slate-50
                             rounded-2xl border border-slate-200
                             hover:shadow-lg hover:-translate-y-1
                             transition-all duration-200 cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-lg text-gray-700">
                        Cephalogram #{pred.id}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(pred.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-indigo-600 font-medium">
                      View →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


      {/* ================= DELETE MODAL ================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-96">

            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Enter Verification Code
            </h3>

            <input
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="border border-gray-300 focus:ring-2 focus:ring-indigo-400
                         focus:outline-none p-3 w-full mb-4 rounded-xl"
              placeholder="6-digit code"
            />

            <button
              onClick={confirmDeletePatient}
              className="w-full bg-red-600 hover:bg-red-700
                         text-white py-3 rounded-xl shadow-md transition"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}

    </div>
  );
}