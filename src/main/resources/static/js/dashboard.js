// Dashboard JavaScript
document.addEventListener("DOMContentLoaded", function () {
    // Wait for common functions to be available
    setTimeout(() => {
        if (typeof loadNavigation === "function") {
            loadNavigation();
        }
        if (typeof loadFooter === "function") {
            loadFooter();
        }

        // Load user data after navigation is loaded
        loadUserData();

        // Start token expiration check
        setInterval(checkTokenExpiration, 60000); // Check every minute

        // Add event listeners for dashboard items
        addDashboardEventListeners();
    }, 100);
});

// Load user data and update dashboard
async function loadUserData() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
            return;
        }

        const username = localStorage.getItem("username");
        const roles = localStorage.getItem("roles");

        if (username) {
            // Update welcome message
            const welcomeMessage = document.querySelector(
                ".welcome-message h3"
            );
            if (welcomeMessage) {
                welcomeMessage.textContent = `خوش آمدید ${username}!`;
            }

            // Check user roles and show appropriate sections
            if (roles) {
                try {
                    const rolesArray = JSON.parse(roles);
                    const hasProviderRole = rolesArray.some(
                        (role) => role.authority === "PROVIDER"
                    );
                    const hasAdminRole = rolesArray.some(
                        (role) => role.authority === "ADMIN"
                    );

                    // Hide user sections for admin
                    const placeholderContent = document.querySelector(
                        ".placeholder-content"
                    );
                    if (placeholderContent && hasAdminRole) {
                        placeholderContent.style.display = "none";
                    }

                    // Show/hide provider section (only for non-admin providers)
                    const providerSection =
                        document.querySelector(".provider-only");
                    if (providerSection) {
                        providerSection.style.display =
                            hasProviderRole && !hasAdminRole ? "block" : "none";
                    }

                    // Show/hide admin section
                    const adminSection = document.querySelector(".admin-only");
                    if (adminSection) {
                        adminSection.style.display = hasAdminRole
                            ? "block"
                            : "none";
                    }
                } catch (e) {
                    console.error("Error parsing roles:", e);
                }
            }

            // Wait for navigation to load, then update it
            setTimeout(() => {
                if (typeof window.updateNavigationState === "function") {
                    window.updateNavigationState();
                } else {
                    // Fallback: update navigation manually
                    updateNavigationState();
                }
            }, 100);
        }
    } catch (error) {
        console.error("Error loading user data:", error);
        showMessage("خطا در بارگذاری اطلاعات کاربر", "error");
    }
}

// Add event listeners for dashboard items
function addDashboardEventListeners() {
    // Wishlist button
    const wishlistBtn = document.getElementById("wishlist-dashboard-btn");
    if (wishlistBtn) {
        wishlistBtn.addEventListener("click", function () {
            window.location.href = "/wishlist";
        });
    }
}
