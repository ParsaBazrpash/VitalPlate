
import { getAuth } from "firebase/auth";




// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries




// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyBLykEjCRAwqr8fc311OkczL5HJdZEBzx4",
  authDomain: "axxess2025.firebaseapp.com",
  projectId: "axxess2025",
  storageBucket: "axxess2025.firebasestorage.app",
  messagingSenderId: "566443806294",
  appId: "1:566443806294:web:7b951c3b166f71074e75f7",
  measurementId: "G-T4WW82W7TQ"
};




// Initialize Firebase




const app = initializeApp(firebaseConfig);




export const auth = getAuth(app);
export const db = getFirestore(app);
