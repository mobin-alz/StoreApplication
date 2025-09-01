// Admin Messages Page JavaScript

let messages = [];
let filteredMessages = [];
let messageToDelete = null;

// Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    loadNavigation();
    loadFooter();

    // Check if user is admin
    const token = localStorage.getItem("token");
    const roles = localStorage.getItem("roles");

    if (!token) {
        window.location.href = "/login";
        return;
    }

    // Check if user has admin role
    let isAdmin = false;
    if (roles) {
        try {
            const rolesArray = JSON.parse(roles);
            isAdmin = rolesArray.some((role) => role.authority === "ADMIN");
        } catch (e) {
            console.error("Error parsing roles:", e);
        }
    }

    if (!isAdmin) {
        window.location.href = "/login";
        return;
    }

    // Load messages
    loadMessages();
});

// Load messages from API
async function loadMessages() {
    try {
        showLoading();

        const response = await apiRequest("/api/messages");

        // Handle 404 as empty messages (API endpoint might not exist yet)
        if (response && response.status === 404) {
            messages = [];
            filteredMessages = [];
            displayMessages();
            updateStats();
            return;
        }

        if (!response || !response.ok) {
            throw new Error(
                `HTTP error! status: ${response?.status || "Unknown"}`
            );
        }

        const responseData = await response.json();
        messages = Array.isArray(responseData) ? responseData : [];
        filteredMessages = [...messages];

        displayMessages();
        updateStats();
    } catch (error) {
        console.error("Error loading messages:", error);
        // If it's a 404 error or network error, show empty state instead of error
        if (error.message.includes("404") || error.message.includes("Failed to fetch")) {
            messages = [];
            filteredMessages = [];
            displayMessages();
            updateStats();
        } else {
            showError("خطا در بارگذاری پیام‌ها");
        }
    }
}

// Display messages in the UI
function displayMessages() {
    if (!filteredMessages || filteredMessages.length === 0) {
        showEmptyState();
        return;
    }

    hideAllStates();
    document.getElementById("messages-container").style.display = "block";

    const messagesContainer = document.getElementById("messages-container");
    messagesContainer.innerHTML = "";

    filteredMessages.forEach((message) => {
        const messageElement = createMessageElement(message);
        messagesContainer.appendChild(messageElement);
    });
}

// Create message element
function createMessageElement(message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message-card ${
        message.status?.toLowerCase() || "pending"
    }`;
    messageDiv.onclick = () => showMessageDetails(message);

    const statusText =
        message.status === "APPROVED" ? "تأیید شده" : "در انتظار";
    const statusClass = message.status === "APPROVED" ? "approved" : "pending";

    messageDiv.innerHTML = `
        <div class="message-header">
            <div class="message-info">
                <h3>${message.title || "بدون موضوع"}</h3>
                <div class="message-meta">
                    <span><i class="fas fa-user"></i> ${
                        message.firstName || ""
                    } ${message.lastName || ""}</span>
                    <span><i class="fas fa-envelope"></i> ${
                        message.email || ""
                    }</span>
                    <span><i class="fas fa-phone"></i> ${
                        message.phoneNumber || "ندارد"
                    }</span>
                </div>
            </div>
            <div class="message-status ${statusClass}">${statusText}</div>
        </div>
        <div class="message-content">
            <p>${message.message || ""}</p>
        </div>
        <div class="message-actions">
            <button class="btn btn-view" onclick="event.stopPropagation(); showMessageDetails(${
                message.id
            })">
                <i class="fas fa-eye"></i>
                مشاهده
            </button>
            ${
                message.status !== "APPROVED"
                    ? `
                <button class="btn btn-approve" onclick="event.stopPropagation(); approveMessage(${message.id})">
                    <i class="fas fa-check"></i>
                    تأیید
                </button>
            `
                    : ""
            }
            <button class="btn btn-delete" onclick="event.stopPropagation(); showDeleteModal(${
                message.id
            })">
                <i class="fas fa-trash"></i>
                حذف
            </button>
        </div>
    `;

    return messageDiv;
}

// Show message details in modal
function showMessageDetails(messageId) {
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    const modal = document.getElementById("messageModal");
    const detailsContainer = document.getElementById("message-details");
    const actionsContainer = document.getElementById("message-actions");

    const statusText =
        message.status === "APPROVED" ? "تأیید شده" : "در انتظار";
    const statusClass = message.status === "APPROVED" ? "approved" : "pending";

    detailsContainer.innerHTML = `
        <div class="message-detail-header">
            <h2>${message.title || "بدون موضوع"}</h2>
            <div class="message-status ${statusClass}">${statusText}</div>
        </div>
        <div class="message-detail-info">
            <div class="info-row">
                <label>نام:</label>
                <span>${message.firstName || ""} ${
        message.lastName || ""
    }</span>
            </div>
            <div class="info-row">
                <label>ایمیل:</label>
                <span>${message.email || ""}</span>
            </div>
            <div class="info-row">
                <label>شماره تماس:</label>
                <span>${message.phoneNumber || "ندارد"}</span>
            </div>
            <div class="info-row">
                <label>تاریخ ارسال:</label>
                <span>${new Date().toLocaleDateString("fa-IR")}</span>
            </div>
        </div>
        <div class="message-detail-content">
            <label>پیام:</label>
            <div class="message-text">${message.message || ""}</div>
        </div>
    `;

    actionsContainer.innerHTML = `
        ${
            message.status !== "APPROVED"
                ? `
            <button class="btn btn-primary" onclick="approveMessage(${message.id})">
                <i class="fas fa-check"></i>
                تأیید پیام
            </button>
        `
                : ""
        }
        <button class="btn btn-danger" onclick="showDeleteModal(${message.id})">
            <i class="fas fa-trash"></i>
            حذف پیام
        </button>
    `;

    modal.style.display = "flex";
}

// Close message modal
function closeMessageModal() {
    const modal = document.getElementById("messageModal");
    modal.style.display = "none";
}

// Approve message
async function approveMessage(messageId) {
    try {
        const response = await apiRequest(`/api/messages/${messageId}`, {
            method: "PUT",
        });

        if (response && response.ok) {
            // Update local data
            const message = messages.find((m) => m.id === messageId);
            if (message) {
                message.status = "APPROVED";
            }

            // Refresh display
            displayMessages();
            updateStats();
            closeMessageModal();

            showMessage("پیام با موفقیت تأیید شد", "success");
        } else {
            throw new Error("Failed to approve message");
        }
    } catch (error) {
        console.error("Error approving message:", error);
        showMessage("خطا در تأیید پیام", "error");
    }
}

// Show delete confirmation modal
function showDeleteModal(messageId) {
    messageToDelete = messageId;
    const modal = document.getElementById("deleteModal");
    modal.style.display = "flex";
}

// Close delete modal
function closeDeleteModal() {
    messageToDelete = null;
    const modal = document.getElementById("deleteModal");
    modal.style.display = "none";
}

// Confirm delete message
async function confirmDeleteMessage() {
    if (!messageToDelete) return;

    try {
        const response = await apiRequest(`/api/messages/${messageToDelete}`, {
            method: "DELETE",
        });

        if (response && response.ok) {
            // Remove from local data
            messages = messages.filter((m) => m.id !== messageToDelete);
            filteredMessages = filteredMessages.filter(
                (m) => m.id !== messageToDelete
            );

            // Refresh display
            displayMessages();
            updateStats();
            closeDeleteModal();
            closeMessageModal();

            showMessage("پیام با موفقیت حذف شد", "success");
        } else {
            throw new Error("Failed to delete message");
        }
    } catch (error) {
        console.error("Error deleting message:", error);
        showMessage("خطا در حذف پیام", "error");
    }
}

// Filter messages
function filterMessages() {
    const statusFilter = document.getElementById("status-filter").value;
    const searchInput = document
        .getElementById("search-input")
        .value.toLowerCase();

    filteredMessages = messages.filter((message) => {
        const matchesStatus = !statusFilter || message.status === statusFilter;
        const matchesSearch =
            !searchInput ||
            (message.firstName &&
                message.firstName.toLowerCase().includes(searchInput)) ||
            (message.lastName &&
                message.lastName.toLowerCase().includes(searchInput)) ||
            (message.email &&
                message.email.toLowerCase().includes(searchInput)) ||
            (message.title &&
                message.title.toLowerCase().includes(searchInput)) ||
            (message.message &&
                message.message.toLowerCase().includes(searchInput));

        return matchesStatus && matchesSearch;
    });

    displayMessages();
}

// Update statistics
function updateStats() {
    const pendingCount = messages.filter((m) => m.status !== "APPROVED").length;
    const approvedCount = messages.filter(
        (m) => m.status === "APPROVED"
    ).length;
    const totalCount = messages.length;

    document.getElementById("pending-count").textContent = pendingCount;
    document.getElementById("approved-count").textContent = approvedCount;
    document.getElementById("total-count").textContent = totalCount;
}

// Refresh messages
function refreshMessages() {
    loadMessages();
}

// Show loading state
function showLoading() {
    hideAllStates();
    document.getElementById("loading-state").style.display = "block";
}

// Show empty state
function showEmptyState() {
    hideAllStates();
    document.getElementById("empty-state").style.display = "block";
}

// Show error state
function showError(message) {
    hideAllStates();
    document.getElementById("error-state").style.display = "block";
    document.getElementById("error-state").querySelector("p").textContent =
        message;
}

// Hide all states
function hideAllStates() {
    document.getElementById("loading-state").style.display = "none";
    document.getElementById("empty-state").style.display = "none";
    document.getElementById("messages-container").style.display = "none";
    document.getElementById("error-state").style.display = "none";
}

// Close modal when clicking outside
document.addEventListener("click", function (event) {
    const messageModal = document.getElementById("messageModal");
    const deleteModal = document.getElementById("deleteModal");

    if (messageModal && event.target === messageModal) {
        closeMessageModal();
    }

    if (deleteModal && event.target === deleteModal) {
        closeDeleteModal();
    }
});

// Show message function
function showMessage(message, type = "info") {
    // Remove existing messages
    const existingMessages = document.querySelectorAll(".message");
    existingMessages.forEach((msg) => msg.remove());

    // Create message element
    const messageElement = document.createElement("div");
    messageElement.className = `message message-${type}`;
    messageElement.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add message to page
    document.body.appendChild(messageElement);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageElement.parentElement) {
            messageElement.remove();
        }
    }, 5000);
}
