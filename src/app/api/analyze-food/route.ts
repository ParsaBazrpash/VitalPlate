import { NextResponse } from 'next/server';

// Interfaces for Clarifai API response
interface ClarifaiConcept {
  id: string;
  name: string;
  value: number;
}

interface ClarifaiOutputData {
  concepts: ClarifaiConcept[];
}

interface ClarifaiOutput {
  data: ClarifaiOutputData;
}

interface ClarifaiResponse {
  outputs: ClarifaiOutput[];
}

// Interfaces for USDA API response
interface FoodNutrient {
  nutrientName: string;
  value: number;
}

interface FoodData {
  description: string;
  foodNutrients: FoodNutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
}

interface USDAResponse {
  foods: FoodData[];
}

// Interface for the request body
interface AnalyzeFoodRequest {
  image: string;
}

// Helper function to find nutrient values
function findNutrient(nutrients: FoodNutrient[], name: string): number {
  const nutrient = nutrients.find(n => n.nutrientName.includes(name));
  return nutrient ? Math.round(nutrient.value) : 0;
}

export async function POST(request: Request) {
  try {
    const { image } = (await request.json()) as AnalyzeFoodRequest;

    // 1. Identify the food using Clarifai
    const clarifaiResponse = await fetch(
      `https://api.clarifai.com/v2/models/food-item-recognition/outputs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Key fb1b19a718b14263b89ca3e8f00c160c`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: [
            {
              data: {
                image: {
                  base64: image.split(',')[1]
                }
              }
            }
          ]
        })
      }
    );

    const clarifaiData = (await clarifaiResponse.json()) as ClarifaiResponse;

    if (!clarifaiResponse.ok) {
      throw new Error('Failed to identify food');
    }

    // Extract food items with high confidence
    const foods = clarifaiData.outputs[0].data.concepts
      .filter((concept: ClarifaiConcept) => concept.value > 0.9)
      .map((concept: ClarifaiConcept) => concept.name);

    if (foods.length === 0) {
      throw new Error('No food items detected');
    }

    // 2. Get nutritional information from USDA
    const usdaResponse = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=WavWYq1Wfx1eINc2TV0ibQQAu0f2GzWQzGWSb225&query=${foods[0]}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!usdaResponse.ok) {
      throw new Error('Failed to get nutritional information');
    }

    const usdaData = (await usdaResponse.json()) as USDAResponse;

    if (!usdaData.foods || usdaData.foods.length === 0) {
      throw new Error('No nutritional information found');
    }

    // Get the first food item's nutritional data
    const foodData = usdaData.foods[0];

    // 3. Format the response
    const response = {
      name: foodData.description,
      calories: findNutrient(foodData.foodNutrients, 'Energy'),
      protein: findNutrient(foodData.foodNutrients, 'Protein'),
      carbs: findNutrient(foodData.foodNutrients, 'Carbohydrate'),
      fat: findNutrient(foodData.foodNutrients, 'Total lipid (fat)'),
      ingredients: foods,
      confidence: Math.round(clarifaiData.outputs[0].data.concepts[0].value * 100),
      servingSize: foodData.servingSize || 100,
      servingSizeUnit: foodData.servingSizeUnit || 'g'
    };

    return NextResponse.json(response);

  } catch (error: unknown) {
    console.error('Error analyzing food:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Failed to analyze food' },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to analyze food' }, { status: 500 });
  }
}
