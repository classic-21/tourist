"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface District {
  id: string;
  name: string;
}

interface Place {
  id: string;
  name: string;
}

const AdminNewScenic = () => {
  const router = useRouter();
  const [districts, setDistricts] = useState<District[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [form, setForm] = useState({
    placeID: "",
    name: "",
    descEn: "",
    descHi: "",
    imageUrl: "",
    order: "0",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (list.length > 0) setForm((f) => ({ ...f, placeID: list[0].id }));
    };
    fetchPlaces();
  }, [selectedDistrict]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.placeID || !form.name) {
      setError("Place and name are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}scenics`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": getAdminToken() },
        body: JSON.stringify({
          placeID: form.placeID,
          name: form.name,
          description: { en: form.descEn, hi: form.descHi },
          imageUrl: form.imageUrl,
          order: Number(form.order),
          audios: [],
        }),
      });
      const data = await res.json();
      if (data?.statusCode === 201) {
        router.push("/admin/scenics");
      } else {
        setError(data?.message || "Failed to create scenic.");
      }
    } catch {
      setError("Failed to connect to server.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "13px", color: "#555", marginBottom: "6px", fontWeight: 500 };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}>←</button>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>New Scenic Stop</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", padding: "24px", maxWidth: "600px" }}>
        {error && <p style={{ color: "#C80000", fontSize: "13px", marginBottom: "16px" }}>{error}</p>}

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>District</label>
          <select style={inputStyle} value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
            {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Place *</label>
          <select style={inputStyle} value={form.placeID} onChange={(e) => setForm((f) => ({ ...f, placeID: e.target.value }))} required>
            {places.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Scenic Name *</label>
          <input style={inputStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Entry Gate & First View" required />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Order (stop sequence)</label>
          <input style={inputStyle} type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))} min={0} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Image (S3 key)</label>
          <input style={inputStyle} value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="scenics/taj-mahal/entry-gate.jpg" />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Description (English)</label>
          <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" } as React.CSSProperties} value={form.descEn} onChange={(e) => setForm((f) => ({ ...f, descEn: e.target.value }))} />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={labelStyle}>Description (Hindi)</label>
          <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" } as React.CSSProperties} value={form.descHi} onChange={(e) => setForm((f) => ({ ...f, descHi: e.target.value }))} />
        </div>

        <p style={{ fontSize: "12px", color: "#888", marginBottom: "16px" }}>
          After creating the scenic, go to Edit to upload audio files.
        </p>

        <button type="submit" disabled={saving}
          style={{ background: "#8E170D", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 24px", fontSize: "14px", fontWeight: 600, cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Creating..." : "Create Scenic"}
        </button>
      </form>
    </div>
  );
};

export default AdminNewScenic;
