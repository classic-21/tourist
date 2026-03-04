"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Tour {
  id: string;
  name: string;
  place: string;
  amount: number;
  mappingID: number;
  description: any;
}

const AdminTours = () => {
  const router = useRouter();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getAdminToken = () => sessionStorage.getItem("adminToken") ?? "";

  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}tours/all`);
      const data = await res.json();
      if (data?.statusCode === 200) {
        setTours(data.data ?? []);
      } else {
        setError("Failed to load tours.");
      }
    } catch {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This action is irreversible.`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}tours/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": getAdminToken(),
          },
        }
      );
      const data = await res.json();
      if (data?.statusCode === 200) {
        setTours((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert(data?.message || "Failed to delete tour.");
      }
    } catch {
      alert("Failed to delete tour.");
    } finally {
      setDeletingId(null);
    }
  };

  const cellStyle: React.CSSProperties = {
    padding: "12px 16px",
    fontSize: "13px",
    borderBottom: "1px solid #eee",
    verticalAlign: "middle",
  };

  const thStyle: React.CSSProperties = {
    ...cellStyle,
    background: "#f5f5f5",
    fontWeight: 600,
    color: "#444",
    textAlign: "left",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Tours</h1>
          <p style={{ fontSize: "13px", color: "#888", margin: "4px 0 0" }}>
            {tours.length} tour{tours.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/tours/new")}
          style={{
            background: "#8E170D",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + Add Tour
        </button>
      </div>

      {loading && <p style={{ color: "#888", fontSize: "14px" }}>Loading tours...</p>}
      {error && <p style={{ color: "#C80000", fontSize: "14px" }}>{error}</p>}

      {!loading && !error && tours.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #eee",
        }}>
          <p style={{ color: "#888", fontSize: "15px", marginBottom: "16px" }}>No tours yet.</p>
          <button
            onClick={() => router.push("/admin/tours/new")}
            style={{
              background: "#8E170D",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Add your first tour
          </button>
        </div>
      )}

      {!loading && tours.length > 0 && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Place</th>
                <th style={thStyle}>Mapping ID</th>
                <th style={thStyle}>Price</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tours.map((tour) => (
                <tr key={tour.id} style={{ transition: "background 0.1s" }}>
                  <td style={cellStyle}>
                    <span style={{ fontWeight: 500 }}>{tour.name}</span>
                  </td>
                  <td style={{ ...cellStyle, color: "#666" }}>{tour.place}</td>
                  <td style={{ ...cellStyle, color: "#666" }}>{tour.mappingID}</td>
                  <td style={cellStyle}>₹{tour.amount}</td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button
                        onClick={() => router.push(`/admin/tours/edit/${tour.id}`)}
                        style={{
                          background: "#f0f0f0",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 14px",
                          fontSize: "12px",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tour.id, tour.name)}
                        disabled={deletingId === tour.id}
                        style={{
                          background: "#fee2e2",
                          color: "#C80000",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 14px",
                          fontSize: "12px",
                          cursor: deletingId === tour.id ? "default" : "pointer",
                          fontWeight: 500,
                          opacity: deletingId === tour.id ? 0.6 : 1,
                        }}
                      >
                        {deletingId === tour.id ? "Deleting..." : "Delete"}
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

export default AdminTours;
