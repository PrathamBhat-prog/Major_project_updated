import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function DoctorDashboard() {
  const { token } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch patients
        const res = await fetch(`${API_URL}/patients`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Failed to fetch patients");
        }

        const patientData = await res.json();
        setPatients(patientData);

        // Fetch predictions for each patient
        const allPredictions = [];

        for (let p of patientData) {
          const predRes = await fetch(
            `${API_URL}/patients/${p.id}/predictions`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (predRes.ok) {
            const predData = await predRes.json();
            predData.forEach((pred) =>
              allPredictions.push({
                ...pred,
                patientName: p.name,
              })
            );
          }
        }

        // Sort by newest first
        allPredictions.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setPredictions(allPredictions.slice(0, 5)); // Show latest 5
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Doctor Dashboard
      </h1>

      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* PATIENTS */}
          <div className="bg-white p-5 rounded shadow">
            <h3 className="font-semibold mb-3 text-lg">
              My Patients
            </h3>

            {patients.length === 0 ? (
              <div className="text-gray-500">
                No patients yet
              </div>
            ) : (
              <ul className="space-y-2">
                {patients.map((p) => (
                  <li
                    key={p.id}
                    className="flex justify-between border-b pb-1"
                  >
                    <span>{p.name}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4">
              <Link
                className="text-indigo-600 hover:text-indigo-800"
                to="/doctor/create-patient"
              >
                + Create New Patient
              </Link>
            </div>
          </div>

          {/* RECENT CEPHALOGRAMS */}
          <div className="bg-white p-5 rounded shadow">
            <h3 className="font-semibold mb-3 text-lg">
              Recent Cephalograms
            </h3>

            {predictions.length === 0 ? (
              <div className="text-gray-500">
                No cephalograms uploaded yet.
              </div>
            ) : (
              <ul className="space-y-3">
                {predictions.map((pred) => (
                  <li
                    key={pred.id}
                    className="border p-3 rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      navigate(`/doctor/landmark/${pred.id}`)
                    }
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {pred.patientName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(pred.created_at).toLocaleString()}
                        </div>
                      </div>

                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          pred.mode_used === "ml"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {pred.mode_used?.toUpperCase()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4">
              <Link
                className="text-indigo-600 hover:text-indigo-800"
                to="/doctor/upload-cephalogram"
              >
                Upload Cephalogram
              </Link>
            </div>
          </div>

        </div>
      )}
    </main>
  );
}