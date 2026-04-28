
const API_URL = "https://chatterbox-backend.webchatproject.workers.dev";
let currentGroup = "Office";
const languageSelection = {}; // Stores selected language per message ID

// ── SESSION GUARD: Redirect to login if no user 
const storedUser = localStorage.getItem("user");
if (!storedUser) {
  console.warn("No session found. Redirecting to login...");
  window.location.href = "index.html";
}

const currentUser = storedUser ? JSON.parse(storedUser) : { email: "Guest" };

// ── DISPLAY USER INFO 
const userNameEl = document.getElementById("user-name");
const userAvatarEl = document.getElementById("user-avatar");
if (userNameEl) userNameEl.textContent = currentUser.email;
if (userAvatarEl) {
  userAvatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.email)}&background=random`;
}

// ── PERSISTENCE HELPERS 
window.saveLanguage = function (id, lang) {
  languageSelection[id] = lang;
};

// ── LOAD MESSAGES 
async function loadMessages() {
  try {
    const res = await fetch(
      API_URL + "/get-messages?group=" + encodeURIComponent(currentGroup)
    );

    const data = await res.json();

    console.log("Loaded for:", currentGroup, data);

    console.log("Loaded messages:", data);

    const box = document.getElementById("messages");
    box.innerHTML = "";

    data.forEach(msg => {
      const selectedLang = languageSelection[msg.id] || "hi";

      box.innerHTML += `
        <div class="message-bubble ${msg.username === currentUser.email ? 'message-mine' : 'message-yours'}">
          <strong>${msg.username}</strong><br>
          <span>${msg.message}</span>
          <br>
          <div class="bubble-controls">
            <select class="translation-select" onchange="saveLanguage(${msg.id}, this.value)">
              <option value="hi" ${selectedLang === "hi" ? "selected" : ""}>Hindi</option>
              <option value="fr" ${selectedLang === "fr" ? "selected" : ""}>French</option>
              <option value="es" ${selectedLang === "es" ? "selected" : ""}>Spanish</option>
              <option value="de" ${selectedLang === "de" ? "selected" : ""}>German</option>
              <option value="ja" ${selectedLang === "ja" ? "selected" : ""}>Japanese</option>
            </select>
            <button class="translate-btn" onclick="translateMessage('${msg.message.replace(/'/g, "\\'")}', ${msg.id}, this)">
              Translate
            </button>
          </div>
          <div class="translated-container"></div>
        </div>
      `;
    });
  } catch (error) {
    console.error("Load error:", error);
  }
}

// ── SEND MESSAGE 
window.sendMessage = async function () {
  const input = document.getElementById("inputText");
  const message = input.value.trim();

  console.log("Sending:", message);

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

// ── CONVERT TONE
window.convertTone = async function () {
  const text = document.getElementById("inputText").value;
  const tone = document.getElementById("tone").value;

  if (!text) {
    alert("Enter text first");
    return;
  }

  const response = await fetch("/convert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, tone }),
  });

  const data = await response.json();

  if (data.error) {
    alert(data.error || "Unknown error");
    return;
  }

  document.getElementById("inputText").value = data.result;
};

// ── TRANSLATE MESSAGE 
window.translateMessage = async function (text, id, button) {
  const lang = languageSelection[id] || "hi";

  const response = await fetch(
    API_URL + "/translate-message",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text,
        targetLanguage: lang
      })
    }
  );

  const data = await response.json();

  // Find the container in this bubble and show it
  const bubble = button.closest('.message-bubble');
  const container = bubble.querySelector('.translated-container');

  if (container) {
    container.innerText = data.translatedText || "Translation unavailable";
    container.style.display = "block";
  }
}

// ── SEND ON ENTER KEY 
document.getElementById("inputText")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    window.sendMessage();
  }
});

// ── GROUP SWITCHING 
// attach click listeners to all group cards
document.querySelectorAll(".group-item").forEach(item => {
  item.addEventListener("click", () => {
    currentGroup = item.dataset.group;

    // update heading text
    const titleEl = document.getElementById("groupTitle");
    if (titleEl) titleEl.innerText = currentGroup;

    // active UI highlight
    document.querySelectorAll(".group-item").forEach(g =>
      g.classList.remove("active")
    );
    item.classList.add("active");

    console.log("Switched group:", currentGroup);

    loadMessages();
  });
});

// ── THEME TOGGLE 
document.getElementById('theme-toggle')?.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark-mode');
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = isDark ? 'light_mode' : 'dark_mode';
});

// ── LOGOUT 
window.logoutUser = function () {
  localStorage.removeItem("user");
  window.location.href = "index.html";
};

// ── POLL FOR NEW MESSAGES 
loadMessages();
setInterval(loadMessages, 2000);
