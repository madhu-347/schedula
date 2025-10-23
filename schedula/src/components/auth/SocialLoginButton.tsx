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
    className="w-full flex items-center justify-center py-3 rounded-xl border border-gray-200 bg-white text-lg font-medium mb-3 cursor-pointer gap-3 shadow-sm hover:shadow-md transition"
  >
    {iconUrl && (
      <img src={iconUrl} alt="icon" style={{ width: 30, height: 30 }} />
    )}
    <span className="text-gray-600">{text}</span>
  </button>
);
