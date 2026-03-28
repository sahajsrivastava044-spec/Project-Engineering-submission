// Conversation history (full context)
const messages = [];

const chatDisplay = document.getElementById('chatDisplay');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');


const form = document.getElementById('chatForm');

form.addEventListener('submit', (e) => {
    e.preventDefault(); // prevents page reload
    sendMessage();
});

/**
 * Render a message bubble in the chat display
 */
function renderMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', role);
    messageDiv.textContent = content;
    chatDisplay.appendChild(messageDiv);
    
    // Auto-scroll to bottom
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

/**
 * Handle sending the message
 */
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    // 1. Store user message
    messages.push({ role: "user", content: text });

    // 2. Show it
    renderMessage("user", text);

    messageInput.value = "";

    try {
        const res = await fetch('https://project-engineering-1.onrender.com/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages })
        });

        const data = await res.json();

        if (!res.ok) {
            const errorText = data.message || data.error || 'Unknown server error';
            renderMessage('assistant', `Error: ${errorText}`);
            return;
        }

        const reply = data.reply || data.message || 'No reply from server';

        // 3. Store AI reply
        messages.push({
            role: 'assistant',
            content: reply
        });

        // 4. Show AI reply
        renderMessage("assistant", reply);

    } catch (err) {
        console.error(err);
        renderMessage("assistant", "Error occurred");
    }
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
