import React from "react";

interface FooterProps {
  question: string;
  linkText: string;
  onLinkClick: () => void;
}
export const FormFooterComponent: React.FC<FooterProps> = ({
  question,
  linkText,
  onLinkClick,
}) => (
  <div
    style={{
      textAlign: "center",
      color: "#8E99A7",
      fontWeight: 400,
      marginTop: 36,
    }}
  >
    {question}
    <span
      style={{
        color: "#5EB3E0",
        fontWeight: 500,
        marginLeft: 8,
        cursor: "pointer",
      }}
      onClick={onLinkClick}
      className="text-blue-300"
    >
      {linkText}
    </span>
  </div>
);
