export interface Notification {
  id?: string;
  recipientId: string; // user who should receive the notification
  recipientRole: "doctor" | "user";
  title: string;
  message: string;
  type: "appointment" | "follow-up" | "reminder" | "alert" | "prescription";
  targetUrl: string; // client route to open when clicked
  relatedId?: string;
  createdAt?: string;
  read?: boolean;
}
