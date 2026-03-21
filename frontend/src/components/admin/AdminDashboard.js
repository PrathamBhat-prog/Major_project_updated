import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { User, Activity, FileText } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function AdminDashboard() {
  const { getAuthHeaders } = useContext(AuthContext);

  const [patients, setPatients] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getAuthHeaders();

        const [pRes, prRes, uRes] = await Promise.all([
          fetch(`${API_URL}/admin/patients`, { headers }),
          fetch(`${API_URL}/admin/predictions`, { headers }),
          fetch(`${API_URL}/admin/users`, { headers }),
        ]);

        const pData = await pRes.json();
        const prData = await prRes.json();
        const uData = await uRes.json();
        console.log("USERS:", uData);
        console.log("PATIENT:", pData[0]);
        setPatients(pData || []);
        setPredictions(prData || []);
        setUsers(uData || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getAuthHeaders]);

  // ================= DERIVED DATA =================

  const totalPatients = patients.length;
  const totalPredictions = predictions.length;
  const totalDoctors = users.filter(u => u.role === "doctor").length;

  // Map doctorId → name
  // Map doctorId → name
// Map doctorId -> display name (robust)
const doctorMap = {};
users.forEach(u => {
  if (u.role === "doctor") {
    const id = String(u.id ?? u.user_id ?? u._id);       // handle different id fields
    const name = u.username ?? u.name ?? u.email ?? `Doc ${id}`;
    doctorMap[id] = name;
  }
});
// Patients per doctor
const doctorPatients = {};
patients.forEach(p => {
  const docId = String(p.owner_id ?? p.doctor_id ?? p.user_id);
  if (!docId) return;
  doctorPatients[docId] = (doctorPatients[docId] || 0) + 1;
});

// Predictions per doctor
const doctorPredictions = {};
predictions.forEach(pred => {
  const patient = patients.find(p => String(p.id) === String(pred.patient_id));
  if (patient) {
    const docId = String(patient.owner_id ?? patient.doctor_id ?? patient.user_id);
    if (!docId) return;
    doctorPredictions[docId] = (doctorPredictions[docId] || 0) + 1;
  }
});
  // Chart data
  const doctorChartData = Object.keys(doctorPatients).map(docId => ({
    name: doctorMap[docId] || `Doc ${docId}`,
    patients: doctorPatients[docId]
  }));

  // ML vs Clinical
  const modeStats = [
  {
    name: "ML",
    value: predictions.filter(p =>
      /ml/i.test(p.model_name)
    ).length
  },
  {
    name: "Clinical",
    value: predictions.filter(p =>
      /clinical/i.test(p.model_name)
    ).length
  }
];

  const COLORS = ["#6366f1", "#22c55e"];

  if (loading) {
    return (
      <div className="p-10 text-center text-lg">
        Loading Dashboard...
      </div>
    );
  }
console.log("MODE STATS:", modeStats);
console.log("PREDICTIONS:", predictions);
  return (
    <div className="p-6">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Admin Dashboard
      </h1>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <StatCard
          title="Total Patients"
          value={totalPatients}
          icon={<Activity />}
          color="blue"
        />

        <StatCard
          title="Total Predictions"
          value={totalPredictions}
          icon={<FileText />}
          color="green"
        />

        <StatCard
          title="Total Doctors"
          value={totalDoctors}
          icon={<User />}
          color="purple"
        />

      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

        {/* Patients per Doctor */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold mb-4">
            Patients per Doctor
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={doctorChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="patients" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ML vs Clinical */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold mb-4">
            ML vs Clinical Usage
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={modeStats} dataKey="value" outerRadius={90} label>
                {modeStats.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ================= DOCTOR TABLE ================= */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">
          Doctor Performance
        </h2>

        <table className="w-full text-sm">
          <thead className="text-gray-500">
            <tr>
              <th className="p-3 text-left">Doctor</th>
              <th className="p-3 text-center">Patients</th>
              <th className="p-3 text-center">Predictions</th>
            </tr>
          </thead>

          <tbody>
            {Object.keys(doctorPatients).map(docId => (
              <tr key={docId} className="border-t hover:bg-gray-50">
                <td className="p-3">
  {doctorMap[docId] || "Unknown Doctor"}
</td>
                <td className="p-3 text-center">
                  {doctorPatients[docId]}
                </td>
                <td className="p-3 text-center">
                  {doctorPredictions[docId] || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

// ================= CARD =================
function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500"
  };

  return (
    <div className={`p-6 rounded-xl text-white shadow ${colors[color]}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm">{title}</p>
          <h2 className="text-2xl font-bold">{value}</h2>
        </div>
        {icon}
      </div>
    </div>
  );
}