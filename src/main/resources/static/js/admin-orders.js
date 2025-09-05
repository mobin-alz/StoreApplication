// Admin Orders Page JavaScript

let orders = [];
let filteredOrders = [];
let currentOrderId = null;
let currentFilter = "all";
let searchQuery = "";

// Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    loadNavigation();
    loadFooter();

    // Check if user is authenticated and has admin access
    checkAdminAccess();

    // Initialize event listeners
    initializeEventListeners();

    // Load orders
    loadOrders();
});

// Check admin access
function checkAdminAccess() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/login";
        return;
    }

    const roles = JSON.parse(localStorage.getItem("roles") || "[]");
    const isAdmin = roles.some((role) => role.authority === "ADMIN");
    if (!isAdmin) {
        window.location.href = "/dashboard";
        return;
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach((button) => {
        button.addEventListener("click", function () {
            // Remove active class from all buttons
            filterButtons.forEach((btn) => btn.classList.remove("active"));
            // Add active class to clicked button
            this.classList.add("active");

            // Update current filter
            currentFilter = this.getAttribute("data-status");

            // Apply filters
            applyFilters();
        });
    });

    // Search input
    const searchInput = document.getElementById("search-orders");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            searchQuery = this.value.toLowerCase().trim();
            applyFilters();
        });
    }
}

// Load all orders
async function loadOrders() {
    try {
        showLoading();

        const response = await apiRequest("/api/orders");

        if (!response || !response.ok) {
            throw new Error("Failed to load orders");
        }

        orders = await response.json();

        if (orders.length === 0) {
            showEmptyState();
        } else {
            // Load user information for each order
            await loadUserInfoForOrders();

            // Initialize filtered orders
            filteredOrders = [...orders];
            updateOrderStats();
            displayOrders();
        }
    } catch (error) {
        console.error("Error loading orders:", error);
        showError("خطا در بارگذاری سفارشات");
    }
}

// Load user information for all orders using userId
async function loadUserInfoForOrders() {
    // Show loading state while fetching user info
    const loadingElement = document.getElementById("loading-state");
    if (loadingElement) {
        loadingElement.style.display = "block";
    }

    const userPromises = orders.map(async (order) => {
        if (order.userId) {
            try {
                const userResponse = await apiRequest(
                    `/api/users/${order.userId}`
                );
                if (userResponse && userResponse.ok) {
                    const user = await userResponse.json();
                    order.user = user;
                }
            } catch (error) {
                console.error(
                    `Error loading user ${order.userId} for order ${order.id}:`,
                    error
                );
                // Keep the order but without user info
            }
        }
        return order;
    });

    await Promise.all(userPromises);

    // Hide loading state
    if (loadingElement) {
        loadingElement.style.display = "none";
    }
}

// Apply filters and search
function applyFilters() {
    filteredOrders = orders.filter((order) => {
        // Status filter
        if (currentFilter !== "all" && order.status !== currentFilter) {
            return false;
        }

        // Search filter
        if (searchQuery) {
            const orderId = order.id.toString();
            const orderDate = new Date(order.date).toLocaleDateString("fa-IR");
            const statusText = getStatusText(order.status);
            const totalAmount = formatPrice(order.totalAmount);
            const customerId = order.user?.id?.toString() || "";

            const searchableText =
                `${orderId} ${orderDate} ${statusText} ${totalAmount} ${customerId}`.toLowerCase();

            if (!searchableText.includes(searchQuery)) {
                return false;
            }
        }

        return true;
    });

    updateOrderStats();
    displayOrders();
}

// Update order statistics
function updateOrderStats() {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
        (order) => order.status === "PENDING"
    ).length;
    const completedOrders = orders.filter((order) =>
        ["PAID", "SHIPPED"].includes(order.status)
    ).length;
    const totalRevenue = orders
        .filter((order) => order.status !== "CANCELED")
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Update stats elements
    const totalOrdersElement = document.getElementById("total-orders");
    if (totalOrdersElement) {
        totalOrdersElement.textContent = totalOrders;
    }

    const pendingOrdersElement = document.getElementById("pending-orders");
    if (pendingOrdersElement) {
        pendingOrdersElement.textContent = pendingOrders;
    }

    const completedOrdersElement = document.getElementById("completed-orders");
    if (completedOrdersElement) {
        completedOrdersElement.textContent = completedOrders;
    }

    const totalRevenueElement = document.getElementById("total-revenue");
    if (totalRevenueElement) {
        totalRevenueElement.textContent = formatPrice(totalRevenue) + " تومان";
    }
}

// Display orders
function displayOrders() {
    hideAllStates();
    document.getElementById("orders-content").style.display = "block";

    const ordersList = document.getElementById("orders-list");
    if (!ordersList) return;

    ordersList.innerHTML = "";

    if (filteredOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>هیچ سفارشی یافت نشد</h3>
                <p>با فیلترهای انتخابی هیچ سفارشی پیدا نشد</p>
            </div>
        `;
        return;
    }

    // Sort orders by date (newest first)
    const sortedOrders = filteredOrders.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    sortedOrders.forEach((order) => {
        const orderElement = createOrderElement(order);
        ordersList.appendChild(orderElement);
    });
}

// Create order element
function createOrderElement(order) {
    const orderDiv = document.createElement("div");
    orderDiv.className = "order-card";

    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const statusText = getStatusText(order.status);
    const statusClass = getStatusClass(order.status);
    const productsCount = order.orderProducts ? order.orderProducts.length : 0;

    orderDiv.innerHTML = `
        <div class="order-header">
            <div class="order-title">
                <div class="order-icon">
                    <i class="fas fa-shopping-bag"></i>
                </div>
                <div class="order-info">
                    <h3>سفارش شماره ${order.id}</h3>
                    <div class="order-number">تاریخ: ${formattedDate}</div>
                </div>
            </div>
            <div class="order-header-actions">
                <div class="order-status ${statusClass}">${statusText}</div>
                <button class="action-btn secondary" onclick="openStatusModal(${
                    order.id
                }, '${order.status}')">
                    <i class="fas fa-edit"></i>
                    تغییر وضعیت
                </button>
            </div>
        </div>
        
        <div class="order-details">
            <div class="detail-item">
                <div class="detail-label">مشتری</div>
                <div class="customer-info">
                    <div class="customer-name">${
                        order.user?.username ||
                        (order.userId ? `کاربر ${order.userId}` : "نامشخص")
                    }</div>
                    
                    ${
                        !order.user && order.userId
                            ? '<div class="loading-user">در حال بارگذاری...</div>'
                            : ""
                    }
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-label">مبلغ کل</div>
                <div class="detail-value">${formatPrice(
                    order.totalAmount
                )} تومان</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">محصولات</div>
                <div class="products-preview">
                    ${
                        order.orderProducts && order.orderProducts.length > 0
                            ? `
                        ${order.orderProducts
                            .slice(0, 3)
                            .map(
                                (item) => `
                            <div class="product-preview">
                                <i class="fas fa-box"></i>
                                ${item.product?.productName || "محصول نامشخص"}
                            </div>
                        `
                            )
                            .join("")}
                        ${
                            order.orderProducts.length > 3
                                ? `
                            <div class="product-preview">
                                <i class="fas fa-ellipsis-h"></i>
                                +${order.orderProducts.length - 3} محصول دیگر
                            </div>
                        `
                                : ""
                        }
                        `
                            : `
                        <div class="no-products">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>محصولی یافت نشد</span>
                        </div>
                        `
                    }
                </div>
            </div>
        </div>
    `;

    return orderDiv;
}

// Get status text in Persian
function getStatusText(status) {
    const statusMap = {
        PENDING: "در انتظار پرداخت",
        PAID: "پرداخت شده",
        SHIPPED: "ارسال شده",
        CANCELED: "لغو شده",
    };
    return statusMap[status] || status;
}

// Get status CSS class
function getStatusClass(status) {
    const classMap = {
        PENDING: "pending",
        PAID: "paid",
        SHIPPED: "shipped",
        CANCELED: "canceled",
    };
    return classMap[status] || "pending";
}

// View order details
function viewOrderDetails(orderId) {
    window.location.href = `/order/${orderId}`;
}

// Open status update modal
function openStatusModal(orderId, currentStatus) {
    currentOrderId = orderId;

    const modal = document.getElementById("statusModal");
    const statusSelect = document.getElementById("new-status");

    if (modal && statusSelect) {
        statusSelect.value = currentStatus;
        modal.style.display = "block";
    }
}

// Close status modal
function closeStatusModal() {
    const modal = document.getElementById("statusModal");
    if (modal) {
        modal.style.display = "none";
        currentOrderId = null;
    }
}

// Update order status
async function updateOrderStatus() {
    if (!currentOrderId) return;

    const newStatus = document.getElementById("new-status").value;
    if (!newStatus) return;

    try {
        const response = await apiRequest(
            `/api/orders/${currentOrderId}/status?status=${newStatus}`,
            {
                method: "PUT",
            }
        );

        if (response && response.ok) {
            showMessage("وضعیت سفارش با موفقیت بروزرسانی شد", "success");
            closeStatusModal();
            // Reload orders
            loadOrders();
        } else {
            throw new Error("Failed to update order status");
        }
    } catch (error) {
        console.error("Error updating order status:", error);
        showMessage("خطا در بروزرسانی وضعیت سفارش", "error");
    }
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
    const errorState = document.getElementById("error-state");
    if (errorState) {
        const errorMessage = errorState.querySelector("p");
        if (errorMessage) errorMessage.textContent = message;
        errorState.style.display = "block";
    }
}

// Hide all states
function hideAllStates() {
    document.getElementById("loading-state").style.display = "none";
    document.getElementById("empty-state").style.display = "none";
    document.getElementById("orders-content").style.display = "none";
    document.getElementById("error-state").style.display = "none";
}

// Format price with thousand separators
function formatPrice(price) {
    return new Intl.NumberFormat("fa-IR").format(Math.round(price));
}

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

// Close modal when clicking outside
document.addEventListener("click", function (event) {
    const modal = document.getElementById("statusModal");
    if (modal && event.target === modal) {
        closeStatusModal();
    }
});
