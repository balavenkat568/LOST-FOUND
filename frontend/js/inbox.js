// Logic for User Inbox / Messages page (inbox.html)

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadInbox();
});

async function loadInbox() {
    const container = document.getElementById('inbox-container');
    if (!container) return;

    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading messages...</span>
            </div>
        </div>
    `;

    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/messages/conversations/my`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const conversations = await response.json();

        if (!response.ok) {
            throw new Error(conversations.message || 'Failed to load inbox conversations');
        }

        if (conversations.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted fs-5 mb-2">📥 Your inbox is empty.</p>
                    <p class="text-muted small">When you message a user or someone messages you regarding a lost/found item, your chat threads will appear here.</p>
                    <a href="items.html" class="btn btn-primary mt-2">Browse Items</a>
                </div>
            `;
            return;
        }

        container.innerHTML = conversations.map(conv => {
            const item = conv.item || {};
            const otherUser = conv.otherUser || {};
            
            const typeBadge = item.type === 'LOST' 
                ? '<span class="badge badge-lost me-1">LOST</span>' 
                : '<span class="badge badge-found me-1">FOUND</span>';
            
            const statusBadge = item.status === 'RETURNED'
                ? '<span class="badge badge-returned">RETURNED</span>'
                : '<span class="badge badge-active">ACTIVE</span>';

            const timeString = conv.lastMessageTime 
                ? new Date(conv.lastMessageTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                : '';

            return `
                <div class="col-md-6 mb-3">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                    ${typeBadge}
                                    ${statusBadge}
                                </div>
                                <small class="text-muted">${timeString}</small>
                            </div>
                            <h5 class="card-title text-truncate mb-1">${item.title || 'Untitled Item'}</h5>
                            <small class="text-primary mb-2">💬 Conversation with: <strong>${otherUser.name || 'Unknown User'}</strong></small>
                            
                            <div class="p-2 bg-light rounded text-muted small flex-grow-1 mb-3">
                                <strong>Last message:</strong> "${escapeHtml(conv.lastMessage || '')}"
                            </div>

                            <a href="chat.html?itemId=${item._id}&receiverId=${otherUser._id}" class="btn btn-outline-primary btn-sm w-100">
                                💬 Open Chat Conversation
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading inbox:', error);
        container.innerHTML = `<div class="col-12 text-center text-danger py-4">Error loading conversations. Please try again.</div>`;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}
