"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRoot() {
  const router = useRouter();
  useEffect(() => {
    const adminToken = sessionStorage.getItem("adminToken");
    router.replace(adminToken ? "/admin/tours" : "/admin/login");
  }, [router]);
  return null;
}
