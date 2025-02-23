'use client';


import React, { useState, useEffect, JSX} from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AnimatedMessage from '../components/AnimatedMessage';


interface Recipe {
 name: string;
 description: string;
 link?: string;
}


interface FoodRecommendation {
 foods: string[];
 avoid?: string[];
 recipes: Recipe[];
}


interface FoodRecommendations {
 [key: string]: FoodRecommendation;
}


interface MessageProps {
 type: 'user' | 'bot';
 message: string | JSX.Element;
}


const HealthFoodRecommender: React.FC = () => {
 const [userInput, setUserInput] = useState<string>('');
 const [chatHistory, setChatHistory] = useState<MessageProps[]>([]);
 const [error, setError] = useState<string | null>(null);
 const [foodRecommendations, setFoodRecommendations] = useState<FoodRecommendations | null>(null);


 const symptomKeywords = {
   'headache': ['headache', 'migraine', 'head ache', 'head hurts', 'head pain', 'head is pounding'],
   'stomach ache': ['stomach', 'nausea', 'stomach ache', 'tummy ache', 'digestive', 'tummy', 'gut', 'belly'],
   'sore throat': ['throat', 'sore throat', 'strep', 'scratchy throat', 'throat pain'],
   'fever': ['fever', 'temperature', 'hot', 'chills', 'feverish'],
   'cold': ['cold', 'congestion', 'stuffy', 'runny nose', 'sneezing', 'cough'],
   'pregnant': ['pregnant', 'pregnancy', 'expecting'],
   'vegan': ['vegan', 'plant based'],
   'vegetarian': ['vegetarian', 'veggie'],
   'gluten free': ['gluten free', 'gluten-free', 'celiac', 'coeliac']
 };


 useEffect(() => {
   const loadFoodRecommendations = async () => {
     try {
       const response = await fetch('/food_recommendations.json');
       if (!response.ok) throw new Error('Failed to fetch food recommendations');
       const data = await response.json();
       setFoodRecommendations(data);
     } catch (err) {
       console.error('Error loading food recommendations:', err);
       setError('Oops! Having trouble loading recommendations. Give it another try?');
     }
   };


   loadFoodRecommendations();
 }, []);


 const detectSymptoms = (input: string): string[] => {
    try {
      const inputLower = input.toLowerCase();
      const normalizedInput = inputLower.replace(/\s+/g, ' ').trim();
      
      return Object.entries(symptomKeywords)
        .filter(([, keywords]) =>
          keywords.some(keyword => normalizedInput.includes(keyword))
        )
        .map(([symptom]) => symptom);
    } catch (err) {
      console.error('Error detecting symptoms:', err);
      return [];
    }
  };
  


 const generateResponse = (detectedSymptoms: string[]): MessageProps => {
   try {
     if (!foodRecommendations) {
       return {
         type: 'bot',
         message: "Just a moment! I'm getting everything ready to help you..."
       };
     }


     if (detectedSymptoms.length === 0) {
       return {
         type: 'bot',
         message: (
           <div className="space-y-2">
             <p>I am not quite sure what you are looking for. Could you tell me more? For example:</p>
             <ul className="list-disc pl-4 text-gray-600 text-sm">
                <li>&quot;I have a headache and feel sick&quot;</li>
               <li>&quot;I am looking for vegan recipes&quot;</li>
               <li>&quot;Need gluten-free meal ideas&quot;</li>
             </ul>
           </div>
         )
       };
     }


     const recommendations = detectedSymptoms
       .filter(symptom => foodRecommendations[symptom])
       .map(symptom => ({
         symptom,
         ...foodRecommendations[symptom]
       }));


     if (recommendations.length === 0) {
       return {
         type: 'bot',
         message: "I don't have specific food suggestions for that, but staying hydrated is always helpful!"
       };
     }


     return {
       type: 'bot',
       message: (
         <div className="space-y-3">
           {recommendations.map((rec, index) => (
             <div key={index} className="space-y-2">
               <p className="font-medium text-blue-700">
                 {rec.symptom === 'pregnant' ? 'For pregnancy, consider these foods:' :
                  rec.symptom === 'vegan' ? 'Recommended vegan foods:' :
                  rec.symptom === 'vegetarian' ? 'Recommended vegetarian foods:' :
                  rec.symptom === 'gluten-free' ? 'Recommended gluten-free foods:' :
                  `For your ${rec.symptom}, try these foods:`}
               </p>
               <ul className="list-disc pl-4 text-gray-600 text-sm">
                 {rec.foods.map((food, idx) => (
                   <li key={`food-${idx}`}>{food}</li>
                 ))}
               </ul>
              
               {rec.avoid && rec.avoid.length > 0 && (
                 <>
                   <p className="font-medium text-blue-700 mt-2">Maybe skip these for now:</p>
                   <ul className="list-disc pl-4 text-gray-600 text-sm">
                     {rec.avoid.map((food, idx) => (
                       <li key={`avoid-${idx}`}>{food}</li>
                     ))}
                   </ul>
                 </>
               )}


               <p className="font-medium text-blue-700 mt-2">Recipe suggestions:</p>
               <div className="grid grid-cols-1 gap-2">
                 {rec.recipes.map((recipe, idx) => (
                   <div
                     key={`recipe-${idx}`}
                     className="p-2 rounded bg-blue-50 hover:bg-blue-100 text-sm"
                   >
                     <p className="font-medium text-blue-600">{recipe.name}</p>
                     <p className="text-xs text-gray-600">{recipe.description}</p>
                   </div>
                 ))}
               </div>
             </div>
           ))}
           <div className="bg-yellow-50 border border-yellow-100 p-2 rounded text-sm mt-2">
             <p className="text-yellow-700">
               Remember to drink plenty of water! If you are not feeling better soon, it is best to check with a healthcare provider. 💙
             </p>
           </div>
         </div>
       )
     };
   } catch (err) {
     console.error('Error generating response:', err);
     return {
       type: 'bot',
       message: 'Oops! Something went wrong. Could you try asking that again?'
     };
   }
 };


 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
   e.preventDefault();
   setError(null);


   try {
     if (!userInput.trim()) return;


     const userMessage: MessageProps = {
       type: 'user',
       message: userInput.trim()
     };


     const detectedSymptoms = detectSymptoms(userInput);
     const botResponse = generateResponse(detectedSymptoms);


     setChatHistory(prev => [...prev, userMessage, botResponse]);
     setUserInput('');
   } catch (err) {
     console.error('Error handling submission:', err);
     setError('Oops! Something went wrong. Mind trying again?');
   }
 };


 return (
   <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
     <div className="max-w-2xl mx-auto px-4 py-6">
       <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
         <ArrowLeft className="w-4 h-4" />
         <span>Back</span>
       </Link>


       <div className="bg-white rounded-lg shadow-lg border border-gray-100">
         <div className="p-4 border-b border-gray-100">
           <h1 className="text-lg font-bold text-blue-800">Hey there! 👋</h1>
           <p className="text-sm text-gray-600">
             Tell me how you are feeling or what type of food recommendations you are looking for!
           </p>
         </div>


         <div className="p-4">
           <div className="h-96 overflow-y-auto space-y-3 mb-4 custom-scrollbar">
             {chatHistory.length === 0 && (
               <div className="text-gray-500 text-center p-4 text-sm">
                 How can I help you today? 😊
               </div>
             )}
             {chatHistory.map((chat, index) => (
               <div
                 key={index}
                 className={`p-3 rounded-lg ${
                   chat.type === 'user'
                     ? 'bg-blue-50 ml-auto max-w-[80%] text-black'
                     : 'bg-gray-50 mr-auto max-w-[80%] text-black'
                 }`}
               >
                 <AnimatedMessage message={chat.message} />
               </div>
             ))}
             {error && (
               <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                 {error}
               </div>
             )}
           </div>
          
           <form onSubmit={handleSubmit} className="flex gap-2">
             <input
               type="text"
               value={userInput}
               onChange={(e) => setUserInput(e.target.value)}
               placeholder="How are you feeling? Or what diet are you following?"
               className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black"
               maxLength={500}
             />
             <button
               type="submit"
               className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
               disabled={!userInput.trim()}
             >
               <Send className="w-4 h-4" />
             </button>
           </form>
         </div>
       </div>
     </div>
   </div>
 );
};


export default HealthFoodRecommender;
