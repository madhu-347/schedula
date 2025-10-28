"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    LogOut, Calendar, Users, Settings, Clock, UserPlus, Video, ChevronRight, Star // Added Star
} from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import mockData from "@/lib/mockData.json"; // Import mockData to get doctor details

// --- Type Definitions ---
type AccountInfo = {
    id: number | string;
    name: string;
    email: string;
    type: 'user' | 'doctor';
    specialty?: string;
};

// Assuming mockData.doctors structure based on previous context
type MockDoctorData = {
    id: number;
    name: string;
    specialty: string;
    // ... add other relevant fields if needed
};
// --- End Type Definitions ---


// --- Mock Data ---
const mockDashboardData = {
    upcomingAppointments: [
        { id: 1, patientName: 'Sudharkar Murti', time: '09:00 AM', type: 'In-Clinic', reason: 'Follow-up Check' },
        { id: 2, patientName: 'Anjali Rao', time: '10:30 AM', type: 'Virtual', reason: 'New Consultation' },
        { id: 3, patientName: 'John Mathew', time: '11:15 AM', type: 'In-Clinic', reason: 'Routine Physical' },
    ],
    stats: {
        todayAppointments: 3,
        totalPatients: 157,
        pendingRequests: 3
    },
    appointmentTypeBreakdown: [
        { name: 'In-Clinic', value: 45 },
        { name: 'Virtual', value: 25 },
    ],
    reviews: [
        { id: 1, patientName: 'Priya Kumar', rating: 5, comment: 'Very helpful and understanding. Explained everything clearly.', date: '2025-10-25' },
        { id: 2, patientName: 'John Mathew', rating: 4, comment: 'Good consultation, but the wait time was a bit long.', date: '2025-10-24' },
        { id: 3, patientName: 'Anjali Rao', rating: 5, comment: 'Excellent doctor! Highly recommend.', date: '2025-10-23' },
    ]
};

// --- Calendar Mock Data ---
const appointmentDates = [ new Date(), new Date(2025, 9, 30), new Date(2025, 10, 5) ];
// --- End Calendar Data ---


export default function DoctorDashboardPage() {
    const router = useRouter();
    const [doctorInfo, setDoctorInfo] = useState<AccountInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    // --- Authentication Check ---
     useEffect(() => {
         const userString = localStorage.getItem("user");
         const expiryString = localStorage.getItem("userExpiry");
         const expiry = expiryString ? Number(expiryString) : 0;
         let isValid = false;
         let userData: AccountInfo | null = null;

         if (userString && expiry && Date.now() < expiry) {
             try {
                 userData = JSON.parse(userString);
                 if (userData && userData.type === 'doctor') {
                     // Try to find specialty from mockData (adjust if using real API)
                     // Added type assertion for safety
                     const doctorDetails = (mockData.doctors as MockDoctorData[] || []).find(d => d.id === userData?.id);
                     // eslint-disable-next-line react-hooks/set-state-in-effect
                     setDoctorInfo({...userData, specialty: doctorDetails?.specialty});
                     isValid = true;
                 }
             } catch (e) { console.error("Error parsing user data", e); }
         }
         if (!isValid) {
             router.push('/doctor/login'); // Redirect if not valid
         } else {
             // eslint-disable-next-line react-hooks/set-state-in-effect
             setIsLoading(false); // Stop loading only if valid
         }
     // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [router]); // Added router to dependency array as per ESLint suggestion
    // --- End Auth Check ---


    // --- Logout Function ---
    const handleLogout = () => {
         localStorage.removeItem("user");
         localStorage.removeItem("userExpiry");
         router.push('/doctor/login');
     };
    // --- End Logout ---

    // --- Loading State ---
    if (isLoading) { return <div className="min-h-screen flex justify-center items-center bg-gray-100">Verifying session...</div>; }
    // --- End Loading State ---


    // --- Calendar Modifiers ---
    const appointmentDayModifier = { appointment: appointmentDates };
    const appointmentDotStyleCSS = `
        .rdp-day_appointment { position: relative; }
        .rdp-day_appointment::after {
            content: ''; position: absolute; bottom: 4px; left: 50%;
            transform: translateX(-50%); width: 6px; height: 6px;
            border-radius: 50%; background-color: #0891b2; /* cyan-600 */
        }
    `;
    // --- End Calendar Modifiers ---

    // --- Pie Chart Colors ---
    const PIE_COLORS = ['#06b6d4', '#67e8f9']; // Cyan-500, Cyan-300
    // --- End Pie Chart Colors ---


    // --- Main Dashboard UI ---
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                     <div>
                         <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
                         {doctorInfo && ( <p className="text-sm text-cyan-100 mt-1"> {doctorInfo.name} - {doctorInfo.specialty || 'Specialist'} </p> )}
                     </div>
                     <button onClick={handleLogout} title="Logout" className="p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cyan-600 focus:ring-white transition-colors"> <LogOut size={20} /> </button>
                 </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                 {/* Added lg:items-start for grid alignment */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-start">

                    {/* Left Column Wrapper */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Calendar Section */}
                        <section className="bg-white p-4 rounded-lg shadow-md">
                            <style>{appointmentDotStyleCSS}</style>
                            <DayPicker
                                mode="single"
                                month={currentMonth}
                                onMonthChange={setCurrentMonth}
                                modifiers={appointmentDayModifier}
                                modifiersClassNames={{ appointment: 'rdp-day_appointment' }}
                                styles={{ caption_label: { fontWeight: 'bold' }, head_cell: { color: '#666', fontSize: '0.8rem' } }}
                                footer={ <p className="text-center text-sm mt-2 text-gray-500"> Today is {format(new Date(), 'PPP')}. </p> }
                                showOutsideDays
                                // removed fixedWeeks
                                className="w-full"
                            />
                        </section>

                        {/* Quick Actions Section */}
                        <section className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-lg font-semibold text-gray-700 mb-3">Quick Actions</h2>
                            <div className="flex flex-wrap gap-2">
                                <button className="text-sm bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1.5 rounded-md transition-colors">Add New Patient</button>
                                <button className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-md transition-colors">Manage Availability</button>
                            </div>
                        </section>

                        {/* --- MOVED: Recent Reviews Section --- */}
                        <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Reviews</h2>
                            {mockDashboardData.reviews.length > 0 ? (
                                <ul className="space-y-4">
                                    {mockDashboardData.reviews.map((review) => (
                                        <li key={review.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-medium text-gray-700 text-sm">{review.patientName}</span>
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                         <Star key={i} size={14} className={` ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                                     ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-1">{review.comment}</p>
                                            <p className="text-xs text-gray-400 text-right">{format(new Date(review.date), 'PP')}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : ( <p className="text-gray-500 text-sm">No reviews received yet.</p> )}
                             <button className="text-sm text-cyan-600 hover:underline mt-4 font-medium">View All Reviews</button>
                        </section>
                        {/* --- END MOVED --- */}
                    </div>


                    {/* Right Column: Stats, Pie, Appointments, Activity */}
                    <section className="lg:col-span-2 space-y-6">
                        {/* Quick Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                           <StatBox title="Today's Appointments" value={mockDashboardData.stats.todayAppointments} icon={Calendar} color="text-cyan-600 bg-cyan-100" />
                           <StatBox title="Total Patients" value={mockDashboardData.stats.totalPatients} icon={Users} color="text-blue-600 bg-blue-100" />
                           <StatBox title="Pending Requests" value={mockDashboardData.stats.pendingRequests} icon={UserPlus} color="text-amber-600 bg-amber-100" />
                        </div>

                        {/* Pie Chart Section */}
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                             <h2 className="text-xl font-semibold text-gray-800 mb-4">Appointment Types (This Month)</h2>
                             <div style={{ width: '100%', height: 300 }}>
                                 <ResponsiveContainer>
                                     <PieChart>
                                         <Pie data={mockDashboardData.appointmentTypeBreakdown} cx="50%" cy="50%" labelLine={false} outerRadius={130} fill="#8884d8" dataKey="value" nameKey="name" >
                                             {mockDashboardData.appointmentTypeBreakdown.map((entry, index) => ( <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} /> ))}
                                         </Pie>
                                         <Tooltip formatter={(value) => `${value} appointments`} />
                                         <Legend iconType="circle" verticalAlign="bottom" height={36}/>
                                     </PieChart>
                                 </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Upcoming Appointments List */}
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                           <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
                            {mockDashboardData.upcomingAppointments.length > 0 ? (
                                <ul className="space-y-4">
                                    {mockDashboardData.upcomingAppointments.map((appt) => (
                                        <li key={appt.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {appt.type === 'Virtual' ? <Video className="w-5 h-5 text-purple-500 flex-shrink-0"/> : <Clock className="w-5 h-5 text-cyan-500 flex-shrink-0"/>}
                                                <div> <p className="font-medium text-gray-700">{appt.patientName}</p> <p className="text-xs text-gray-500">{appt.time} - {appt.reason}</p> </div>
                                            </div>
                                            <button className="text-cyan-600 hover:text-cyan-800 p-1"> <ChevronRight size={18} /> </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : ( <p className="text-gray-500 text-sm">No upcoming appointments scheduled.</p> )}
                             <button className="text-sm text-cyan-600 hover:underline mt-4 font-medium">View Full Schedule</button>
                        </div>

                        {/* Recent Patient Activity (Placeholder) */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                           <h2 className="text-lg font-semibold text-gray-700 mb-3">Recent Patient Activity</h2>
                            <p className="text-gray-500 text-sm">Patient activity feed goes here...</p>
                        </div>

                        {/* --- "Quick Actions" was removed from here --- */}
                    </section>
                </div>
            </main>
        </div>
    );
}

// --- Helper Component for Stat Boxes ---
interface StatBoxProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
}

function StatBox({ title, value, icon: Icon, color }: StatBoxProps) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4 hover:shadow-lg transition-shadow">
            <div className={`p-3 rounded-full ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}