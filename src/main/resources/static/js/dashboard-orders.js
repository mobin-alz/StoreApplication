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

    // Update countdown timers every minute
    setInterval(() => {
        updateCountdownTimers();
    }, 60000); // Update every minute
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

        // Check for PENDING orders that might need products added
        await checkPendingOrders();

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
            const totalAmount = formatPrice(calculateOrderTotal(order));

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
        .reduce((sum, order) => sum + calculateOrderTotal(order), 0);

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
            <div class="order-title">
                <div class="order-icon">
                    <i class="fas fa-shopping-bag"></i>
                </div>
                <div class="order-info">
                    <h3>سفارش شماره ${order.id}</h3>
                    <div class="order-date">${formattedDate}</div>
                </div>
            </div>
            <div class="order-header-actions">
                <div class="order-status ${statusClass}">${statusText}</div>
                ${
                    order.status === "PENDING"
                        ? `
                    <div class="pending-info">
                        <div class="time-remaining">
                            <i class="fas fa-clock"></i>
                            ${getTimeRemaining(order.date)}
                        </div>
                        <button class="btn btn-payment" onclick="retryPayment(${
                            order.id
                        })">
                            <i class="fas fa-credit-card"></i>
                            تکمیل پرداخت
                        </button>
                    </div>
                `
                        : ""
                }
            </div>
        </div>
        
        <div class="order-details">
            <div class="order-items">
                ${
                    order.orderProducts && order.orderProducts.length > 0
                        ? `
                        <div class="products-preview">
                            ${order.orderProducts
                                .slice(0, 3)
                                .map(
                                    (item) => `
                                <div class="product-preview">
                                    <i class="fas fa-box"></i>
                                    ${
                                        item.product?.productName ||
                                        "محصول نامشخص"
                                    }
                                </div>
                            `
                                )
                                .join("")}
                            ${
                                order.orderProducts.length > 3
                                    ? `
                                <div class="product-preview">
                                    <i class="fas fa-ellipsis-h"></i>
                                    +${
                                        order.orderProducts.length - 3
                                    } محصول دیگر
                                </div>
                            `
                                    : ""
                            }
                        </div>
                        `
                        : `
                        <div class="no-products">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>محصولی در این سفارش یافت نشد</span>
                        </div>
                        `
                }
            </div>
            <div class="order-summary">
                <div class="summary-item">
                    <span class="summary-label">تعداد محصولات:</span>
                    <span class="summary-value">${
                        order.orderProducts ? order.orderProducts.length : 0
                    }</span>
                </div>
                <div class="summary-item total">
                    <span class="summary-label">مبلغ کل:</span>
                    <span class="summary-value">${formatPrice(
                        calculateOrderTotal(order)
                    )} تومان</span>
                </div>
                ${
                    order.orderProducts &&
                    order.orderProducts.some(
                        (item) => item.product?.productDiscount > 0
                    )
                        ? `
                    <div class="summary-item discount">
                        <span class="summary-label">تخفیف اعمال شده:</span>
                        <span class="summary-value discount-value">
                            ${formatPrice(calculateTotalDiscount(order))} تومان
                        </span>
                    </div>
                `
                        : ""
                }
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
                <button class="btn btn-danger" onclick="cancelOrder(${order.id})">
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
        : "/images/placeholder.svg";
    const quantity = item.quantity || 0;

    return `
        <div class="order-item">
            <img src="${productImage}" alt="${productName}" class="order-item-image" 
                 onerror="this.src='/images/placeholder.svg'">
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

// Retry payment for PENDING order
async function retryPayment(orderId) {
    try {
        // Get order details to get the amount
        const response = await apiRequest(`/api/orders/${orderId}`);
        if (!response || !response.ok) {
            showMessage("خطا در دریافت اطلاعات سفارش", "error");
            return;
        }

        const order = await response.json();
        const amount = order.totalAmount;

        // Store order info for callback
        localStorage.setItem(`order_${orderId}_amount`, amount.toString());

        // Initiate Zarinpal payment
        await initiateZarinpalPayment(amount, orderId);
    } catch (error) {
        console.error("Error retrying payment:", error);
        showMessage("خطا در شروع پرداخت مجدد", "error");
    }
}

// Initiate Zarinpal payment
async function initiateZarinpalPayment(amount, orderId) {
    try {
        const userId = localStorage.getItem("userId");
        const requestBody = {
            merchant_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // Replace with your actual merchant ID
            amount: parseInt(amount),
            description: `پرداخت سفارش شماره ${orderId}`,
            callback_url: `http://localhost:8080/callback?orderId=${orderId}`,
            metadata: {
                user_id: userId || "1",
                order_id: orderId.toString(),
            },
        };

        const response = await apiRequest("/api/zarin/request", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response || !response.ok) {
            const errorText = await response.text();
            console.error(
                "Zarinpal request failed:",
                response.status,
                errorText
            );
            throw new Error("Failed to initiate payment");
        }

        const result = await response.json();

        if (result.data && result.data.authority) {
            // Redirect to Zarinpal payment page
            const paymentUrl = `https://sandbox.zarinpal.com/pg/StartPay/${result.data.authority}`;
            window.location.href = paymentUrl;
        } else {
            throw new Error("Invalid response from payment gateway");
        }
    } catch (error) {
        console.error("Error calling Zarinpal API:", error);
        throw error;
    }
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

// Calculate total discount for an order
// Calculate total amount for an order from order products
function calculateOrderTotal(order) {
    if (!order.orderProducts) return 0;

    return order.orderProducts.reduce((totalAmount, item) => {
        const discountedPrice = item.priceAtOrderTime || 0;
        const quantity = item.quantity || 0;

        return totalAmount + discountedPrice * quantity;
    }, 0);
}

function calculateTotalDiscount(order) {
    if (!order.orderProducts) return 0;

    return order.orderProducts.reduce((totalDiscount, item) => {
        const originalPrice = item.product?.productPrice || 0;
        const discount = item.product?.productDiscount || 0;
        const quantity = item.quantity || 0;

        if (discount > 0) {
            const discountAmount =
                ((originalPrice * discount) / 100) * quantity;
            return totalDiscount + discountAmount;
        }
        return totalDiscount;
    }, 0);
}

// Calculate time remaining for PENDING orders (24 hours from creation)
function getTimeRemaining(orderDate) {
    const orderTime = new Date(orderDate);
    const now = new Date();
    const timeDiff = orderTime.getTime() + 24 * 60 * 60 * 1000 - now.getTime(); // 24 hours from order time

    if (timeDiff <= 0) {
        return "منقضی شده";
    }

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours} ساعت و ${minutes} دقیقه`;
}

// Update countdown timers for PENDING orders
function updateCountdownTimers() {
    const timeRemainingElements = document.querySelectorAll(".time-remaining");
    timeRemainingElements.forEach((element) => {
        const orderCard = element.closest(".order-card");
        if (orderCard) {
            const orderId = orderCard
                .querySelector(".order-info h3")
                ?.textContent?.match(/\d+/)?.[0];
            if (orderId) {
                const order = orders.find((o) => o.id == orderId);
                if (order && order.status === "PENDING") {
                    const newTimeRemaining = getTimeRemaining(order.date);
                    element.innerHTML = `<i class="fas fa-clock"></i> ${newTimeRemaining}`;

                    // If expired, refresh the page to remove the order
                    if (newTimeRemaining === "منقضی شده") {
                        setTimeout(() => {
                            loadOrders();
                        }, 2000);
                    }
                }
            }
        }
    });
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

// Check for PENDING orders that might need products added
async function checkPendingOrders() {
    const pendingOrders = orders.filter(
        (order) =>
            order.status === "PENDING" &&
            (!order.orderProducts || order.orderProducts.length === 0)
    );

    for (const order of pendingOrders) {
        console.log("Found PENDING order without products:", order.id);

        // Check if we have cart items stored for this order
        const cartItemsJson = localStorage.getItem(
            `order_${order.id}_cartItems`
        );
        if (cartItemsJson) {
            console.log("Found stored cart items for order:", order.id);
            try {
                await addOrderProductsToOrder(order.id);
                console.log("Added products to order:", order.id);
            } catch (error) {
                console.error(
                    "Error adding products to order:",
                    order.id,
                    error
                );
            }
        }
    }
}

// Add order products to order (copied from callback.js)
async function addOrderProductsToOrder(orderId) {
    try {
        console.log("Adding order products for orderId:", orderId);

        // Get cart items from localStorage
        const cartItemsJson = localStorage.getItem(
            `order_${orderId}_cartItems`
        );
        if (!cartItemsJson) {
            console.warn("No cart items found for order:", orderId);
            return;
        }

        const cartItems = JSON.parse(cartItemsJson);
        console.log("Cart items:", cartItems);

        const promises = cartItems.map(async (item, index) => {
            // Calculate discounted price
            const originalPrice = item.product.productPrice;
            const discount = item.product.productDiscount || 0;
            const discountedPrice =
                originalPrice - (originalPrice * discount) / 100;

            const requestBody = {
                order_id: parseInt(orderId),
                product_id: item.product.productId,
                quantity: item.quantity,
                priceAtOrderTime: discountedPrice,
            };

            console.log(`Adding product ${index + 1}:`, requestBody);

            try {
                const response = await apiRequest("/api/order-product/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                });

                if (!response || !response.ok) {
                    console.error(
                        `Failed to add product ${index + 1}:`,
                        response.status,
                        response.statusText
                    );
                    return null;
                }

                const result = await response.json();
                console.log(`Successfully added product ${index + 1}:`, result);
                return result;
            } catch (error) {
                console.error(`Error adding product ${index + 1}:`, error);
                return null;
            }
        });

        const results = await Promise.all(promises);
        console.log("All order products results:", results);

        // Check if any products failed to add
        const failedProducts = results.filter((result) => result === null);
        if (failedProducts.length > 0) {
            console.warn(
                `${failedProducts.length} products failed to add to order`
            );
        }
    } catch (error) {
        console.error("Error adding order products:", error);
    }
}
