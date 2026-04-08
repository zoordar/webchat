// chat.js — Works with chat.html after login redirect

const API_URL = "https://chatterbox-backend.webchatproject.workers.dev";
let currentGroup = "Office";

// ── SESSION GUARD: Redirect to login if no user ──────────────
const storedUser = localStorage.getItem("user");
if (!storedUser) {
  console.warn("No session found. Redirecting to login...");
  window.location.href = "index.html";
}

const currentUser = storedUser ? JSON.parse(storedUser) : { email: "Guest" };

// ── DISPLAY USER INFO ────────────────────────────────────────
const userNameEl = document.getElementById("user-name");
const userAvatarEl = document.getElementById("user-avatar");
if (userNameEl) userNameEl.textContent = currentUser.email;
if (userAvatarEl) {
  userAvatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.email)}&background=random`;
}

// ── LOAD MESSAGES ────────────────────────────────────────────
async function loadMessages() {
  try {
    const res = await fetch(
      API_URL + "/get-messages?group=" + encodeURIComponent(currentGroup)
    );

    const data = await res.json();

    console.log("Loaded for:", currentGroup, data);

    const box = document.getElementById("messages");
    box.innerHTML = "";

    data.forEach(msg => {
      box.innerHTML += `
        <div class="message-bubble">
          <strong>${msg.username}</strong><br>
          ${msg.message}
        </div>
      `;
    });
  } catch (error) {
    console.error("Load error:", error);
  }
}

// ── SEND MESSAGE ─────────────────────────────────────────────
window.sendMessage = async function () {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();

  if (!message) return;

  const user = JSON.parse(localStorage.getItem("user"));

  const payload = {
    username: user.email,
    message: message,
    group_name: currentGroup
  };

  console.log("PAYLOAD:", payload);

  await fetch(API_URL + "/send-message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  input.value = "";
  loadMessages();
};

// ── SEND ON ENTER KEY ────────────────────────────────────────
document.getElementById("messageInput")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    window.sendMessage();
  }
});

// ── GROUP SWITCHING ──────────────────────────────────────────
// attach click listeners to all group cards
document.querySelectorAll(".group-item").forEach(item => {
  item.addEventListener("click", () => {
    currentGroup = item.dataset.group;

    // update heading text
    const titleEl = document.getElementById("groupTitle");
    if(titleEl) titleEl.innerText = currentGroup;

    // active UI highlight
    document.querySelectorAll(".group-item").forEach(g =>
      g.classList.remove("active")
    );
    item.classList.add("active");

    console.log("Switched group:", currentGroup);

    loadMessages();
  });
});

// ── THEME TOGGLE ─────────────────────────────────────────────
document.getElementById('theme-toggle')?.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark-mode');
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = isDark ? 'light_mode' : 'dark_mode';
});

// ── LOGOUT ───────────────────────────────────────────────────
window.logoutUser = function () {
  localStorage.removeItem("user");
  window.location.href = "index.html";
};

// ── POLL FOR NEW MESSAGES ────────────────────────────────────
loadMessages();
setInterval(loadMessages, 2000);
