'use server';
/**
 * @fileOverview An AI agent that identifies a food item from an image and extracts its nutritional information.
 *
 * - identifyFoodAndExtractNutritionalData - A function that handles the food identification and nutritional data extraction process.
 * - IdentifyFoodAndExtractNutritionalDataInput - The input type for the identifyFoodAndExtractNutritionalData function.
 * - IdentifyFoodAndExtractNutritionalDataOutput - The return type for the identifyFoodAndExtractNutritionalData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyFoodAndExtractNutritionalDataInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a food product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyFoodAndExtractNutritionalDataInput = z.infer<typeof IdentifyFoodAndExtractNutritionalDataInputSchema>;

const IdentifyFoodAndExtractNutritionalDataOutputSchema = z.object({
  foodIdentification: z.object({
    identifiedFood: z.string().describe('The identified food item.'),
    confidenceLevel: z
      .number()
      .describe('The confidence level of the food identification (0-1).'),
  }),
  nutritionalInformation: z.object({
    calories: z.string().describe('The number of calories in the food item.'),
    protein: z.string().describe('The amount of protein in the food item.'),
    fat: z.string().describe('The amount of fat in the food item.'),
    carbohydrates: z.string().describe('The amount of carbohydrates in the food item.'),
    servingSize: z.string().describe('The serving size for the nutritional information.'),
  }),
  allergens: z
    .array(z.string())
    .describe('A list of common allergens that may be present in the food item.'),
});
export type IdentifyFoodAndExtractNutritionalDataOutput = z.infer<typeof IdentifyFoodAndExtractNutritionalDataOutputSchema>;

export async function identifyFoodAndExtractNutritionalData(
  input: IdentifyFoodAndExtractNutritionalDataInput
): Promise<IdentifyFoodAndExtractNutritionalDataOutput> {
  return identifyFoodAndExtractNutritionalDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyFoodAndExtractNutritionalDataPrompt',
  input: {schema: IdentifyFoodAndExtractNutritionalDataInputSchema},
  output: {schema: IdentifyFoodAndExtractNutritionalDataOutputSchema},
  prompt: `You are an expert nutritionist. You will identify the food item in the image and extract its nutritional information.

  Analyze the following image of a food product and provide its nutritional information:
  Prioritize identifying food items that are commonly found or available in India.
  Image: {{media url=photoDataUri}}

  Here is the nutritional information you should extract:
  - Food Identification: Identify the food item and provide a confidence level (0-1).
  - Nutritional Information: Calories, protein, fat, carbohydrates, and serving size.
  - Allergens: A list of common allergens that may be present in the food item.
  `,
});

const identifyFoodAndExtractNutritionalDataFlow = ai.defineFlow(
  {
    name: 'identifyFoodAndExtractNutritionalDataFlow',
    inputSchema: IdentifyFoodAndExtractNutritionalDataInputSchema,
    outputSchema: IdentifyFoodAndExtractNutritionalDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
