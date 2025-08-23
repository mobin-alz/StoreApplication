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

function loadFooter() {
    fetch("/fragments/footer.html")
        .then((response) => response.text())
        .then((html) => {
            document.getElementById("footer-placeholder").innerHTML = html;
        })
        .catch((error) => console.error("Error loading footer:", error));
}

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

// Toggle dropdown menu
function toggleDropdown() {
    const dropdownMenu = document.getElementById("dropdown-menu");
    if (dropdownMenu) {
        dropdownMenu.classList.toggle("show");
    }
}

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
        text-align: center;
    `;

    if (type === "success") {
        messageDiv.style.backgroundColor = "#28a745";
    } else {
        messageDiv.style.backgroundColor = "#dc3545";
    }

    // Add to page
    document.body.appendChild(messageDiv);

    // Remove after 5 seconds
    setTimeout(() => {
        messageDiv.style.animation = "slideOut 0.3s ease";
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 5000);
}
