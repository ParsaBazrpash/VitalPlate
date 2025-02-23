"use client";
import React, { useState, ChangeEvent } from "react";
import { auth } from "../config/firebase"; // adjust path to your Firebase config
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  AuthError,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { X } from "lucide-react";


interface AuthProps {
  setIsLoginOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onLogin: () => void;
}


export default function Auth({ setIsLoginOpen, onLogin }: AuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);


  // Close the modal
  const handleClose = () => {
    setIsLoginOpen(false);
  };


  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("User signed up successfully!");
      handleClose();
    } catch (err) {
      const error = err as AuthError;
      console.error("Error during sign-up:", error.message);
      alert(error.message);
    }
  };


  const handleLogIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Logged in user ID:", user.uid);
      alert("User logged in successfully!");


      // Call the parent's onLogin callback
      onLogin();
      handleClose();
    } catch (err) {
      const error = err as AuthError;
      console.error("Error during log-in:", error.message);
      alert(error.message);
    }
  };


  // New: Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // This gives you a Google Access Token. You can use it to access the Google API if needed.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;


      // The signed-in user info.
      const user = result.user;
      console.log("Google Sign-In user:", user);
      alert("User signed in with Google successfully!");


      // Call the parent's onLogin callback
      onLogin();
      handleClose();
    } catch (error) {
      const err = error as AuthError;
      console.error("Error during Google Sign-In:", err.message);
      alert(err.message);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay (click anywhere to close) */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      {/* Modal */}
      <div
        className="relative w-full max-w-md p-6 rounded-xl shadow-lg bg-white"
        onClick={(e) => e.stopPropagation()} // prevent closing if clicking inside
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-600 hover:text-gray-900"
        >
          <X className="w-5 h-5" />
        </button>


        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>


        <div className="space-y-4">
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            className="w-full px-4 py-2 rounded border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            className="w-full px-4 py-2 rounded border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          {isSignUp && (
            <input
              placeholder="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setConfirmPassword(e.target.value)
              }
              className="w-full px-4 py-2 rounded border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          )}
          <button
            onClick={isSignUp ? handleSignUp : handleLogIn}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-200"
          >
            {isSignUp ? "Sign Up" : "Log In"}
          </button>


          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center space-x-2 mt-2 py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition duration-200"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
              className="w-5 h-5"
            />
            <span>Sign In with Google</span>
          </button>


          <p className="text-center mt-4 text-gray-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setConfirmPassword("");
              }}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              {isSignUp ? "Log In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
