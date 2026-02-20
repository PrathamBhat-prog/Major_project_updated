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

  // ============================
  // HANDLE SUBMIT
  // ============================
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
        dob: form.dob || "",
        notes: `
Gender: ${form.gender}
Email: ${form.email || "N/A"}
Phone: ${form.phone || "N/A"}
Address: ${form.address || "N/A"}
        `.trim(),
      };

      const res = await fetch(`${API_URL}/patients`, {
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
    <main className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-6">
        Create New Patient
      </h2>

      <form
        onSubmit={submit}
        className="bg-white p-6 rounded shadow space-y-4"
      >
        {/* NAME */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Full Name *
          </label>
          <input
            required
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="w-full border p-2 rounded"
            placeholder="Enter full name"
          />
        </div>

        {/* DOB */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            value={form.dob}
            onChange={(e) =>
              setForm({ ...form, dob: e.target.value })
            }
            className="w-full border p-2 rounded"
          />
        </div>

        {/* GENDER */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Gender
          </label>
          <select
            value={form.gender}
            onChange={(e) =>
              setForm({ ...form, gender: e.target.value })
            }
            className="w-full border p-2 rounded"
          >
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* EMAIL */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="w-full border p-2 rounded"
            placeholder="example@email.com"
          />
        </div>

        {/* PHONE */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Phone
          </label>
          <input
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
            className="w-full border p-2 rounded"
            placeholder="Phone number"
          />
        </div>

        {/* ADDRESS */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Address
          </label>
          <input
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
            className="w-full border p-2 rounded"
            placeholder="Address"
          />
        </div>

        {error && (
          <div className="text-sm text-red-500">
            {error}
          </div>
        )}

        {/* SUBMIT */}
        <div className="flex justify-end">
          <button
            disabled={loading}
            className={`px-5 py-2 rounded text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500"
            }`}
          >
            {loading ? "Creating..." : "Create Patient"}
          </button>
        </div>
      </form>
    </main>
  );
}