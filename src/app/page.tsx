"use client";

import { useState } from 'react';
import Image from 'next/image';
import { ScannerModeSelector, type ScanMode } from '@/components/nutrisnap/scanner-mode-selector';
import { BarcodeForm } from '@/components/nutrisnap/barcode-form';
import { ImageForm } from '@/components/nutrisnap/image-form';
import { NutritionDisplay, type NutritionData } from '@/components/nutrisnap/nutrition-display';
import { LoadingIndicator } from '@/components/nutrisnap/loading-indicator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function NutriSnapPage() {
  const [scanMode, setScanMode] = useState<ScanMode>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSetScanMode = (mode: ScanMode) => {
    setScanMode(mode);
    setNutritionData(null); // Clear previous results
    setErrorMessage(null); // Clear previous errors
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-background to-secondary/20">
      <header className="mb-10 text-center">
        <div className="inline-block p-1 rounded-lg bg-primary shadow-lg">
          {/* Placeholder for an SVG logo if available */}
          {/* For now, using a simple text logo effect */}
           <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="inline-block rounded">
            <rect width="100" height="100" rx="10" fill="hsl(var(--primary-foreground))"/>
            <path d="M30 70 C30 50, 40 40, 50 40 C60 40, 70 50, 70 70 L70 75 L60 75 L60 70 C60 55, 55 50, 50 50 C45 50, 40 55, 40 70 L40 75 L30 75 Z M45 30 Q50 20 55 30 L50 60 Z" fill="hsl(var(--primary))"/>
            <circle cx="50" cy="55" r="8" fill="hsl(var(--secondary))"/>
           </svg>
        </div>
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          NutriSnap
        </h1>
        <p className="mt-3 text-xl text-muted-foreground sm:mt-4">
          Your smart nutrition companion. Scan, analyze, and understand your food.
        </p>
      </header>

      <main className="w-full max-w-2xl space-y-8">
        <ScannerModeSelector setScanMode={handleSetScanMode} currentMode={scanMode} />

        {scanMode === 'barcode' && (
          <BarcodeForm 
            setIsLoading={setIsLoading} 
            setNutritionData={setNutritionData}
            setErrorMessage={setErrorMessage} 
          />
        )}

        {scanMode === 'image' && (
          <ImageForm 
            setIsLoading={setIsLoading} 
            setNutritionData={setNutritionData} 
            setErrorMessage={setErrorMessage}
          />
        )}

        {isLoading && <LoadingIndicator />}

        {errorMessage && !isLoading && (
          <Alert variant="destructive" className="mt-6">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {nutritionData && !isLoading && !errorMessage && (
          <div className="mt-10">
            <NutritionDisplay data={nutritionData} />
          </div>
        )}

        {!scanMode && !isLoading && !nutritionData && !errorMessage && (
           <div className="text-center p-8 bg-card rounded-lg shadow-md">
             <Image 
                src="https://placehold.co/300x200.png" 
                alt="Healthy food illustration" 
                width={300} 
                height={200} 
                className="mx-auto rounded-lg mb-4"
                data-ai-hint="healthy food" 
              />
             <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome to NutriSnap!</h2>
             <p className="text-muted-foreground">
               Select a scan mode above to get started. You can scan a product's barcode/QR code or analyze an image of your food to get detailed nutritional information.
             </p>
           </div>
        )}
      </main>
      
      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} NutriSnap. All rights reserved (concept app).</p>
        <p>Powered by Next.js and Genkit AI.</p>
      </footer>
    </div>
  );
}
