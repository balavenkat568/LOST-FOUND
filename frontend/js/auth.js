// Shared Authentication & UI Utility Functions

const API_BASE_URL = window.location.origin + '/api';

// Get token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Get user profile object from localStorage
function getUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
}

// Save authentication data to localStorage
function setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

// Logout user and clear localStorage
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Protect pages requiring login
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
    }
}

// Display alert banner in UI
function showAlert(message, type = 'danger', containerId = 'alert-container') {
    const alertContainer = document.getElementById(containerId);
    if (!alertContainer) return;

    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}

// Render dynamic navbar based on auth state
function renderNavbar() {
    const navAuthItems = document.getElementById('nav-auth-items');
    if (!navAuthItems) return;

    const token = getToken();
    const user = getUser();

    if (token && user) {
        navAuthItems.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="items.html">Browse Items</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="create-item.html">+ Post Item</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="my-items.html">My Items</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="inbox.html">💬 Inbox</a>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle font-weight-bold" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    👤 ${user.name}
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item text-danger" href="#" onclick="logout(); return false;">Logout</a></li>
                </ul>
            </li>
        `;
    } else {
        navAuthItems.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="items.html">Browse Items</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="login.html">Login</a>
            </li>
            <li class="nav-item">
                <a class="btn btn-outline-primary ms-2" href="register.html">Register</a>
            </li>
        `;
    }
}

// Execute when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
});
