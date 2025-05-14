"use client";

import type { Dispatch, SetStateAction } from 'react';
import { Button } from "@/components/ui/button";
import { ScanBarcode, QrCode, Camera } from "lucide-react";

export type ScanMode = "barcode" | "image" | null;

interface ScannerModeSelectorProps {
  setScanMode: Dispatch<SetStateAction<ScanMode>>;
  currentMode: ScanMode;
}

export function ScannerModeSelector({ setScanMode, currentMode }: ScannerModeSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
      <Button
        onClick={() => setScanMode("barcode")}
        variant={currentMode === "barcode" ? "default" : "outline"}
        className="w-full sm:w-auto"
        aria-pressed={currentMode === "barcode"}
      >
        <ScanBarcode className="mr-2 h-5 w-5" />
        Scan Barcode / QR
      </Button>
      <Button
        onClick={() => setScanMode("image")}
        variant={currentMode === "image" ? "default" : "outline"}
        className="w-full sm:w-auto"
        aria-pressed={currentMode === "image"}
      >
        <Camera className="mr-2 h-5 w-5" />
        Analyze Food Image
      </Button>
    </div>
  );
}
