"use client";

import { Loader2 } from "lucide-react";

export function LoadingIndicator() {
  return (
    <div className="flex justify-center items-center py-8">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 text-lg text-muted-foreground">Analyzing...</p>
    </div>
  );
}
