// In @/lib/types/doctor.ts
export interface Doctor {
  id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  image?: string;
  phone?: string;
  specialty: string;
  qualifications?: string;
  fellowship?: string;
  isAvailable: boolean;
  availableDays?: string[];
  availableTime?: {
    morning: {
      from: string;
      to: string;
    };
    evening: {
      from: string;
      to: string;
    };
  };
  bio?: string; // Make optional
  is_favorited?: boolean;
  reviews?: any[];
  fee?: number; // Make optional
}
