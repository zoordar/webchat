import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

window.loginWithEmail = async function () {
  try {
    console.log("Email login clicked");

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("Firebase success", result.user);

    localStorage.setItem(
      "user",
      JSON.stringify({
        email: result.user.email,
        uid: result.user.uid
      })
    );

    window.location.href = "chat.html";
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

window.loginWithGoogle = async function () {
  try {
    console.log("Google login clicked");
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    console.log("Google auth success", result.user);

    localStorage.setItem(
      "user",
      JSON.stringify({
        email: result.user.email,
        uid: result.user.uid
      })
    );

    window.location.href = "chat.html";
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};
