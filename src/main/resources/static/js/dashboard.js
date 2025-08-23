// Dashboard page functionality
document.addEventListener("DOMContentLoaded", function () {
    console.log("Dashboard page loaded");

    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
        // Redirect to login if not authenticated
        window.location.href = "/login";
        return;
    }

    // Load user data and update dashboard
    loadUserData();
    console.log("User is authenticated, dashboard ready");
});

function loadUserData() {
    const username = localStorage.getItem("username");
    const roles = localStorage.getItem("roles");

    // Update dashboard welcome message
    const welcomeTitle = document.querySelector(".welcome-message h3");
    if (welcomeTitle && username) {
        welcomeTitle.textContent = `خوش آمدید ${username}!`;
    }

    // Update role information if available
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

            // You can add role-specific content here
            console.log(`User role: ${roleText}`);
        } catch (e) {
            console.error("Error parsing roles:", e);
        }
    }
}

// Add any dashboard-specific functions here
function refreshDashboard() {
    console.log("Refreshing dashboard...");
    // Add refresh logic here later
}
