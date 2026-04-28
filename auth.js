import { auth } from "./firebase-config.js";
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// EMAIL LOGIN
window.loginWithEmail = async function () {
    try {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        console.log("Email login clicked:", email);

        const result = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        console.log("Firebase success:", result.user);

        localStorage.setItem(
            "user",
            JSON.stringify({
                email: result.user.email,
                uid: result.user.uid
            })
        );

        console.log("Redirecting to chat.html...");
        window.location.href = "chat.html";

    } catch (error) {
        console.error("Email login error:", error);
        alert(error.message);
    }
};

//  GOOGLE LOGIN 
window.loginWithGoogle = async function () {
    try {
        console.log("Google login clicked");
        const provider = new GoogleAuthProvider();

        const result = await signInWithPopup(auth, provider);

        console.log("Google auth success:", result.user);

        localStorage.setItem(
            "user",
            JSON.stringify({
                email: result.user.email,
                uid: result.user.uid
            })
        );

        console.log("Redirecting to chat.html...");
        window.location.href = "chat.html";

    } catch (error) {
        console.error("Google login error:", error);
        alert(error.message);
    }
};

// ── LOGOUT 
window.logoutUser = async function () {
    try {
        await signOut(auth);
        localStorage.removeItem("user");
        console.log("Logged out. Redirecting to index.html...");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Logout error:", error);
        alert(error.message);
    }
};
