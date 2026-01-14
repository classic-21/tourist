"use client";

import BottomNavbar from "@/components/bottomNavbar/bottomNavbar";
import React, { useEffect, useState } from "react";

const PostLoginLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    if (authToken) {
      setToken(authToken);
    }
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {children}
      {token ? <BottomNavbar /> : <></>}
    </div>
  );
};

export default PostLoginLayout;
