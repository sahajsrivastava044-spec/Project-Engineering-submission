// Conversation history (full context)
const messages = [];

const chatDisplay = document.getElementById('chatDisplay');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const form = document.getElementById('chatForm');

// 🔥 IMPORTANT: CHANGE THIS
// For local:
const API_URL = "http://localhost:3000/chat";

// For deployed (REPLACE THIS later):
// const API_URL = "https://your-backend-url.onrender.com/chat";

form.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
});

function renderMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', role);
    messageDiv.textContent = content;
    chatDisplay.appendChild(messageDiv);

    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    messages.push({ role: "user", content: text });
    renderMessage("user", text);

    messageInput.value = "";

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages })
        });

        const data = await res.json();

        console.log("RESPONSE:", data); // 🔥 DEBUG LINE

        if (!res.ok) {
            const errorText = data.message || data.error || 'Unknown server error';
            renderMessage('assistant', `Error: ${errorText}`);
            return;
        }

        const reply = data.reply;

        if (!reply) {
            renderMessage("assistant", "Error: No reply from server");
            return;
        }

        messages.push({
            role: 'assistant',
            content: reply
        });

        renderMessage("assistant", reply);

    } catch (err) {
        console.error("FETCH ERROR:", err);
        renderMessage("assistant", "Error connecting to server");
    }
}

sendBtn.addEventListener('click', sendMessage);