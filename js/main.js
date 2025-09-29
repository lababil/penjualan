// js/main.js - Main application logic

class LoginManager {
    constructor() {
        this.form = null;
        this.emailInput = null;
        this.passwordInput = null;
        this.loginButton = null;
        this.errorMessage = null;
        this.successMessage = null;
        this.loadingSpinner = null;
        this.buttonText = null;
    }

    init() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.loginButton = document.getElementById('loginButton');
        this.errorMessage = document.getElementById('errorMessage');
        this.successMessage = document.getElementById('successMessage');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.buttonText = document.getElementById('buttonText');

        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleLogin(e));
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.target === this.emailInput || e.target === this.passwordInput)) {
                e.preventDefault();
                this.handleLogin(e);
            }
        });
    }

    async handleLogin(event) {
        event.preventDefault();

        const email = this.emailInput?.value?.trim();
        const password = this.passwordInput?.value?.trim();

        this.clearMessages();

        if (!email || !password) {
            this.showError('Email and password are required.');
            return;
        }

        this.setLoading(true);

        try {
            if (!window.auth || typeof window.auth.signIn !== 'function') {
                throw new Error('Firebase authentication is not ready. Please refresh the page.');
            }

            const result = await window.auth.signIn(email, password);

            if (result.success) {
                this.showSuccess('Login successful! Redirecting...');
            } else {
                throw new Error(result.error || 'Invalid email or password.');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError(error.message || 'An unexpected error occurred. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        if (this.loginButton) this.loginButton.disabled = loading;
        if (this.buttonText) this.buttonText.textContent = loading ? 'Signing in...' : 'Sign In';
        if (this.loadingSpinner) this.loadingSpinner.classList.toggle('hidden', !loading);
        if (this.emailInput) this.emailInput.disabled = loading;
        if (this.passwordInput) this.passwordInput.disabled = loading;
    }

    showError(message) {
        if (this.errorMessage) {
            this.errorMessage.classList.remove('hidden');
            document.getElementById('errorMessageText').textContent = message;
        }
        if (this.successMessage) this.successMessage.classList.add('hidden');
    }

    showSuccess(message) {
        if (this.successMessage) {
            this.successMessage.classList.remove('hidden');
            document.getElementById('successMessageText').textContent = message;
        }
        if (this.errorMessage) this.errorMessage.classList.add('hidden');
    }

    clearMessages() {
        if (this.errorMessage) this.errorMessage.classList.add('hidden');
        if (this.successMessage) this.successMessage.classList.add('hidden');
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    const loginManager = new LoginManager();
    loginManager.init();
    window.loginManager = loginManager;
});
