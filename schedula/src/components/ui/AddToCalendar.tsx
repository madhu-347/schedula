import React from "react";
import { Calendar } from "lucide-react";

// Add to Calendar Button Component
interface AddToCalendarButtonProps {
  onClick?: () => void;
  text?: string;
}

export const AddToCalendarButton: React.FC<AddToCalendarButtonProps> = ({
  onClick,
  text = "Add to calendar",
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-cyan-100 hover:bg-cyan-200 text-cyan-600 font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
    >
      <Calendar className="w-5 h-5" />
      {text}
    </button>
  );
};
export default AddToCalendarButton;
