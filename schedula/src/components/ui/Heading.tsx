import React from "react";

export const HeadingComponent: React.FC<{ text: string }> = ({ text }) => (
  <h2 className="text-center font-bold text-3xl mb-2.5">{text}</h2>
);
