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
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 py-14 px-6">

    <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl p-12 border">

      {/* HEADER */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-indigo-700">
          Upload Cephalogram
        </h2>
        <p className="text-gray-500 mt-3">
          Select patient and choose classification mode
        </p>
      </div>

      {/* PATIENT SELECT */}
      <div className="mb-10">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Select Patient
        </label>

        <select
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300
                     focus:ring-2 focus:ring-indigo-500 focus:outline-none
                     shadow-sm"
        >
          <option value="">Choose a patient...</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (#{p.id})
            </option>
          ))}
        </select>
      </div>

      {/* FILE UPLOAD (CLEAN STYLE) */}
      <div className="mb-10">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Upload Image
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={onFile}
          className="w-full px-4 py-3 border rounded-xl
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0
                     file:bg-indigo-600 file:text-white
                     hover:file:bg-indigo-700
                     cursor-pointer"
        />
      </div>

      {/* IMAGE PREVIEW */}
      {fileData && (
        <div className="mb-12 text-center">
          <div className="bg-slate-50 p-6 rounded-2xl shadow-inner inline-block">
            <img
              src={fileData.imageData}
              alt="Preview"
              className="max-h-72 rounded-xl shadow-md"
            />
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="mb-8 text-center text-red-600 font-medium">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-10">

  {/* CLINICAL CARD */}
<div
  onClick={() => !loading && submit("clinical")}
  className={`relative cursor-pointer rounded-3xl p-10
              bg-blue-800 text-white shadow-xl
              transition-all duration-300
              hover:shadow-2xl hover:-translate-y-2`}
>
  {loading && (
    <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center">
      <span className="text-white font-semibold text-lg">
        Processing...
      </span>
    </div>
  )}

  <h3 className="text-3xl font-bold mb-4">
    Clinical Classify
  </h3>

  <p className="text-base text-white/90">
    Full automatic clinical classification and cephalometric angle analysis.
  </p>

  <div className="mt-8 text-lg font-semibold">
    Start Clinical Analysis →
  </div>
</div>


  {/* ML CARD */}
  <div
    onClick={() => !loading && submit("ml")}
    className="relative cursor-pointer rounded-3xl p-10
               bg-gradient-to-br from-indigo-600 to-purple-700
               text-white shadow-xl
               transition-all duration-300
               hover:shadow-2xl hover:-translate-y-2"
  >
    {loading && (
      <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center">
        <span className="text-white font-semibold text-lg">
          Processing...
        </span>
      </div>
    )}

    <h3 className="text-3xl font-bold mb-4 drop-shadow-md">
      ML Classify
    </h3>

    <p className="text-white/95 text-base leading-relaxed">
      AI-assisted landmark detection with manual refinement option.
    </p>

    <div className="mt-8 text-lg font-semibold">
      Start ML Prediction →
    </div>
  </div>

</div>

    </div>

    {/* OPTIONAL OUTPUT */}
    {latestPredictionId && (
      <div className="max-w-5xl mx-auto mt-16 bg-white rounded-3xl shadow-xl p-8 border">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">
          Prediction Output
        </h3>
        <CephalogramViewer id={latestPredictionId} />
      </div>
    )}

  </div>
);
}