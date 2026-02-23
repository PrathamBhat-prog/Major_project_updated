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
  <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 py-12 px-6">

    <div className="max-w-6xl mx-auto space-y-12">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">
          Predicted Landmarks
        </h2>

        {ceph.mode_used && (
          <span
            className={`px-5 py-2 rounded-full text-sm font-semibold shadow-sm ${
              ceph.mode_used === "ml"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {ceph.mode_used === "ml"
              ? "ML Mode"
              : "Clinical Mode"}
          </span>
        )}
      </div>


      {/* IMAGE CARD */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border flex justify-center">

        <div className="relative inline-block">

          <img
            src={imageSrc}
            alt="Cephalogram"
            className="max-w-4xl rounded-2xl"
          />

          {/* LANDMARK OVERLAY */}
          {ceph.landmarks?.map((p, i) => (
            <div
              key={i}
              className="absolute group"
              style={{
                left: `${p.x * 100}%`,
                top: `${p.y * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Animated Dot */}
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg
                              group-hover:scale-125 transition-transform duration-200" />

              {/* Label */}
              <div className="text-xs bg-black/70 text-white px-2 py-1 rounded-md mt-2
                              opacity-0 group-hover:opacity-100 transition duration-200
                              whitespace-nowrap">
                {p.name}
              </div>
            </div>
          ))}

        </div>
      </div>


      {/* LANDMARK COUNT */}
      <div className="bg-white rounded-2xl shadow-md p-6 border text-gray-700">
        Total Landmarks:{" "}
        <span className="font-bold text-indigo-600 text-lg">
          {ceph.landmarks?.length || 0}
        </span>
      </div>


      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-lg border p-8">

        <h3 className="text-2xl font-semibold text-gray-800 mb-6">
          Landmark Coordinates
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm rounded-lg overflow-hidden">

            <thead className="bg-indigo-50 text-indigo-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  X
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  Y
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {ceph.landmarks?.map((p) => (
                <tr
                  key={p.name}
                  className="hover:bg-slate-50 transition"
                >
                  <td className="px-4 py-3 font-medium text-gray-700">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {Number(p.x).toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {Number(p.y).toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>


      {/* NAVIGATION BUTTON */}
      <div className="flex justify-end">
        <Link
          to={`/doctor/classification/${id}`}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700
                     hover:from-indigo-700 hover:to-indigo-800
                     text-white font-semibold px-8 py-3
                     rounded-2xl shadow-lg hover:shadow-xl
                     transition-all duration-200 hover:-translate-y-1"
        >
          View Full Cephalometric Analysis →
        </Link>
      </div>

    </div>
  </div>
);
}