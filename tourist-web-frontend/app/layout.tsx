"use client";
import React, { ReactNode, useEffect } from "react";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import { usePathname, useRouter } from "next/navigation";

interface HomeLayoutProps {
  children: ReactNode;
}

const publicPaths = ["/", "/sign-in", "/sign-up"];
// Admin paths manage their own auth (admin token, not JWT)
const adminPathPrefix = "/admin";

const HomeLayout = ({ children }: HomeLayoutProps) => {
  const pathName = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Admin section manages its own auth — skip JWT redirect
    if (pathName.startsWith(adminPathPrefix)) return;

    const token = localStorage.getItem("authToken");

    if (!token) {
      if (!publicPaths.includes(pathName)) {
        router.replace("/sign-in");
      }
    } else {
      if (publicPaths.includes(pathName)) {
        router.replace("/discover");
      }
    }
  }, [pathName, router]);

  return (
    <html lang="en">
      <body>
        <ToastContainer />
        {children}
      </body>
    </html>
  );
};

export default HomeLayout;
