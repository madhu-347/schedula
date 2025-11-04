import React from "react";
import { Card } from "@/components/ui/Card";

interface AppointmentDetailsCardProps {
  appointmentNumber: string;
  status: "Upcoming" | "Completed" | "Cancelled" | "Waiting";
  date: string;
  day: string;
  time: string;
  duration?: string;
  fee?: string;
  clinicAddress?: string;
}

export const AppointmentDetailsCard: React.FC<AppointmentDetailsCardProps> = ({
  appointmentNumber,
  status,
  date,
  day,
  time,
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
      case "Cancelled":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="p-6 shadow-sm bg-white rounded-2xl">
      {/* Appointment Number */}
      <div className="mb-4">
        <p className="text-muted-foreground mb-1 text-gray-500">
          Appointment Number:
        </p>
        <p className="text-sm md:text-base text-black text-foreground">
          {appointmentNumber}
        </p>
      </div>

      {/* Status and Reporting Time */}
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div>
          <p className="text-muted-foreground mb-1 text-gray-500">Status</p>
          <p
            className={`text-sm md:text-base font-semibold text-foreground ${getStatusColor()}`}
          >
            {status}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1 text-gray-500">Date</p>
          <p className="text-sm md:text-base text-black text-foreground">
            {date} {day}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1 text-gray-500">
            Reporting Time
          </p>
          <p className="text-sm md:text-base text-black text-foreground">
            {time}
          </p>
        </div>
        {fee && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {fee && (
              <div>
                <p className="text-muted-foreground mb-1 text-gray-500">Fee</p>
                <p className="text-sm md:text-base text-black text-foreground">
                  {fee}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
