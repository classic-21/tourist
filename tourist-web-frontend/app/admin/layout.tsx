"use client";
import React, { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
}

const AdminLayout = ({ children }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Admin login page itself doesn't need a token check
    if (pathname === "/admin/login") {
      setAuthorized(true);
      return;
    }
    const adminToken = sessionStorage.getItem("adminToken");
    if (!adminToken) {
      router.replace("/admin/login");
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  if (!authorized) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Admin nav bar */}
      {pathname !== "/admin/login" && (
        <nav style={{
          background: "#1a1a1a",
          color: "#fff",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ fontWeight: 700, fontSize: "16px" }}>Indian Narrated — Admin</span>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <a href="/admin/districts" style={{ color: "#ccc", textDecoration: "none", fontSize: "14px" }}>Districts</a>
            <a href="/admin/places" style={{ color: "#ccc", textDecoration: "none", fontSize: "14px" }}>Places</a>
            <a href="/admin/scenics" style={{ color: "#ccc", textDecoration: "none", fontSize: "14px" }}>Scenics</a>
            <a href="/admin/tours" style={{ color: "#888", textDecoration: "none", fontSize: "12px" }}>Tours (legacy)</a>
            <button
              onClick={() => {
                sessionStorage.removeItem("adminToken");
                router.replace("/admin/login");
              }}
              style={{
                background: "#C80000",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "6px 14px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </nav>
      )}
      <main style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
