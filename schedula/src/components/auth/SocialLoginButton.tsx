// eg: google sign-in button component
import React from "react";

interface SocialLoginButtonProps {
  onClick: () => void;
  text: string;
  iconUrl?: string;
}
export const SocialLoginButtonComponent: React.FC<SocialLoginButtonProps> = ({
  onClick,
  text,
  iconUrl,
}) => (
  <button
    onClick={onClick}
    style={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      padding: 18,
      borderRadius: 14,
      border: "1px solid #ddd",
      background: "#fff",
      fontSize: 18,
      fontWeight: 500,
      marginBottom: 12,
      cursor: "pointer",
    }}
  >
    {iconUrl && (
      <img src={iconUrl} alt="icon" style={{ width: 28, marginRight: 16 }} />
    )}
    {text}
  </button>
);
