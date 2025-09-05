// Dashboard Orders Page JavaScript

let orders = [];
let filteredOrders = [];
let currentFilter = "all";
let searchQuery = "";

// Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    loadNavigation();
    loadFooter();

    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/login";
        return;
    }

    // Initialize event listeners
    initializeEventListeners();

    // Load orders
    loadOrders();
});

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

// Load user orders
async function loadOrders() {
    try {
        showLoading();

        const userId = localStorage.getItem("userId");
        if (!userId) {
            throw new Error("User ID not found");
        }

        const response = await apiRequest(`/api/orders/user/${userId}`);

        if (!response || !response.ok) {
            throw new Error("Failed to load orders");
        }

        orders = await response.json();

        if (orders.length === 0) {
            showEmptyState();
        } else {
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

            const searchableText =
                `${orderId} ${orderDate} ${statusText} ${totalAmount}`.toLowerCase();

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
    const totalSpent = orders
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

    const totalSpentElement = document.getElementById("total-spent");
    if (totalSpentElement) {
        totalSpentElement.textContent = formatPrice(totalSpent) + " تومان";
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

    orderDiv.innerHTML = `
        <div class="order-header">
            <div class="order-info">
                <div class="order-number">سفارش شماره ${order.id}</div>
                <div class="order-date">${formattedDate}</div>
            </div>
            <div class="order-status ${statusClass}">${statusText}</div>
        </div>
        
        <div class="order-details">
            <div class="order-items">
                ${
                    order.orderProducts
                        ? order.orderProducts
                              .map((item) => createOrderItemHTML(item))
                              .join("")
                        : ""
                }
            </div>
            <div class="order-summary">
                <div class="order-total">${formatPrice(
                    order.totalAmount
                )} تومان</div>
            </div>
        </div>
        
        <div class="order-actions">
            <button class="btn btn-primary" onclick="viewOrderDetails(${
                order.id
            })">
                <i class="fas fa-eye"></i>
                مشاهده جزئیات
            </button>
            ${
                order.status === "PENDING"
                    ? `
                <button class="btn btn-secondary" onclick="cancelOrder(${order.id})">
                    <i class="fas fa-times"></i>
                    لغو سفارش
                </button>
            `
                    : ""
            }
        </div>
    `;

    return orderDiv;
}

// Create order item HTML
function createOrderItemHTML(item) {
    const productName = item.product?.productName || "محصول نامشخص";
    const productImage = item.product?.productImages
        ? `/api/products/images/${extractFilename(item.product.productImages)}`
        : "/images/placeholder.jpg";
    const quantity = item.quantity || 0;

    return `
        <div class="order-item">
            <img src="${productImage}" alt="${productName}" class="order-item-image" 
                 onerror="this.src='/images/placeholder.jpg'">
            <div class="order-item-details">
                <div class="order-item-name">${productName}</div>
                <div class="order-item-quantity">تعداد: ${quantity}</div>
            </div>
        </div>
    `;
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

// Cancel order
async function cancelOrder(orderId) {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این سفارش را لغو کنید؟")) {
        return;
    }

    try {
        const response = await apiRequest(
            `/api/orders/${orderId}/status?status=CANCELED`,
            {
                method: "PUT",
            }
        );

        if (response && response.ok) {
            showMessage("سفارش با موفقیت لغو شد", "success");
            // Reload orders
            loadOrders();
        } else {
            throw new Error("Failed to cancel order");
        }
    } catch (error) {
        console.error("Error canceling order:", error);
        showMessage("خطا در لغو سفارش", "error");
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

// Extract filename from path
function extractFilename(filePath) {
    if (!filePath) return null;
    const filename = filePath.split(/[\\\/]/).pop();
    return filename;
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
