// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { createAppointment } from "@/app/services/appointments.api";
// import { createNotification } from "@/app/services/notifications.api";
// import mockData from "@/lib/mockData.json";

// export default function FollowUpPage() {
//   const { appointmentId } = useParams() as { appointmentId: string };
//   const router = useRouter();

//   const [followup, setFollowup] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [confirmed, setConfirmed] = useState(false);

//   useEffect(() => {
//     (async () => {
//       const res = await fetch(`/api/followup?id=${appointmentId}`);
//       const json = await res.json();
//       setFollowup(json.data);
//       setLoading(false);
//     })();
//   }, [appointmentId]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-gray-600">
//         Loading…
//       </div>
//     );
//   }

//   if (!followup) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-gray-600">
//         Invalid follow-up request.
//       </div>
//     );
//   }

//   // ✅ CONFIRM FOLLOW-UP
//   const confirmFollowUp = async () => {
//     await fetch("/api/followup", {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ id: followup.id, status: "Confirmed" }),
//     });

//     const response = await fetch("/api/appointment", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         patientId: followup.patientId,
//         doctorId: followup.doctorId,
//         date: followup.followUpDate,
//         day: new Date(followup.followUpDate).toLocaleString("en-US", {
//           weekday: "long",
//         }),
//         time: followup.followUpTime || "—",
//         status: "Upcoming",
//         paid: false,
//         visitType: "Follow-up",
//         type: "In-person",
//       }),
//     });

//     // Check if appointment was created successfully and send notifications
//     const result = await response.json();
//     if (result.success) {
//       // Send notifications for the follow-up appointment
//       try {
//         // Get patient and doctor info
//         const patient = mockData.users.find(
//           (user: any) => user.id === followup.patientId
//         );
//         const doctor = mockData.doctors.find(
//           (doc: any) => doc.id === followup.doctorId
//         );

//         if (patient && doctor) {
//           const patientName = `${patient.firstName || "Patient"} ${
//             patient.lastName || ""
//           }`.trim();
//           const doctorName = `${doctor.firstName} ${doctor.lastName}`;

//           // Send notification to doctor
//           const doctorNotification = generateDoctorNotification({
//             recipientId: followup.doctorId,
//             doctorName: doctorName,
//             patientName: patientName,
//             date: followup.followUpDate,
//             time: followup.followUpTime || "—",
//             appointmentId: result.data.id,
//           });
//           await sendNotification(doctorNotification);

//           // Send notification to patient
//           const patientNotification = generatePatientNotification({
//             recipientId: followup.patientId,
//             doctorName: doctorName,
//             patientName: patientName,
//             date: followup.followUpDate,
//             time: followup.followUpTime || "—",
//             appointmentId: result.data.id,
//           });
//           await sendNotification(patientNotification);
//         }
//       } catch (notificationError) {
//         console.error(
//           "Error sending follow-up notifications:",
//           notificationError
//         );
//       }

//       console.log("Follow-up appointment created successfully");
//     }

//     setConfirmed(true);
//   };

//   // ✅ CANCEL FOLLOW-UP
//   const cancelFollowUp = async () => {
//     await fetch("/api/followup", {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ id: followup.id, status: "Cancelled" }),
//     });

//     router.push("/user/appointment"); // ✅ FIXED ROUTE
//   };

//   // ✅ AFTER CONFIRM → Success animation
//   if (confirmed) {
//     return (
//       <div className="min-h-screen bg-cyan-50 flex items-center justify-center p-4">
//         <div className="bg-white max-w-sm w-full p-6 rounded-xl shadow text-center">
//           <style>{`
//             .grow-text {
//               animation: grow 0.5s ease forwards;
//               transform: scale(0.7);
//               opacity: 0;
//             }
//             @keyframes grow {
//               0% { transform: scale(0.7); opacity: 0; }
//               100% { transform: scale(1); opacity: 1; }
//             }
//           `}</style>

//           <h2 className="text-xl font-bold text-green-700 grow-text flex items-center justify-center gap-2">
//             Follow-up Booked
//             <span className="text-green-600 text-2xl">✓</span>
//           </h2>

//           <button
//             onClick={() => router.push("/user/appointment")}
//             className="mt-6 w-full bg-cyan-600 text-white py-2 rounded"
//           >
//             View Appointment
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ✅ MAIN FOLLOW-UP UI
//   return (
//     <div className="min-h-screen bg-cyan-50 flex items-center justify-center p-4">
//       <div className="max-w-sm w-full bg-white rounded-xl shadow p-6 space-y-4">
//         <h1 className="text-xl font-semibold text-center">Follow-up Details</h1>

//         <div className="p-4 bg-gray-50 rounded space-y-1 text-gray-700">
//           <p>
//             <strong>Date:</strong> {followup.followUpDate}
//           </p>

//           <p>
//             <strong>Time:</strong>{" "}
//             {followup.followUpTime || followup.time || "—"}
//           </p>
//         </div>

//         <div className="flex flex-col gap-3 mt-4">
//           <button
//             onClick={confirmFollowUp}
//             className="bg-green-600 text-white py-2 rounded"
//           >
//             Confirm
//           </button>

//           <button
//             onClick={cancelFollowUp}
//             className="border border-red-500 text-red-500 py-2 rounded"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
