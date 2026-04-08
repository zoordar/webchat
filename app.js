import { setupAuthUI } from './auth.js';
import { initializeChat } from './chat.js';
const API_URL = "https://chatterbox-backend.webchatproject.workers.dev";

/*
 * App.js Coordinates standard Frontend interactions that spans beyond just
 * Authentication or isolated Chat operations.
 */

// Global DOM Cache
const authSection = document.getElementById('auth-section');
const chatSection = document.getElementById('chat-section');
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

// Custom Actions
function handleAuthSuccess(user) {
    // Remove login panel
    authSection.classList.add('hidden');
    authSection.classList.remove('active');

    // Display massive chat
    chatSection.classList.remove('hidden');

    // Let domain logic bootstrap
    initializeChat(user);
}

function handleAuthLogout() {
    // Hide massive chat 
    chatSection.classList.add('hidden');

    // Reboot Auth panel
    authSection.classList.remove('hidden');
    authSection.classList.add('active');

    document.getElementById('login-form').reset();
}

// Enable beautiful Dark/Light transition
themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');

    // Standard icon swap
    themeIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
});

// Map standard behavior to Side Bar interactive groups
const groupItems = document.querySelectorAll('.group-item');
const currentGroupName = document.getElementById('current-group-name');
const currentGroupTone = document.getElementById('current-group-tone');

groupItems.forEach(item => {
    item.addEventListener('click', () => {
        // Toggle selected presentation across set
        groupItems.forEach(g => g.classList.remove('active'));
        item.classList.add('active');

        // Metadata access
        const groupType = item.getAttribute('data-type');
        const groupTone = item.getAttribute('data-tone');
        const groupName = item.getAttribute('data-name');

        // Update App UI elements locally
        currentGroupName.textContent = groupName;
        currentGroupTone.textContent = groupTone;

        // Signal event broker to inform Chat to fetch relevant dataset
        window.dispatchEvent(new CustomEvent('groupChanged', {
            detail: { group: groupType, tone: groupTone }
        }));
    });
});

// A fun integration point to prove extension concepts
document.querySelector('.emoji-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    const messageInput = document.getElementById('message-input');
    messageInput.value += '✨';
    messageInput.focus();
});

// Run Setup at Boot!
document.addEventListener('DOMContentLoaded', () => {
    setupAuthUI(handleAuthSuccess, handleAuthLogout);
});
