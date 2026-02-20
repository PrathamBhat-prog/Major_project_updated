import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function CephalogramViewer() {
  const { id } = useParams();
  const { getAuthHeaders } = useContext(AuthContext);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    async function load() {
      try {
        if (!id) throw new Error("Invalid prediction ID");

        const res = await fetch(`${API_URL}/cephalogram/${id}`, {
          headers: getAuthHeaders(),
        });

        if (!res.ok) throw new Error("Failed to load cephalogram");

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, getAuthHeaders, API_URL]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!data?.image_url) return <p className="p-6">No image found.</p>;

  const imageSrc = data.image_url.startsWith("http")
    ? data.image_url
    : `${API_URL}${data.image_url}`;

  const excelSrc = data.excel_file?.startsWith("http")
    ? data.excel_file
    : `${API_URL}${data.excel_file}`;

  const isML = data.mode_used === "ml";

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Predicted Landmarks
        </h2>

        {data.mode_used && (
          <span
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              isML
                ? "bg-indigo-100 text-indigo-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {isML ? "ML Mode" : "Clinical Mode"}
          </span>
        )}
      </div>

      {/* QUICK SUMMARY */}
      {data.skeletal_class && (
        <div className="bg-blue-50 p-4 rounded shadow">
          <b>Skeletal Class:</b>{" "}
          <span className="text-blue-700 font-semibold">
            {data.skeletal_class}
          </span>
        </div>
      )}

      {/* IMAGE WITH LANDMARK OVERLAY */}
      <div className="relative inline-block bg-white p-4 rounded shadow">
        <img
          src={imageSrc}
          alt="Cephalogram"
          className="max-w-4xl rounded block"
        />

        {/* Overlay landmarks */}
        {data.landmarks?.map((p, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${p.x * 100}%`,
              top: `${p.y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="w-3 h-3 bg-red-500 rounded-full border border-white" />
            <div className="text-xs text-yellow-300 font-semibold mt-1 text-center">
              {p.name}
            </div>
          </div>
        ))}
      </div>

      {/* LANDMARK TABLE */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Landmark Coordinates
        </h3>

        <table className="w-full max-w-lg border text-sm bg-white shadow rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-2">Name</th>
              <th className="border px-2 py-2">X</th>
              <th className="border px-2 py-2">Y</th>
            </tr>
          </thead>
          <tbody>
            {data.landmarks?.map((p) => (
              <tr key={p.name}>
                <td className="border px-2 py-1">{p.name}</td>
                <td className="border px-2 py-1">
                  {Number(p.x).toFixed(4)}
                </td>
                <td className="border px-2 py-1">
                  {Number(p.y).toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DOWNLOAD EXCEL */}
      {data.excel_file && (
        <div>
          <a
            href={excelSrc}
            target="_blank"
            rel="noreferrer"
            className="text-green-600 underline"
          >
            Download Landmark Excel
          </a>
        </div>
      )}

      {/* NAVIGATION BUTTONS */}
      <div className="flex gap-4 pt-4">

        {/* Manual Adjust only in ML mode */}
        {isML && (
          <Link
            to={`/doctor/manual-adjust/${id}`}
            className="px-5 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Adjust Landmarks
          </Link>
        )}

        {/* Full Analysis */}
        <Link
          to={`/doctor/classification/${id}`}
          className="px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          View Full Analysis →
        </Link>
      </div>
    </div>
  );
}