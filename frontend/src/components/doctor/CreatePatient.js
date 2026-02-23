import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CreatePatient() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    dob: "",
    gender: "M",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;

  const calculateAge = (dob) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      return setError("Patient name is required");
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        age: calculateAge(form.dob),
        dob: form.dob || "",
        gender: form.gender,
        notes: `
Gender: ${form.gender}
Email: ${form.email || "N/A"}
Phone: ${form.phone || "N/A"}
Address: ${form.address || "N/A"}
        `.trim(),
      };

      const res = await fetch(`${API_URL}/patients/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to create patient");
      }

      await res.json();
      navigate("/doctor/dashboard");

    } catch (err) {
      console.error("Error creating patient:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-8">

      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-lg shadow-2xl rounded-3xl p-10 border">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-indigo-700">
            Create New Patient
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Enter patient details below
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">

          {/* NAME */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Full Name *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full border border-gray-300 p-3 rounded-xl
                         focus:ring-2 focus:ring-indigo-400
                         focus:outline-none transition"
              placeholder="Enter full name"
            />
          </div>

          {/* DOB */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              value={form.dob}
              onChange={(e) =>
                setForm({ ...form, dob: e.target.value })
              }
              className="w-full border border-gray-300 p-3 rounded-xl
                         focus:ring-2 focus:ring-indigo-400
                         focus:outline-none transition"
            />
          </div>

          {/* GENDER */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Gender
            </label>
            <select
              value={form.gender}
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value })
              }
              className="w-full border border-gray-300 p-3 rounded-xl
                         focus:ring-2 focus:ring-indigo-400
                         focus:outline-none transition"
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Email
            </label>
            <input
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full border border-gray-300 p-3 rounded-xl
                         focus:ring-2 focus:ring-indigo-400
                         focus:outline-none transition"
              placeholder="example@email.com"
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Phone
            </label>
            <input
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
              className="w-full border border-gray-300 p-3 rounded-xl
                         focus:ring-2 focus:ring-indigo-400
                         focus:outline-none transition"
              placeholder="Phone number"
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Address
            </label>
            <input
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
              className="w-full border border-gray-300 p-3 rounded-xl
                         focus:ring-2 focus:ring-indigo-400
                         focus:outline-none transition"
              placeholder="Address"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-4 pt-4">

            <button
              type="button"
              onClick={() => navigate("/doctor/dashboard")}
              className="px-6 py-3 rounded-xl border border-gray-300
                         text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className={`px-8 py-3 rounded-xl text-white font-semibold shadow-md transition-all duration-200
                ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 hover:-translate-y-1"
                }`}
            >
              {loading ? "Creating..." : "Create Patient"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}