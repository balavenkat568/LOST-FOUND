// Logic for My Listings page (my-items.html)

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadMyItems();
});

async function loadMyItems() {
    const container = document.getElementById('my-items-container');
    if (!container) return;

    container.innerHTML = `
        <div class="col-12 text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading your listings...</span>
            </div>
        </div>
    `;

    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/items/user/my`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const items = await response.json();

        if (!response.ok) {
            throw new Error(items.message || 'Failed to fetch your listings');
        }

        if (items.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted fs-5">You haven't posted any lost or found items yet.</p>
                    <a href="create-item.html" class="btn btn-primary mt-2">+ Post Your First Item</a>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map(item => {
            const typeBadge = item.type === 'LOST' 
                ? '<span class="badge badge-lost me-1">LOST</span>' 
                : '<span class="badge badge-found me-1">FOUND</span>';
            
            const statusBadge = item.status === 'RETURNED'
                ? '<span class="badge badge-returned">RETURNED</span>'
                : '<span class="badge badge-active">ACTIVE</span>';

            return `
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                    ${typeBadge}
                                    ${statusBadge}
                                </div>
                                <small class="text-muted">${item.category}</small>
                            </div>
                            <h5 class="card-title text-truncate">${item.title}</h5>
                            <p class="card-text text-muted flex-grow-1">${item.description}</p>
                            <small class="text-muted d-block mb-3">📍 Location: ${item.location} | Date: ${item.date}</small>
                            <div class="d-flex gap-2">
                                <a href="item-details.html?id=${item._id}" class="btn btn-outline-primary btn-sm flex-fill">View Details</a>
                                ${item.status === 'ACTIVE' 
                                    ? `<button onclick="markAsReturnedMyPage('${item._id}')" class="btn btn-outline-success btn-sm flex-fill">Mark Returned</button>`
                                    : `<button disabled class="btn btn-secondary btn-sm flex-fill">Returned</button>`
                                }
                                <button onclick="deleteMyItem('${item._id}')" class="btn btn-outline-danger btn-sm">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading my items:', error);
        showAlert(error.message, 'danger');
        container.innerHTML = `<div class="col-12 text-center text-danger py-4">Failed to load your listings.</div>`;
    }
}

async function markAsReturnedMyPage(itemId) {
    if (!confirm('Mark this item as RETURNED?')) return;

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

        if (response.ok) {
            showAlert('Item marked as RETURNED!', 'success');
            loadMyItems();
        } else {
            const data = await response.json();
            showAlert(data.message || 'Failed to update status', 'danger');
        }
    } catch (error) {
        console.error('Error marking returned:', error);
        showAlert('Network error updating item status.', 'danger');
    }
}

async function deleteMyItem(itemId) {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showAlert('Item deleted successfully!', 'success');
            loadMyItems();
        } else {
            const data = await response.json();
            showAlert(data.message || 'Failed to delete item', 'danger');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        showAlert('Network error deleting item.', 'danger');
    }
}
