// In @/lib/types/doctor.ts
export interface Doctor {
  id: number;
  name: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  profilePicture: string;
  phone?: string;
  specialty: string;
  qualification?: string;
  fellowship?: string;
  status: string;
  bio: string;
  time: string;
  imageUrl?: string; // Make optional
  is_favorited?: boolean; // Make optional
}
