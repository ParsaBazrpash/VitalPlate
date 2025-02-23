"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { User, Mail, Phone, Home, Edit2, Save, X } from "lucide-react";


// Firebase imports
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase"; // Your Firestore config
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "../config/firebase"; // Your Firebase Auth config


interface FormFlags {
  senior: boolean;
  athlete: boolean;
  pregnant: boolean;
  anorexia: boolean;
}


interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  flags: FormFlags;
}


interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
}


const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  flags: {
    senior: false,
    athlete: false,
    pregnant: false,
    anorexia: false,
  },
};


export default function ProfileForm() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});


  // ─────────────────────────────────────────────────────────────────
  // 1. Watch auth state and store currentUser
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user);
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);


  // ─────────────────────────────────────────────────────────────────
  // 2. Fetch the profile doc whenever currentUser changes
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async (uid: string) => {
      try {
        const docRef = doc(db, "profiles", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data() as FormData);
        } else {
          // If no doc for this user, reset
          setFormData(initialFormData);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };


    if (currentUser?.uid) {
      fetchProfile(currentUser.uid);
    } else {
      setFormData(initialFormData);
    }
  }, [currentUser]);


  // ─────────────────────────────────────────────────────────────────
  // 3. Validate the form
  // ─────────────────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};


    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  // ─────────────────────────────────────────────────────────────────
  // 4. Save doc to "profiles/{user.uid}" on form submit
  // ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;


    if (!currentUser) {
      console.error("No user is logged in. Cannot save profile.");
      return;
    }


    try {
      const docRef = doc(db, "profiles", currentUser.uid);
      await setDoc(docRef, formData, { merge: true });
      console.log("Profile saved to Firestore:", formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error storing profile:", error);
    }
  };


  // ─────────────────────────────────────────────────────────────────
  // 5. Handle form field changes (including checkboxes)
  // ─────────────────────────────────────────────────────────────────
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        flags: {
          ...prev.flags,
          [name]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };


  // ─────────────────────────────────────────────────────────────────
  // 6. If not logged in, show a message (or redirect)
  // ─────────────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-700">
          You must be <strong>logged in</strong> to view this page.
        </p>
      </div>
    );
  }


  // ─────────────────────────────────────────────────────────────────
  // 7. Logged in user can see/edit their own profile
  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-800">Profile Information</h2>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? (
                <>
                  <X className="w-5 h-5" /> Cancel
                </>
              ) : (
                <>
                  <Edit2 className="w-5 h-5" /> Edit
                </>
              )}
            </button>
          </div>


          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">First Name</label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2 border text-black border-gray-200 rounded-lg
                               focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                               disabled:bg-gray-50"
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>
              </div>


              <div>
                <label className="block text-gray-700 mb-2">Last Name</label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2 border text-black border-gray-200 rounded-lg
                               focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                               disabled:bg-gray-50"
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>
            </div>


            {/* Email */}
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border text-black border-gray-200 rounded-lg
                             focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                             disabled:bg-gray-50"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
            </div>


            {/* Phone */}
            <div>
              <label className="block text-gray-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border text-black border-gray-200 rounded-lg
                             focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                             disabled:bg-gray-50"
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>


            {/* Address */}
            <div>
              <label className="block text-gray-700 mb-2">Address</label>
              <div className="relative">
                <Home className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2 border text-black border-gray-200 rounded-lg
                             focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                             disabled:bg-gray-50"
                  placeholder="Enter address"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>
            </div>


            {/* Additional Info (checkboxes) */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">
                Additional Information
              </h3>
              <div className="space-y-3">
                {Object.entries(formData.flags).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name={key}
                      checked={value}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>


            {/* Save button appears only when editing */}
            {isEditing && (
              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
