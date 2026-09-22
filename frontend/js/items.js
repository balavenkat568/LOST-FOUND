// Logic for Browse Items page (items.html)

document.addEventListener('DOMContentLoaded', () => {
    loadItems();

    // Event listener for search & filter form
    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            loadItems();
        });
    }

    // Reset filters handler
    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.getElementById('search-input').value = '';
            document.getElementById('type-select').value = 'ALL';
            document.getElementById('category-select').value = 'ALL';
            document.getElementById('status-select').value = 'ALL';
            document.getElementById('location-input').value = '';
            loadItems();
        });
    }
});

async function loadItems() {
    const itemsGrid = document.getElementById('items-grid');
    if (!itemsGrid) return;

    itemsGrid.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading items...</span>
            </div>
        </div>
    `;

    // Extract filter values
    const search = document.getElementById('search-input')?.value.trim() || '';
    const type = document.getElementById('type-select')?.value || 'ALL';
    const category = document.getElementById('category-select')?.value || 'ALL';
    const status = document.getElementById('status-select')?.value || 'ALL';
    const location = document.getElementById('location-input')?.value.trim() || '';

    // Build URL query string
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (type !== 'ALL') queryParams.append('type', type);
    if (category !== 'ALL') queryParams.append('category', category);
    if (status !== 'ALL') queryParams.append('status', status);
    if (location) queryParams.append('location', location);

    try {
        const response = await fetch(`${API_BASE_URL}/items?${queryParams.toString()}`);
        const items = await response.json();

        if (!response.ok) {
            throw new Error(items.message || 'Failed to fetch items');
        }

        if (items.length === 0) {
            itemsGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted fs-5">No lost or found items match your criteria.</p>
                </div>
            `;
            return;
        }

        itemsGrid.innerHTML = items.map(item => renderItemCard(item)).join('');
    } catch (error) {
        console.error('Error loading items:', error);
        showAlert(error.message, 'danger');
        itemsGrid.innerHTML = `<div class="col-12 text-center py-4 text-danger">Error loading items. Please try again.</div>`;
    }
}

function renderItemCard(item) {
    const typeBadge = item.type === 'LOST' 
        ? '<span class="badge badge-lost me-1">LOST</span>' 
        : '<span class="badge badge-found me-1">FOUND</span>';
    
    const statusBadge = item.status === 'RETURNED'
        ? '<span class="badge badge-returned">RETURNED</span>'
        : '<span class="badge badge-active">ACTIVE</span>';

    const posterName = item.postedBy ? item.postedBy.name : 'Unknown Student';

    return `
        <div class="col-md-4 mb-4">
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
                    <p class="card-text text-muted flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                        ${item.description}
                    </p>
                    <div class="mt-2 pt-2 border-top">
                        <small class="d-block text-muted mb-1">📍 <strong>Location:</strong> ${item.location}</small>
                        <small class="d-block text-muted mb-1">📅 <strong>Date:</strong> ${item.date}</small>
                        <small class="d-block text-muted mb-3">👤 <strong>Posted by:</strong> ${posterName}</small>
                        <a href="item-details.html?id=${item._id}" class="btn btn-outline-primary btn-sm w-100">View Details</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}
