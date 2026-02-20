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
    <div className="p-8 space-y-10 max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">
          Cephalometric Analysis Report
        </h2>

        {ceph.mode_used && (
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

      {/* IMAGE */}
      <div className="bg-white p-4 rounded shadow">
        <img
          src={imageSrc}
          alt="Labeled Cephalogram"
          className="rounded max-w-full"
        />
      </div>

      {/* CLASSIFICATION SUMMARY */}
      <div className="bg-blue-50 p-6 rounded shadow space-y-4">
        <h3 className="text-xl font-semibold">
          Classification Summary
        </h3>

        <div className="text-lg">
          <b>Skeletal Class:</b>{" "}
          <span className="text-blue-700 font-semibold">
            {ceph.skeletal_class || "N/A"}
          </span>
        </div>

        {!isML && (
          <>
            {ceph.maxilla_status && (
              <div>
                <b>Maxilla:</b> {ceph.maxilla_status}
              </div>
            )}

            {ceph.mandible_status && (
              <div>
                <b>Mandible:</b> {ceph.mandible_status}
              </div>
            )}

            {ceph.divergence_status && (
              <div>
                <b>Divergence Pattern:</b>{" "}
                {ceph.divergence_status}
              </div>
            )}
          </>
        )}
      </div>

      {/* ANGLES */}
      <div>
        <h3 className="text-xl font-semibold mb-6">
          Cephalometric Angles
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {ceph.angles &&
            Object.entries(ceph.angles).map(([k, v]) => (
              <div
                key={k}
                className="p-5 bg-white border rounded shadow"
              >
                <div className="font-medium text-gray-600">
                  {k}
                </div>
                <div className="text-2xl text-blue-600 mt-2">
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
          <h3 className="text-xl font-semibold mb-6">
            Airway Analysis
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-green-50 rounded shadow">
              <b>Upper Airway</b>
              <div className="text-lg mt-2">
                {ceph.airway.upper_airway_width != null
                  ? ceph.airway.upper_airway_width.toFixed(2) + " mm"
                  : "N/A"}
              </div>
            </div>

            <div className="p-5 bg-yellow-50 rounded shadow">
              <b>Lower Airway</b>
              <div className="text-lg mt-2">
                {ceph.airway.lower_airway_width != null
                  ? ceph.airway.lower_airway_width.toFixed(2) + " mm"
                  : "N/A"}
              </div>
            </div>

            <div className="p-5 bg-purple-50 rounded shadow">
              <b>Airway Area</b>
              <div className="text-lg mt-2">
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
        <div className="text-right">
          <a
            href={pdfSrc}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700"
          >
            Download PDF Report
          </a>
        </div>
      )}
    </div>
  );
}