// Check if user is already logged in on page load
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    if (token) {
        updateAuthUI(true);
    }
});

// Show message to user
function showMessage(message, type) {
    // Create message element
    const messageDiv = document.createElement("div");
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;

    // Style the message
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;

    if (type === "success") {
        messageDiv.style.backgroundColor = "#28a745";
    } else {
        messageDiv.style.backgroundColor = "#dc3545";
    }

    // Add to page
    document.body.appendChild(messageDiv);

    // Remove after 3 seconds
    setTimeout(() => {
        messageDiv.style.animation = "slideOut 0.3s ease";
        setTimeout(() => {
            if (messageDiv.parentNode) {
                document.body.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// Update authentication UI
function updateAuthUI(isLoggedIn) {
    const authButtons = document.querySelector(".auth-buttons");

    if (isLoggedIn) {
        const username = localStorage.getItem("username");
        authButtons.innerHTML = `
            <span class="user-welcome">خوش آمدید ${username}</span>
            <button class="btn btn-secondary" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i>
                خروج
            </button>
        `;
    } else {
        authButtons.innerHTML = `
            <a href="/login" class="btn btn-login">
                <i class="fas fa-sign-in-alt"></i>
                ورود
            </a>
            <a href="/register" class="btn btn-register">
                <i class="fas fa-user-plus"></i>
                ثبت‌نام
            </a>
        `;
    }
}

// Logout function
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("roles");
    updateAuthUI(false);
    showMessage("خروج موفقیت‌آمیز بود", "success");
}

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .user-welcome {
        color: white;
        font-weight: 500;
        margin-left: 1rem;
    }
`;
document.head.appendChild(style);
