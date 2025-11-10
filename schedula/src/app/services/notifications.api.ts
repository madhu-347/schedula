// Notification service for handling notifications for both patient and doctor sides
// Fetch notifications for a user (doctor or patient)
import { Notification } from "@/lib/types/notification";

export async function getNotifications(
  recipientId?: string
): Promise<Notification[]> {
  if (!recipientId) {
    throw new Error("Recipient ID is required");
  }
  try {
    const url = `/api/notifications?recipientId=${recipientId}`;

    const response = await fetch(url);
    const result = await response.json();
    console.log("notification response", result);

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
  notificationData: Notification
): Promise<Notification | null> {
  try {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...notificationData, // Ensure all properties are included
      }),
    });
    const result = await response.json();
    console.log("notification response", result);

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
export async function markNotificationAsRead(id: string): Promise<boolean> {
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
  recipientId?: string
): Promise<number> {
  try {
    const notifications = await getNotifications(recipientId);
    return notifications.filter((notification) => !notification.read).length;
  } catch (error) {
    console.error("Failed to get unread notifications count:", error);
    return 0;
  }
}
