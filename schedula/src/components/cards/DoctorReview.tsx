import React from "react";
import { Card } from "../ui/Card";
import { User } from "lucide-react";

interface DoctorInfoCardProps {
  firstName: string;
  lastName: string;
  specialty: string;
  qualifications?: string;
  imageUrl?: string;
}

export const DoctorInfoCard: React.FC<DoctorInfoCardProps> = ({
  firstName,
  lastName,
  specialty,
  qualifications,
  imageUrl,
}) => {
  // console.log({
  //   object: { firstName, lastName, specialty, qualifications, imageUrl },
  // });
  return (
    <Card className="p-5 shadow-sm bg-white w-full rounded-2xl">
      <div className="flex items-center gap-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${firstName} ${lastName}`}
            className="rounded-2xl w-20 h-20 md:w-25 md:h-25 object-cover shrink-0"
          />
        ) : (
          <User className="w-20 h-20 md:w-25 md:h-25 text-gray-400" />
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1 truncate">
            {`${firstName} ${lastName}`}
          </h2>
          <hr className="md:w-45 border-gray-200 mb-1" />
          <p className="text-sm md:text-base text-muted-foreground mb-1">
            {specialty}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">
            {qualifications}
          </p>
        </div>
      </div>
    </Card>
  );
};
