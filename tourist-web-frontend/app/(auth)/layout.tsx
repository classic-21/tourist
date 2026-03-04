import React from "react";

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      {children}
    </div>
  );
};

export default AuthLayout;
