"use client";

import { useState, useTransition } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { extractNutritionalData, type ExtractNutritionalDataOutput } from '@/ai/flows/extract-nutritional-data';
import type { NutritionData } from './nutrition-display';

const BarcodeFormSchema = z.object({
  barcode: z.string().min(3, { message: "Barcode must be at least 3 characters." }),
});

interface BarcodeFormProps {
  setIsLoading: (loading: boolean) => void;
  setNutritionData: (data: NutritionData | null) => void;
  setErrorMessage: (message: string | null) => void;
}

export function BarcodeForm({ setIsLoading, setNutritionData, setErrorMessage }: BarcodeFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof BarcodeFormSchema>>({
    resolver: zodResolver(BarcodeFormSchema),
    defaultValues: {
      barcode: "",
    },
  });

  async function onSubmit(values: z.infer<typeof BarcodeFormSchema>) {
    setIsLoading(true);
    setNutritionData(null);
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const result: ExtractNutritionalDataOutput = await extractNutritionalData({ barcode: values.barcode });
        
        if (result && result.productName && result.productName.toLowerCase().includes("could not be found")) {
           setErrorMessage(`Could not find nutritional information for barcode: ${values.barcode}`);
           setNutritionData(null);
        } else if (result && result.productName) {
          const adaptedData: NutritionData = {
            source: 'barcode',
            itemName: result.productName,
            servingSize: result.servingSize,
            calories: result.calories,
            protein: result.protein,
            fat: result.fat,
            saturatedFat: result.saturatedFat,
            transFat: result.transFat,
            cholesterol: result.cholesterol,
            sodium: result.sodium,
            carbohydrates: result.carbohydrates,
            fiber: result.fiber,
            sugar: result.sugar,
            allergens: result.allergens ? result.allergens.split(',').map(a => a.trim()) : [],
          };
          setNutritionData(adaptedData);
          toast({ title: "Success", description: "Nutritional data retrieved." });
        } else {
          setErrorMessage("Failed to retrieve nutritional data. The product might not be in the database.");
          setNutritionData(null);
        }
      } catch (error) {
        console.error("Error fetching nutritional data:", error);
        setErrorMessage("An error occurred while fetching nutritional data.");
        setNutritionData(null);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch data." });
      } finally {
        setIsLoading(false);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow-md">
        <FormField
          control={form.control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="barcode-input" className="text-lg font-semibold">Enter Barcode or QR Code Data</FormLabel>
              <FormControl>
                <Input id="barcode-input" placeholder="e.g., 978020137962" {...field} className="text-base" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending || form.formState.isSubmitting}>
          {isPending || form.formState.isSubmitting ? "Analyzing..." : "Get Nutritional Data"}
        </Button>
      </form>
    </Form>
  );
}
