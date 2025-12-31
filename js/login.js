// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.innerHTML = `
            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        `;
    } else {
        passwordInput.type = 'password';
        eyeIcon.innerHTML = `
            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        `;
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'flex';

    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Show loading state
function setLoading(isLoading) {
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    const loginBtn = document.querySelector('.btn-login');

    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        loginBtn.disabled = true;
    } else {
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        loginBtn.disabled = false;
    }
}

// Check user role and redirect accordingly
async function checkUserRoleAndRedirect(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            const userRole = userData.role || 'customer';

            console.log('User role:', userRole);

            // Redirect based on role
            switch(userRole) {
                case 'barista':
                    window.location.href = 'barista/dashboard.html';
                    break;
                case 'admin':
                    window.location.href = 'admin/dashboard.html';
                    break;
                default:
                    // Customer role - not allowed to access web dashboard
                    await auth.signOut();
                    showError('Access denied. This portal is for staff only.');
            }
        } else {
            await auth.signOut();
            showError('User profile not found. Please contact administrator.');
        }
    } catch (error) {
        console.error('Error checking user role:', error);
        showError('Error verifying user access. Please try again.');
        await auth.signOut();
    }
}

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Basic validation
    if (!email || !password) {
        showError('Please enter both email and password');
        return;
    }

    setLoading(true);

    try {
        // Set persistence based on "Remember Me" checkbox
        const persistence = rememberMe
            ? firebase.auth.Auth.Persistence.LOCAL
            : firebase.auth.Auth.Persistence.SESSION;

        await auth.setPersistence(persistence);

        // Sign in with email and password
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        console.log('Login successful:', user.uid);

        // Check user role and redirect
        await checkUserRoleAndRedirect(user.uid);

    } catch (error) {
        console.error('Login error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        setLoading(false);

        // Handle different error codes
        switch (error.code) {
            case 'auth/user-not-found':
                showError('No account found with this email address');
                break;
            case 'auth/wrong-password':
                showError('Incorrect password. Please try again');
                break;
            case 'auth/invalid-email':
                showError('Invalid email address format');
                break;
            case 'auth/invalid-credential':
                showError('Invalid email or password. Please check your credentials');
                break;
            case 'auth/user-disabled':
                showError('This account has been disabled. Contact administrator');
                break;
            case 'auth/too-many-requests':
                showError('Too many failed attempts. Please try again later');
                break;
            case 'auth/network-request-failed':
                showError('Network error. Please check your internet connection');
                break;
            default:
                showError(`Login failed: ${error.message}`);
        }
    }
});

// Check if user is already logged in
auth.onAuthStateChanged(async (user) => {
    if (user && window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        console.log('User already logged in, checking role...');
        await checkUserRoleAndRedirect(user.uid);
    }
});

// Add enter key listener for form inputs
document.getElementById('email').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('password').focus();
    }
});

console.log('Login script loaded successfully');
