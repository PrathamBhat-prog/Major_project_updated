import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Line,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { motion } from "framer-motion";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function AdvancedAnalysis() {

  const { getAuthHeaders } = useContext(AuthContext);

  // ================= STATE =================

  const [dbData, setDbData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [tab, setTab] = useState("db");

  // ================= FETCH =================

  useEffect(() => {
    const fetchData = async () => {
      const headers = getAuthHeaders();

      const [dbRes, exRes] = await Promise.all([
        fetch(`${API_URL}/admin/predictions`, { headers }),
        fetch(`${API_URL}/admin/master-excel-data`, { headers })
      ]);

      setDbData(await dbRes.json());
      setExcelData(await exRes.json());
    };

    fetchData();
  }, []);

  const data = tab === "db" ? dbData : excelData;

  // ================= HELPERS =================

  const getAirway = (d) => {
  return (
    d?.airway?.upper_airway ??   // DB format
    d?.upper_airway ??           // Excel format ✅
    d?.airway_width ??           // fallback
    null
  );
};

const getAngle = (d, k) => {
  return (
    d?.angles?.[k] ??  // DB
    d?.[k] ??          // Excel ✅
    null
  );
};

  const metrics = ["SNB","SNA","YEN","SN_GoGn"];

 const clean = (v) => {
  if (v === null || v === undefined) return null;
  const num = Number(String(v).trim());
  return isNaN(num) ? null : num;
};
console.log("EXCEL ROW:", excelData[0]);
const getPairs = (key) => {
  return data
    .map(d => {
      const x = clean(getAngle(d, key));
      const y = clean(getAirway(d));

      return { x, y };
    })
    .filter(p => p.x !== null && p.y !== null)
    .sort((a, b) => a.x - b.x);
};

  // ================= CORRELATION =================

  const correlation = (pairs) => {
  const n = pairs.length;
  if (n < 2) return 0;

  const sx = pairs.reduce((s,p)=>s+p.x,0);
  const sy = pairs.reduce((s,p)=>s+p.y,0);
  const sxy = pairs.reduce((s,p)=>s+p.x*p.y,0);
  const sx2 = pairs.reduce((s,p)=>s+p.x*p.x,0);
  const sy2 = pairs.reduce((s,p)=>s+p.y*p.y,0);

  const num = n*sxy - sx*sy;
  const den = Math.sqrt((n*sx2 - sx*sx)*(n*sy2 - sy*sy));

  if (den === 0) return 0;

  return num / den;
};

  const interpret = (r) => {
  const abs = Math.abs(r);

  if (abs > 0.7) return r > 0 ? "Strong Positive" : "Strong Negative";
  if (abs > 0.3) return r > 0 ? "Moderate Positive" : "Moderate Negative";
  if (abs > 0.1) return r > 0 ? "Weak Positive" : "Weak Negative";

  return "No Correlation";
};

  // ================= REGRESSION =================

  const regression = (pairs) => {
    const n = pairs.length;

    const sx = pairs.reduce((s,p)=>s+p.x,0);
    const sy = pairs.reduce((s,p)=>s+p.y,0);
    const sxy = pairs.reduce((s,p)=>s+p.x*p.y,0);
    const sx2 = pairs.reduce((s,p)=>s+p.x*p.x,0);

    const slope = (n*sxy - sx*sy)/(n*sx2 - sx*sx);
    const intercept = (sy - slope*sx)/n;

    return { slope, intercept };
  };

  // ================= UI =================

  return (
    <div className="p-6 space-y-10 bg-gradient-to-br from-indigo-100 via-white to-purple-100 min-h-screen">

      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold">
          AI-Based Cephalometric Correlation Analysis
        </h1>
        <p className="text-gray-600">
          Relationship between airway width and craniofacial parameters
        </p>
      </div>

      {/* DB / EXCEL */}
      <div className="flex gap-4">
        <button
          onClick={()=>setTab("db")}
          className={`px-4 py-2 rounded ${
            tab==="db" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Database
        </button>

        <button
          onClick={()=>setTab("excel")}
          className={`px-4 py-2 rounded ${
            tab==="excel" ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
        >
          Excel
        </button>
      </div>

      {/* CORRELATION CARDS */}
      <div className="grid md:grid-cols-4 gap-4">
        {metrics.map(k=>{
          const r = correlation(getPairs(k));

          return (
            <motion.div
              key={k}
              whileHover={{ scale:1.05 }}
              className="bg-white p-4 rounded-xl shadow text-center"
            >
              <p>{k}</p>
              <h2 className="text-xl font-bold text-indigo-600">
                {r.toFixed(3)}
              </h2>
              <p>{interpret(r)}</p>
            </motion.div>
          );
        })}
      </div>

      {/* SCATTER PLOTS */}
      <div className="grid md:grid-cols-2 gap-6">

        {metrics.map(key => {

          const pairs = getPairs(key);
          const r = correlation(pairs);
          const { slope, intercept } = regression(pairs);

          const minX = pairs[0]?.x;
          const maxX = pairs[pairs.length-1]?.x;

          const line = Array.from({length:20},(_,i)=>{
            const x = minX+(i/19)*(maxX-minX);
            return {x,y:slope*x+intercept};
          });

          return (
            <motion.div
              key={key}
              whileHover={{ scale:1.03 }}
              className="bg-white p-4 rounded-xl shadow-lg"
            >

              <h3 className="font-semibold mb-1">
                {key} vs Airway
              </h3>

              <p className="text-sm text-gray-600">
                r = {r.toFixed(3)} → {interpret(r)}
              </p>

              <p className="text-xs text-gray-500">
                Regression: y = {slope.toFixed(2)}x + {intercept.toFixed(2)}
              </p>

              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3"/>

                  {/* ✅ FIXED AXIS */}
                  <XAxis
                    type="number"
                    dataKey="x"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(v)=>v.toFixed(1)}
                  />

                  <YAxis
                    type="number"
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />

                  <Tooltip/>

                  <Scatter data={pairs} fill="#3b82f6"/>

                  <Line
                    data={line}
                    dataKey="y"
                    stroke="red"
                    dot={false}
                  />
                </ScatterChart>
              </ResponsiveContainer>

            </motion.div>
          );
        })}

      </div>

      {/* RADAR */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-2">
          Feature Influence Radar
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Shows correlation strength of parameters with airway width.
        </p>

        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={metrics.map(k=>{
            const r = correlation(getPairs(k));
            return {metric:k,value:Math.abs(r)};
          })}>
            <PolarGrid/>
            <PolarAngleAxis dataKey="metric"/>
            <PolarRadiusAxis domain={[0,1]}/>
            <Radar dataKey="value" fill="#6366f1" fillOpacity={0.6}/>
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* TABLES */}
      <div className="space-y-6">

        {metrics.map(key => {

          const groups = {};

          data.forEach(d => {
            const cls = d.skeletal_class || "Unknown";
            const div = d.divergence_status || "Unknown";

            if (!groups[cls]) groups[cls] = {};
            if (!groups[cls][div]) groups[cls][div] = [];

            const val = getAngle(d,key);

            if (val !== null && !isNaN(val)) {
              groups[cls][div].push(val);
            }
          });

          return (
            <div key={key} className="bg-white p-5 rounded-xl shadow">

              <h3 className="font-semibold mb-4">{key} Analysis</h3>

              {Object.keys(groups).map(cls => (
                <div key={cls} className="mb-4">

                  <h4 className="font-medium">{cls}</h4>

                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {Object.entries(groups[cls]).map(([div,vals]) => {

                      const avg = vals.length
                        ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2)
                        : "0";

                      return (
                        <motion.div
                          key={div}
                          whileHover={{ scale:1.05 }}
                          className="bg-gray-100 p-3 rounded text-center"
                        >
                          <p>{div}</p>
                          <p className="font-bold text-indigo-600">{avg}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                </div>
              ))}

            </div>
          );
        })}

      </div>

    </div>
  );
}