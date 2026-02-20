import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function AutoLandmark() {
  const { id } = useParams();
  const { getAuthHeaders } = useContext(AuthContext);

  const [ceph, setCeph] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/cephalogram/${id}`, {
          headers: getAuthHeaders(),
        });

        if (!res.ok) throw new Error("Failed to load data");

        const data = await res.json();
        setCeph(data);
      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, [id]);

  if (error) return <p className="text-red-500 p-6">{error}</p>;
  if (!ceph) return <p className="p-6">Loading...</p>;

  const imageSrc = ceph.image_url?.startsWith("http")
    ? ceph.image_url
    : `${API_URL}${ceph.image_url}`;

  const modeColor =
    ceph.mode_used === "ml"
      ? "bg-indigo-100 text-indigo-700"
      : "bg-green-100 text-green-700";

  return (
    <div className="p-6 space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">
          Predicted Landmarks
        </h2>

        {ceph.mode_used && (
          <span className={`px-3 py-1 rounded text-sm font-medium ${modeColor}`}>
            Mode: {ceph.mode_used.toUpperCase()}
          </span>
        )}
      </div>

      {/* IMAGE WITH OVERLAY */}
      <div className="relative inline-block border rounded shadow">
        <img
          src={imageSrc}
          alt="Cephalogram"
          className="max-w-4xl block"
        />

        {/* LANDMARK OVERLAY */}
        {ceph.landmarks?.map((p, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${p.x * 100}%`,
              top: `${p.y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Dot */}
            <div className="w-3 h-3 bg-red-500 rounded-full border border-white shadow" />

            {/* Label */}
            <div className="text-xs text-yellow-400 font-semibold mt-1 -ml-2">
              {p.name}
            </div>
          </div>
        ))}
      </div>

      {/* LANDMARK COUNT */}
      <div className="text-gray-600">
        Total Landmarks:{" "}
        <span className="font-semibold">
          {ceph.landmarks?.length || 0}
        </span>
      </div>

      {/* TABLE */}
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Landmark Coordinates
        </h3>

        <div className="overflow-x-auto">
          <table className="border text-sm w-full max-w-xl">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">X</th>
                <th className="border px-2 py-1">Y</th>
              </tr>
            </thead>
            <tbody>
              {ceph.landmarks?.map((p) => (
                <tr key={p.name}>
                  <td className="border px-2 py-1 font-medium">
                    {p.name}
                  </td>
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
      </div>

      {/* NAVIGATION */}
      <Link
        to={`/doctor/classification/${id}`}
        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded shadow"
      >
        View Full Cephalometric Analysis →
      </Link>

    </div>
  );
}