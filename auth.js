// Simple authentication handling 
const users = [
    { id: 1, username: 'admin', password: 'admin123', name: 'Admin User' },
    { id: 2, username: 'staff', password: 'staff123', name: 'Staff Member' }
];

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('index.html')) {
        const currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) {
            window.location.href = 'login.html';
        } else {
            document.getElementById('currentUser').textContent = JSON.parse(currentUser).name;
        }
    }
});

// Handle login form submission
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'index.html';
        } else {
            document.getElementById('loginError').textContent = 'Invalid username or password';
        }
    });
}

// Handle logout
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
}