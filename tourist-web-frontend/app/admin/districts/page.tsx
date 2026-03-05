"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface District {
  id: string;
  name: string;
  state: string;
  amount: number;
  placeCount: number;
}

const AdminDistricts = () => {
  const router = useRouter();
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getAdminToken = () => sessionStorage.getItem("adminToken") ?? "";

  const fetchDistricts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}districts/all`);
      const data = await res.json();
      if (data?.statusCode === 200) {
        setDistricts(data.data ?? []);
      } else {
        setError("Failed to load districts.");
      }
    } catch {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}districts/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-token": getAdminToken() },
      });
      const data = await res.json();
      if (data?.statusCode === 200) {
        setDistricts((prev) => prev.filter((d) => d.id !== id));
      } else {
        alert(data?.message || "Failed to delete district.");
      }
    } catch {
      alert("Failed to delete district.");
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
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Districts</h1>
          <p style={{ fontSize: "13px", color: "#888", margin: "4px 0 0" }}>
            {districts.length} district{districts.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/districts/new")}
          style={{ background: "#8E170D", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
        >
          + Add District
        </button>
      </div>

      {loading && <p style={{ color: "#888", fontSize: "14px" }}>Loading districts...</p>}
      {error && <p style={{ color: "#C80000", fontSize: "14px" }}>{error}</p>}

      {!loading && !error && districts.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "12px", border: "1px solid #eee" }}>
          <p style={{ color: "#888", fontSize: "15px", marginBottom: "16px" }}>No districts yet.</p>
          <button onClick={() => router.push("/admin/districts/new")}
            style={{ background: "#8E170D", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "14px", cursor: "pointer" }}>
            Add your first district
          </button>
        </div>
      )}

      {!loading && districts.length > 0 && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>State</th>
                <th style={thStyle}>Places</th>
                <th style={thStyle}>Price</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {districts.map((d) => (
                <tr key={d.id}>
                  <td style={cellStyle}><span style={{ fontWeight: 500 }}>{d.name}</span></td>
                  <td style={{ ...cellStyle, color: "#666" }}>{d.state}</td>
                  <td style={{ ...cellStyle, color: "#666" }}>{d.placeCount}</td>
                  <td style={cellStyle}>₹{d.amount}</td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button onClick={() => router.push(`/admin/districts/edit/${d.id}`)}
                        style={{ background: "#f0f0f0", border: "none", borderRadius: "6px", padding: "6px 14px", fontSize: "12px", cursor: "pointer", fontWeight: 500 }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(d.id, d.name)} disabled={deletingId === d.id}
                        style={{ background: "#fee2e2", color: "#C80000", border: "none", borderRadius: "6px", padding: "6px 14px", fontSize: "12px", cursor: deletingId === d.id ? "default" : "pointer", fontWeight: 500, opacity: deletingId === d.id ? 0.6 : 1 }}>
                        {deletingId === d.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDistricts;
