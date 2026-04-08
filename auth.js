// auth.js — Browser CDN imports only (Cloudflare Pages compatible)
import { auth } from "./firebase-config.js";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ──────────────────────────────────────────────
// SESSION CHECK: If user already logged in → go to chat
// ──────────────────────────────────────────────
const savedUser = localStorage.getItem("user");
if (savedUser) {
    console.log("[Auth] Existing session found. Showing chat.");
}

// ──────────────────────────────────────────────
// GOOGLE LOGIN — exposed globally for onclick=""
// ──────────────────────────────────────────────
window.loginWithGoogle = async function () {
    console.log("[Auth] Google login button clicked.");
    const errorMsg = document.getElementById('auth-error');
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        console.log("[Auth] Google login success:", user.email);

        localStorage.setItem("user", JSON.stringify({
            name: user.displayName || user.email,
            email: user.email,
            uid: user.uid,
            photoURL: user.photoURL || ""
        }));

        if (errorMsg) errorMsg.classList.add('hidden');
        console.log("[Auth] Redirecting to chat...");
        // No redirect — SPA: show chat section directly
        showChatSection(user);

    } catch (error) {
        console.error("[Auth] Google login failed:", error.code, error.message);
        if (errorMsg) {
            errorMsg.textContent = "Google Sign-in failed: " + error.message;
            errorMsg.classList.remove('hidden');
        }
    }
};

// ──────────────────────────────────────────────
// EMAIL LOGIN — exposed globally for onclick=""
// ──────────────────────────────────────────────
window.loginWithEmail = async function () {
    console.log("[Auth] Email login button clicked.");
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('auth-error');

    if (!email || !password) {
        if (errorMsg) {
            errorMsg.textContent = "Please enter your email and password.";
            errorMsg.classList.remove('hidden');
        }
        return;
    }

    try {
        let result;
        try {
            // Try login first
            result = await signInWithEmailAndPassword(auth, email, password);
            console.log("[Auth] Email login success:", result.user.email);
        } catch (loginErr) {
            if (loginErr.code === "auth/user-not-found" || loginErr.code === "auth/invalid-credential") {
                // Auto-create account if user doesn't exist
                console.log("[Auth] User not found, creating new account...");
                result = await createUserWithEmailAndPassword(auth, email, password);
                console.log("[Auth] New account created:", result.user.email);
            } else {
                throw loginErr;
            }
        }

        const user = result.user;
        localStorage.setItem("user", JSON.stringify({
            name: user.displayName || user.email,
            email: user.email,
            uid: user.uid,
            photoURL: ""
        }));

        if (errorMsg) errorMsg.classList.add('hidden');
        console.log("[Auth] Redirecting to chat...");
        showChatSection(user);

    } catch (error) {
        console.error("[Auth] Email login failed:", error.code, error.message);
        if (errorMsg) {
            errorMsg.textContent = "Login failed: " + error.message;
            errorMsg.classList.remove('hidden');
        }
    }
};

// ──────────────────────────────────────────────
// LOGOUT — exposed globally
// ──────────────────────────────────────────────
window.logoutUser = async function () {
    console.log("[Auth] Logout triggered.");
    try {
        await signOut(auth);
        localStorage.removeItem("user");
        console.log("[Auth] Signed out. Showing login.");
        showLoginSection();
    } catch (error) {
        console.error("[Auth] Logout error:", error);
    }
};

// ──────────────────────────────────────────────
// SPA SECTION SWITCH HELPERS
// ──────────────────────────────────────────────
function showChatSection(user) {
    const authSection = document.getElementById('auth-section');
    const chatSection = document.getElementById('chat-section');

    if (authSection) {
        authSection.classList.add('hidden');
        authSection.classList.remove('active');
    }
    if (chatSection) {
        chatSection.classList.remove('hidden');
    }

    // Update user profile in sidebar
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=random`;
    const nameEl = document.getElementById('user-name');
    const avatarEl = document.getElementById('user-avatar');
    if (nameEl) nameEl.textContent = user.displayName || user.email.split('@')[0];
    if (avatarEl) avatarEl.src = user.photoURL || fallbackAvatar;

    // Fire event for app.js / chat.js to pick up
    window.dispatchEvent(new CustomEvent('authSuccess', { detail: { user } }));
}

function showLoginSection() {
    const authSection = document.getElementById('auth-section');
    const chatSection = document.getElementById('chat-section');

    if (chatSection) chatSection.classList.add('hidden');
    if (authSection) {
        authSection.classList.remove('hidden');
        authSection.classList.add('active');
    }

    window.dispatchEvent(new CustomEvent('authLogout'));
}

// ──────────────────────────────────────────────
// SETUP: Wire up legacy event listeners + auth state watch
// ──────────────────────────────────────────────
export function setupAuthUI(onAuthSuccess, onAuthLogout) {
    // Listen for section-switch events dispatched from above
    window.addEventListener('authSuccess', (e) => onAuthSuccess(e.detail.user));
    window.addEventListener('authLogout', () => onAuthLogout());

    // Wire the form submit to the global loginWithEmail function
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            window.loginWithEmail();
        });
    }

    // Wire the Google button to the global loginWithGoogle function
    const googleBtn = document.getElementById('google-login-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => window.loginWithGoogle());
    }

    // Wire the logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => window.logoutUser());
    }

    // Firebase auth state watcher — handles page refresh persistence
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("[Auth] onAuthStateChanged: user signed in:", user.email);
            // Update localStorage with latest user info
            localStorage.setItem("user", JSON.stringify({
                name: user.displayName || user.email,
                email: user.email,
                uid: user.uid,
                photoURL: user.photoURL || ""
            }));
            showChatSection(user);
        } else {
            console.log("[Auth] onAuthStateChanged: no user.");
            localStorage.removeItem("user");
            showLoginSection();
        }
    });
}
