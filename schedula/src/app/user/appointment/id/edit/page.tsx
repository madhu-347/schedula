"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/Button";
import { InputFieldComponent } from "@/components/ui/InputField";
// Define the Appointment type locally or import from a shared file
type Appointment = {
  id: number;
  doctorId: number;
  doctorName: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
};

export default function EditAppointmentPage() {
    const router = useRouter();
    const params = useParams();
    const apptId = params?.apptId as string;

    const [formData, setFormData] = useState({
        patientName: '',
        date: '',
        time: '',
        reason: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch appointment details on load
    useEffect(() => {
        if (!apptId) return;
        setIsLoading(true);
        setError(null);

        const fetchAppointment = async () => {
            try {
                const response = await fetch(`/api/appointments/${apptId}`);
                if (!response.ok) throw new Error('Failed to fetch appointment');
                const data = await response.json();
                
                // Pre-fill form data
                setFormData({
                    patientName: data.appointment.patientName,
                    date: data.appointment.date, // Assumes YYYY-MM-DD
                    time: data.appointment.time, // Assumes HH:MM
                    reason: data.appointment.reason,
                });
            } catch (err: any) {
                setError(err.message || 'Could not load details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAppointment();
    }, [apptId]);

    const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    // Handle form submission (Update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!apptId) return;
        setIsSaving(true);
        setError(null);

        try {
            const response = await fetch(`/api/appointments/${apptId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: formData.date,
                    time: formData.time,
                    reason: formData.reason,
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Failed to update: ${errorData}`);
            }

            alert("Appointment updated successfully! (Simulated)");
            window.dispatchEvent(new Event("appointment:updated")); // Trigger update on list page
            router.back(); // Go back to the previous page

        } catch (err: any) {
            setError(err.message || 'Could not save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-6 text-center">Loading...</div>;
    if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto p-4 flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 text-gray-600 hover:text-gray-900">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-800">Edit Appointment</h1>
                </div>
            </header>
            <main className="max-w-3xl mx-auto p-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <form onSubmit={handleSubmit} className="space-y-4">
                         <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                             <p className="text-gray-800 font-medium bg-gray-100 p-2 rounded border border-gray-200">{formData.patientName}</p>
                         </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <InputFieldComponent id="date" type="date" value={formData.date} onChange={handleInputChange('date')} required />
                        </div>
                        <div>
                            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                            <InputFieldComponent id="time" type="time" value={formData.time} onChange={handleInputChange('time')} required />
                        </div>
                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                            <textarea id="reason" value={formData.reason} onChange={handleInputChange('reason')} required rows={3}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div className="pt-4 flex justify-end">
                            <Button type="submit" disabled={isSaving} className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg">
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}