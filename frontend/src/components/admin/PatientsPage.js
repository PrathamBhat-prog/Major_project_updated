import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function PatientsPage() {
  const { getAuthHeaders } = useContext(AuthContext);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/admin/patients", {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(setPatients);
  }, []);

  return (
    <div>
      <h2 className="text-xl mb-4">All Patients</h2>
      {patients.map(p => (
        <div key={p.id} className="p-3 border mb-2 rounded">
          {p.name}
        </div>
      ))}
    </div>
  );
}