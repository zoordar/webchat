import { translateWithGemini, API_BASE_URL } from './gemma-api.js';

let currentUser = null;
let currentGroupContext = 'friends'; // Default Group
let currentToneContext = 'Casual Tone';
let pollingInterval = null;

// UI Elements
const messagesContainer = document.getElementById('messages-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const aiToggle = document.getElementById('ai-translate-toggle');
const targetLangSelect = document.getElementById('target-language');
const typingIndicator = document.getElementById('typing-indicator');

// Auto-Scroll helper
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Render a single message directly into the DOM
function renderMessage(docData, docId) {
    // Prevent duplicate rendering
    if (document.getElementById(`msg-${docId}`)) return;

    const { username, message, translated_message, created_at, group_name } = docData;
    
    // Safety check - we only render if it belongs to selected group
    if (group_name !== currentGroupContext) return;

    // Use display name or email prefix to match logic in handleSendMessage
    const safeMyName = currentUser.displayName || currentUser.email.split('@')[0];
    const isMine = username === safeMyName;
    
    let timeString = 'Sending...';
    if (created_at) {
        timeString = new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' });
    }

    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${isMine ? 'message-mine' : 'message-yours'}`;
    wrapper.id = `msg-${docId}`;

    let html = `
        <div class="message-header">
            <span>${isMine ? 'You' : (username || 'User')}</span>
            <span>${timeString}</span>
        </div>
        <div class="message-bubble">
            <p>${translated_message || message}</p>
    `;

    // Append Original context if translation occurred explicitly
    if (translated_message && translated_message !== message) {
        html += `<div class="translation-box">Original: ${message}</div>`;
    }

    html += `</div>`;
    wrapper.innerHTML = html;
    
    messagesContainer.appendChild(wrapper);
    scrollToBottom();
}

export async function loadMessages() {
  const url = typeof API_URL !== 'undefined' ? API_URL : API_BASE_URL;
  const res = await fetch(`${url}/get-messages`);
  const data = await res.json();

  const box = document.getElementById("messages") || document.getElementById("messages-container");
  box.innerHTML = "";

  data.forEach(msg => {
    box.innerHTML += `
      <div class="message">
        <b>${msg.username}</b>: ${msg.message}
      </div>
    `;
  });
}

export function initializeChat(user) {
    currentUser = user;
    
    messagesContainer.innerHTML = '';
    loadMessages().then(() => scrollToBottom());

    // Launch polling equivalent mechanism
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(loadMessages, 3000); 

    // Listen for Group change dispatches locally
    window.addEventListener('groupChanged', (e) => {
        currentGroupContext = e.detail.group;
        currentToneContext = e.detail.tone;
        
        messagesContainer.innerHTML = ''; // Re-render chat area
        loadMessages().then(() => scrollToBottom());
    });

    messageForm.removeEventListener('submit', sendMessageWrapper);
    messageForm.addEventListener('submit', sendMessageWrapper);
}

function sendMessageWrapper(e) {
    if(e) e.preventDefault();
    sendMessage();
}

async function sendMessage() {
  const input = document.getElementById("messageInput") || document.getElementById("message-input"); // fallback to current id
  const message = input.value.trim();

  if (!message) return;

  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Guest"
  };

  const url = typeof API_URL !== 'undefined' ? API_URL : API_BASE_URL;

  await fetch(`${url}/send-message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: user.name,
      message: message
    })
  });

  input.value = "";
  loadMessages();
}

setInterval(loadMessages, 2000);
