import React from "react";

export const LogoComponent: React.FC = () => (
  <div
    style={{
      margin: "32px auto",
      background: "#F4F4F4",
      width: 200,
      height: 150,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 40,
    }}
  >
    <span style={{ fontWeight: 700, fontSize: 28 }}>Your Logo</span>
  </div>
);
