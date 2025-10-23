import React from "react";

interface CheckboxProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}
export const CheckboxComponent: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
}) => (
  <label
    style={{
      display: "flex",
      alignItems: "center",
      fontWeight: 600,
      color: "#8E99A7",
    }}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{ marginRight: 10 }}
    />
    {label}
  </label>
);
