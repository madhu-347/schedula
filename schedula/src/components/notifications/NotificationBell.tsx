// "use client";

// import React, { useState, useEffect } from "react";
// import { Bell, X } from "lucide-react";
// import { useAuth } from "@/context/AuthContext";
// import { useRouter } from "next/navigation";

// import {
//   getNotifications,
//   markNotificationAsRead,
// } from "@/services/notification.service";
// import { Notification } from "@/services/notification.service";

// interface NotificationBellProps {
//   role: "doctor" | "patient";
// }

// export default function NotificationBell({ role }: NotificationBellProps) {
//   const router = useRouter();
//   const { doctor, user } = useAuth();
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [isOpen, setIsOpen] = useState(false);

//   // Fetch notifications
//   useEffect(() => {
//     const fetchNotifications = async () => {
//       if ((role === "doctor" && !doctor) || (role === "patient" && !user)) {
//         return;
//       }

//       const recipientId = role === "doctor" ? doctor?.id : user?.id;
//       const fetchedNotifications = await getNotifications(recipientId);

//       setNotifications(fetchedNotifications);

//       // Count unread notifications
//       const unread = fetchedNotifications.filter((n) => !n.read).length;
//       setUnreadCount(unread);
//     };

//     fetchNotifications();

//     // Poll for new notifications every 30 seconds
//     const interval = setInterval(fetchNotifications, 30000);
//     return () => clearInterval(interval);
//   }, [doctor, user, role]);

//   // Mark notification as read
//   const handleMarkAsRead = async (id: number) => {
//     const success = await markNotificationAsRead(id);
//     if (success) {
//       setNotifications(
//         notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
//       );

//       // Update unread count
//       setUnreadCount((prev) => Math.max(0, prev - 1));
//     }
//   };

//   // Mark all as read
//   const handleMarkAllAsRead = async () => {
//     for (const notification of notifications.filter((n) => !n.read)) {
//       await markNotificationAsRead(notification.id);
//     }

//     setNotifications(notifications.map((n) => ({ ...n, read: true })));
//     setUnreadCount(0);
//   };

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
//       >
//         <Bell className="w-5 h-5 text-gray-600" />
//         {unreadCount > 0 && (
//           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//             {unreadCount}
//           </span>
//         )}
//       </button>

//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
//           <div className="p-4 border-b border-gray-200">
//             <div className="flex justify-between items-center">
//               <h3 className="font-semibold text-gray-900">Notifications</h3>
//               {unreadCount > 0 && (
//                 <button
//                   onClick={handleMarkAllAsRead}
//                   className="text-sm text-cyan-600 hover:text-cyan-800"
//                 >
//                   Mark all as read
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="max-h-96 overflow-y-auto">
//             {notifications.length === 0 ? (
//               <div className="p-4 text-center text-gray-500">
//                 No notifications
//               </div>
//             ) : (
//               <ul>
//                 {notifications.map((notification) => (
//                   <li
//                     key={notification.id}
//                     onClick={() => {
//                       if (!notification.read) handleMarkAsRead(notification.id);
//                       if (notification.targetUrl)
//                         router.push(notification.targetUrl);
//                     }}
//                     className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
//                       !notification.read ? "bg-blue-50" : ""
//                     }`}
//                   >
//                     <div className="flex justify-between">
//                       <div className="flex-1">
//                         <p className="text-sm font-medium text-gray-900">
//                           {notification.doctorName}
//                         </p>
//                         <p className="text-sm text-gray-600">
//                           {notification.message}
//                         </p>
//                         <p className="text-xs text-gray-400 mt-1">
//                           {new Date(notification.timestamp).toLocaleString()}
//                         </p>
//                       </div>
//                       {!notification.read && (
//                         <button
//                           onClick={() => handleMarkAsRead(notification.id)}
//                           className="ml-2 text-gray-400 hover:text-gray-600"
//                         >
//                           <X className="w-4 h-4" />
//                         </button>
//                       )}
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>

//           <div className="p-2 text-center border-t border-gray-200">
//             <button
//               onClick={() => setIsOpen(false)}
//               className="text-sm text-gray-500 hover:text-gray-700"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Click outside to close */}
//       {isOpen && (
//         <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
//       )}
//     </div>
//   );
// }
