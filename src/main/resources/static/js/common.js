// Load navigation and footer on all pages
document.addEventListener("DOMContentLoaded", function () {
    loadNavigation();
    loadFooter();
    updateNavigationState();
});

function loadNavigation() {
    fetch("/fragments/navigation.html")
        .then((response) => response.text())
        .then((html) => {
            document.getElementById("nav-placeholder").innerHTML = html;
            // After loading navigation, update the state
            updateNavigationState();
        })
        .catch((error) => console.error("Error loading navigation:", error));
}

// Make function globally accessible
window.loadNavigation = loadNavigation;

function loadFooter() {
    fetch("/fragments/footer.html")
        .then((response) => response.text())
        .then((html) => {
            document.getElementById("footer-placeholder").innerHTML = html;
        })
        .catch((error) => console.error("Error loading footer:", error));
}

// Make function globally accessible
window.loadFooter = loadFooter;

// Update navigation based on authentication state
function updateNavigationState() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const roles = localStorage.getItem("roles");

    const guestButtons = document.getElementById("guest-buttons");
    const userDropdown = document.getElementById("user-dropdown");
    const userName = document.getElementById("user-name");
    const dropdownUsername = document.getElementById("dropdown-username");
    const dropdownRole = document.getElementById("dropdown-role");

    if (token && username) {
        // User is logged in
        if (guestButtons) guestButtons.style.display = "none";
        if (userDropdown) {
            userDropdown.style.display = "flex";
            if (userName) userName.textContent = username;
            if (dropdownUsername) dropdownUsername.textContent = username;

            // Set role text
            if (roles) {
                try {
                    const rolesArray = JSON.parse(roles);
                    const role = rolesArray[0]?.authority || "USER";
                    const roleText =
                        role === "USER"
                            ? "کاربر عادی"
                            : role === "PROVIDER"
                            ? "فروشنده"
                            : role === "ADMIN"
                            ? "مدیر"
                            : "کاربر";
                    if (dropdownRole) dropdownRole.textContent = roleText;
                } catch (e) {
                    if (dropdownRole) dropdownRole.textContent = "کاربر عادی";
                }
            }
        }
    } else {
        // User is not logged in
        if (guestButtons) guestButtons.style.display = "flex";
        if (userDropdown) userDropdown.style.display = "none";
    }
}

// Make function globally accessible
window.updateNavigationState = updateNavigationState;

// Toggle dropdown menu
function toggleDropdown() {
    const dropdownMenu = document.getElementById("dropdown-menu");
    if (dropdownMenu) {
        dropdownMenu.classList.toggle("show");
    }
}

// Make function globally accessible
window.toggleDropdown = toggleDropdown;

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
    const userDropdown = document.getElementById("user-dropdown");
    const dropdownMenu = document.getElementById("dropdown-menu");

    if (userDropdown && !userDropdown.contains(event.target)) {
        if (dropdownMenu) {
            dropdownMenu.classList.remove("show");
        }
    }
});

// Logout function
function logout() {
    // Clear all authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("roles");

    // Update navigation
    updateNavigationState();

    // Redirect to home page
    window.location.href = "/";

    // Show logout message
    showMessage("خروج موفقیت‌آمیز بود", "success");
}

// Make function globally accessible
window.logout = logout;

// Show message function (reusable)
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll(".message");
    existingMessages.forEach((msg) => msg.remove());

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
        max-width: 400px;
        word-wrap: break-word;
    `;

    // Set background color based on message type
    switch (type) {
        case "success":
            messageDiv.style.backgroundColor = "#28a745";
            break;
        case "error":
            messageDiv.style.backgroundColor = "#dc3545";
            break;
        case "warning":
            messageDiv.style.backgroundColor = "#ffc107";
            messageDiv.style.color = "#212529";
            break;
        default:
            messageDiv.style.backgroundColor = "#17a2b8";
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

// Make function globally accessible
window.showMessage = showMessage;

// Add CSS animations
const commonStyle = document.createElement("style");
commonStyle.textContent = `
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
`;
document.head.appendChild(commonStyle);

// Add this function to check token expiration proactively
function checkTokenExpiration() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        // Decode JWT payload (without verification)
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();

        // If token expires in next 5 minutes, show warning
        if (expirationTime - currentTime < 5 * 60 * 1000) {
            showMessage(
                "جلسه شما به زودی منقضی می‌شود. لطفاً دوباره وارد شوید.",
                "warning"
            );
        }

        // If token is expired, logout immediately
        if (currentTime >= expirationTime) {
            logout();
            showMessage(
                "جلسه شما منقضی شده است. لطفاً دوباره وارد شوید.",
                "error"
            );
        }
    } catch (error) {
        console.error("Error decoding token:", error);
        // If token is malformed, consider it expired and log out
        logout();
        showMessage("توکن نامعتبر است. لطفاً دوباره وارد شوید.", "error");
    }
}

// Make function globally accessible
window.checkTokenExpiration = checkTokenExpiration;

// Check token expiration every minute
setInterval(checkTokenExpiration, 60000);

// Also check when page loads
document.addEventListener("DOMContentLoaded", checkTokenExpiration);
