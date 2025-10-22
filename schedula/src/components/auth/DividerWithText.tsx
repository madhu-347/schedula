import React from "react";

interface DividerWithTextProps {
  text: string;
}

export const DividerWithText: React.FC<DividerWithTextProps> = ({ text }) => (
  <div className="flex items-center my-6 text-muted-foreground font-medium">
    <div className="flex-1 h-px bg-border"></div>
    <div className="mx-4">{text}</div>
    <div className="flex-1 h-px bg-border"></div>
  </div>
);
