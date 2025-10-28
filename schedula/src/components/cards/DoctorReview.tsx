import React from "react";
import { Card } from "../ui/Card";

interface DoctorInfoCardProps {
  name: string;
  specialty: string;
  location: string;
  qualification: string;
  imageUrl?: string;
}

export const DoctorInfoCard: React.FC<DoctorInfoCardProps> = ({
  name,
  specialty,
  location,
  qualification,
  imageUrl,
}) => {
  return (
    <Card className="p-5 shadow-sm bg-white w-full rounded-2xl">
      <div className="flex items-center gap-4">
        <img
          src={imageUrl}
          alt={name}
          className="rounded-2xl w-20 h-20 md:w-25 md:h-25 object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1 truncate">
            {name}
          </h2>
          <hr className="md:w-45 border-gray-200 mb-1" />
          <p className="text-sm md:text-base text-muted-foreground mb-1">
            {specialty} - {location}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">
            {qualification}
          </p>
        </div>
      </div>
    </Card>
  );
};
