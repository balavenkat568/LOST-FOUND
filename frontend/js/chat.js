// Logic for Real-Time Item Chat (chat.html)

let socket;
let currentItemId;
let currentReceiverId;
let currentUser;
let typingTimeout;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    currentUser = getUser();

    const urlParams = new URLSearchParams(window.location.search);
    currentItemId = urlParams.get('itemId');
    currentReceiverId = urlParams.get('receiverId');

    if (!currentItemId) {
        window.location.href = 'items.html';
        return;
    }

    initChat();
});

async function initChat() {
    // Load item context info
    await loadItemContext(currentItemId);

    // Initialize Socket.IO connection
    socket = io(window.location.origin);

    // Join item chat room
    socket.emit('join_room', {
        itemId: currentItemId,
        userId: currentUser._id
    });

    // Load message history from MongoDB REST API
    await loadMessageHistory(currentItemId);

    // Socket listeners for real-time updates
    socket.on('receive_message', (msg) => {
        appendMessage(msg);
    });

    socket.on('user_typing', (data) => {
        const typingEl = document.getElementById('typing-indicator');
        if (typingEl) {
            if (data.isTyping && data.username !== currentUser.name) {
                typingEl.textContent = `${data.username} is typing...`;
            } else {
                typingEl.textContent = '';
            }
        }
    });

    // Form submit listener
    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        chatForm.addEventListener('submit', handleSendMessage);
    }

    // Input listener for typing indicator
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('input', handleTypingInput);
    }
}

async function loadItemContext(itemId) {
    const itemContextEl = document.getElementById('item-chat-header');
    if (!itemContextEl) return;

    try {
        const response = await fetch(`${API_BASE_URL}/items/${itemId}`);
        const item = await response.json();

        if (response.ok) {
            // Determine receiverId if not passed in URL parameters
            if (!currentReceiverId) {
                if (currentUser._id === item.postedBy._id) {
                    // Current user is item owner; receiver will be set from chat history or previous sender
                } else {
                    currentReceiverId = item.postedBy._id;
                }
            }

            const posterName = item.postedBy ? item.postedBy.name : 'Unknown';
            const badge = item.type === 'LOST' 
                ? '<span class="badge badge-lost me-2">LOST</span>' 
                : '<span class="badge badge-found me-2">FOUND</span>';

            itemContextEl.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1">${badge} ${item.title}</h5>
                        <small class="text-muted">Location: ${item.location} | Category: ${item.category} | Status: <strong>${item.status}</strong></small>
                    </div>
                    <a href="item-details.html?id=${item._id}" class="btn btn-sm btn-outline-secondary">View Item</a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading item context:', error);
    }
}

async function loadMessageHistory(itemId) {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;

    chatBox.innerHTML = '<div class="text-center py-3 text-muted">Loading message history...</div>';

    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/messages/${itemId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const messages = await response.json();

        if (response.ok) {
            chatBox.innerHTML = '';
            if (messages.length === 0) {
                chatBox.innerHTML = `
                    <div class="text-center text-muted py-5">
                        <p class="mb-1">No messages yet.</p>
                        <small>Start the conversation to verify ownership and organize handover.</small>
                    </div>
                `;
            } else {
                messages.forEach(msg => {
                    appendMessage(msg);
                });
            }

            // If receiverId was missing, pick from last message if applicable
            if (!currentReceiverId && messages.length > 0) {
                const lastMsg = messages[messages.length - 1];
                currentReceiverId = lastMsg.sender._id === currentUser._id ? lastMsg.receiver._id : lastMsg.sender._id;
            }

            scrollToBottom();
        } else {
            chatBox.innerHTML = '<div class="text-danger text-center py-3">Failed to load chat history.</div>';
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
        chatBox.innerHTML = '<div class="text-danger text-center py-3">Network error loading messages.</div>';
    }
}

async function handleSendMessage(e) {
    e.preventDefault();

    const inputEl = document.getElementById('message-input');
    const messageText = inputEl.value.trim();

    if (!messageText) return;

    if (!currentReceiverId) {
        showAlert('Cannot determine message recipient. Please return to item page and click "Message User".', 'warning');
        return;
    }

    // Stop typing status
    socket.emit('stop_typing', {
        itemId: currentItemId,
        username: currentUser.name
    });

    // Emit real-time socket event (which saves to MongoDB in server socket handler)
    socket.emit('send_message', {
        senderId: currentUser._id,
        receiverId: currentReceiverId,
        itemId: currentItemId,
        messageText: messageText
    });

    inputEl.value = '';
}

function appendMessage(msg) {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;

    // Remove empty placeholder if present
    const placeholder = chatBox.querySelector('.text-muted.py-5');
    if (placeholder) {
        chatBox.innerHTML = '';
    }

    const isSent = (msg.sender._id || msg.sender) === currentUser._id;
    const senderName = isSent ? 'You' : (msg.sender.name || 'User');
    const msgTime = new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const bubbleHtml = `
        <div class="message-bubble ${isSent ? 'message-sent' : 'message-received'}">
            <div class="message-sender-name">${senderName}</div>
            <div>${escapeHtml(msg.message)}</div>
            <div class="message-time">${msgTime}</div>
        </div>
    `;

    chatBox.insertAdjacentHTML('beforeend', bubbleHtml);
    scrollToBottom();
}

function handleTypingInput() {
    socket.emit('typing', {
        itemId: currentItemId,
        username: currentUser.name
    });

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('stop_typing', {
            itemId: currentItemId,
            username: currentUser.name
        });
    }, 2000);
}

function scrollToBottom() {
    const chatBox = document.getElementById('chat-box');
    if (chatBox) {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}
