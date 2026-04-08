// chat.js — Works with chat.html after login redirect

const API_URL = "https://chatterbox.webchatproject.workers.dev";

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
    const res = await fetch(API_URL + "/get-messages");
    const data = await res.json();

    const box = document.getElementById("messages");
    box.innerHTML = "";

    data.forEach(msg => {
      box.innerHTML += `
        <div class="message">
          <b>${msg.username}</b>: ${msg.message}
        </div>
      `;
    });
  } catch (error) {
    console.error("Failed to load messages:", error);
  }
}

// ── SEND MESSAGE ─────────────────────────────────────────────
window.sendMessage = async function () {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();

  if (!message) return;

  const user = JSON.parse(localStorage.getItem("user"));

  console.log("Sending message:", message);

  const res = await fetch(API_URL + "/send-message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: user.email,
      message: message
    })
  });

  const result = await res.json();
  console.log(result);

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
const groupItems = document.querySelectorAll('.group-item');
const currentGroupName = document.getElementById('current-group-name');
const currentGroupTone = document.getElementById('current-group-tone');

groupItems.forEach(item => {
  item.addEventListener('click', () => {
    groupItems.forEach(g => g.classList.remove('active'));
    item.classList.add('active');
    if (currentGroupName) currentGroupName.textContent = item.getAttribute('data-name');
    if (currentGroupTone) currentGroupTone.textContent = item.getAttribute('data-tone');
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
