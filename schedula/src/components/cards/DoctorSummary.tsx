import { Doctor } from "@/lib/types/doctor";
import Image from "next/image";
import { User } from "lucide-react";

function DoctorSummary({ doctor }: { doctor: Doctor }) {
  // Helper function to get doctor's full name
  const getDoctorName = () => {
    if (doctor.firstName || doctor.lastName) {
      return `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (doctor as any).name || "Doctor";
  };

  const doctorName = getDoctorName();
  const hasImage = doctor.image;

  return (
    <div>
      <div className="max-w-3xl mx-auto px-5 mt-3">
        <div className="bg-white text-gray-900 rounded-2xl p-5 flex items-center gap-4 shadow-md">
          <div className="flex-1">
            <h2 className="text-lg font-bold leading-tight text-gray-900">
              {doctorName}
            </h2>
            <p className="text-sm text-gray-600 font-medium mt-0.5">
              {doctor.specialty}
            </p>
            <p className="text-sm text-cyan-600 font-semibold mt-2">
              {doctor.qualifications || "MBBS, MS (Surgeon)"}
            </p>
            <p className="text-xs text-gray-500 mt-1">{doctor.bio}</p>
          </div>

          {/* Doctor Image or Fallback Icon */}
          {hasImage ? (
            <Image
              src={hasImage}
              alt={doctorName}
              width={80}
              height={80}
              className="rounded-xl w-25 h-22 object-cover"
            />
          ) : (
            <div className="rounded-xl w-20 h-20 flex items-center justify-center bg-gray-100 ring-2 ring-cyan-100">
              <User className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorSummary;
