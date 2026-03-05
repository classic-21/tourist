"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Scenic {
  id: string;
  name: string;
  placeID: string;
  order: number;
  languages: string[];
}

interface District {
  id: string;
  name: string;
}

interface Place {
  id: string;
  name: string;
  districtID: string;
}

const AdminScenics = () => {
  const router = useRouter();
  const [districts, setDistricts] = useState<District[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [scenics, setScenics] = useState<Scenic[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedPlace, setSelectedPlace] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getAdminToken = () => sessionStorage.getItem("adminToken") ?? "";
  const getToken = () => localStorage.getItem("authToken") ?? "";

  useEffect(() => {
    const fetchDistricts = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}districts/all`);
      const data = await res.json();
      const list = data?.data ?? [];
      setDistricts(list);
      if (list.length > 0) setSelectedDistrict(list[0].id);
    };
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (!selectedDistrict) return;
    const fetchPlaces = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}places/district/${selectedDistrict}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      const list = data?.data ?? [];
      setPlaces(list);
      setSelectedPlace(list.length > 0 ? list[0].id : "");
    };
    fetchPlaces();
  }, [selectedDistrict]);

  useEffect(() => {
    if (!selectedPlace) return;
    const fetchScenics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}scenics/place/${selectedPlace}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        setScenics(data?.data ?? []);
      } finally {
        setLoading(false);
      }
    };
    fetchScenics();
  }, [selectedPlace]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}scenics/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-token": getAdminToken() },
      });
      const data = await res.json();
      if (data?.statusCode === 200) {
        setScenics((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert(data?.message || "Failed to delete.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const cellStyle: React.CSSProperties = { padding: "12px 16px", fontSize: "13px", borderBottom: "1px solid #eee", verticalAlign: "middle" };
  const thStyle: React.CSSProperties = { ...cellStyle, background: "#f5f5f5", fontWeight: 600, color: "#444", textAlign: "left" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Scenics</h1>
          <p style={{ fontSize: "13px", color: "#888", margin: "4px 0 0" }}>{scenics.length} scenic stop{scenics.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => router.push("/admin/scenics/new")}
          style={{ background: "#8E170D", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
          + Add Scenic
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div>
          <label style={{ fontSize: "13px", color: "#555", marginRight: "8px" }}>District:</label>
          <select style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px" }}
            value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: "13px", color: "#555", marginRight: "8px" }}>Place:</label>
          <select style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px" }}
            value={selectedPlace} onChange={(e) => setSelectedPlace(e.target.value)}>
            {places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {loading && <p style={{ color: "#888", fontSize: "14px" }}>Loading scenics...</p>}

      {!loading && scenics.length > 0 && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Stop</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Languages</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scenics.map((s, idx) => (
                <tr key={s.id}>
                  <td style={{ ...cellStyle, color: "#888" }}>{idx + 1}</td>
                  <td style={cellStyle}><span style={{ fontWeight: 500 }}>{s.name}</span></td>
                  <td style={{ ...cellStyle, color: "#666" }}>
                    {s.languages?.join(", ") || "—"}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button onClick={() => router.push(`/admin/scenics/edit/${s.id}`)}
                        style={{ background: "#f0f0f0", border: "none", borderRadius: "6px", padding: "6px 14px", fontSize: "12px", cursor: "pointer", fontWeight: 500 }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(s.id, s.name)} disabled={deletingId === s.id}
                        style={{ background: "#fee2e2", color: "#C80000", border: "none", borderRadius: "6px", padding: "6px 14px", fontSize: "12px", cursor: deletingId === s.id ? "default" : "pointer", fontWeight: 500, opacity: deletingId === s.id ? 0.6 : 1 }}>
                        {deletingId === s.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && scenics.length === 0 && selectedPlace && (
        <p style={{ color: "#888", fontSize: "14px", textAlign: "center", padding: "40px 0" }}>No scenics for this place yet.</p>
      )}
    </div>
  );
};

export default AdminScenics;
