"use client"
import React, { useState, useEffect } from 'react';
import { 
  X,
  Mail,
  Lock
} from 'lucide-react';
import Image from 'next/image';

interface FloatingShapeProps {
  className: string;
}

const FloatingShape: React.FC<FloatingShapeProps> = ({ className }) => (
  <div className={`absolute rounded-full mix-blend-multiply filter blur-xl animate-float ${className}`}></div>
);

const CardBackground: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden rounded-lg">
    <FloatingShape className="w-16 h-16 sm:w-24 sm:h-24 bg-blue-400/20 top-0 left-0" />
    <FloatingShape className="w-12 h-12 sm:w-20 sm:h-20 bg-purple-400/20 bottom-0 right-0" />
    <FloatingShape className="w-10 h-10 sm:w-16 sm:h-16 bg-pink-400/20 top-1/2 left-1/4" />
    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
  </div>
);

const LandingPage: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      setMousePosition({
        x: (clientX / window.innerWidth) * 20,
        y: (clientY / window.innerHeight) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      // Here you would typically make an API call to authenticate
      // For now, we'll just close the modal and reset fields
      setIsLoginOpen(false);
      setEmail('');
      setPassword('');
    } catch {
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      {/* Background shapes */}
      <div className="fixed inset-0 overflow-hidden">
        <FloatingShape className="w-48 h-48 sm:w-96 sm:h-96 bg-blue-400/30 top-0 left-0" />
        <FloatingShape className="w-48 h-48 sm:w-96 sm:h-96 bg-purple-400/30 bottom-0 right-0" />
        <FloatingShape className="w-40 h-40 sm:w-80 sm:h-80 bg-pink-400/30 top-1/2 left-1/4" />
        <FloatingShape className="w-32 h-32 sm:w-64 sm:h-64 bg-indigo-400/30 top-1/4 right-1/4" />
        <FloatingShape className="w-32 h-32 sm:w-64 sm:h-64 bg-sky-400/30 bottom-1/4 left-1/3" />
        <FloatingShape className="w-16 h-16 sm:w-32 sm:h-32 bg-teal-400/30 top-1/3 right-1/3" />
        <FloatingShape className="w-16 h-16 sm:w-32 sm:h-32 bg-cyan-400/30 bottom-1/3 left-1/2" />

        <div 
          className="absolute w-full h-full bg-gradient-radial from-blue-200/20 to-transparent"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            transition: 'transform 0.2s ease-out',
          }}
        />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-blue-800">
              Your Personal Health Companion
            </h1>
            <p className="mt-3 max-w-md mx-auto text-sm sm:text-base md:text-lg text-gray-800 md:mt-5 md:max-w-3xl">
              Take control of your health journey with our comprehensive suite of tools and services.
            </p>
          </div>

          {/* Features Section */}
          <div className="mt-12 sm:mt-20 space-y-8 sm:space-y-12">
            {/* AI Health Assistant */}
            <div className="relative flex flex-col md:flex-row items-center gap-4 sm:gap-8 rounded-lg p-4 sm:p-8 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardBackground />
              <div className="relative z-10 w-full md:w-1/3 max-w-[200px] mx-auto md:max-w-none">
                <Image
                  src="/images/AIimage.png"
                  alt="AI Health Assistant" 
                  width={400}
                  height={300}
                  className="rounded-lg w-full h-40 sm:h-auto object-cover shadow-lg"
                />
              </div>
              <div className="relative z-10 w-full md:w-1/2 space-y-2 sm:space-y-4 text-center md:text-left">
                <h3 className="text-2xl sm:text-3xl font-semibold text-blue-800">
                  AI Health Assistant
                </h3>
                <p className="text-sm sm:text-lg text-gray-800">
                  Get instant answers to your health-related questions with our advanced chatbot. Our powered assistant is available 24/7 to provide reliable health information.
                </p>
                <a 
                  href="/chatbot" 
                  className="inline-block bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-xl text-sm sm:text-base"
                >
                  Try Chatbot
                </a>
              </div>
            </div>

            {/* Calories Finder */}
            <div className="relative flex flex-col md:flex-row items-center gap-4 sm:gap-8 rounded-lg p-4 sm:p-8 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardBackground />
              <div className="relative z-10 w-full md:w-1/3 max-w-[200px] mx-auto md:max-w-none">
                <Image
                  src="/images/calories.jpg"
                  alt="Calories Finder"
                  width={400}
                  height={300}
                  className="rounded-lg w-full h-40 sm:h-auto object-cover shadow-lg"
                />
              </div>
              <div className="relative z-10 w-full md:w-1/2 space-y-2 sm:space-y-4 text-center md:text-left">
                <h3 className="text-2xl sm:text-3xl font-semibold text-blue-800">
                  Calories Finder
                </h3>
                <p className="text-sm sm:text-lg text-gray-800">
                  Track your nutrition and find detailed caloric information for any food item. Our comprehensive database helps you make informed decisions about your diet.
                </p>
                <a 
                  href="/calories" 
                  className="inline-block bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-xl text-sm sm:text-base"
                >
                  Find Calories
                </a>
              </div>
            </div>

            {/* Health Analytics */}
            <div className="relative flex flex-col md:flex-row items-center gap-4 sm:gap-8 rounded-lg p-4 sm:p-8 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardBackground />
              <div className="relative z-10 w-full md:w-1/3 max-w-[200px] mx-auto md:max-w-none">
                <Image
                  src="/images/analytics.png"
                  alt="Health Analytics"
                  width={400}
                  height={300}
                  className="rounded-lg w-full h-40 sm:h-auto object-cover shadow-lg"
                />
              </div>
              <div className="relative z-10 w-full md:w-1/2 space-y-2 sm:space-y-4 text-center md:text-left">
                <h3 className="text-2xl sm:text-3xl font-semibold text-blue-800">
                  Health Analytics
                </h3>
                <p className="text-sm sm:text-lg text-gray-800">
                  Visualize your health progress with comprehensive analytics and insights. Track your fitness goals and monitor vital statistics.
                </p>
                <a 
                  href="/analytics" 
                  className="inline-block bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-xl text-sm sm:text-base"
                >
                  View Analytics
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-8 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Login</h2>
              <button
                onClick={() => setIsLoginOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(2%, 2%) rotate(5deg);
          }
          50% {
            transform: translate(-2%, 4%) rotate(-5deg);
          }
          75% {
            transform: translate(1%, -2%) rotate(3deg);
          }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-from), var(--tw-gradient-to) 70%);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;