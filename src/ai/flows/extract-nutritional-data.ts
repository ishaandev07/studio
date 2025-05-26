
'use server';
/**
 * @fileOverview Flow for extracting nutritional information from a product barcode.
 *
 * - extractNutritionalData - A function that handles the extraction of nutritional data from a barcode.
 * - ExtractNutritionalDataInput - The input type for the extractNutritionalData function.
 * - ExtractNutritionalDataOutput - The return type for the extractNutritionalData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractNutritionalDataInputSchema = z.object({
  barcode: z.string().describe('The barcode of the product to look up.'),
});
export type ExtractNutritionalDataInput = z.infer<typeof ExtractNutritionalDataInputSchema>;

const ExtractNutritionalDataOutputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  servingSize: z.string().describe('The serving size of the product.'),
  calories: z.string().describe('The number of calories per serving.'),
  fat: z.string().describe('The amount of fat per serving.'),
  saturatedFat: z.string().describe('The amount of saturated fat per serving.'),
  transFat: z.string().describe('The amount of trans fat per serving.'),
  cholesterol: z.string().describe('The amount of cholesterol per serving.'),
  sodium: z.string().describe('The amount of sodium per serving.'),
  carbohydrates: z.string().describe('The amount of carbohydrates per serving.'),
  fiber: z.string().describe('The amount of fiber per serving.'),
  sugar: z.string().describe('The amount of sugar per serving.'),
  protein: z.string().describe('The amount of protein per serving.'),
  allergens: z.string().describe('A comma-separated list of allergens contained in the product.'),
});
export type ExtractNutritionalDataOutput = z.infer<typeof ExtractNutritionalDataOutputSchema>;

export async function extractNutritionalData(input: ExtractNutritionalDataInput): Promise<ExtractNutritionalDataOutput> {
  return extractNutritionalDataFlow(input);
}

const lookupBarcodeTool = ai.defineTool(
  {
    name: 'lookupBarcode',
    description: 'Looks up product information based on a barcode.',
    inputSchema: z.object({
      barcode: z.string().describe('The barcode to look up.')
    }),
    outputSchema: z.object({
      productName: z.string().describe('The name of the product.'),
      servingSize: z.string().describe('The serving size of the product.'),
      calories: z.string().describe('The number of calories per serving.'),
      fat: z.string().describe('The amount of fat per serving.'),
      saturatedFat: z.string().describe('The amount of saturated fat per serving.'),
      transFat: z.string().describe('The amount of trans fat per serving.'),
      cholesterol: z.string().describe('The amount of cholesterol per serving.'),
      sodium: z.string().describe('The amount of sodium per serving.'),
      carbohydrates: z.string().describe('The amount of carbohydrates per serving.'),
      fiber: z.string().describe('The amount of fiber per serving.'),
      sugar: z.string().describe('The amount of sugar per serving.'),
      protein: z.string().describe('The amount of protein per serving.'),
      allergens: z.string().describe('A comma-separated list of allergens contained in the product.')
    }),
  },
  async (input) => {
    // TODO: Implement this function to call an external API or database to look up nutritional information by barcode.
    // This is a placeholder; replace with actual implementation.
    console.log("Looking up barcode: " + input.barcode);
    return {
      productName: 'Example Product',
      servingSize: '100g',
      calories: '200',
      fat: '10g',
      saturatedFat: '5g',
      transFat: '0g',
      cholesterol: '0mg',
      sodium: '100mg',
      carbohydrates: '20g',
      fiber: '5g',
      sugar: '10g',
      protein: '5g',
      allergens: 'None'
    };
  }
);

const extractNutritionalDataPrompt = ai.definePrompt({
  name: 'extractNutritionalDataPrompt',
  tools: [lookupBarcodeTool],
  input: {schema: ExtractNutritionalDataInputSchema},
  output: {schema: ExtractNutritionalDataOutputSchema},
  prompt: `Extract the nutritional information for the given barcode. Use the lookupBarcode tool to find the information.
Prioritize finding nutritional information for products that are available in India.
Barcode: {{{barcode}}}

If you cannot find the nutritional information, return a message saying that the information could not be found.`
});

const extractNutritionalDataFlow = ai.defineFlow(
  {
    name: 'extractNutritionalDataFlow',
    inputSchema: ExtractNutritionalDataInputSchema,
    outputSchema: ExtractNutritionalDataOutputSchema,
  },
  async input => {
    const {output} = await extractNutritionalDataPrompt(input);
    return output!;
  }
);
