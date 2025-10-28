"use client";

import { motion, Variants } from "framer-motion";
// import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CalendarDays, Clock, HeartPulse } from "lucide-react";

// Animation variants
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// const fadeUp = {
//   hidden: { opacity: 0, y: 40 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
// };

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

// const fadeIn = {
//   hidden: { opacity: 0 },
//   visible: { opacity: 1, transition: { duration: 0.6 } },
// };

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      {/* NAVBAR */}
      <motion.header
        className="flex justify-between items-center px-6 md:px-16 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold bg-linear-to-t from-[#46C2DE] to-[#000000] bg-clip-text text-transparent">
          Wellora
        </h1>
        <nav className="space-x-6 hidden md:block">
          <Link href="#features" className="hover:text-[#46C2DE]">
            Features
          </Link>
          <Link href="#howitworks" className="hover:text-[#46C2DE]">
            How it Works
          </Link>
          <Link href="#contact" className="hover:text-[#46C2DE]">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/user/login">
            <Button
              variant="outline"
              className="border-[#46C2DE] text-[#46C2DE] hover:bg-[#46C2DE] hover:text-white"
            >
              Login
            </Button>
          </Link>
          <Link href="/user/register">
            <Button className="bg-[#46C2DE] text-white hover:bg-transparent hover:text-[#46C2DE] hover:border-[#46C2DE] border-2 border-transparent transition-all duration-200">
              Register
            </Button>
          </Link>
        </div>
      </motion.header>

      {/* HERO SECTION */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-16 md:py-24 overflow-hidden">
        {/* Left Content */}
        <motion.div
          className="md:w-1/2 space-y-6 text-center md:text-left"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-4xl md:text-5xl font-bold leading-snug text-gray-900">
            Book Doctor Appointments <br />
            <span className="text-[#46C2DE]">Faster & Easier</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Find trusted doctors, schedule consultations, and manage your
            appointments seamlessly — anytime, anywhere.
          </p>
          <div className="flex justify-center md:justify-start gap-4">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link href="/user/login">
                <Button className="bg-[#46C2DE] hover:bg-[#3ab6d2] text-white px-6 py-3 text-lg rounded-lg">
                  Get Started
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link href="#features">
                <Button
                  variant="outline"
                  className="border-[#46C2DE] text-[#46C2DE] hover:bg-[#E6F7FA] px-6 py-3 text-lg rounded-lg"
                >
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Image with floating animation */}
        <motion.div
          className="md:w-1/2 mt-10 md:mt-0 flex justify-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.img
            src="/banners/login-page-3.png"
            alt="Doctor Appointment"
            className="max-w-sm md:max-w-md w-full drop-shadow-lg"
            animate={{ y: [0, -15, 0] }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <motion.section
        id="features"
        className="py-16 bg-gray-50 px-6 md:px-16"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h3 className="text-3xl font-semibold text-center mb-12">
          Why Choose <span className="text-[#46C2DE]">Wellora</span>?
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <CalendarDays className="w-10 h-10 text-[#46C2DE]" />,
              title: "Easy Scheduling",
              desc: "Book and manage doctor appointments in just a few clicks.",
            },
            {
              icon: <Clock className="w-10 h-10 text-[#46C2DE]" />,
              title: "Instant Notifications",
              desc: "Get real-time updates on booking confirmations and reminders.",
            },
            {
              icon: <HeartPulse className="w-10 h-10 text-[#46C2DE]" />,
              title: "Verified Doctors",
              desc: "Consult trusted and qualified medical professionals anytime.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-md text-center hover:shadow-lg transition"
              whileHover={{ scale: 1.03 }}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex justify-center mb-4">{item.icon}</div>
              <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* HOW IT WORKS SECTION */}
      <motion.section
        id="howitworks"
        className="py-16 px-6 md:px-16 text-center bg-white"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h3 className="text-3xl font-semibold mb-12">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-10 text-gray-700">
          {[
            {
              step: "1",
              title: "Search Doctor",
              desc: "Find the right specialist based on symptoms or specialty.",
            },
            {
              step: "2",
              title: "Book Appointment",
              desc: "Select a convenient time slot and confirm your visit online.",
            },
            {
              step: "3",
              title: "Consult & Relax",
              desc: "Visit the clinic or consult online from the comfort of your home.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="text-[#46C2DE] text-4xl font-bold mb-2">
                {item.step}
              </div>
              <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* FOOTER */}
      <motion.footer
        className="py-8 bg-gray-100 text-center text-gray-600 text-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        © {new Date().getFullYear()} Wellora. All rights reserved.
      </motion.footer>
    </div>
  );
}
