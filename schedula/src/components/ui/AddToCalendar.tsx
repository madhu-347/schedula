import React from "react";
import { Calendar } from "lucide-react";

// Add to Calendar Button Component
interface AddToCalendarButtonProps {
  onClick?: () => void;
  text?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export const AddToCalendarButton: React.FC<AddToCalendarButtonProps> = ({
  onClick,
  text = "Add to calendar",
  disabled = false,
  isLoading = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="bg-cyan-100 hover:bg-cyan-200 text-cyan-600 font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
    >
      <Calendar className="w-5 h-5" />
      {isLoading ? "Adding to Calendar..." : text}
    </button>
  );
};
export default AddToCalendarButton;
