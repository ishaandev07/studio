"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, ActivitySquare, Droplet, Wheat, Utensils, AlertTriangle, Percent, ThumbsUp } from "lucide-react"; // Replaced Beef with ActivitySquare, CheckSquare with ThumbsUp

export interface NutritionData {
  source: 'barcode' | 'image';
  itemName: string;
  servingSize?: string;
  calories?: string;
  protein?: string;
  fat?: string;
  saturatedFat?: string; 
  transFat?: string; 
  cholesterol?: string;
  sodium?: string;
  carbohydrates?: string;
  fiber?: string;
  sugar?: string;
  allergens?: string[] | string; 
  confidenceLevel?: number; 
}

interface NutritionDisplayProps {
  data: NutritionData;
}

const NutrientItem: React.FC<{ icon: React.ElementType; label: string; value?: string; unit?: string }> = ({ icon: Icon, label, value, unit }) => {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
      <div className="flex items-center">
        <Icon className="h-5 w-5 mr-3 text-primary" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm text-foreground">{value}{unit}</span>
    </div>
  );
};

export function NutritionDisplay({ data }: NutritionDisplayProps) {
  const allergensArray = typeof data.allergens === 'string' 
    ? data.allergens.split(',').map(a => a.trim()).filter(a => a && a.toLowerCase() !== 'none') 
    : (Array.isArray(data.allergens) ? data.allergens.filter(a => a && a.toLowerCase() !== 'none') : []);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-3xl font-bold text-center text-primary">{data.itemName}</CardTitle>
        {data.source === 'image' && data.confidenceLevel !== undefined && (
          <div className="flex items-center justify-center mt-1">
            <ThumbsUp className="h-4 w-4 mr-1 text-secondary" />
            <CardDescription>
              Identification Confidence: {(data.confidenceLevel * 100).toFixed(0)}%
            </CardDescription>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <NutrientItem icon={Utensils} label="Serving Size" value={data.servingSize} />
        
        <Card className="bg-secondary/20">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-xl">Macronutrients</CardTitle>
          </CardHeader>
          <CardContent>
            <NutrientItem icon={Flame} label="Calories" value={data.calories} unit=" kcal" />
            <NutrientItem icon={ActivitySquare} label="Protein" value={data.protein} unit="g" />
            <NutrientItem icon={Droplet} label="Total Fat" value={data.fat} unit="g" />
            {data.source === 'barcode' && data.saturatedFat && <NutrientItem icon={Droplet} label="Saturated Fat" value={data.saturatedFat} unit="g" />}
            {data.source === 'barcode' && data.transFat && <NutrientItem icon={Droplet} label="Trans Fat" value={data.transFat} unit="g" />}
            <NutrientItem icon={Wheat} label="Carbohydrates" value={data.carbohydrates} unit="g" />
            {data.source === 'barcode' && data.fiber && <NutrientItem icon={Wheat} label="Dietary Fiber" value={data.fiber} unit="g" />}
            {data.source === 'barcode' && data.sugar && <NutrientItem icon={Wheat} label="Total Sugars" value={data.sugar} unit="g" />}
          </CardContent>
        </Card>

        {data.source === 'barcode' && (data.cholesterol || data.sodium) && (
          <Card className="bg-secondary/20">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-xl">Micronutrients & Other</CardTitle>
            </CardHeader>
            <CardContent>
              {data.cholesterol && <NutrientItem icon={Percent} label="Cholesterol" value={data.cholesterol} unit="mg" />}
              {data.sodium && <NutrientItem icon={Percent} label="Sodium" value={data.sodium} unit="mg" />}
            </CardContent>
          </Card>
        )}

        {allergensArray.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
              Potential Allergens
            </h3>
            <div className="flex flex-wrap gap-2">
              {allergensArray.map((allergen, index) => (
                <Badge key={index} variant="destructive" className="text-sm">{allergen}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground text-center w-full">
          Nutritional information is AI-generated and may not be 100% accurate. Always verify with product packaging for critical dietary needs.
        </p>
      </CardFooter>
    </Card>
  );
}
