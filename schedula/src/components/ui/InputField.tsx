import React from "react";

interface InputFieldProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
}

export const InputFieldComponent: React.FC<InputFieldProps> = ({
  type,
  placeholder,
  value,
  onChange,
  className = "",
  required = false,
  disabled = false,
  name,
  id,
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    disabled={disabled}
    name={name}
    id={id}
    className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 placeholder-gray-500 ${className}`}
    style={{
      fontSize: 16,
    }}
  />
);
