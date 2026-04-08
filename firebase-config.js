// firebase-config.js — Browser CDN imports only (Cloudflare Pages compatible)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAd3-52hmv8sPLcBq30NOC2sqBrTmNPqSQ",
    authDomain: "web-chat-adc33.firebaseapp.com",
    projectId: "web-chat-adc33",
    storageBucket: "web-chat-adc33.firebasestorage.app",
    messagingSenderId: "956910031734",
    appId: "1:956910031734:web:ef8075fbfbb3b0bb1e2057"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);