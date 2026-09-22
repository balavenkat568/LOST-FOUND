// Logic for Single Item Details view (item-details.html)

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');

    if (!itemId) {
        window.location.href = 'items.html';
        return;
    }

    loadItemDetails(itemId);
});

async function loadItemDetails(itemId) {
    const detailsContainer = document.getElementById('item-details-container');
    if (!detailsContainer) return;

    try {
        const response = await fetch(`${API_BASE_URL}/items/${itemId}`);
        const item = await response.json();

        if (!response.ok) {
            throw new Error(item.message || 'Failed to load item details');
        }

        const currentUser = getUser();
        const isOwner = currentUser && item.postedBy && (currentUser._id === item.postedBy._id);

        const typeBadge = item.type === 'LOST' 
            ? '<span class="badge badge-lost me-2 fs-6">LOST</span>' 
            : '<span class="badge badge-found me-2 fs-6">FOUND</span>';
        
        const statusBadge = item.status === 'RETURNED'
            ? '<span class="badge badge-returned fs-6">RETURNED</span>'
            : '<span class="badge badge-active fs-6">ACTIVE</span>';

        const posterName = item.postedBy ? item.postedBy.name : 'Unknown Student';

        let actionButtonsHtml = '';

        if (isOwner) {
            // Owner options: Mark Returned or Delete
            actionButtonsHtml = `
                <div class="mt-4 pt-3 border-top">
                    <h6>Listing Owner Actions:</h6>
                    ${item.status === 'ACTIVE' 
                        ? `<button onclick="markItemReturned('${item._id}')" class="btn btn-success me-2">✅ Mark as Returned</button>` 
                        : `<button disabled class="btn btn-secondary me-2">✅ Item Returned</button>`
                    }
                    <button onclick="deleteItemListing('${item._id}')" class="btn btn-outline-danger">🗑️ Delete Listing</button>
                </div>
            `;
        } else {
            // Visitor / Other student options: Message User CTA
            if (currentUser) {
                actionButtonsHtml = `
                    <div class="mt-4 pt-3 border-top">
                        <a href="chat.html?itemId=${item._id}&receiverId=${item.postedBy._id}" class="btn btn-primary btn-lg">
                            💬 Message User
                        </a>
                        <p class="text-muted small mt-2">Communicate privately with ${posterName} to verify ownership and arrange item collection.</p>
                    </div>
                `;
            } else {
                actionButtonsHtml = `
                    <div class="mt-4 pt-3 border-top">
                        <a href="login.html" class="btn btn-primary btn-lg">
                            🔒 Login to Message User
                        </a>
                    </div>
                `;
            }
        }

        detailsContainer.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-header bg-white py-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            ${typeBadge}
                            ${statusBadge}
                        </div>
                        <span class="text-muted">Category: <strong>${item.category}</strong></span>
                    </div>
                </div>
                <div class="card-body">
                    <h2 class="card-title mb-3">${item.title}</h2>
                    <hr>
                    <div class="row mb-4">
                        <div class="col-md-6 mb-2">
                            <strong>📍 Location:</strong> ${item.location}
                        </div>
                        <div class="col-md-6 mb-2">
                            <strong>📅 Date Lost/Found:</strong> ${item.date}
                        </div>
                        <div class="col-md-6 mb-2">
                            <strong>👤 Posted By:</strong> ${posterName}
                        </div>
                        <div class="col-md-6 mb-2">
                            <strong>⏱️ Listing Date:</strong> ${new Date(item.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                    
                    <h5>Description</h5>
                    <p class="card-text bg-light p-3 rounded" style="white-space: pre-line;">${item.description}</p>
                    
                    ${actionButtonsHtml}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading item details:', error);
        detailsContainer.innerHTML = `
            <div class="alert alert-danger" role="alert">
                ${error.message || 'Error loading item details.'}
            </div>
        `;
    }
}

// Mark item returned API call
async function markItemReturned(itemId) {
    if (!confirm('Are you sure you want to mark this item as RETURNED?')) return;

    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'RETURNED' })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Item status updated to RETURNED!', 'success');
            loadItemDetails(itemId);
        } else {
            showAlert(data.message || 'Failed to update item status.', 'danger');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showAlert('Network error updating item status.', 'danger');
    }
}

// Delete item API call
async function deleteItemListing(itemId) {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;

    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert('Listing deleted successfully.');
            window.location.href = 'my-items.html';
        } else {
            showAlert(data.message || 'Failed to delete item.', 'danger');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        showAlert('Network error deleting item.', 'danger');
    }
}
