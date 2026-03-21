import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL;

export default function PredictionsPage() {
  const { getAuthHeaders } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");

  // ================= SAFE VALUE =================
  const safeValue = (val) => {
    if (!val) return "-";
    if (typeof val === "object") {
      return Object.values(val).join(", ");
    }
    return val;
  };

  // ================= FETCH =================
  useEffect(() => {
    fetch(`${API_URL}/admin/predictions`, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, [getAuthHeaders]);

  // ================= FILTER =================
  const filtered = data.filter((p) =>
    (p.doctor_name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ================= OPEN FILE (FINAL FIX) =================
  const openFile = (url) => {
    if (!url) return;

    let finalUrl = url;

    // ✅ If backend sends relative path → attach API URL
    if (!url.startsWith("http")) {
      finalUrl = `${API_URL}${url}`;
    }

    window.open(finalUrl, "_blank", "noopener,noreferrer");
  };

  // ================= UI =================
  return (
    <div className="max-w-6xl mx-auto p-6">

      <h2 className="text-2xl font-bold mb-4 text-indigo-700">
        All Predictions
      </h2>

      {/* SEARCH */}
      <input
        placeholder="Search by Doctor Name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 mb-6 border rounded-xl"
      />

      <div className="space-y-4">

        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition"
          >

            {/* HEADER */}
            <div
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              className="flex justify-between items-center p-4 cursor-pointer"
            >

              <div>
                <h3 className="text-lg font-semibold">
                  {p.model_name}
                </h3>

                <p className="text-xs text-gray-400">
                  Doctor: {p.doctor_name || "Unknown"}
                </p>

                <p className="text-xs text-gray-400">
                  Patient: {p.patient_name || `ID: ${p.patient_id}`}
                </p>
              </div>

              <div className="flex items-center gap-3">

                <span
                  className={`px-3 py-1 text-sm rounded-full font-semibold ${
                    p.skeletal_class === "Class I"
                      ? "bg-green-100 text-green-700"
                      : p.skeletal_class === "Class II"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {p.skeletal_class || "-"}
                </span>

                <span>{expanded === p.id ? "▲" : "▼"}</span>

              </div>
            </div>

            {/* DROPDOWN */}
            {expanded === p.id && (
              <div className="border-t p-4 space-y-4">

                <p className="text-sm text-gray-500">
                  {p.created_at
                    ? new Date(p.created_at).toLocaleString()
                    : "-"}
                </p>

                {/* CLINICAL */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-gray-500 text-sm">Maxilla</p>
                    <p className="font-semibold">
                      {safeValue(p.maxilla_status)}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-3 rounded">
                    <p className="text-gray-500 text-sm">Mandible</p>
                    <p className="font-semibold">
                      {safeValue(p.mandible_status)}
                    </p>
                  </div>

                  <div className="bg-orange-50 p-3 rounded">
                    <p className="text-gray-500 text-sm">Divergence</p>
                    <p className="font-semibold">
                      {safeValue(p.divergence_status)}
                    </p>
                  </div>

                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-gray-500 text-sm">Airway</p>
                    <p className="font-semibold">
                      {safeValue(p.airway)}
                    </p>
                  </div>

                  <div className="bg-red-50 p-3 rounded">
                    <p className="text-gray-500 text-sm">Airway Class</p>
                    <p className="font-semibold">
                      {safeValue(p.airway_class)}
                    </p>
                  </div>

                </div>

                {/* ACTIONS */}
                <div className="flex gap-3">

                  {p.image_path && (
                    <button
                      onClick={() => openFile(p.image_path)}
                      className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded"
                    >
                      View Image
                    </button>
                  )}

                  {p.pdf_path && (
                    <button
                      onClick={() => openFile(p.pdf_path)}
                      className="px-3 py-1 bg-green-100 hover:bg-green-200 rounded"
                    >
                      Report
                    </button>
                  )}

                </div>

              </div>
            )}

          </div>
        ))}

      </div>

    </div>
  );
}