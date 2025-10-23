import React from "react";

export const HeadingComponent: React.FC<{ text: string }> = ({ text }) => (
  <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 10 }}>{text}</h2>
);
