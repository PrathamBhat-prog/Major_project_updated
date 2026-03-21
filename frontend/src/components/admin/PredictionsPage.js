import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function PredictionsPage() {
  const { getAuthHeaders } = useContext(AuthContext);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/admin/predictions", {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div>
      <h2 className="text-xl mb-4">Predictions</h2>
      {data.map(p => (
        <div key={p.id} className="p-3 border mb-2 rounded">
          {p.model_name}
        </div>
      ))}
    </div>
  );
}