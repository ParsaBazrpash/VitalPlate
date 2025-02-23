// types/index.ts
export interface NutritionResult {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: string[];
    confidence: number;
    servingSize: number;
    servingSizeUnit: string;
  }
  
  export interface ApiError {
    error: string;
  }