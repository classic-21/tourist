"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const AdminLogin = () => {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!token.trim()) {
      setError("Please enter the admin token.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Verify the admin token by calling a protected endpoint
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}tours/all`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": token.trim(),
          },
        }
      );

      if (res.ok) {
        sessionStorage.setItem("adminToken", token.trim());
        router.replace("/admin/tours");
      } else {
        setError("Invalid admin token. Please try again.");
      }
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f8f9fa",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "40px 32px",
        width: "100%",
        maxWidth: "380px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "6px" }}>Admin Login</h1>
        <p style={{ fontSize: "13px", color: "#666", marginBottom: "24px" }}>
          Indian Narrated — Tour Management
        </p>

        {error && (
          <p style={{ color: "#C80000", fontSize: "13px", marginBottom: "12px" }}>{error}</p>
        )}

        <label style={{ display: "block", fontSize: "13px", color: "#555", marginBottom: "6px" }}>
          Admin Token
        </label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="Enter admin token"
          style={{
            width: "100%",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "10px 12px",
            fontSize: "14px",
            marginBottom: "16px",
            boxSizing: "border-box",
            outline: "none",
          }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            background: "#8E170D",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "12px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Verifying..." : "Login"}
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
