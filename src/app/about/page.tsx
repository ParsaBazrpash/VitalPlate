"use client"
import React, { useState, useEffect } from 'react';
import { Heart, Users, Globe, Award } from 'lucide-react';
import Image from 'next/image';

interface FloatingShapeProps {
  className: string;
}

const FloatingShape: React.FC<FloatingShapeProps> = ({ className }) => (
  <div className={`absolute rounded-full mix-blend-multiply filter blur-xl animate-float ${className}`}></div>
);

const CardBackground: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden rounded-lg">
    <FloatingShape className="w-24 h-24 bg-blue-400/20 top-0 left-0" />
    <FloatingShape className="w-20 h-20 bg-purple-400/20 bottom-0 right-0" />
    <FloatingShape className="w-16 h-16 bg-pink-400/20 top-1/2 left-1/4" />
    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
  </div>
);

const AboutPage: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20,
        y: (e.clientY / window.innerHeight) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const teamMembers = [
    {
      name: "Parsa Bazrpash",
      role: "Team Member",
      image: "/images/parsa.jpg",
      description: "Full-stack developer and AI enthusiast"
    },
    {
      name: "Jaena Orozco",
      role: "Team Member",
      image: "/images/jaena.jpeg",
      description: "UI/UX specialist and frontend developer"
    },
    {
      name: "Vinay Nair",
      role: "Team Member",
      image: "/images/vinay.jpeg",
      description: "Backend developer and health tech innovator"
    },
    {
      name: "Aliza Karachiwalla",
      role: "Team Member",
      image: "/api/placeholder/120/120",
      description: "Full-stack developer and health analytics expert"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      {/* Background animations */}
      <div className="fixed inset-0 overflow-hidden">
        <FloatingShape className="w-96 h-96 bg-blue-400/30 top-0 left-0" />
        <FloatingShape className="w-96 h-96 bg-purple-400/30 bottom-0 right-0" />
        <FloatingShape className="w-80 h-80 bg-pink-400/30 top-1/2 left-1/4" />
        <FloatingShape className="w-64 h-64 bg-indigo-400/30 top-1/4 right-1/4" />
        
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-blue-800 sm:text-5xl md:text-6xl mb-6">
              About Us
            </h1>
            <p className="mt-3 max-w-3xl mx-auto text-xl text-gray-800">
              We are on a mission to revolutionize personal healthcare through innovative technology and human-centered design.
            </p>
          </div>

          {/* Our Story Section */}
          <div className="relative rounded-lg p-8 mb-16 overflow-hidden">
            <CardBackground />
            <div className="relative z-10">
              <h2 className="text-3xl font-semibold text-blue-800 mb-6">Our Story</h2>
              <p className="text-lg text-gray-800 mb-6">
                Created during the 2025 Axxess Hackathon, our team came together with a shared vision to revolutionize personal health management. We identified a crucial need for an integrated platform that combines chatbot assistance, calorie tracking, and health analytics in one seamless experience.
              </p>
              <p className="text-lg text-gray-800">
                Through intense collaboration and innovative thinking, we developed this comprehensive health platform to empower users with tools for better health management and decision-making.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="relative rounded-lg p-6 text-center">
              <CardBackground />
              <div className="relative z-10">
                <Heart className="w-12 h-12 text-blue-800 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Care</h3>
                <p className="text-gray-700">Putting your health and wellbeing first in everything we do</p>
              </div>
            </div>
            
            <div className="relative rounded-lg p-6 text-center">
              <CardBackground />
              <div className="relative z-10">
                <Users className="w-12 h-12 text-blue-800 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Community</h3>
                <p className="text-gray-700">Building a supportive environment for health and wellness</p>
              </div>
            </div>
            
            <div className="relative rounded-lg p-6 text-center">
              <CardBackground />
              <div className="relative z-10">
                <Globe className="w-12 h-12 text-blue-800 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Innovation</h3>
                <p className="text-gray-700">Leveraging cutting-edge technology for better health outcomes</p>
              </div>
            </div>
            
            <div className="relative rounded-lg p-6 text-center">
              <CardBackground />
              <div className="relative z-10">
                <Award className="w-12 h-12 text-blue-800 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Excellence</h3>
                <p className="text-gray-700">Maintaining the highest standards in healthcare technology</p>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="relative rounded-lg p-8 overflow-hidden">
            <CardBackground />
            <div className="relative z-10">
              <h2 className="text-3xl font-semibold text-blue-800 mb-8 text-center">Developer Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {teamMembers.map((member, index) => (
                  <div key={index} className="text-center">
                    <Image
                      src={member.image}
                      alt={member.name}
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="text-xl font-semibold text-blue-800">{member.name}</h3>
                    <p className="text-blue-600 mb-2">{member.role}</p>
                    <p className="text-gray-700">{member.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default AboutPage;