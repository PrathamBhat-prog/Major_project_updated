import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  PieChart, Pie, Cell, Legend
} from "recharts";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function Analytics() {
  const { getAuthHeaders } = useContext(AuthContext);

  const [tab, setTab] = useState("db");
  const [dbData, setDbData] = useState([]);
  const [excelData, setExcelData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const headers = getAuthHeaders();

      const [predRes, excelRes] = await Promise.all([
        fetch(`${API_URL}/admin/predictions`, { headers }),
        fetch(`${API_URL}/admin/master-excel-data`, { headers })
      ]);

      const preds = await predRes.json();
      const excel = await excelRes.json();

      setDbData(preds);
      setExcelData(excel);
    };

    fetchData();
  }, []);

  const data = tab === "db" ? dbData : excelData;

  // ================= HELPERS =================

  const countByKey = (arr, key) => {
    const map = {};
    arr.forEach(i => {
      const k = i[key] || "Unknown";
      map[k] = (map[k] || 0) + 1;
    });
    return Object.keys(map).map(k => ({ name: k, value: map[k] }));
  };

  // ✅ FIXED GROWTH
  const getGrowth = (d) => {
    if (d.divergence_status) {
      const val = d.divergence_status.toLowerCase();
      if (val.includes("hypo")) return "Hypodivergent";
      if (val.includes("hyper")) return "Hyperdivergent";
      return "Normodivergent";
    }

    const v = d.SN_GoGn || d.FMA;
    if (!v) return "Unknown";
    if (v < 28) return "Hypodivergent";
    if (v <= 36) return "Normodivergent";
    return "Hyperdivergent";
  };

  // ✅ FIXED AIRWAY
  const getAirwayClass = (d) => {
    if (d.airway && d.airway.upper_airway !== undefined) {
      const val = d.airway.upper_airway;
      if (val < 10) return "Severe";
      if (val < 15) return "Moderate";
      return "Normal";
    }

    const area = d.airway_area;
    if (!area) return "Unknown";
    if (area < 100) return "Severe";
    if (area < 200) return "Moderate";
    return "Normal";
  };

  // ✅ FINAL MATRIX FIX
  const getMatrix = (metric) => {
    const classes = ["Class I", "Class II", "Class III"];
    const growths = ["Normodivergent", "Hypodivergent", "Hyperdivergent"];

    const result = {};

    classes.forEach(cls => {
      result[cls] = {};
      growths.forEach(g => {
        const filtered = data.filter(d => {
          const clsMatch =
            (d.skeletal_class || "").toLowerCase().trim() === cls.toLowerCase();

          const growthMatch =
            (getGrowth(d) || "").toLowerCase().trim() === g.toLowerCase();

          return clsMatch && growthMatch;
        });

        const values = filtered
          .map(d => {
            if (d.angles && d.angles[metric] !== undefined) {
              return d.angles[metric];
            }
            return d[metric];
          })
          .filter(v => typeof v === "number" && !isNaN(v));

        const avg = values.length
          ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
          : "-";

        result[cls][g] = avg;
      });
    });

    return result;
  };

  const airwayData = countByKey(
    data.map(d => ({ airway: getAirwayClass(d) })),
    "airway"
  );

  const classData = countByKey(data, "skeletal_class");
  const maxillaData = countByKey(data, "maxilla_status");
  const mandibleData = countByKey(data, "mandible_status");

  const COLORS = ["#6366f1", "#22c55e", "#f59e0b"];

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      {/* TABS */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setTab("db")} className={`px-4 py-2 rounded ${tab==="db" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
          Database
        </button>

        <button onClick={() => setTab("excel")} className={`px-4 py-2 rounded ${tab==="excel" ? "bg-green-500 text-white" : "bg-gray-200"}`}>
          Master Excel
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Patients" value={data.length} />
        <StatCard title="Class II" value={data.filter(d => d.skeletal_class === "Class II").length} />
        <StatCard title="Class III" value={data.filter(d => d.skeletal_class === "Class III").length} />
        <StatCard title="Avg Age" value={
          data.length
            ? (data.reduce((s, d) => s + (d.age || 0), 0) / data.length).toFixed(1)
            : 0
        } />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Card title="Skeletal Class">
          <PieChart width={300} height={250}>
            <Pie data={classData} dataKey="value" outerRadius={80}>
              {classData.map((_, i) => <Cell key={i} fill={COLORS[i%3]} />)}
            </Pie>
            <Legend />
          </PieChart>
        </Card>

        <Card title="Airway Classification">
          <PieChart width={300} height={250}>
            <Pie data={airwayData} dataKey="value" outerRadius={80}>
              {airwayData.map((_, i) => <Cell key={i} fill={COLORS[i%3]} />)}
            </Pie>
            <Legend />
          </PieChart>
        </Card>

        <Card title="Maxilla Status">
          <PieChart width={300} height={250}>
            <Pie data={maxillaData} dataKey="value" outerRadius={80}>
              {maxillaData.map((_, i) => <Cell key={i} fill={COLORS[i%3]} />)}
            </Pie>
            <Legend />
          </PieChart>
        </Card>

        <Card title="Mandible Status">
          <PieChart width={300} height={250}>
            <Pie data={mandibleData} dataKey="value" outerRadius={80}>
              {mandibleData.map((_, i) => <Cell key={i} fill={COLORS[i%3]} />)}
            </Pie>
            <Legend />
          </PieChart>
        </Card>

      </div>

      {/* MATRIX */}
      <Matrix title="YEN Analysis" matrix={getMatrix("YEN")} />
      <Matrix title="SNA Analysis" matrix={getMatrix("SNA")} />
      <Matrix title="SNB Analysis" matrix={getMatrix("SNB")} />
      <Matrix title="Airway Area" matrix={getMatrix("upper_airway")} />

    </div>
  );
}

function Matrix({ title, matrix }) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-4">{title}</h2>

      {Object.keys(matrix).map(cls => (
        <div key={cls} className="bg-white p-4 mb-4 rounded-xl shadow">
          <h3 className="font-semibold mb-2">{cls}</h3>

          <div className="grid grid-cols-3 gap-4">
            {Object.entries(matrix[cls]).map(([g, v]) => (
              <div key={g} className="bg-gray-100 p-3 rounded text-center">
                <p className="text-sm text-gray-500">{g}</p>
                <p className="text-xl font-bold">{v}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}