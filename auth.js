import { auth } from "./firebase-config.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export function setupAuthUI(onAuthSuccess, onAuthLogout) {
    if (!auth) {
        document.getElementById('auth-error').textContent = "Firebase is not configured! Please edit firebase-config.js";
        document.getElementById('auth-error').classList.remove('hidden');
        return;
    }

    const errorMsg = document.getElementById('auth-error');

    // Login with Email
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const pass = document.getElementById('password').value;

        try {
            await loginWithEmail(email, pass);
            errorMsg.classList.add('hidden');
        } catch (error) {
            console.error("Auth Error (Email): ", error);
            errorMsg.textContent = "Error: Create an account on Firebase Console or use a valid combination.";
            errorMsg.classList.remove('hidden');
        }
    });

    // Login with Google
    document.getElementById('google-login-btn').addEventListener('click', async () => {
        try {
            const googleProvider = new GoogleAuthProvider();
            await signInWithPopup(auth, googleProvider);
            errorMsg.classList.add('hidden');
        } catch (error) {
            console.error("Auth Error (Google): ", error);
            errorMsg.textContent = "Google Sign-in was cancelled or failed.";
            errorMsg.classList.remove('hidden');
        }
    });

    // Logout Flow
    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    });

    // Monitor Authentication State
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in -> Map details to sidebar Profile
            const fallbackAvatar = `https://ui-avatars.com/api/?name=${user.email}&background=random`;
            document.getElementById('user-name').textContent = user.displayName || user.email.split('@')[0];
            document.getElementById('user-avatar').src = user.photoURL || fallbackAvatar;

            // Trigger app state change callback
            onAuthSuccess(user);
        } else {
            // User signed out -> Trigger app state change callback
            onAuthLogout();
        }
    });
}

export async function loginWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  localStorage.setItem(
    "user",
    JSON.stringify({
      name: result.user.email,
      uid: result.user.uid
    })
  );

  window.location.href = "chat.html";
}
