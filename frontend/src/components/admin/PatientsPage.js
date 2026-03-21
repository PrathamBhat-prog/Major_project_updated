import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function PatientsPage() {
  const { getAuthHeaders } = useContext(AuthContext);

  const [patients, setPatients] = useState([]);
  const [expandedPatient, setExpandedPatient] = useState(null);

  // ================= FETCH =================
  useEffect(() => {
    fetch(`${API_URL}/admin/patients`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then(setPatients)
      .catch(console.error);
  }, []);

  // ================= UI =================
  return (
    <div className="max-w-6xl mx-auto p-6">

      <h2 className="text-2xl font-bold mb-6 text-indigo-700">
        All Patients
      </h2>

      <div className="space-y-4">

        {patients.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition"
          >

            {/* ================= HEADER ================= */}
            <div
              onClick={() =>
                setExpandedPatient(
                  expandedPatient === p.id ? null : p.id
                )
              }
              className="flex justify-between items-center p-4 cursor-pointer"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {p.name}
                </h3>
                <p className="text-xs text-gray-400">
                  Patient ID: {p.id}
                </p>
              </div>

              <span className="text-gray-400">
                {expandedPatient === p.id ? "▲" : "▼"}
              </span>
            </div>

            {/* ================= DROPDOWN ================= */}
            {expandedPatient === p.id && (
  <div className="border-t p-4">

    {!p.predictions || p.predictions.length === 0 ? (
      <p className="text-gray-400 text-sm">
        No predictions available
      </p>
    ) : (
      <div className="space-y-3">

        {(p.predictions || []).map((pred) => (
          <div
            key={pred.id}
            className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100"
          >

            <div>
              <p className="font-medium">
                Cephalogram #{pred.id}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(pred.created_at).toLocaleDateString()}
              </p>
            </div>

            <div
              className={`px-3 py-1 text-sm rounded-full font-semibold ${
                pred.skeletal_class === "Class I"
                  ? "bg-green-100 text-green-700"
                  : pred.skeletal_class === "Class II"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {pred.skeletal_class}
            </div>

          </div>
        ))}

      </div>
    )}

  </div>
)}

          </div>
        ))}

      </div>

    </div>
  );
}