// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgonSFIs8uaRtPW4suxZ0yISYgLlCphBg",
  authDomain: "ayushcare-8ff01.firebaseapp.com",
  projectId: "ayushcare-8ff01",
  storageBucket: "ayushcare-8ff01.firebasestorage.app",
  messagingSenderId: "159673862080",
  appId: "1:159673862080:web:9f1b61897d722ab125aa25"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export default app;