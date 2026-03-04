"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface FormState {
  name: string;
  place: string;
  mappingID: string;
  amount: string;
  descriptionEnglish: string;
  descriptionHindi: string;
}

const EditTour = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { id } = params;

  const [form, setForm] = useState<FormState>({
    name: "",
    place: "",
    mappingID: "",
    amount: "",
    descriptionEnglish: "",
    descriptionHindi: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAdminToken = () => sessionStorage.getItem("adminToken") ?? "";

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}tours/all`);
        const data = await res.json();
        const tour = data?.data?.find((t: { id: string }) => t.id === id);
        if (tour) {
          const desc = typeof tour.description === "object" ? tour.description : {};
          setForm({
            name: tour.name ?? "",
            place: tour.place ?? "",
            mappingID: String(tour.mappingID ?? ""),
            amount: String(tour.amount ?? ""),
            descriptionEnglish: desc?.english ?? (typeof tour.description === "string" ? tour.description : ""),
            descriptionHindi: desc?.hindi ?? "",
          });
        } else {
          setError("Tour not found.");
        }
      } catch {
        setError("Failed to load tour.");
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.place.trim()) {
      setError("Name and place are required.");
      return;
    }

    const description: Record<string, string> = {};
    if (form.descriptionEnglish.trim()) description.english = form.descriptionEnglish.trim();
    if (form.descriptionHindi.trim()) description.hindi = form.descriptionHindi.trim();

    setSaving(true);
    setError(null);

    try {
      const updates: Record<string, any> = {
        name: form.name.trim(),
        place: form.place.trim(),
      };
      if (form.mappingID) updates.mappingID = Number(form.mappingID);
      if (form.amount) updates.amount = Number(form.amount);
      if (Object.keys(description).length > 0) updates.description = description;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}tours/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": getAdminToken(),
        },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (data?.statusCode === 200) {
        router.push("/admin/tours");
      } else {
        setError(data?.message || "Failed to update tour.");
      }
    } catch {
      setError("Failed to connect to server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ color: "#888", fontSize: "14px" }}>Loading tour...</p>;
  }

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
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Edit Tour</h1>
      </div>

      <div style={{ background: "#fff", borderRadius: "12px", padding: "28px", border: "1px solid #eee" }}>
        {error && (
          <p style={{ color: "#C80000", fontSize: "13px", marginBottom: "16px", background: "#fee2e2", padding: "10px 14px", borderRadius: "8px" }}>
            {error}
          </p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <FormField label="Tour Name *" value={form.name} onChange={(v) => handleChange("name", v)} />
          <FormField label="Place *" value={form.place} onChange={(v) => handleChange("place", v)} />
          <FormField label="Mapping ID" value={form.mappingID} onChange={(v) => handleChange("mappingID", v)} type="number" />
          <FormField label="Price (₹)" value={form.amount} onChange={(v) => handleChange("amount", v)} type="number" />
        </div>

        <div style={{ marginTop: "16px" }}>
          <TextAreaField
            label="Description (English)"
            value={form.descriptionEnglish}
            onChange={(v) => handleChange("descriptionEnglish", v)}
          />
        </div>
        <div style={{ marginTop: "16px" }}>
          <TextAreaField
            label="Description (Hindi)"
            value={form.descriptionHindi}
            onChange={(v) => handleChange("descriptionHindi", v)}
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
            {saving ? "Saving..." : "Save Changes"}
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

export default EditTour;
