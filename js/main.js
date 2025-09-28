// js/main.js - Main application logic

class LoginManager {
    constructor() {
        this.form = null;
        this.usernameInput = null;
        this.passwordInput = null;
        this.loginButton = null;
        this.errorMessage = null;
        this.successMessage = null;
        this.loadingSpinner = null;
        this.buttonText = null;
    }

    // Initialize login form
    init() {
        this.form = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.loginButton = document.getElementById('loginButton');
        this.errorMessage = document.getElementById('errorMessage');
        this.successMessage = document.getElementById('successMessage');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.buttonText = document.getElementById('buttonText');

        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.target === this.usernameInput || e.target === this.passwordInput)) {
                e.preventDefault();
                this.handleLogin(e);
            }
        });
    }

    // Handle login form submission
    async handleLogin(event) {
        event.preventDefault();

        const username = this.usernameInput?.value?.trim();
        const password = this.passwordInput?.value?.trim();

        // Clear previous messages
        this.clearMessages();

        // Validate input
        if (!username || !password) {
            this.showError('Silakan masukkan email dan password.');
            return;
        }

        // For demo purposes, convert username to email format if needed
        let email = username;
        if (!email.includes('@')) {
            // Convert demo usernames to email format
            email = `${username}@lababil.com`;
        }

        // Set loading state
        this.setLoading(true);

        try {
            // Check if Firebase Auth is ready
            if (!window.auth || typeof window.auth.signIn !== 'function') {
                throw new Error('Sistem autentikasi belum siap. Pastikan konfigurasi Firebase sudah benar dan refresh halaman.');
            }

            // Use Firebase Authentication
            const result = await window.auth.signIn(email, password);

            if (result.success) {
                // Show success message
                this.showSuccess('Login berhasil! Mengalihkan...');

                // Clear form
                this.clearForm();

                // Firebase will automatically redirect via auth state listener

            } else {
                throw new Error(result.error || 'Login gagal');
            }

        } catch (error) {
            console.error('Login error:', error);
            this.showError(error.message || 'Terjadi kesalahan saat login. Silakan coba lagi.');
        } finally {
            this.setLoading(false);
        }
    }

    // Set loading state
    setLoading(loading) {
        if (this.loginButton) {
            this.loginButton.disabled = loading;
        }
        
        if (this.buttonText) {
            this.buttonText.textContent = loading ? 'Signing in...' : 'Sign In';
        }
        
        if (this.loadingSpinner) {
            this.loadingSpinner.classList.toggle('hidden', !loading);
        }

        // Disable form inputs during loading
        if (this.usernameInput) this.usernameInput.disabled = loading;
        if (this.passwordInput) this.passwordInput.disabled = loading;
    }

    // Show error message
    showError(message) {
        if (this.errorMessage) {
            this.errorMessage.classList.remove('hidden');
            this.errorMessage.querySelector('div').textContent = message;
        }
        
        if (this.successMessage) {
            this.successMessage.classList.add('hidden');
        }
    }

    // Show success message  
    showSuccess(message) {
        if (this.successMessage) {
            this.successMessage.classList.remove('hidden');
            this.successMessage.querySelector('div').textContent = message;
        }
        
        if (this.errorMessage) {
            this.errorMessage.classList.add('hidden');
        }
    }

    // Clear all messages
    clearMessages() {
        if (this.errorMessage) {
            this.errorMessage.classList.add('hidden');
        }
        
        if (this.successMessage) {
            this.successMessage.classList.add('hidden');
        }
    }

    // Clear form inputs
    clearForm() {
        if (this.usernameInput) this.usernameInput.value = '';
        if (this.passwordInput) this.passwordInput.value = '';
    }
}

// Theme Management
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.createThemeToggle();
    }

    applyTheme(theme) {
        document.body.className = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    createThemeToggle() {
        // Create theme toggle button (optional)
        const themeToggle = document.createElement('button');
        themeToggle.id = 'themeToggle';
        themeToggle.className = 'fixed top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors';
        themeToggle.innerHTML = this.currentTheme === 'light' ? '🌙' : '☀️';
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
            themeToggle.innerHTML = this.currentTheme === 'light' ? '🌙' : '☀️';
        });
        
        document.body.appendChild(themeToggle);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize login manager
    const loginManager = new LoginManager();
    loginManager.init();
    
    // Initialize theme manager
    const themeManager = new ThemeManager();
    themeManager.init();
    
    // Make managers globally available
    window.loginManager = loginManager;
    window.themeManager = themeManager;
    
    console.log('Lababil Sales System v2.0 initialized');
});