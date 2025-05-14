"use client";

import { useState, useTransition, ChangeEvent } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { identifyFoodAndExtractNutritionalData, type IdentifyFoodAndExtractNutritionalDataOutput } from '@/ai/flows/identify-food-and-extract-nutritional-data';
import type { NutritionData } from './nutrition-display';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const ImageFormSchema = z.object({
  image: z.custom<FileList>()
    .refine((files) => files && files.length > 0, "Image is required.")
    .refine((files) => files && files[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => files && ALLOWED_IMAGE_TYPES.includes(files[0]?.type),
      "Only .jpg, .jpeg, .png, .webp and .gif formats are supported."
    ),
});

interface ImageFormProps {
  setIsLoading: (loading: boolean) => void;
  setNutritionData: (data: NutritionData | null) => void;
  setErrorMessage: (message: string | null) => void;
}

export function ImageForm({ setIsLoading, setNutritionData, setErrorMessage }: ImageFormProps) {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ImageFormSchema>>({
    resolver: zodResolver(ImageFormSchema),
  });

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("image", event.target.files as FileList);
      form.trigger("image"); // Manually trigger validation for the image field
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      form.resetField("image");
    }
  };

  const convertFileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  async function onSubmit(values: z.infer<typeof ImageFormSchema>) {
    setIsLoading(true);
    setNutritionData(null);
    setErrorMessage(null);

    if (!values.image || values.image.length === 0) {
      setErrorMessage("Please select an image.");
      setIsLoading(false);
      return;
    }

    const file = values.image[0];

    startTransition(async () => {
      try {
        const photoDataUri = await convertFileToDataUri(file);
        const result: IdentifyFoodAndExtractNutritionalDataOutput = await identifyFoodAndExtractNutritionalData({ photoDataUri });

        if (result && result.foodIdentification?.identifiedFood) {
          const adaptedData: NutritionData = {
            source: 'image',
            itemName: result.foodIdentification.identifiedFood,
            servingSize: result.nutritionalInformation.servingSize,
            calories: result.nutritionalInformation.calories,
            protein: result.nutritionalInformation.protein,
            fat: result.nutritionalInformation.fat,
            carbohydrates: result.nutritionalInformation.carbohydrates,
            allergens: result.allergens,
            confidenceLevel: result.foodIdentification.confidenceLevel,
          };
          setNutritionData(adaptedData);
          toast({ title: "Success", description: "Food identified and nutritional data retrieved." });
        } else {
          setErrorMessage("Could not identify the food or extract nutritional data from the image.");
          setNutritionData(null);
        }
      } catch (error) {
        console.error("Error identifying food:", error);
        setErrorMessage("An error occurred while analyzing the image.");
        setNutritionData(null);
        toast({ variant: "destructive", title: "Error", description: "Could not analyze image." });
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
          name="image"
          render={({ fieldState }) => ( // field is not directly used here, onChange handled by handleImageChange
            <FormItem>
              <FormLabel htmlFor="image-upload" className="text-lg font-semibold">Upload Food Image</FormLabel>
              <FormControl>
                <Input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </FormControl>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />

        {preview && (
          <div className="mt-4 border border-muted rounded-md p-2 flex justify-center">
            <Image 
              src={preview} 
              alt="Image preview" 
              width={200} 
              height={200} 
              className="rounded-md object-contain max-h-64" 
              data-ai-hint="food preview"
            />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isPending || form.formState.isSubmitting}>
          {isPending || form.formState.isSubmitting ? "Analyzing..." : "Analyze Image"}
        </Button>
      </form>
    </Form>
  );
}
