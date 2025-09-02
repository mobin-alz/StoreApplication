// Dashboard Users Management JavaScript
let users = [];
let filteredUsers = [];
let userToDelete = null;

document.addEventListener("DOMContentLoaded", function () {
    // Wait for common functions to be available
    setTimeout(() => {
        if (typeof loadNavigation === "function") {
            loadNavigation();
        }
        if (typeof loadFooter === "function") {
            loadFooter();
        }

        // Check if user is admin
        checkAdminAccess();

        // Load users
        loadUsers();

        // Add event listeners
        addEventListeners();

        // Start token expiration check
        setInterval(checkTokenExpiration, 60000); // Check every minute
    }, 100);
});

// Check if user has admin access
function checkAdminAccess() {
    const token = localStorage.getItem("token");
    const roles = localStorage.getItem("roles");

    if (!token) {
        window.location.href = "/login";
        return;
    }

    if (roles) {
        try {
            const rolesArray = JSON.parse(roles);
            const hasAdminRole = rolesArray.some(
                (role) => role.authority === "ADMIN"
            );

            if (!hasAdminRole) {
                showMessage(
                    "شما دسترسی لازم برای مشاهده این صفحه را ندارید",
                    "error"
                );
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 2000);
                return;
            }
        } catch (e) {
            console.error("Error parsing roles:", e);
            window.location.href = "/login";
        }
    } else {
        window.location.href = "/login";
    }
}

// Add event listeners
function addEventListeners() {
    // Search input
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", filterUsers);
    }

    // Edit form
    const editForm = document.getElementById("edit-user-form");
    if (editForm) {
        editForm.addEventListener("submit", handleEditUser);
    }

    // Modal close on outside click
    window.addEventListener("click", function (event) {
        const editModal = document.getElementById("edit-user-modal");
        const deleteModal = document.getElementById("delete-user-modal");

        if (event.target === editModal) {
            closeEditModal();
        }
        if (event.target === deleteModal) {
            closeDeleteModal();
        }
    });
}

// Load users from API
async function loadUsers() {
    try {
        showLoading(true);
        hideError();

        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch("/api/users/all", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("username");
                localStorage.removeItem("roles");
                window.location.href = "/login";
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        users = await response.json();
        filteredUsers = [...users];

        showLoading(false);
        renderUsers();

        if (users.length === 0) {
            showNoUsersMessage();
        }
    } catch (error) {
        console.error("Error loading users:", error);
        showLoading(false);
        showError("خطا در بارگذاری کاربران: " + error.message);
    }
}

// Show loading spinner
function showLoading(show) {
    const loadingSpinner = document.getElementById("loading-spinner");
    const usersTableContainer = document.getElementById(
        "users-table-container"
    );

    if (show) {
        loadingSpinner.style.display = "flex";
        usersTableContainer.style.display = "none";
    } else {
        loadingSpinner.style.display = "none";
        usersTableContainer.style.display = "block";
    }
}

// Show error message
function showError(message) {
    const errorMessage = document.getElementById("error-message");
    const errorText = document.getElementById("error-text");
    const usersTableContainer = document.getElementById(
        "users-table-container"
    );

    errorText.textContent = message;
    errorMessage.style.display = "block";
    usersTableContainer.style.display = "none";
}

// Hide error message
function hideError() {
    const errorMessage = document.getElementById("error-message");
    errorMessage.style.display = "none";
}

// Show no users message
function showNoUsersMessage() {
    const noUsersMessage = document.getElementById("no-users-message");
    const usersTable = document.getElementById("users-table");

    noUsersMessage.style.display = "block";
    usersTable.style.display = "none";
}

// Hide no users message
function hideNoUsersMessage() {
    const noUsersMessage = document.getElementById("no-users-message");
    const usersTable = document.getElementById("users-table");

    noUsersMessage.style.display = "none";
    usersTable.style.display = "table";
}

// Render users table
function renderUsers() {
    const tbody = document.getElementById("users-table-body");
    if (!tbody) return;

    hideNoUsersMessage();

    if (filteredUsers.length === 0) {
        showNoUsersMessage();
        return;
    }

    tbody.innerHTML = "";

    filteredUsers.forEach((user) => {
        const row = createUserRow(user);
        tbody.appendChild(row);
    });
}

// Create user table row
function createUserRow(user) {
    const row = document.createElement("tr");

    const roleClass = user.role.toLowerCase();
    const roleText = getRoleText(user.role);

    row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td><span class="role-badge ${roleClass}">${roleText}</span></td>
        <td>
            <div class="action-buttons">
                <button class="btn-action btn-edit" onclick="editUser(${user.id})" title="ویرایش">
                    <i class="fas fa-edit"></i>
                    ویرایش
                </button>
                <button class="btn-action btn-delete" onclick="deleteUser(${user.id})" title="حذف">
                    <i class="fas fa-trash-alt"></i>
                    حذف
                </button>
            </div>
        </td>
    `;

    return row;
}

// Get role text in Persian
function getRoleText(role) {
    switch (role) {
        case "USER":
            return "کاربر عادی";
        case "PROVIDER":
            return "ارائه‌دهنده";
        case "ADMIN":
            return "مدیر";
        default:
            return role;
    }
}

// Filter users based on search input
function filterUsers() {
    const searchInput = document.getElementById("search-input");
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm === "") {
        filteredUsers = [...users];
    } else {
        filteredUsers = users.filter(
            (user) =>
                user.username.toLowerCase().includes(searchTerm) ||
                user.role.toLowerCase().includes(searchTerm) ||
                user.id.toString().includes(searchTerm)
        );
    }

    renderUsers();
}

// Refresh users
function refreshUsers() {
    loadUsers();
}

// Edit user
function editUser(userId) {
    const user = users.find((u) => u.id === userId);
    if (!user) {
        showMessage("کاربر مورد نظر یافت نشد", "error");
        return;
    }

    // Fill form with user data
    document.getElementById("edit-user-id").value = user.id;
    document.getElementById("edit-username").value = user.username;
    document.getElementById("edit-role").value = user.role;

    // Show modal
    const modal = document.getElementById("edit-user-modal");
    modal.style.display = "block";
}

// Close edit modal
function closeEditModal() {
    const modal = document.getElementById("edit-user-modal");
    modal.style.display = "none";

    // Reset form
    document.getElementById("edit-user-form").reset();
}

// Handle edit user form submission
async function handleEditUser(event) {
    event.preventDefault();

    const userId = document.getElementById("edit-user-id").value;
    const username = document.getElementById("edit-username").value.trim();
    const role = document.getElementById("edit-role").value;

    if (!username) {
        showMessage("نام کاربری نمی‌تواند خالی باشد", "error");
        return;
    }

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch("/api/users", {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: parseInt(userId),
                username: username,
                role: role,
            }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("username");
                localStorage.removeItem("roles");
                window.location.href = "/login";
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        showMessage("کاربر با موفقیت ویرایش شد", "success");
        closeEditModal();
        loadUsers(); // Reload users
    } catch (error) {
        console.error("Error updating user:", error);
        showMessage("خطا در ویرایش کاربر: " + error.message, "error");
    }
}

// Delete user
function deleteUser(userId) {
    const user = users.find((u) => u.id === userId);
    if (!user) {
        showMessage("کاربر مورد نظر یافت نشد", "error");
        return;
    }

    userToDelete = user;

    // Fill delete modal
    document.getElementById("delete-username").textContent = user.username;
    document.getElementById("delete-role").textContent = getRoleText(user.role);

    // Show modal
    const modal = document.getElementById("delete-user-modal");
    modal.style.display = "block";
}

// Close delete modal
function closeDeleteModal() {
    const modal = document.getElementById("delete-user-modal");
    modal.style.display = "none";
    userToDelete = null;
}

// Confirm delete user
async function confirmDeleteUser() {
    if (!userToDelete) {
        showMessage("کاربر مورد نظر یافت نشد", "error");
        return;
    }

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`/api/users/${userToDelete.id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("username");
                localStorage.removeItem("roles");
                window.location.href = "/login";
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        showMessage("کاربر با موفقیت حذف شد", "success");
        closeDeleteModal();
        loadUsers(); // Reload users
    } catch (error) {
        console.error("Error deleting user:", error);
        showMessage("خطا در حذف کاربر: " + error.message, "error");
    }
}

// Show message (using common.js function if available)
function showMessage(message, type = "info") {
    if (typeof window.showMessage === "function") {
        window.showMessage(message, type);
    } else {
        // Fallback message display
        const messageDiv = document.createElement("div");
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        if (type === "success") {
            messageDiv.style.background =
                "linear-gradient(135deg, #48bb78, #38a169)";
        } else if (type === "error") {
            messageDiv.style.background =
                "linear-gradient(135deg, #f56565, #e53e3e)";
        } else {
            messageDiv.style.background =
                "linear-gradient(135deg, #4299e1, #3182ce)";
        }

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Check token expiration
function checkTokenExpiration() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/login";
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if (payload.exp < currentTime) {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("roles");
            window.location.href = "/login";
        }
    } catch (error) {
        console.error("Error checking token expiration:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("roles");
        window.location.href = "/login";
    }
}
