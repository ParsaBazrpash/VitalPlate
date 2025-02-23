"use client";


import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Auth from './components/Auth'; // Adjust this path if needed
import { auth } from "../app/config/firebase";
import { signOut } from "firebase/auth";
import Image from 'next/image'

interface UserData {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}


export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);


  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');
  }, []);


  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser({
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email,
          photoURL: user.photoURL
        });
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };


  const UserButton = () => {
    if (!currentUser) {
      return (
        <button
          onClick={() => setShowAuthModal(true)}
          className="bg-blue-100 px-4 py-2 rounded hover:bg-blue-200 flex items-center text-black"
        >
          <User className="w-4 h-4 mr-2" />
          Login / Sign Up
        </button>
      );
    }


    return (
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`flex items-center space-x-2 px-4 py-2 rounded
            ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          {currentUser.photoURL ? (
            <Image
              src={currentUser.photoURL}
              alt={currentUser.displayName || ''}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-black font-semibold">
              {currentUser.displayName?.[0].toUpperCase()}
            </div>
          )}
          <span className={isDarkMode ? 'text-black' : 'text-black'}>
            {currentUser.displayName}
          </span>
          <ChevronDown className="w-4 h-4 text-black" />
        </button>


        {showUserMenu && (
          <div
            className={`absolute right-0 mt-2 w-64 rounded-md shadow-lg py-2 px-4
              ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
          >
            {/* Profile Section */}
            <div className="flex items-center border-b border-gray-600 pb-2 mb-2">
              {currentUser.photoURL ? (
                <Image
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || ''}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-black font-semibold">
                  {currentUser.displayName?.[0].toUpperCase()}
                </div>
              )}
              <div className="ml-2">
                <p className="text-sm font-semibold text-black">{currentUser.displayName}</p>
                <p className="text-xs text-black">{currentUser.email}</p>
              </div>
            </div>
            <Link
              href="/profile"
              className={`block px-4 py-2 ${
                isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className={`w-full text-left px-4 py-2 flex items-center space-x-2
                ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    );
  };


  return (
    <nav
      className={`${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-b sticky top-0 z-50`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Brand */}
          <div className="flex items-center">
          <Link href="/" className="flex items-center">
        <Image
          src="/images/logo.png" 
          alt="VitalPlate Logo" 
          className="w-12 h-12"
          width={500}   // specify the width
          height={300}
        />
        <span className="ml-2 text-2xl font-bold text-blue-800">
          VitalPlate
        </span>
      </Link>
          </div>


          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>


          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`${
                pathname === '/'
                  ? 'text-blue-700 font-semibold'
                  : isDarkMode
                  ? 'text-gray-300 hover:text-blue-400'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Home
            </Link>
            <Link
              href="/chatbot"
              className={`${
                pathname === '/chatbot'
                  ? 'text-blue-700 font-semibold'
                  : isDarkMode
                  ? 'text-gray-300 hover:text-blue-400'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Chatbot
            </Link>
            <Link
              href="/calories"
              className={`${
                pathname === '/calories'
                  ? 'text-blue-700 font-semibold'
                  : isDarkMode
                  ? 'text-gray-300 hover:text-blue-400'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Calories Finder
            </Link>
            <Link
              href="/analytics"
              className={`${
                pathname === '/analytics'
                  ? 'text-blue-700 font-semibold'
                  : isDarkMode
                  ? 'text-gray-300 hover:text-blue-400'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Analytics
            </Link>

            <Link
              href="/about"
              className={`${
                pathname === '/about'
                  ? 'text-blue-700 font-semibold'
                  : isDarkMode
                  ? 'text-gray-300 hover:text-blue-400'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              About us
            </Link>
            {/* User Button */}
            <UserButton />
          </div>
        </div>
      </div>


      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div
            className={`px-2 pt-2 pb-3 space-y-1 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <Link
              href="/"
              className={`block px-3 py-2 rounded ${
                pathname === '/'
                  ? 'text-blue-700 font-semibold'
                  : isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/chatbot"
              className={`block px-3 py-2 rounded ${
                pathname === '/chatbot'
                  ? 'text-blue-700 font-semibold'
                  : isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Chatbot
            </Link>
            <Link
              href="/calories"
              className={`block px-3 py-2 rounded ${
                pathname === '/calories'
                  ? 'text-blue-700 font-semibold'
                  : isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Calories Finder
            </Link>
            <Link
              href="/analytics"
              className={`block px-3 py-2 rounded ${
                pathname === '/analytics'
                  ? 'text-blue-700 font-semibold'
                  : isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Analytics
            </Link>
            <Link
              href="/about"
              className={`block px-3 py-2 rounded ${
                pathname === '/about'
                  ? 'text-blue-700 font-semibold'
                  : isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              About us
            </Link>


            {/* Conditionally show Login or Profile/Logout in mobile menu */}
            {!currentUser ? (
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded flex items-center bg-blue-100 text-black hover:bg-blue-200"
              >
                <User className="w-4 h-4 mr-2" />
                Login / Sign Up
              </button>
            ) : (
              <>
                <Link
                  href="/profile"
                  className={`block px-3 py-2 rounded ${
                    isDarkMode
                      ? 'text-black hover:bg-gray-700'
                      : 'text-black hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded flex items-center ${
                    isDarkMode ? 'text-black hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}


      {/* Auth Modal (if using Auth component) */}
      {showAuthModal && (
        <Auth
          setIsLoginOpen={setShowAuthModal}
          onLogin={() => console.log("User logged in!")}
        />
      )}
    </nav>
  );
}
