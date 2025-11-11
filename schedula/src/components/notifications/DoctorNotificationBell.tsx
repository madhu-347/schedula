"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  Calendar,
  FileText,
  Clock,
  AlertCircle,
  Pill,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  getNotifications,
  markNotificationAsRead,
} from "@/app/services/notifications.api";
import { Notification } from "@/lib/types/notification";

export default function DoctorNotificationBell() {
  const router = useRouter();
  const { doctor } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!doctor) {
        return;
      }

      const recipientId = doctor.id;
      const fetchedNotifications = await getNotifications(recipientId);
      const doctorNotifications = fetchedNotifications.filter((n) => n.recipientRole === "doctor");
      setNotifications(doctorNotifications);

      // Count unread notifications
      const unread = doctorNotifications.filter((n) => !n.read).length;
      setUnreadCount(unread);
    };

    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [doctor]);

  // Mark notification as read
  const handleMarkAsRead = async (id: string) => {
    const success = await markNotificationAsRead(id);
    if (success) {
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    for (const notification of notifications.filter((n) => !n.read)) {
      if (notification.id) {
        await markNotificationAsRead(notification.id);
      }
    }

    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: Notification["type"]) => {
    const iconProps = { className: "w-4 h-4" };

    switch (type) {
      case "appointment":
        return <Calendar {...iconProps} />;
      case "follow-up":
        return <Clock {...iconProps} />;
      case "reminder":
        return <Bell {...iconProps} />;
      case "alert":
        return <AlertCircle {...iconProps} />;
      case "prescription":
        return <Pill {...iconProps} />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "appointment":
        return "text-blue-600 bg-blue-100";
      case "follow-up":
        return "text-purple-600 bg-purple-100";
      case "reminder":
        return "text-yellow-600 bg-yellow-100";
      case "alert":
        return "text-red-600 bg-red-100";
      case "prescription":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read && notification.id) {
      handleMarkAsRead(notification.id);
    }
    if (notification.targetUrl) {
      router.push(notification.targetUrl);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-60">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-cyan-600 hover:text-cyan-800 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div
                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getNotificationColor(
                          notification.type
                        )}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {notification.createdAt
                            ? new Date(notification.createdAt).toLocaleString()
                            : "Just now"}
                        </p>
                      </div>

                      {/* Mark as read button */}
                      {!notification.read && notification.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id!);
                          }}
                          className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label="Mark as read"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-2 text-center border-t border-gray-200">
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors w-full py-1"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
