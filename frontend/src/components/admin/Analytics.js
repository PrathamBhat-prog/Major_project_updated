import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { motion } from "framer-motion";
import CountUp from "react-countup";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444"];

export default function Analytics() {
  const { getAuthHeaders } = useContext(AuthContext);
  
  const [tab, setTab] = useState("db");
  const [dbData, setDbData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getAuthHeaders();

        const [predRes, excelRes] = await Promise.all([
          fetch(`${API_URL}/admin/predictions`, { headers }),
          fetch(`${API_URL}/admin/master-excel-data`, { headers })
        ]);

        setDbData(await predRes.json());
        setExcelData(await excelRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const rawData = tab === "db" ? dbData : excelData;

  // ================= HELPERS =================

  const countByKey = (arr, key) => {
    const map = {};
    arr.forEach(i => {
      const k = i[key] || "Unknown";
      map[k] = (map[k] || 0) + 1;
    });
    return Object.keys(map).map(k => ({ name: k, value: map[k] }));
  };

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

  // 🔥 NEW HELPERS (ADDED ONLY)
  const getMaxillary = (d) => {
    const val = d?.angles?.SNA ?? d.SNA;
    if (!val) return "Unknown";
    if (val > 84) return "Prognathic";
    if (val >= 80) return "Orthognathic";
    return "Retrognathic";
  };

  const getMandibular = (d) => {
    const val = d?.angles?.SNB ?? d.SNB;
    if (!val) return "Unknown";
    if (val > 82) return "Prognathic";
    if (val >= 78) return "Orthognathic";
    return "Retrognathic";
  };

  // 🔥 UPDATED FILTER (ADDED SUPPORT)
  const data = filter
    ? rawData.filter(d =>
        d.skeletal_class === filter ||
        getGrowth(d) === filter ||
        getMaxillary(d) === filter ||
        getMandibular(d) === filter
      )
    : rawData;
const getYenAirwayTable = () => {
  return data.map((d, i) => ({
    id: i,
    class: d.skeletal_class || "-",
    yen: d?.angles?.YEN ?? d.YEN ?? "-",
    airway:
      typeof (d?.airway_width ?? d.airway) === "object"
        ? (d?.airway_width?.upper_airway??
           d?.airway?.upper_airway ??
           "-")
        : (d?.airway_width ?? d.airway ?? "-")
  }));
};
  // ================= MATRIX =================

  const getMatrix = (metric) => {
    const classes = ["Class I", "Class II", "Class III"];
    const growths = ["Normodivergent", "Hypodivergent", "Hyperdivergent"];
    const result = {};
    
    classes.forEach(cls => {
      result[cls] = {};

      growths.forEach(g => {
        const filtered = data.filter(d =>
          (d.skeletal_class || "").toLowerCase() === cls.toLowerCase() &&
          getGrowth(d).toLowerCase() === g.toLowerCase()
        );

        const values = filtered
          .map(d => {
            let val = null;

            if (d?.angles && d.angles[metric] !== undefined) {
              val = d.angles[metric];
            } else if (d[metric] !== undefined) {
              val = d[metric];
            }

            return val !== null ? parseFloat(val) : null;
          })
          .filter(v => v !== null && !isNaN(v));

        const avg = values.length
          ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
          : "-";

        result[cls][g] = avg;
      });
    });

    return result;
  };

  // ================= DATA =================

  const divergenceData = countByKey(
    data.map(d => ({ divergence: getGrowth(d) })),
    "divergence"
  );

  const classData = countByKey(data, "skeletal_class");

  // 🔥 NEW DATA
  const maxillaryData = countByKey(
    data.map(d => ({ max: getMaxillary(d) })),
    "max"
  );

  const mandibularData = countByKey(
    data.map(d => ({ mand: getMandibular(d) })),
    "mand"
  );

  if (loading) return <Loading />;

  return (
    <motion.div
      className="p-6 min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      <motion.h1 className="text-3xl font-bold mb-6">
        Analytics Dashboard
      </motion.h1>

      <div className="flex gap-4 mb-6">
        <TabBtn active={tab==="db"} onClick={() => setTab("db")} label="Database" />
        <TabBtn active={tab==="excel"} onClick={() => setTab("excel")} label="Master Excel" />
      </div>

      <InsightCard data={data} />

      {filter && (
        <div className="mb-4 bg-white p-3 rounded shadow">
          Showing: <b>{filter}</b>
          <button onClick={()=>setFilter(null)} className="ml-3 text-blue-500">Clear</button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total" value={data.length} />
        <StatCard title="Class II" value={data.filter(d=>d.skeletal_class==="Class II").length} />
        <StatCard title="Class III" value={data.filter(d=>d.skeletal_class==="Class III").length} />
        <StatCard title="Avg Age" value={
          data.length
            ? (data.reduce((s,d)=>s+(d.age||0),0)/data.length).toFixed(1)
            : 0
        } />
      </div>

      {/* ORIGINAL CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Class Distribution">
          <PieUI data={classData} onClick={setFilter} />
        </ChartCard>

        <ChartCard title="Divergence">
          <PieUI data={divergenceData} onClick={setFilter} />
        </ChartCard>

        {/* <ChartCard title="Class Comparison">
          <BarUI data={classData} />
        </ChartCard>

        <ChartCard title="Divergence Comparison">
          <BarUI data={divergenceData} />
        </ChartCard> */}
      </div>

      {/* NEW PIE CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ChartCard title="Maxillary Position (SNA)">
          <PieUI data={maxillaryData} onClick={setFilter} />
        </ChartCard>

        <ChartCard title="Mandibular Position (SNB)">
          <PieUI data={mandibularData} onClick={setFilter} />
        </ChartCard>
      </div>

      <Matrix title="SNA Analysis" matrix={getMatrix("SNA")} />
      <Matrix title="SNB Analysis" matrix={getMatrix("SNB")} />
      <Matrix title="YEN Analysis" matrix={getMatrix("YEN")} />
      <YenAirwayTable data={getYenAirwayTable()} />

    </motion.div>
  );
}

/* ================= COMPONENTS ================= */

function TabBtn({ active, onClick, label }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-5 py-2 rounded-xl ${
        active
          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
          : "bg-white shadow"
      }`}
    >
      {label}
    </motion.button>
  );
}

function StatCard({ title, value }) {
  return (
    <motion.div
      whileHover={{ scale: 1.07, y: -5 }}
      className="bg-white p-5 rounded-xl text-center shadow-md hover:shadow-2xl"
    >
      <p className="text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold text-indigo-600">
        <CountUp end={value} duration={1.2} />
      </h2>
    </motion.div>
  );
}

function InsightCard({ data }) {
  const total = data.length;
  const c2 = data.filter(d=>d.skeletal_class==="Class II").length;
  const percent = total?((c2/total)*100).toFixed(1):0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-xl mb-6 shadow-lg"
    >
      {percent}% patients are Class II
    </motion.div>
  );
}

function ChartCard({ title, children }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-4 rounded-xl shadow hover:shadow-xl"
    >
      <h2 className="mb-2 font-semibold">{title}</h2>
      {children}
    </motion.div>
  );
}

// 🔥 UPDATED PIE (ANIMATION ONLY)
function PieUI({ data, onClick }) {
  const [active, setActive] = useState(null);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          isAnimationActive={true}
          animationDuration={800}
          onClick={(e)=>onClick?.(e.name)}
          onMouseEnter={(_, i)=>setActive(i)}
          activeIndex={active}
        >
          {data.map((_,i)=>(
            <Cell key={i} fill={COLORS[i%COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

function BarUI({ data }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3"/>
        <XAxis dataKey="name"/>
        <YAxis/>
        <Tooltip />
        <Bar dataKey="value" animationDuration={800}>
          {data.map((_,i)=>(
            <Cell key={i} fill={COLORS[i%COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function Matrix({ title, matrix }) {
  const [active, setActive] = useState(null);
  
  return (
    <div className="mt-16">
      <h2 className="text-2xl font-semibold mb-6">{title}</h2>

      {Object.keys(matrix).map((cls)=>{
        const hasData = Object.values(matrix[cls]).some(v => v !== null);
        if (!hasData) return null;

        return (
          <div key={cls} className="mb-10">
            <h3 className="mb-4 font-semibold">{cls}</h3>

            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(matrix[cls]).map(([growth,val])=>{
                const id = cls+growth;
                const isActive = active===id;

                return (
                  <motion.div
                    key={growth}
                    onClick={()=>setActive(isActive?null:id)}
                    whileHover={{ scale:1.05 }}
                    className={`p-5 rounded-xl cursor-pointer ${
                      isActive ? "ring-2 ring-indigo-500 shadow-xl" : "bg-white shadow"
                    }`}
                  >
                    <p>{growth}</p>

                    <h2 className="text-3xl font-bold mt-2">
                      {val === null ? (
                        <span className="text-gray-400 text-sm">No Data</span>
                      ) : (
                        <CountUp end={parseFloat(val)} duration={1} />
                      )}
                    </h2>

                  {val !== null && val !== "-" && (
  <div className="mt-3 h-2 bg-gray-200 rounded overflow-hidden">
    <motion.div
      initial={{width:0}}
      animate={{
        width: `${Math.min((parseFloat(val) / 150) * 100, 100)}%`
      }}
      className="h-full bg-indigo-500"
    />
  </div>

                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Loading() {
  return (
    <div className="p-10 animate-pulse">
      <div className="h-6 bg-gray-300 mb-4 w-1/3"></div>
      <div className="h-40 bg-gray-300"></div>
    </div>
  );
}
function YenAirwayTable({ data }) {
  return (
    <div className="mt-16">
      <h2 className="text-2xl font-semibold mb-6">
        YEN vs Airway Width Analysis
      </h2>

      <div className="bg-white p-4 rounded-xl shadow overflow-auto max-h-[400px]">
        <table className="w-full text-sm border">
          <thead className="bg-indigo-100 sticky top-0">
            <tr>
              <th className="p-2 border">Class</th>
              <th className="p-2 border">YEN Angle</th>
              <th className="p-2 border">Airway Width</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td className="p-2 border">{row.class}</td>
                <td className="p-2 border">{row.yen}</td>
                <td className="p-2 border">{row.airway}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}