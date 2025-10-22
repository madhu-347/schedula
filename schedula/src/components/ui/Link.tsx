import React from "react";

interface LinkComponentProps {
  text: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export const LinkComponent: React.FC<LinkComponentProps> = ({
  text,
  onClick,
  style,
}) => (
  <span
    onClick={onClick}
    style={{ color: "#E2697B", fontWeight: 500, cursor: "pointer", ...style }}
  >
    {text}
  </span>
);
