import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function ClassificationView() {
  const { id } = useParams();
  const { getAuthHeaders } = useContext(AuthContext);
  const API_URL = process.env.REACT_APP_API_URL;

  const [ceph, setCeph] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/cephalogram/${id}`, {
          headers: getAuthHeaders(),
        });

        if (!res.ok) throw new Error("Failed to load analysis");

        const data = await res.json();
        setCeph(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, getAuthHeaders, API_URL]);

  if (loading) return <p className="p-8">Loading analysis...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;
  if (!ceph) return <p className="p-8">No data found</p>;

  // Fix URLs (local vs AWS)
  const imageSrc = ceph.image_url?.startsWith("http")
    ? ceph.image_url
    : `${API_URL}${ceph.image_url}`;

  const pdfSrc = ceph.pdf_report?.startsWith("http")
    ? ceph.pdf_report
    : `${API_URL}${ceph.pdf_report}`;

  const isML = ceph.mode_used === "ml";

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 py-12 px-6">

    <div className="max-w-6xl mx-auto space-y-12">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-bold text-gray-800 tracking-tight">
          Cephalometric Analysis Report
        </h2>

        {ceph.mode_used && (
          <span
            className={`px-5 py-2 rounded-full text-sm font-semibold shadow-sm ${
              isML
                ? "bg-indigo-100 text-indigo-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {isML ? "ML Mode" : "Clinical Mode"}
          </span>
        )}
      </div>


      {/* IMAGE CARD */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border">
        <img
          src={imageSrc}
          alt="Labeled Cephalogram"
          className="rounded-2xl w-full object-contain"
        />
      </div>


      {/* CLASSIFICATION SUMMARY */}
      <div className="bg-gradient-to-r from-indigo-50 to-slate-50 p-8 rounded-3xl shadow-lg border space-y-6">

        <h3 className="text-2xl font-semibold text-gray-800">
          Classification Summary
        </h3>

        <div className="text-xl">
          <b>Skeletal Class:</b>{" "}
          <span className="text-indigo-700 font-bold">
            {ceph.skeletal_class || "N/A"}
          </span>
        </div>

        {!isML && (
          <div className="grid md:grid-cols-3 gap-6 text-gray-700">

            {ceph.maxilla_status && (
              <div className="bg-white p-5 rounded-2xl shadow-sm border">
                <b>Maxilla</b>
                <div className="mt-2 text-indigo-600 font-medium">
                  {ceph.maxilla_status}
                </div>
              </div>
            )}

            {ceph.mandible_status && (
              <div className="bg-white p-5 rounded-2xl shadow-sm border">
                <b>Mandible</b>
                <div className="mt-2 text-indigo-600 font-medium">
                  {ceph.mandible_status}
                </div>
              </div>
            )}

            {ceph.divergence_status && (
              <div className="bg-white p-5 rounded-2xl shadow-sm border">
                <b>Divergence Pattern</b>
                <div className="mt-2 text-indigo-600 font-medium">
                  {ceph.divergence_status}
                </div>
              </div>
            )}

          </div>
        )}
      </div>


      {/* ANGLES */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-8">
          Cephalometric Angles
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {ceph.angles &&
            Object.entries(ceph.angles).map(([k, v]) => (
              <div
                key={k}
                className="p-6 bg-white rounded-2xl shadow-md border hover:shadow-lg transition-all duration-200"
              >
                <div className="font-medium text-gray-500">
                  {k}
                </div>

                <div className="text-3xl font-bold text-indigo-600 mt-3">
                  {typeof v === "number"
                    ? `${v.toFixed(2)}°`
                    : "N/A"}
                </div>
              </div>
            ))}
        </div>
      </div>


      {/* AIRWAY */}
      {ceph.airway && (
        <div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-8">
            Airway Analysis
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="p-6 bg-emerald-50 rounded-2xl shadow-md border">
              <b className="text-emerald-700">Upper Airway</b>
              <div className="text-xl mt-3 font-semibold">
                {ceph.airway.upper_airway_width != null
                  ? ceph.airway.upper_airway_width.toFixed(2) + " mm"
                  : "N/A"}
              </div>
            </div>

            <div className="p-6 bg-amber-50 rounded-2xl shadow-md border">
              <b className="text-amber-700">Lower Airway</b>
              <div className="text-xl mt-3 font-semibold">
                {ceph.airway.lower_airway_width != null
                  ? ceph.airway.lower_airway_width.toFixed(2) + " mm"
                  : "N/A"}
              </div>
            </div>

            <div className="p-6 bg-purple-50 rounded-2xl shadow-md border">
              <b className="text-purple-700">Airway Area</b>
              <div className="text-xl mt-3 font-semibold">
                {ceph.airway.airway_area != null
                  ? ceph.airway.airway_area.toFixed(2) + " sq.mm"
                  : "N/A"}
              </div>
            </div>

          </div>
        </div>
      )}


      {/* DOWNLOAD PDF */}
      {ceph.pdf_report && (
        <div className="flex justify-end pt-4">
          <a
            href={pdfSrc}
            target="_blank"
            rel="noreferrer"
            className="bg-gradient-to-r from-indigo-600 to-indigo-700
                       hover:from-indigo-700 hover:to-indigo-800
                       text-white font-semibold px-8 py-3
                       rounded-2xl shadow-lg hover:shadow-xl
                       transition-all duration-200 hover:-translate-y-1"
          >
            Download PDF Report
          </a>
        </div>
      )}

    </div>
  </div>
);
}