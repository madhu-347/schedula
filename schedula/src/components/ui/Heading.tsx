"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface HeadingProps {
  heading: string;
  headingClassName?: string; // optional custom classes
}

export default function Heading({
  heading,
  headingClassName = "",
}: HeadingProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 bg-transparent">
      <div className="max-w-3xl mx-auto px-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-cyan-600/30 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1
            className={`text-xl font-semibold ${headingClassName}`}
          >
            {heading}
          </h1>
        </div>
      </div>
    </header>
  );
}
