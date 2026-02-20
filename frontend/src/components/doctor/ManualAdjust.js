import React, { useState, useRef, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function ManualAdjust() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getAuthHeaders } = useContext(AuthContext);

  const {
    patientId,
    imageFile,
    previewImage,
    predictedLandmarks,
  } = location.state || {};
// ================================
// LANDMARK NAME MAP
// ================================
const landmarkNames = {
  P1: "Sella",
  P2: "Nasion",
  P3: "Orbitale",
  P4: "Porion",
  P5: "Subspinale (A Point)",
  P6: "Supramentale (B Point)",
  P7: "Pogonion",
  P8: "Menton",
  P9: "Gonion",
  P10: "Articulare",
  P11: "Incision Inferius",
  P12: "Incision Superius",
  P13: "Upper Lip",
  P14: "Lower Lip",
  P15: "Soft Tissue Pogonion",
  P16: "Posterior Nasal Spine",
  P17: "Anterior Nasal Spine",
  P18: "Upper Incisor Tip",
  P19: "Lower Incisor Tip"
};
  const API_URL = process.env.REACT_APP_API_URL;

  const imageRef = useRef(null);

  const [landmarks, setLandmarks] = useState([]);
  const [originalLandmarks, setOriginalLandmarks] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize landmarks
  useEffect(() => {
    if (!predictedLandmarks) return;
    setLandmarks(predictedLandmarks);
    setOriginalLandmarks(JSON.parse(JSON.stringify(predictedLandmarks)));
  }, [predictedLandmarks]);

  if (!previewImage || !landmarks.length)
    return <p className="p-8">Invalid navigation state</p>;

  // ================================
  // HANDLE DRAG
  // ================================
  const handleMouseDown = (index) => {
    setSelectedIndex(index);
    setDragging(true);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!dragging || selectedIndex === null) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const clampedX = Math.min(Math.max(x, 0), 1);
    const clampedY = Math.min(Math.max(y, 0), 1);

    const updated = [...landmarks];
    updated[selectedIndex] = {
      ...updated[selectedIndex],
      x: parseFloat(clampedX.toFixed(4)),
      y: parseFloat(clampedY.toFixed(4)),
    };

    setLandmarks(updated);
  };

  // ================================
  // APPLY ALL COORDINATES (NEW)
  // ================================
  const applyAll = () => {
    setSelectedIndex(-1); // Special flag to show all as active (blue)
  };

  // ================================
  // RESET FUNCTIONS
  // ================================
  const resetSelected = () => {
    if (selectedIndex === null || selectedIndex === -1) return;

    const updated = [...landmarks];
    updated[selectedIndex] = originalLandmarks[selectedIndex];
    setLandmarks(updated);
  };

  const resetAll = () => {
    setLandmarks(JSON.parse(JSON.stringify(originalLandmarks)));
    setSelectedIndex(null);
  };

  // ================================
  // FINALIZE ML
  // ================================
  const finalize = async () => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("landmarks", JSON.stringify(landmarks));

      const headers = getAuthHeaders();
      delete headers["Content-Type"];

      const res = await fetch(
        `${API_URL}/ml-finalize/${patientId}`,
        {
          method: "POST",
          headers,
          body: formData,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Finalize error:", errorText);
        throw new Error("Finalization failed");
      }

      const data = await res.json();
      navigate(`/doctor/landmark/${data.id}`);

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // CHECK IF MODIFIED
  // ================================
  const isModified = (index) => {
    return (
      landmarks[index].x !== originalLandmarks[index].x ||
      landmarks[index].y !== originalLandmarks[index].y
    );
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* LEFT PANEL - IMAGE */}
      <div
        className="md:col-span-2 relative border rounded shadow"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <img
          ref={imageRef}
          src={previewImage}
          alt="Cephalogram"
          className="w-full select-none"
          draggable={false}
        />

        {/* LANDMARK OVERLAY */}
        {landmarks.map((p, i) => {
          const left = `${p.x * 100}%`;
          const top = `${p.y * 100}%`;

          const isActive =
            selectedIndex === -1 || i === selectedIndex; // UPDATED

          const modified = isModified(i);

          return (
            <div
              key={i}
              onMouseDown={() => handleMouseDown(i)}
              className={`absolute w-3 h-3 rounded-full cursor-pointer 
                ${isActive ? "bg-blue-500" : modified ? "bg-green-500" : "bg-orange-500"}`}
              style={{
                left,
                top,
                transform: "translate(-50%, -50%)",
              }}
              title={`${p.name} - ${landmarkNames[p.name] || ""}`}
            />
          );
        })}
      </div>

      {/* RIGHT PANEL */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Manual Landmark Adjustment
        </h2>

        {selectedIndex !== null && selectedIndex !== -1 && (
          <div className="p-4 border rounded bg-gray-50">
            <div className="font-medium">
              Selected: {landmarks[selectedIndex].name}
            </div>
            <div>X: {landmarks[selectedIndex].x}</div>
            <div>Y: {landmarks[selectedIndex].y}</div>

            <button
              onClick={resetSelected}
              className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded"
            >
              Reset Selected
            </button>
          </div>
        )}

        <div className="max-h-64 overflow-y-auto border rounded p-2">
          {landmarks.map((p, i) => (
            <div
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`p-2 cursor-pointer rounded text-sm
                ${i === selectedIndex ? "bg-blue-100" : ""}`}
            >
              {p.name} - {landmarkNames[p.name] || ""}
              {isModified(i) && (
                <span className="text-green-600">(Modified)</span>
              )}
            </div>
          ))}
        </div>

        {/* NEW BUTTON */}
        <button
          onClick={applyAll}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded"
        >
          Apply All Coordinates
        </button>

        <button
          onClick={resetAll}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded"
        >
          Reset All
        </button>

        <button
          onClick={finalize}
          disabled={loading}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {loading ? "Processing..." : "Finalize & Generate Report"}
        </button>
      </div>
    </div>
  );
}