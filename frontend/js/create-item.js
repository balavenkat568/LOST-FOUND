// Logic for Posting a Lost/Found Item (create-item.html)

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    const createForm = document.getElementById('create-item-form');
    if (createForm) {
        createForm.addEventListener('submit', handleCreateItem);
    }
});

async function handleCreateItem(e) {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const location = document.getElementById('location').value.trim();
    const date = document.getElementById('date').value.trim();
    const description = document.getElementById('description').value.trim();

    if (!title || !type || !category || !location || !date || !description) {
        showAlert('Please fill in all required fields.', 'warning');
        return;
    }

    const token = getToken();

    try {
        const response = await fetch(`${API_BASE_URL}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                type,
                category,
                location,
                date,
                description
            })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Item listing created successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = `item-details.html?id=${data._id}`;
            }, 1200);
        } else {
            showAlert(data.message || 'Failed to create item listing.', 'danger');
        }
    } catch (error) {
        console.error('Create item error:', error);
        showAlert('Network error while posting item.', 'danger');
    }
}
