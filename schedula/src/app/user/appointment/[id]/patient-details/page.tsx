"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Appointment } from "@/lib/types/appointment";
import Heading from "@/components/ui/Heading";
import { updateAppointment } from "@/app/services/appointments.api";

export default function PatientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params?.id as string;
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    mobileNumber: "",
    weight: "",
    problem: "",
    relationship: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const relationshipOptions = [
    "Self",
    "Son",
    "Daughter",
    "Brother",
    "Sister",
    "Father",
    "Mother",
    "Spouse",
    "Other",
  ];

  const genderOptions = ["Male", "Female", "Other"];

  const addPatientDetails = async (patientDetails: any) => {
    try {
      setErrorMessage("");
      console.log("patientDetails", patientDetails);
      const response = await updateAppointment(appointmentId, {
        patientDetails,
      });
      console.log("add patientDetails response", response);
      if (response && response.success) {
        router.push(`/user/appointment/${appointmentId}/summary`);
      } else {
        // Handle error case
        const errorMsg =
          response?.error ||
          "Failed to save patient details. Please try again.";
        setErrorMessage(errorMsg);
        console.error("Failed to update appointment:", errorMsg);
      }
    } catch (error) {
      const errorMsg = "Failed to save patient details. Please try again.";
      setErrorMessage(errorMsg);
      console.error("Error updating appointment:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // Clear general error message
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleRelationshipSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, relationship: value }));
    setShowDropdown(false);
    if (errors.relationship) {
      setErrors((prev) => ({ ...prev, relationship: "" }));
    }
    // Clear general error message
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleGenderSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value }));
    setShowGenderDropdown(false);
    if (errors.gender) {
      setErrors((prev) => ({ ...prev, gender: "" }));
    }
    // Clear general error message
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    // Age validation
    if (!formData.age) {
      newErrors.age = "Age is required";
    } else if (parseInt(formData.age) < 0 || parseInt(formData.age) > 150) {
      newErrors.age = "Please enter a valid age";
    }

    // Gender validation
    if (!formData.gender.trim()) {
      newErrors.gender = "Gender is required";
    }

    // Mobile number validation
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Mobile number must be 10 digits";
    }

    // Weight validation (optional but if provided, must be valid)
    if (
      formData.weight &&
      (parseInt(formData.weight) <= 0 || parseInt(formData.weight) > 500)
    ) {
      newErrors.weight = "Please enter a valid weight";
    }

    // Relationship validation
    if (!formData.relationship) {
      newErrors.relationship = "Please select relationship";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      formData.fullName.trim() !== "" &&
      formData.age !== "" &&
      formData.gender !== "" &&
      formData.mobileNumber !== "" &&
      formData.relationship !== ""
    );
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Create patient details object
    const patientDetails = {
      fullName: formData.fullName.trim(),
      age: parseInt(formData.age),
      gender: formData.gender as "Male" | "Female" | "Other",
      phone: formData.mobileNumber,
      weight: formData.weight ? parseInt(formData.weight) : undefined,
      problem: formData.problem.trim() || undefined,
      relationship: formData.relationship as
        | "Self"
        | "Son"
        | "Daughter"
        | "Brother"
        | "Sister"
        | "Father"
        | "Mother"
        | "Spouse"
        | "Other",
    };

    // Update the appointment with patient details
    addPatientDetails(patientDetails);
  };

  return (
    <div className="min-h-screen bg-white pb-15">
      {/* Header */}
      <div className="pt-4 mb-2">
        <Heading heading="Patient Details" />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="max-w-3xl mx-auto px-5 mb-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <main className="max-w-3xl mx-auto px-5 py-6">
        <div className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Full name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your name"
              className={`w-full px-4 py-3.5 bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 ${
                errors.fullName ? "ring-2 ring-red-500" : "focus:ring-cyan-500"
              }`}
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Age and Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Age</label>
              <input
                type="number"
                name="age"
                max={500}
                min={1}
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Enter your age"
                className={`w-full px-4 py-3.5 bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 ${
                  errors.age ? "ring-2 ring-red-500" : "focus:ring-cyan-500"
                }`}
              />
              {errors.age && (
                <p className="text-red-500 text-xs mt-1">{errors.age}</p>
              )}
            </div>
            {/* gender */}
            <div className="relative">
              <label className="block text-sm text-gray-600 mb-2">Gender</label>
              <button
                type="button"
                onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                className={`w-full px-4 py-3.5 bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 text-left flex items-center justify-between ${
                  errors.gender ? "ring-2 ring-red-500" : "focus:ring-cyan-500"
                }`}
              >
                <span
                  className={
                    formData.gender ? "text-gray-900" : "text-gray-400"
                  }
                >
                  {formData.gender || "Select your gender"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    showGenderDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
              )}

              {/* Gender Dropdown Menu */}
              {showGenderDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowGenderDropdown(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
                    {genderOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleGenderSelect(option)}
                        className="w-full px-4 py-3 text-left text-gray-900 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleInputChange}
              placeholder="Enter your mobile number"
              maxLength={10}
              className={`w-full px-4 py-3.5 bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 ${
                errors.mobileNumber
                  ? "ring-2 ring-red-500"
                  : "focus:ring-cyan-500"
              }`}
            />
            {errors.mobileNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Weight <span className="text-gray-400">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="Enter your weight in Kgs"
                className={`w-full px-4 py-3.5 bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 text-gray-900 placeholder:text-gray-400 pr-12 ${
                  errors.weight ? "ring-2 ring-red-500" : "focus:ring-cyan-500"
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                Kg
              </span>
            </div>
            {errors.weight && (
              <p className="text-red-500 text-xs mt-1">{errors.weight}</p>
            )}
          </div>

          {/* Problem */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Problem <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              name="problem"
              value={formData.problem}
              onChange={handleInputChange}
              placeholder="write something about your problem"
              rows={6}
              className="w-full px-4 py-3.5 bg-gray-100 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Relationship Dropdown */}
          <div className="relative mb-10">
            <label className="block text-sm text-gray-600 mb-2">
              Relationship with Patient
            </label>
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className={`w-full px-4 py-3.5 bg-white rounded-xl border focus:outline-none focus:ring-2 text-left text-gray-900 flex items-center justify-between ${
                errors.relationship
                  ? "border-red-500 ring-2 ring-red-500"
                  : "border-gray-200 focus:ring-cyan-500"
              }`}
            >
              <span
                className={
                  formData.relationship ? "text-gray-900" : "text-gray-400"
                }
              >
                {formData.relationship || "Relationship with Patient"}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  showDropdown ? "rotate-180" : ""
                }`}
              />
            </button>
            {errors.relationship && (
              <p className="text-red-500 text-xs mt-1">{errors.relationship}</p>
            )}

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
                  {relationshipOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleRelationshipSelect(option)}
                      className="w-full px-4 py-3 text-left text-gray-900 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Save Button */}
          <div className="bottom-5 left-0 right-0 z-30">
            <div className="max-w-3xl mx-auto px-5">
              <Button
                variant="default"
                size="lg"
                className="w-full cursor-pointer"
                onClick={handleSave}
                disabled={!isFormValid()}
              >
                Save & Continue
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
