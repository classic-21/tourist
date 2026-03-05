"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const AdminEditDistrict = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [form, setForm] = useState({
    name: "",
    descEn: "",
    descHi: "",
    imageUrl: "",
    amount: "",
    state: "Uttar Pradesh",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAdminToken = () => sessionStorage.getItem("adminToken") ?? "";

  useEffect(() => {
    const fetchDistrict = async () => {
      try {
        // Use all endpoint to find the district (public)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}districts/all`);
        const data = await res.json();
        const district = (data?.data ?? []).find((d: any) => d.id === id);
        if (district) {
          setForm({
            name: district.name ?? "",
            descEn: district.description?.en ?? "",
            descHi: district.description?.hi ?? "",
            imageUrl: district.imageUrl ?? "",
            amount: String(district.amount ?? ""),
            state: district.state ?? "Uttar Pradesh",
          });
        } else {
          setError("District not found.");
        }
      } catch {
        setError("Failed to load district.");
      } finally {
        setLoading(false);
      }
    };
    fetchDistrict();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}districts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": getAdminToken() },
        body: JSON.stringify({
          name: form.name,
          description: { en: form.descEn, hi: form.descHi },
          imageUrl: form.imageUrl,
          amount: Number(form.amount),
          state: form.state,
        }),
      });
      const data = await res.json();
      if (data?.statusCode === 200) {
        router.push("/admin/districts");
      } else {
        setError(data?.message || "Failed to update district.");
      }
    } catch {
      setError("Failed to connect to server.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd",
    fontSize: "14px", outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "13px", color: "#555", marginBottom: "6px", fontWeight: 500 };

  if (loading) return <p style={{ color: "#888", padding: "24px" }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}>←</button>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Edit District</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", padding: "24px", maxWidth: "600px" }}>
        {error && <p style={{ color: "#C80000", fontSize: "13px", marginBottom: "16px" }}>{error}</p>}

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>District Name</label>
          <input style={inputStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>State</label>
          <input style={inputStyle} value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Price (₹)</label>
          <input style={inputStyle} type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} min={0} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Cover Image (S3 key)</label>
          <input style={inputStyle} value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Description (English)</label>
          <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" } as React.CSSProperties} value={form.descEn} onChange={(e) => setForm((f) => ({ ...f, descEn: e.target.value }))} />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={labelStyle}>Description (Hindi)</label>
          <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" } as React.CSSProperties} value={form.descHi} onChange={(e) => setForm((f) => ({ ...f, descHi: e.target.value }))} />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{ background: "#8E170D", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 24px", fontSize: "14px", fontWeight: 600, cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1 }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default AdminEditDistrict;
