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

            // Check if user has PROVIDER or ADMIN role to show provider-only section
            if (roles) {
                try {
                    const rolesArray = JSON.parse(roles);
                    const hasProviderRole = rolesArray.some(
                        (role) =>
                            role.authority === "PROVIDER" ||
                            role.authority === "ADMIN"
                    );

                    const providerSection =
                        document.querySelector(".provider-only");
                    if (providerSection) {
                        providerSection.style.display = hasProviderRole
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
