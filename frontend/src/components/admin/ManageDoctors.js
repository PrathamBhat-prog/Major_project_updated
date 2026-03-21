import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function ManageDoctors() {
  const { getAuthHeaders } = useContext(AuthContext);

  const [doctors, setDoctors] = useState([]);
  const [expandedDoctor, setExpandedDoctor] = useState(null);
  const [patientsMap, setPatientsMap] = useState({});
  const [loadingPatients, setLoadingPatients] = useState(null);

  // ================= FETCH DOCTORS =================
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/doctors`, {
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      console.error("Error fetching doctors", err);
    }
  };

  // ================= LOAD PATIENTS =================
  const loadPatients = async (doctorId) => {
    if (patientsMap[doctorId]) return;

    setLoadingPatients(doctorId);

    try {
      const res = await fetch(
        `${API_URL}/admin/doctor/${doctorId}/patients`,
        {
          headers: getAuthHeaders(),
        }
      );

      const data = await res.json();

      setPatientsMap((prev) => ({
        ...prev,
        [doctorId]: data,
      }));
    } catch (err) {
      console.error("Error loading patients", err);
    }

    setLoadingPatients(null);
  };

  // ================= TOGGLE ACTIVE =================
  const toggleDoctor = async (doctorId) => {
    try {
      const res = await fetch(`${API_URL}/admin/toggle-user/${doctorId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        alert("Failed to update doctor");
        return;
      }

      const updated = await res.json();

      setDoctors((prev) =>
        prev.map((d) =>
          d.id === doctorId
            ? { ...d, is_active: updated.is_active }
            : d
        )
      );
    } catch (err) {
      console.error("Toggle error", err);
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-6">

      <h2 className="text-2xl font-bold mb-6">Manage Doctors</h2>

      <div className="space-y-4">

        {doctors.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition"
          >

            {/* ================= HEADER ================= */}
            <div
              onClick={() => {
                const newId = expandedDoctor === d.id ? null : d.id;
                setExpandedDoctor(newId);
                if (newId) loadPatients(d.id);
              }}
              className="flex justify-between items-center p-4 cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-indigo-700">
                {d.username}
              </h3>

              <span className="text-sm text-gray-400">
                {expandedDoctor === d.id ? "▲" : "▼"}
              </span>
            </div>

            {/* ================= DROPDOWN ================= */}
            {expandedDoctor === d.id && (
  <div className="border-t px-4 pb-4 space-y-4">

    {/* BASIC INFO */}
    <div className="space-y-1">

     <p className="text-sm">
  <span className="font-medium text-gray-600">Name:</span>{" "}
  {d.full_name}
</p>

<p className="text-sm">
  <span className="font-medium text-gray-600">Email:</span>{" "}
  {d.email || d.username}
</p>

<p className="text-sm">
  <span className="font-medium text-gray-600">Phone:</span>{" "}
  {d.phone || "-"}
</p>
    </div>

    {/* STATUS */}
    <div className="flex gap-3">

      <span className={`text-sm px-2 py-1 rounded ${
        d.is_active
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-600"
      }`}>
        {d.is_active ? "Active" : "Inactive"}
      </span>

      <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
        Patients: {d.patient_count}
      </span>

    </div>

    {/* ACTIONS */}
    <div className="flex gap-3">

      <button
        onClick={() => loadPatients(d.id)}
        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
      >
        Load Patients
      </button>

      <button
        onClick={() => toggleDoctor(d.id)}
        className={`px-3 py-1 rounded text-sm ${
          d.is_active
            ? "bg-red-50 text-red-600 hover:bg-red-100"
            : "bg-green-50 text-green-600 hover:bg-green-100"
        }`}
      >
        {d.is_active ? "Deactivate" : "Activate"}
      </button>

    </div>

    {/* PATIENT LIST */}
    <div>

      {loadingPatients === d.id ? (
        <p className="text-sm text-gray-400 animate-pulse">
          Loading patients...
        </p>
      ) : (patientsMap[d.id] || []).length === 0 ? (
        <p className="text-gray-400 text-sm">
          No patients found
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

          {patientsMap[d.id].map(p => (
            <div
              key={p.id}
              className="bg-gray-50 p-3 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-gray-400">
                  ID: {p.id}
                </p>
              </div>

              <span className="text-sm text-gray-500">
                DOB: {p.age || "-"}
              </span>
            </div>
          ))}

        </div>
      )}

    </div>

  </div>
)}

          </div>
        ))}

      </div>

    </main>
  );
}