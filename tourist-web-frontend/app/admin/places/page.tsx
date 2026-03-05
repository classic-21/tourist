"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Place {
  id: string;
  name: string;
  districtID: string;
  order: number;
  amount: number;
}

interface District {
  id: string;
  name: string;
}

const AdminPlaces = () => {
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getAdminToken = () => sessionStorage.getItem("adminToken") ?? "";
  const getToken = () => localStorage.getItem("authToken") ?? "";

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}districts/all`);
        const data = await res.json();
        setDistricts(data?.data ?? []);
        if (data?.data?.length > 0) {
          setSelectedDistrict(data.data[0].id);
        }
      } catch {
        setError("Failed to load districts.");
      }
    };
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (!selectedDistrict) return;
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}places/district/${selectedDistrict}`,
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        const data = await res.json();
        setPlaces(data?.data ?? []);
      } catch {
        setError("Failed to load places.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, [selectedDistrict]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}places/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-token": getAdminToken() },
      });
      const data = await res.json();
      if (data?.statusCode === 200) {
        setPlaces((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(data?.message || "Failed to delete.");
      }
    } catch {
      alert("Failed to delete.");
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
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Places</h1>
          <p style={{ fontSize: "13px", color: "#888", margin: "4px 0 0" }}>{places.length} place{places.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => router.push("/admin/places/new")}
          style={{ background: "#8E170D", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
        >
          + Add Place
        </button>
      </div>

      {/* District filter */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ fontSize: "13px", color: "#555", marginRight: "8px" }}>Filter by district:</label>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px" }}
        >
          {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {loading && <p style={{ color: "#888", fontSize: "14px" }}>Loading places...</p>}
      {error && <p style={{ color: "#C80000", fontSize: "14px" }}>{error}</p>}

      {!loading && places.length > 0 && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Order</th>
                <th style={thStyle}>Price</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {places.map((p) => (
                <tr key={p.id}>
                  <td style={cellStyle}><span style={{ fontWeight: 500 }}>{p.name}</span></td>
                  <td style={{ ...cellStyle, color: "#666" }}>{p.order}</td>
                  <td style={cellStyle}>₹{p.amount}</td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button onClick={() => router.push(`/admin/places/edit/${p.id}`)}
                        style={{ background: "#f0f0f0", border: "none", borderRadius: "6px", padding: "6px 14px", fontSize: "12px", cursor: "pointer", fontWeight: 500 }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p.id, p.name)} disabled={deletingId === p.id}
                        style={{ background: "#fee2e2", color: "#C80000", border: "none", borderRadius: "6px", padding: "6px 14px", fontSize: "12px", cursor: deletingId === p.id ? "default" : "pointer", fontWeight: 500, opacity: deletingId === p.id ? 0.6 : 1 }}>
                        {deletingId === p.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && places.length === 0 && !error && (
        <p style={{ color: "#888", fontSize: "14px", textAlign: "center", padding: "40px 0" }}>No places for this district.</p>
      )}
    </div>
  );
};

export default AdminPlaces;
