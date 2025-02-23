"use client";

import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { 
  LineChart, Line, 
  BarChart, Bar,
  PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { AlertCircle, Sun, CheckCircle } from "lucide-react";

import { auth, db } from "../config/firebase";

type Mood = "happy" | "neutral" | "sad";
type Meal = "breakfast" | "lunch" | "dinner";

interface MealData {
  mood: Mood;
  food: string;
}

interface CheckInData {
  id?: string;
  userId?: string;
  date: string;
  breakfast: MealData;
  lunch: MealData;
  dinner: MealData;
  symptoms: string[];
  progress: number;
}

interface ChartProps {
  checkIns: CheckInData[];
}

const HealthCharts: React.FC<ChartProps> = ({ checkIns }) => {
  // Symptom Frequency Analysis
  const getSymptomStats = () => {
    const stats: Record<string, number> = {};
    checkIns.forEach(entry => {
      entry.symptoms.forEach(symptom => {
        stats[symptom] = (stats[symptom] || 0) + 1;
      });
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  };

  // Mood Distribution Analysis
  const getMoodStats = () => {
    const moodCount = { happy: 0, neutral: 0, sad: 0 };
    checkIns.forEach(entry => {
      ['breakfast', 'lunch', 'dinner'].forEach(meal => {
        moodCount[entry[meal as Meal].mood]++;
      });
    });
    return Object.entries(moodCount).map(([name, value]) => ({ name, value }));
  };

  // Daily Mood Pattern
  const getMoodPattern = () => {
    const mealScores: Record<string, number> = { breakfast: 0, lunch: 0, dinner: 0 };
    const moodValues = { happy: 1, neutral: 0, sad: -1 };
    
    checkIns.forEach(entry => {
      ['breakfast', 'lunch', 'dinner'].forEach(meal => {
        mealScores[meal] += moodValues[entry[meal as Meal].mood];
      });
    });

    return Object.entries(mealScores).map(([name, value]) => ({
      name,
      score: value / checkIns.length
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Symptom Distribution */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-blue-800">Symptom Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getSymptomStats()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mood Distribution */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-blue-800">Overall Mood Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={getMoodStats()}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {getMoodStats().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Meal Mood Pattern */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-blue-800">Daily Mood Pattern</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={getMoodPattern()}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              <Radar
                name="Mood Score"
                dataKey="score"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Progress Trends */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-blue-800">Weekly Progress Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={checkIns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="progress" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ fill: '#2563eb' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default function HealthAnalytics() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [newCheckIn, setNewCheckIn] = useState<Omit<CheckInData, "date" | "userId">>({
    breakfast: { mood: "neutral", food: "" },
    lunch: { mood: "neutral", food: "" },
    dinner: { mood: "neutral", food: "" },
    symptoms: [],
    progress: 5,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchCheckIns(currentUser.uid);
    } else {
      setCheckIns([]);
    }
  }, [currentUser]);

  const fetchCheckIns = async (uid: string) => {
    const q = query(collection(db, "checkIns"), where("userId", "==", uid));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CheckInData[];
    setCheckIns(data);
  };

  const handleSaveCheckIn = async () => {
    if (!currentUser) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const dataToSave: CheckInData = {
      userId: currentUser.uid,
      date: dateStr,
      ...newCheckIn,
    };
    await addDoc(collection(db, "checkIns"), dataToSave);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
    setNewCheckIn({
      breakfast: { mood: "neutral", food: "" },
      lunch: { mood: "neutral", food: "" },
      dinner: { mood: "neutral", food: "" },
      symptoms: [],
      progress: 5,
    });
    fetchCheckIns(currentUser.uid);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">You must be signed in to view this page.</p>
      </div>
    );
  }

  const getMoodEmoji = (mood: Mood) => {
    if (mood === "happy") return "😊";
    if (mood === "sad") return "😔";
    return "😐";
  };

  const getMotivationalMessage = (progress: number) => {
    if (progress >= 8) return "Amazing progress! Keep up the great work!";
    if (progress >= 6) return "You're doing well! Stay consistent.";
    return "Every small step counts. Let's focus on tomorrow!";
  };

  const meals: Meal[] = ["breakfast", "lunch", "dinner"];
  const symptomsList = ["Headache", "Nausea", "Fatigue", "Bloating", "Acid Reflux"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {showNotification && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-xl flex items-center space-x-3 max-w-md">
              <CheckCircle className="w-6 h-6" />
              <p className="text-lg font-medium">Great job! Your progress has been saved. Keep up the amazing work!</p>
            </div>
          </div>
        )}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-800 sm:text-5xl">
            Health Analytics Dashboard
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            Track your health journey and monitor your daily progress
          </p>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Sun className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-semibold text-blue-800">Daily Check-in</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {meals.map((meal) => (
              <div key={meal}>
                <h3 className="capitalize font-semibold text-gray-700 mb-2">
                  {meal}
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="What did you eat?"
                    className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-black"
                    value={newCheckIn[meal].food}
                    onChange={(e) =>
                      setNewCheckIn((prev) => ({
                        ...prev,
                        [meal]: { ...prev[meal], food: e.target.value },
                      }))
                    }
                  />
                  <select
                    className="border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3"
                    value={newCheckIn[meal].mood}
                    onChange={(e) =>
                      setNewCheckIn((prev) => ({
                        ...prev,
                        [meal]: {
                          ...prev[meal],
                          mood: e.target.value as Mood,
                        },
                      }))
                    }
                  >
                    <option value="happy">😊</option>
                    <option value="neutral">😐</option>
                    <option value="sad">😔</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="font-semibold text-gray-700 mb-3">Symptoms</h3>
            <div className="flex flex-wrap gap-2">
              {symptomsList.map((symptom) => (
                <button
                  key={symptom}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    newCheckIn.symptoms.includes(symptom)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => {
                    setNewCheckIn((prev) => {
                      const hasSymptom = prev.symptoms.includes(symptom);
                      return {
                        ...prev,
                        symptoms: hasSymptom
                          ? prev.symptoms.filter((s) => s !== symptom)
                          : [...prev.symptoms, symptom],
                      };
                    });
                  }}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold text-gray-700 mb-3">
              How do you feel about your progress today?
            </h3>
            <input
              type="range"
              min="0"
              max="10"
              value={newCheckIn.progress}
              onChange={(e) =>
                setNewCheckIn((prev) => ({
                  ...prev,
                  progress: parseInt(e.target.value),
                }))
              }
              className="w-full mt-2"
            />
            <div className="text-center mt-4 text-blue-600 font-medium text-lg">
              {getMotivationalMessage(newCheckIn.progress)}
            </div>
          </div>

          <button
            onClick={handleSaveCheckIn}
            className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Save Daily Check-in
          </button>
        </div>

        {/* Analytics Dashboard Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-800 mb-6">
            Analytics Dashboard
          </h2>
          <HealthCharts checkIns={checkIns} />
        </div>

        {/* Recent History Section */}
        <div className="bg-white rounded-lg p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-2xl font-semibold text-blue-800 mb-6">
            Recent History
          </h2>
          <div className="space-y-6">
            {checkIns.map((entry) => (
              <div key={entry.id} className="border-b border-gray-100 pb-6">
                <div className="font-semibold text-gray-700 mb-3">
                  {entry.date}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["breakfast", "lunch", "dinner"].map((meal) => {
                    const mealData = entry[meal as Meal];
                    return (
                      <div key={meal} className="flex items-center gap-2 text-gray-600">
                        <span className="capitalize font-medium">{meal}:</span>
                        <span>{mealData.food}</span>
                        <span>{getMoodEmoji(mealData.mood)}</span>
                      </div>
                    );
                  })}
                </div>
                {entry.symptoms.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-gray-600">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span>Symptoms: {entry.symptoms.join(", ")}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
