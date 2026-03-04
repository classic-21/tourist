"use client";

import BottomNavbar from "@/components/bottomNavbar/bottomNavbar";
import React, { useEffect, useState } from "react";

const PostLoginLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(!!localStorage.getItem("authToken"));
  }, []);

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        position: "relative",
        minHeight: "100vh",
      }}
    >
      {children}
      {hasToken && <BottomNavbar />}
    </div>
  );
};

export default PostLoginLayout;
