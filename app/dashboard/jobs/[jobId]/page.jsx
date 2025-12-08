"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function JobDetailsPage({ params }) {
  const { jobId } = params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Job Details — {jobId}</h1>
      <p className="mt-4">Here you can show the full job description, requirements, apply link, etc.</p>
      {/* ... more details ... */}
    </div>
  );
}
