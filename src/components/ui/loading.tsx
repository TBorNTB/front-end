// app/loading.tsx
"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin w-10 h-10 text-primary" />
    </div>
  );
}
