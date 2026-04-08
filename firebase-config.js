// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAd3-52hmv8sPLcBq30NOC2sqBrTmNPqSQ",
    authDomain: "web-chat-adc33.firebaseapp.com",
    projectId: "web-chat-adc33",
    storageBucket: "web-chat-adc33.firebasestorage.app",
    messagingSenderId: "956910031734",
    appId: "1:956910031734:web:ef8075fbfbb3b0bb1e2057",
    measurementId: "G-3BNJ588WB1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);