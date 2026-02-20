import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CephalogramViewer from "./CephalogramViewer";

export default function UploadCephalogram() {
  const { getAuthHeaders } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latestPredictionId, setLatestPredictionId] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;
  const nav = useNavigate();

  // =====================================
  // FETCH PATIENTS
  // =====================================
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`${API_URL}/patients`, {
          headers: getAuthHeaders(),
        });

        if (!res.ok) throw new Error("Failed to load patients");

        const data = await res.json();
        setPatients(data);
      } catch (err) {
        console.error(err);
        setError("Unable to fetch patients");
      }
    };

    fetchPatients();
  }, [API_URL]);

  // =====================================
  // HANDLE FILE
  // =====================================
  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    const reader = new FileReader();
    reader.onload = () =>
      setFileData({
        file: f,
        fileName: f.name,
        imageData: reader.result,
      });

    reader.readAsDataURL(f);
  };

  // =====================================
  // SUBMIT FUNCTION
  // =====================================
  const submit = async (mode) => {
    if (!fileData || !patientId) {
      alert("Select patient and upload image");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", fileData.file);

      let endpoint = "";

      // Clinical mode
      if (mode === "clinical") {
        endpoint = `${API_URL}/predict/${patientId}`;
      }

      // ML Stage 1
      if (mode === "ml") {
        endpoint = `${API_URL}/ml-predict/${patientId}`;
      }

      const authHeaders = getAuthHeaders();

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          // 🔥 Only send Authorization — do NOT send Content-Type
          Authorization: authHeaders.Authorization,
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Backend Error:", text);
        throw new Error("Prediction failed");
      }

      const data = await res.json();

      // =====================================
      // Clinical → Full Prediction → Redirect
      // =====================================
      if (mode === "clinical") {
        if (!data.id) throw new Error("Invalid response from backend");

        setLatestPredictionId(data.id);
        nav(`/doctor/landmark/${data.id}`);
      }

      // =====================================
      // ML → Stage 1 → Manual Adjust Page
      // =====================================
      if (mode === "ml") {
        if (!data.landmarks)
          throw new Error("Invalid ML preview response");

        nav(`/doctor/manual-adjust/${patientId}`, {
  state: {
    patientId,
    imageFile: fileData.file,
    previewImage: fileData.imageData,
    predictedLandmarks: data.landmarks,
  },
});
      }

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">
        Upload Cephalogram
      </h2>

      <div className="bg-white p-4 rounded shadow space-y-4">

        {/* Patient Select */}
        <select
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Select patient</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (#{p.id})
            </option>
          ))}
        </select>

        {/* File Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={onFile}
        />

        {/* Preview */}
        {fileData && (
          <div className="p-2 border rounded">
            <img
              src={fileData.imageData}
              className="max-h-48 mx-auto"
              alt="preview"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-red-500">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            disabled={loading}
            onClick={() => submit("clinical")}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {loading ? "Processing..." : "Clinical Classify"}
          </button>

          <button
            disabled={loading}
            onClick={() => submit("ml")}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            {loading ? "Processing..." : "ML Classify"}
          </button>
        </div>
      </div>

      {/* Optional Preview for Clinical */}
      {latestPredictionId && (
        <div className="mt-10">
          <h3 className="text-lg font-semibold">
            Prediction Output
          </h3>
          <CephalogramViewer id={latestPredictionId} />
        </div>
      )}
    </main>
  );
}