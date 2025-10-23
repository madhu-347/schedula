// Appointment Details Card Component
import AddToCalendar from "../ui/AddToCalendar";

interface AppointmentDetailsCardProps {
  appointmentNumber: string;
  status: "Active" | "Completed" | "Cancelled" | "Pending";
  reportingTime: string;
  onAddToCalendar?: () => void;
}

export const AppointmentDetailsCard: React.FC<AppointmentDetailsCardProps> = ({
  appointmentNumber,
  status,
  reportingTime,
  onAddToCalendar,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "Active":
        return "text-green-600";
      case "Completed":
        return "text-blue-600";
      case "Cancelled":
        return "text-red-600";
      case "Pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      {/* Appointment Number */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-500 mb-1">
          Appointment Number:
        </p>
        <p className="text-2xl font-bold text-gray-900">{appointmentNumber}</p>
      </div>

      {/* Status and Reporting Time */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
          <p className={`text-base font-semibold ${getStatusColor()}`}>
            {status}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            Reporting Time
          </p>
          <p className="text-base font-semibold text-gray-900">
            {reportingTime}
          </p>
        </div>
      </div>

      {/* Add to Calendar Button */}
      <AddToCalendar onClick={onAddToCalendar} />
    </div>
  );
};
