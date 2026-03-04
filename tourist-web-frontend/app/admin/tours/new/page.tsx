"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const NewTour = () => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    place: "",
    mappingID: "",
    amount: "",
    descriptionEnglish: "",
    descriptionHindi: "",
  });

  const getAdminToken = () => sessionStorage.getItem("adminToken") ?? "";

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.place.trim() || !form.mappingID || !form.amount) {
      setError("Name, place, mapping ID, and amount are required.");
      return;
    }

    const description: Record<string, string> = {};
    if (form.descriptionEnglish.trim()) description.english = form.descriptionEnglish.trim();
    if (form.descriptionHindi.trim()) description.hindi = form.descriptionHindi.trim();

    if (Object.keys(description).length === 0) {
      setError("At least one description (English or Hindi) is required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}tours/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": getAdminToken(),
        },
        body: JSON.stringify({
          name: form.name.trim(),
          place: form.place.trim(),
          mappingID: Number(form.mappingID),
          amount: Number(form.amount),
          description,
        }),
      });

      const data = await res.json();
      if (data?.statusCode === 200) {
        router.push("/admin/tours");
      } else {
        setError(data?.message || "Failed to create tour.");
      }
    } catch {
      setError("Failed to connect to server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#444" }}
          aria-label="Back"
        >
          ←
        </button>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Add New Tour</h1>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", padding: "28px", border: "1px solid #eee" }}>
        {error && (
          <p style={{ color: "#C80000", fontSize: "13px", marginBottom: "16px", background: "#fee2e2", padding: "10px 14px", borderRadius: "8px" }}>
            {error}
          </p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <FormField label="Tour Name *" value={form.name} onChange={(v) => handleChange("name", v)} placeholder="e.g. Agra Fort" />
          <FormField label="Place *" value={form.place} onChange={(v) => handleChange("place", v)} placeholder="e.g. Agra, Uttar Pradesh" />
          <FormField label="Mapping ID *" value={form.mappingID} onChange={(v) => handleChange("mappingID", v)} placeholder="Numeric ID for S3 folder" type="number" />
          <FormField label="Price (₹) *" value={form.amount} onChange={(v) => handleChange("amount", v)} placeholder="e.g. 399" type="number" />
        </div>

        <div style={{ marginTop: "16px" }}>
          <TextAreaField
            label="Description (English)"
            value={form.descriptionEnglish}
            onChange={(v) => handleChange("descriptionEnglish", v)}
            placeholder="Tour description in English..."
          />
        </div>
        <div style={{ marginTop: "16px" }}>
          <TextAreaField
            label="Description (Hindi)"
            value={form.descriptionHindi}
            onChange={(v) => handleChange("descriptionHindi", v)}
            placeholder="Tour description in Hindi..."
          />
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button
            onClick={() => router.back()}
            style={{
              flex: 1,
              background: "#f0f0f0",
              border: "none",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "14px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              flex: 2,
              background: "#8E170D",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: saving ? "default" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Creating..." : "Create Tour"}
          </button>
        </div>
      </div>
    </div>
  );
};

const FormField = ({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) => (
  <div>
    <label style={{ display: "block", fontSize: "13px", color: "#555", fontWeight: 500, marginBottom: "6px" }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "10px 12px",
        fontSize: "14px",
        boxSizing: "border-box",
        outline: "none",
      }}
    />
  </div>
);

const TextAreaField = ({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) => (
  <div>
    <label style={{ display: "block", fontSize: "13px", color: "#555", fontWeight: 500, marginBottom: "6px" }}>{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      style={{
        width: "100%",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "10px 12px",
        fontSize: "14px",
        resize: "vertical",
        boxSizing: "border-box",
        outline: "none",
        fontFamily: "inherit",
      }}
    />
  </div>
);

export default NewTour;
