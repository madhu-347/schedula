import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CalendarPlus } from "lucide-react";

interface AppointmentDetailsCardProps {
  appointmentNumber: string;
  status: "Upcoming" | "Completed" | "Canceled";
  reportingTime: string;
  onAddToCalendar?: () => void;
  type?: "In-person" | "Virtual";
  duration?: string;
  fee?: string;
  clinicAddress?: string;
}

export const AppointmentDetailsCard: React.FC<AppointmentDetailsCardProps> = ({
  appointmentNumber,
  status,
  reportingTime,
  onAddToCalendar,
  type,
  duration,
  fee,
  clinicAddress,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "Upcoming":
        return "text-green-600";
      case "Completed":
        return "text-primary";
      case "Canceled":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="p-6 shadow-sm bg-white">
      {/* Appointment Number */}
      <div className="mb-6">
        <p className="text-muted-foreground mb-1 text-gray-500">
          Appointment Number:
        </p>
        <p className="text-sm md:text-base text-black text-foreground">
          {appointmentNumber}
        </p>
      </div>

      {/* Status and Reporting Time */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-muted-foreground mb-1 text-gray-500">Status</p>
          <p
            className={`text-sm md:text-base font-semibold text-foreground ${getStatusColor()}`}
          >
            {status}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1 text-gray-500">
            Reporting Time
          </p>
          <p className="text-sm md:text-base text-black text-foreground">
            {reportingTime}
          </p>
        </div>
      </div>

      {/* Additional Details */}
      {(type || duration) && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {type && (
            <div>
              <p className="text-muted-foreground mb-1 text-gray-500">Type</p>
              <p className="text-sm md:text-base text-black text-foreground">
                {type}
              </p>
            </div>
          )}
          {duration && (
            <div>
              <p className="text-gray-500 text-muted-foreground mb-1">
                Duration
              </p>
              <p className="text-sm md:text-base text-black text-foreground">
                {duration}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Consultation Fee */}
      {/* {fee && (
        <div className="mb-6">
          <p className="text-gray-500 text-muted-foreground mb-1">
            Consultation Fee
          </p>
          <p className="text-sm md:text-base text-black text-foreground">
            {fee}
          </p>
        </div>
      )} */}

      {/* Clinic Address */}
      {/* {clinicAddress && (
        <div className="mb-6">
          <p className="text-gray-500 text-muted-foreground mb-1">
            Clinic Address
          </p>
          <p className="text-sm md:text-base text-black text-foreground">
            {clinicAddress}
          </p>
        </div>
      )} */}

      {/* Add to Calendar Button */}
      {onAddToCalendar && (
        <Button
          variant="outline"
          className="w-full md:w-auto"
          onClick={onAddToCalendar}
        >
          <CalendarPlus className="w-4 h-4" />
          Add to calendar
        </Button>
      )}
    </Card>
  );
};
