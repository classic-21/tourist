"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface AudioEntry {
  language: string;
  s3Key: string;
}

const AdminEditScenic = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [form, setForm] = useState({
    placeID: "",
    name: "",
    descEn: "",
    descHi: "",
    imageUrl: "",
    order: "0",
  });
  const [audios, setAudios] = useState<AudioEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio upload state
  const [uploadLang, setUploadLang] = useState("english");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  const getAdminToken = () => sessionStorage.getItem("adminToken") ?? "";
  const getToken = () => localStorage.getItem("authToken") ?? "";

  useEffect(() => {
    const fetchScenic = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}scenics/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        const scenic = data?.data;
        if (scenic) {
          setForm({
            placeID: scenic.placeID ?? "",
            name: scenic.name ?? "",
            descEn: scenic.description?.en ?? "",
            descHi: scenic.description?.hi ?? "",
            imageUrl: scenic.imageUrl ?? "",
            order: String(scenic.order ?? "0"),
          });
          setAudios(scenic.audios ?? []);
        } else {
          setError("Scenic not found.");
        }
      } catch {
        setError("Failed to load scenic.");
      } finally {
        setLoading(false);
      }
    };
    fetchScenic();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}scenics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": getAdminToken() },
        body: JSON.stringify({
          placeID: form.placeID,
          name: form.name,
          description: { en: form.descEn, hi: form.descHi },
          imageUrl: form.imageUrl,
          order: Number(form.order),
          audios,
        }),
      });
      const data = await res.json();
      if (data?.statusCode === 200) {
        router.push("/admin/scenics");
      } else {
        setError(data?.message || "Failed to update scenic.");
      }
    } catch {
      setError("Failed to connect to server.");
    } finally {
      setSaving(false);
    }
  };

  const handleAudioUpload = async () => {
    if (!uploadFile || uploading) return;
    setUploading(true);
    setUploadMsg(null);

    try {
      // Get presigned upload URL from backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}scenics/${id}/audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": getAdminToken() },
        body: JSON.stringify({ language: uploadLang, fileName: uploadFile.name }),
      });
      const data = await res.json();

      if (!data?.data?.uploadUrl) {
        // Dev mode — no S3, but s3Key was saved
        setUploadMsg("Dev mode: S3 not configured. Audio key saved to scenic.");
        // Refresh audios list
        const updated = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}scenics/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }).then((r) => r.json());
        setAudios(updated?.data?.audios ?? []);
        setUploading(false);
        return;
      }

      // Upload to S3 directly
      const uploadRes = await fetch(data.data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "audio/mpeg" },
        body: uploadFile,
      });

      if (uploadRes.ok) {
        setUploadMsg(`Audio uploaded for ${uploadLang}!`);
        // Refresh audios
        const updated = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}scenics/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }).then((r) => r.json());
        setAudios(updated?.data?.audios ?? []);
      } else {
        setUploadMsg("Upload to S3 failed. Please try again.");
      }
    } catch {
      setUploadMsg("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "13px", color: "#555", marginBottom: "6px", fontWeight: 500 };

  if (loading) return <p style={{ color: "#888", padding: "24px" }}>Loading...</p>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}>←</button>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Edit Scenic</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", padding: "24px", maxWidth: "600px", marginBottom: "24px" }}>
        {error && <p style={{ color: "#C80000", fontSize: "13px", marginBottom: "16px" }}>{error}</p>}

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Scenic Name</label>
          <input style={inputStyle} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Order (stop sequence)</label>
          <input style={inputStyle} type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))} min={0} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Image (S3 key)</label>
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

        <button type="submit" disabled={saving}
          style={{ background: "#8E170D", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 24px", fontSize: "14px", fontWeight: 600, cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Audio Upload Section */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eee", padding: "24px", maxWidth: "600px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>Audio Files</h2>

        {/* Current audios */}
        {audios.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "13px", color: "#555", marginBottom: "8px", fontWeight: 500 }}>Uploaded audio:</p>
            {audios.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "#f9f9f9", borderRadius: "6px", marginBottom: "6px", fontSize: "13px" }}>
                <span style={{ fontWeight: 500, textTransform: "capitalize" }}>{a.language}</span>
                <span style={{ color: "#888", fontSize: "11px", flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{a.s3Key}</span>
              </div>
            ))}
          </div>
        )}

        {/* Upload new audio */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={labelStyle}>Language</label>
            <select
              style={{ ...inputStyle, width: "auto" }}
              value={uploadLang}
              onChange={(e) => setUploadLang(e.target.value)}
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Audio File (MP3)</label>
            <input
              type="file"
              accept="audio/mpeg,audio/mp3"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              style={{ fontSize: "13px" }}
            />
          </div>

          {uploadMsg && (
            <p style={{ fontSize: "13px", color: uploadMsg.includes("failed") ? "#C80000" : "#16a34a" }}>
              {uploadMsg}
            </p>
          )}

          <button
            onClick={handleAudioUpload}
            disabled={uploading || !uploadFile}
            style={{ background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: 600, cursor: uploading || !uploadFile ? "default" : "pointer", opacity: uploading || !uploadFile ? 0.6 : 1, width: "fit-content" }}
          >
            {uploading ? "Uploading..." : "Upload Audio"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEditScenic;
