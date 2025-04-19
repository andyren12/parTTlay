// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCz9wDS4GufCFPyMXtKAbjR8iJe1DgzWNo",
  authDomain: "parttlay-1e744.firebaseapp.com",
  projectId: "parttlay-1e744",
  storageBucket: "parttlay-1e744.firebasestorage.app",
  messagingSenderId: "155088562135",
  appId: "1:155088562135:web:8c1421844a2be79adb4d92",
  measurementId: "G-52B23NH53C",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getFirestore(app);
