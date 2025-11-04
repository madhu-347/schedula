// Notification service for handling notifications for both patient and doctor sides

export interface Notification {
  id: number;
  recipientId: string;
  doctorName: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetUrl?: string;
}

// Fetch notifications for a doctor
export async function getNotifications(
  doctorId?: string
): Promise<Notification[]> {
  try {
    const url = doctorId
      ? `/api/notifications?doctorId=${doctorId}`
      : "/api/notifications";

    const response = await fetch(url);
    const result = await response.json();

    if (result.success) {
      return result.data;
    }

    return [];
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}

// Create a new notification
export async function createNotification(
  doctorName: string,
  message: string
): Promise<Notification | null> {
  try {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        doctorName,
        message,
      }),
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    }

    return null;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

// Mark a notification as read
export async function markNotificationAsRead(id: number): Promise<boolean> {
  try {
    const response = await fetch("/api/notifications", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const result = await response.json();

    return result.success || false;
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return false;
  }
}

// Get unread notifications count
export async function getUnreadNotificationsCount(
  doctorId?: string
): Promise<number> {
  try {
    const notifications = await getNotifications(doctorId);
    return notifications.filter((notification) => !notification.read).length;
  } catch (error) {
    console.error("Failed to get unread notifications count:", error);
    return 0;
  }
}
