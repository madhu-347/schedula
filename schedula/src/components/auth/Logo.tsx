import React from "react";

export const LogoComponent: React.FC<{ imageUrl: string }> = ({ imageUrl }) => (
  <div
    style={{
      margin: "0 auto 32px auto",
      background: "#F4F4F4",
      width: 120,
      height: 80,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 20,
    }}
  >
    <img
      src={imageUrl}
      alt="Logo"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        borderRadius: 20,
      }}
    />
  </div>
);
