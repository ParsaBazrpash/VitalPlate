'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { NutritionResult } from '@/types';

interface FoodAnalysis {
  id: string;
  image: string | null;
  isAnalyzing: boolean;
  results: NutritionResult | null;
  error: string | null;
}



export default function CaloriesFinder() {
  const [analyses, setAnalyses] = useState<FoodAnalysis[]>([
    {
      id: '1',
      image: null,
      isAnalyzing: false,
      results: null,
      error: null
    }
  ]);

  const addNewAnalysis = () => {
    setAnalyses(prev => [...prev, {
      id: String(Date.now()),
      image: null,
      isAnalyzing: false,
      results: null,
      error: null
    }]);
  };

  const removeAnalysis = (id: string) => {
    setAnalyses(prev => prev.filter(analysis => analysis.id !== id));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyses(prev => prev.map(analysis => 
      analysis.id === id 
        ? { ...analysis, isAnalyzing: true, error: null, image: URL.createObjectURL(file) }
        : analysis
    ));

    try {
      const base64 = await convertToBase64(file);
      
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze food');
      }

      setAnalyses(prev => prev.map(analysis => 
        analysis.id === id 
          ? { ...analysis, isAnalyzing: false, results: data }
          : analysis
      ));

    } catch (err) {
      setAnalyses(prev => prev.map(analysis => 
        analysis.id === id 
          ? { ...analysis, isAnalyzing: false, error: err instanceof Error ? err.message : 'Failed to analyze image' }
          : analysis
      ));
      console.error('Error:', err);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const prepareChartData = () => {
    const completedAnalyses = analyses.filter(a => a.results !== null);
    
    if (completedAnalyses.length === 0) return [];
  
    return [
      {
        name: 'Calories',
        ...completedAnalyses.reduce((acc, analysis) => {
          if (analysis.results) {
            acc[analysis.results.name] = analysis.results.calories;
          }
          return acc;
        }, {} as Record<string, number>)
      },
      {
        name: 'Protein (g)',
        ...completedAnalyses.reduce((acc, analysis) => {
          if (analysis.results) {
            acc[analysis.results.name] = analysis.results.protein;
          }
          return acc;
        }, {} as Record<string, number>)
      },
      {
        name: 'Carbs (g)',
        ...completedAnalyses.reduce((acc, analysis) => {
          if (analysis.results) {
            acc[analysis.results.name] = analysis.results.carbs;
          }
          return acc;
        }, {} as Record<string, number>)
      }
    ];
  };

  const preparePieChartData = (metric: 'calories' | 'protein' | 'carbs') => {
    return analyses
      .filter(analysis => analysis.results)
      .map(analysis => ({
        name: analysis.results!.name,
        value: metric === 'calories' ? analysis.results!.calories :
               metric === 'protein' ? analysis.results!.protein :
               analysis.results!.carbs
      }));
  };

  const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#059669'];

  const getColorScale = (index: number): string => {
    return COLORS[index % COLORS.length];
  };

  const chartData = prepareChartData();
  const completedAnalyses = analyses.filter(a => a.results !== null);
  const totalCalories = completedAnalyses.reduce((sum, analysis) => 
    sum + (analysis.results?.calories || 0), 0
  );
  const totalProtein = completedAnalyses.reduce((sum, analysis) => 
    sum + (analysis.results?.protein || 0), 0
  );
  const totalCarbs = completedAnalyses.reduce((sum, analysis) => 
    sum + (analysis.results?.carbs || 0), 0
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2 text-blue-800">
          Calories Finder
        </h1>
        <p className="text-l font-bold text-center mb-6 text-gray-600">One dish per photo</p>

        <div className="flex justify-center mb-8">
          <button
            onClick={addNewAnalysis}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Another Dish
          </button>
        </div>

        <div className={`grid ${analyses.length === 1 ? 'place-items-center' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-6 mb-8`}>
          {analyses.map((analysis) => (
            <div key={analysis.id} className={`relative ${analyses.length === 1 ? 'w-full max-w-md' : 'w-full'}`}>
              {analyses.length > 1 && (
                <button
                  onClick={() => removeAnalysis(analysis.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 z-10 hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              <div className="mb-4">
                <label 
                  htmlFor={`image-upload-${analysis.id}`}
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-white hover:bg-blue-50 transition-colors border-blue-300"
                >
                  {analysis.image ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={analysis.image}
                        alt="Selected food"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-2 text-sm text-blue-800">
                        <span className="font-semibold">Click to upload</span>
                      </p>
                      <p className="text-xs text-blue-600">PNG, JPG or JPEG</p>
                    </div>
                  )}
                  <input
                    id={`image-upload-${analysis.id}`}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, analysis.id)}
                  />
                </label>
              </div>

              {analysis.isAnalyzing && (
                <div className="text-center p-4 bg-blue-50 rounded-lg mb-4">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-blue-600">Analyzing your food...</p>
                </div>
              )}

              {analysis.error && (
                <div className="text-center p-4 bg-red-50 rounded-lg mb-4">
                  <p className="text-red-600">{analysis.error}</p>
                </div>
              )}

              {analysis.results && (
                <div className="bg-white rounded-lg shadow-lg p-4 border border-blue-100">
                  <h2 className="text-lg font-semibold mb-3 text-blue-800">{analysis.results.name}</h2>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <p className="text-xl font-bold text-blue-700">{analysis.results.calories}</p>
                      <p className="text-xs text-blue-600">Calories</p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <p className="text-xl font-bold text-blue-700">{analysis.results.protein}g</p>
                      <p className="text-xs text-blue-600">Protein</p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <p className="text-xl font-bold text-blue-700">{analysis.results.carbs}g</p>
                      <p className="text-xs text-blue-600">Carbs</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <h3 className="font-semibold mb-1 text-blue-800">Detected Foods:</h3>
                      <ul className="list-disc list-inside text-blue-600">
                        {analysis.results.ingredients?.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-1 text-blue-800">Serving Size:</h3>
                      <p className="text-blue-600">
                        {analysis.results.servingSize} {analysis.results.servingSizeUnit}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {completedAnalyses.length > 1 && (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-100 mt-8">
              <h2 className="text-xl font-semibold mb-6 text-blue-800 text-center">
                Nutritional Comparison
              </h2>
              
              {/* Bar Chart */}
              <div className="w-full h-[400px] mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip />
                    <Legend />
                    {completedAnalyses.map((analysis, index) => (
                      analysis.results && (
                        <Bar
                          key={analysis.id}
                          dataKey={analysis.results.name}
                          fill={getColorScale(index)}
                        />
                      )
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Charts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                {/* Calories Pie Chart */}
                <div className="h-[300px]">
                  <h3 className="text-lg font-semibold text-center text-blue-800 mb-4">Calories Distribution</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={preparePieChartData('calories')}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {preparePieChartData('calories').map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Protein Pie Chart */}
                {/* Protein Pie Chart */}
                <div className="h-[300px]">
                  <h3 className="text-lg font-semibold text-center text-blue-800 mb-4">Protein Distribution (g)</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={preparePieChartData('protein')}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}g`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {preparePieChartData('protein').map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Carbs Pie Chart */}
                <div className="h-[300px]">
                  <h3 className="text-lg font-semibold text-center text-blue-800 mb-4">Carbs Distribution (g)</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={preparePieChartData('carbs')}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}g`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {preparePieChartData('carbs').map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-100 mt-8">
              <h2 className="text-xl font-semibold mb-6 text-blue-800 text-center">
                Total Nutrition
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">{totalCalories}</p>
                  <p className="text-sm text-blue-600">Total Calories</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">{totalProtein}g</p>
                  <p className="text-sm text-blue-600">Total Protein</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-700">{totalCarbs}g</p>
                  <p className="text-sm text-blue-600">Total Carbs</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}