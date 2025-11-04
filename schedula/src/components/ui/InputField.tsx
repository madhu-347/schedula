"use client";

import React from "react";

// Define base props. Make placeholder optional.
interface BaseProps {
  placeholder?: string; // Make optional
  className?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
}

// Input props: extend standard HTMLInputAttributes
type InputProps = BaseProps &
  React.InputHTMLAttributes<HTMLInputElement> & {
    type: "text" | "email" | "password" | "tel" | "file" | "date" | "time" | "number";
    rows?: never; // Ensure rows is not passed to input
  };

// Textarea props: extend standard HTMLTextareaAttributes
type TextareaProps = BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    type: "textarea";
    // 'rows' is already included in TextareaHTMLAttributes
  };

// Union type for the component
type InputFieldProps = InputProps | TextareaProps;

export const InputFieldComponent: React.FC<InputFieldProps> = ({
  type,
  className = "",
  ...props // All other props (value, onChange, rows, multiple, etc.)
}) => {
  const baseStyles =
    "w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 placeholder-gray-500";

  // Render textarea
  if (type === "textarea") {
    return (
      <textarea
        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} // Pass all props
        className={`${baseStyles} ${className}`}
        style={{ fontSize: 16 }}
      />
    );
  }

  // Render all other input types
  return (
    <input
      type={type}
      {...(props as React.InputHTMLAttributes<HTMLInputElement>)} // Pass all props
      className={`${baseStyles} ${className}`}
      style={{ fontSize: 16 }}
    />
  );
};

InputFieldComponent.displayName = "InputFieldComponent";