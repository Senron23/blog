const wrapper=document.querySelector('.wrapper');
const loginLink=document.querySelector('.login-link');
const registerLink=document.querySelector('.register-link');
// const btnPopup=document.querySelector('.btnLogin');
// const iconClose=document.querySelector('.icon-close');

registerLink.addEventListener('click', ()=>{
    wrapper.classList.add('active');
});
loginLink.addEventListener('click', ()=>{
    wrapper.classList.remove('active');
});
// btnPopup.addEventListener('click', ()=>{
//     wrapper.classList.add('active-popup');
// });
// iconClose.addEventListener('click', ()=>{
//     wrapper.classList.remove('active-popup');
// });
// Function to handle login
// Function to show error messages
function showError(message) {
  alert(message); // You can replace this with a more sophisticated error display
}



document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth.js is connected!');

    // Get form elements
    const registerForm = document.querySelector('.register form');
    const loginForm = document.querySelector('.login form');

    if (registerForm) {
        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            console.log('Register form submitted');
            
            // Debug logs to check form elements
            console.log('Form elements:', {
                usernameInput: this.querySelector('input[name="username"]'),
                passwordInput: this.querySelector('input[name="password"]')
            });

            const usernameInput = this.querySelector('input[name="username"]');
            const passwordInput = this.querySelector('input[name="password"]');

            if (!usernameInput || !passwordInput) {
                console.error('Form inputs not found');
                alert('Form inputs not found');
                return;
            }

            const username = usernameInput.value;
            const password = passwordInput.value;

            console.log('Attempting registration with username:', username);

            try {
                const response = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();
                console.log('Server response:', data);

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userId', data.userId);
                    window.location.href = 'index.html';
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Registration error:', error);
                alert('An error occurred during registration');
            }
        });
    } else {
        console.error('Register form not found');
    }

    // Similar update for login form
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            console.log('Login form submitted');

            const usernameInput = this.querySelector('input[name="username"]');
            const passwordInput = this.querySelector('input[name="password"]');

            if (!usernameInput || !passwordInput) {
                console.error('Form inputs not found');
                alert('Form inputs not found');
                return;
            }

            const username = usernameInput.value;
            const password = passwordInput.value;

            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();
                console.log('Server response:', data);

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userId', data.userId);
                    window.location.href = 'index.html';
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('An error occurred during login');
            }
        });
    } else {
        console.error('Login form not found');
    }
});

// Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token; // Returns true if token exists
}

// Protect routes
function protectRoute() {
    console.log('Checking if route is protected...');
    const token = localStorage.getItem('token');
    console.log('Token found in localStorage:', !!token);
    
    if (!token && !window.location.pathname.includes('loginsignup.html')) {
        console.log('No token found, redirecting to login page');
        window.location.href = 'loginsignup.html';
        return false;
    }
    
    console.log('User is authenticated');
    return true;
}

// Add logout function
function logout() {
    console.log('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = 'loginsignup.html';
}

// Add this to your existing auth.js code for handling tokens in requests
async function makeAuthenticatedRequest(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401) {
        // Token expired or invalid
        logout();
        return null;
    }

    return response;
} 