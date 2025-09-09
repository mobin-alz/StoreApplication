// Order Detail Page JavaScript

let currentOrder = null;
let orderId = null;

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

    // Get order ID from URL
    orderId = getOrderIdFromUrl();
    if (!orderId) {
        showError("شناسه سفارش یافت نشد");
        return;
    }

    // Load order details
    loadOrderDetails();
});

// Get order ID from URL
function getOrderIdFromUrl() {
    const pathSegments = window.location.pathname.split("/");
    return pathSegments[pathSegments.length - 1];
}

// Load order details
async function loadOrderDetails() {
    try {
        showLoading();

        const response = await apiRequest(`/api/orders/${orderId}`);

        if (!response || !response.ok) {
            if (response && response.status === 404) {
                showError("سفارش مورد نظر یافت نشد");
            } else {
                throw new Error("Failed to load order details");
            }
            return;
        }

        currentOrder = await response.json();
        displayOrderDetails();
    } catch (error) {
        console.error("Error loading order details:", error);
        showError("خطا در بارگذاری جزئیات سفارش");
    }
}

// Display order details
function displayOrderDetails() {
    hideAllStates();
    document.getElementById("order-content").style.display = "block";

    // Display order information
    displayOrderInfo();

    // Display products
    displayOrderProducts();

    // Display actions based on user role and order status
    displayOrderActions();
}

// Display order information
function displayOrderInfo() {
    const orderDate = new Date(currentOrder.date);
    const formattedDate = orderDate.toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    // Update order header elements
    const orderIdElement = document.getElementById("order-id");
    if (orderIdElement) {
        orderIdElement.textContent = currentOrder.id;
    }

    const orderDateElement = document.getElementById("order-date");
    if (orderDateElement) {
        orderDateElement.textContent = formattedDate;
    }

    const orderTotalElement = document.getElementById("order-total");
    if (orderTotalElement) {
        orderTotalElement.textContent =
            formatPrice(currentOrder.totalAmount) + " تومان";
    }

    // Set status
    const statusElement = document.getElementById("order-status");
    if (statusElement) {
        statusElement.textContent = getStatusText(currentOrder.status);
        statusElement.className = `status ${getStatusClass(
            currentOrder.status
        )}`;
    }

    // Update summary section
    updateOrderSummary();

    // Update timeline
    updateOrderTimeline();
}

// Update order summary
function updateOrderSummary() {
    const productsCount = currentOrder.orderProducts?.length || 0;

    // Calculate original total and discounted total from order products
    let totalOriginalPrice = 0;
    let totalDiscountedPrice = 0;

    if (currentOrder.orderProducts) {
        currentOrder.orderProducts.forEach((item) => {
            const originalPrice = item.product?.productPrice || 0;
            const discountedPrice = item.priceAtOrderTime || 0;
            const quantity = item.quantity || 0;

            totalOriginalPrice += originalPrice * quantity;
            totalDiscountedPrice += discountedPrice * quantity;
        });
    }

    // Use our calculated total instead of backend total
    const totalAmount = totalDiscountedPrice;

    // Update products count
    const productsCountElement = document.getElementById("products-count");
    if (productsCountElement) {
        productsCountElement.textContent = productsCount;
    }

    const summaryItemsCountElement = document.getElementById(
        "summary-items-count"
    );
    if (summaryItemsCountElement) {
        summaryItemsCountElement.textContent = productsCount;
    }

    // Update subtotal (original total)
    const summarySubtotalElement = document.getElementById("summary-subtotal");
    if (summarySubtotalElement) {
        summarySubtotalElement.textContent =
            formatPrice(totalOriginalPrice) + " تومان";
    }

    // Update total (discounted total)
    const summaryTotalElement = document.getElementById("summary-total");
    if (summaryTotalElement) {
        summaryTotalElement.textContent =
            formatPrice(totalDiscountedPrice) + " تومان";
    }

    // Update savings if there's a discount
    const savingsElement = document.getElementById("summary-savings");
    if (savingsElement && totalOriginalPrice > totalDiscountedPrice) {
        const savings = totalOriginalPrice - totalDiscountedPrice;
        savingsElement.textContent = formatPrice(savings) + " تومان";
        savingsElement.parentElement.style.display = "flex";
    } else if (savingsElement) {
        savingsElement.parentElement.style.display = "none";
    }
}

// Update order timeline
function updateOrderTimeline() {
    const timelineSteps = document.getElementById("timeline-steps");
    if (!timelineSteps) return;

    const status = currentOrder.status;
    const orderDate = new Date(currentOrder.date);

    let timelineHTML = "";

    // Pending step
    const pendingClass =
        status === "PENDING"
            ? "active"
            : ["PAID", "SHIPPED", "CANCELED"].includes(status)
            ? "completed"
            : "pending";
    timelineHTML += `
        <div class="timeline-step ${pendingClass}">
            <div class="step-icon">
                <i class="fas fa-clock"></i>
            </div>
            <div class="step-content">
                <div class="step-title">در انتظار پرداخت</div>
                <div class="step-description">سفارش شما ثبت شده و در انتظار پرداخت است</div>
                <div class="step-date">${orderDate.toLocaleDateString(
                    "fa-IR"
                )}</div>
            </div>
        </div>
    `;

    // Paid step
    if (["PAID", "SHIPPED", "CANCELED"].includes(status)) {
        const paidClass =
            status === "PAID"
                ? "active"
                : ["SHIPPED", "CANCELED"].includes(status)
                ? "completed"
                : "pending";
        timelineHTML += `
            <div class="timeline-step ${paidClass}">
                <div class="step-icon">
                    <i class="fas fa-check"></i>
                </div>
                <div class="step-content">
                    <div class="step-title">پرداخت شده</div>
                    <div class="step-description">پرداخت شما با موفقیت انجام شد</div>
                    <div class="step-date">${orderDate.toLocaleDateString(
                        "fa-IR"
                    )}</div>
                </div>
            </div>
        `;
    }

    // Shipped step
    if (status === "SHIPPED") {
        timelineHTML += `
            <div class="timeline-step active">
                <div class="step-icon">
                    <i class="fas fa-truck"></i>
                </div>
                <div class="step-content">
                    <div class="step-title">ارسال شده</div>
                    <div class="step-description">سفارش شما ارسال شده است</div>
                    <div class="step-date">${orderDate.toLocaleDateString(
                        "fa-IR"
                    )}</div>
                </div>
            </div>
        `;
    }

    // Canceled step
    if (status === "CANCELED") {
        timelineHTML += `
            <div class="timeline-step active">
                <div class="step-icon">
                    <i class="fas fa-times"></i>
                </div>
                <div class="step-content">
                    <div class="step-title">لغو شده</div>
                    <div class="step-description">سفارش شما لغو شده است</div>
                    <div class="step-date">${orderDate.toLocaleDateString(
                        "fa-IR"
                    )}</div>
                </div>
            </div>
        `;
    }

    timelineSteps.innerHTML = timelineHTML;
}

// Display order products
function displayOrderProducts() {
    const productsList = document.getElementById("products-list");
    if (!productsList) return;

    productsList.innerHTML = "";

    if (
        !currentOrder.orderProducts ||
        currentOrder.orderProducts.length === 0
    ) {
        productsList.innerHTML =
            '<div class="empty-products"><i class="fas fa-shopping-bag"></i><p>هیچ محصولی در این سفارش یافت نشد</p></div>';
        return;
    }

    currentOrder.orderProducts.forEach((item) => {
        const productElement = createProductElement(item);
        productsList.appendChild(productElement);
    });
}

// Create product element
function createProductElement(item) {
    const productDiv = document.createElement("div");
    productDiv.className = "product-card";

    const productName = item.product?.productName || "محصول نامشخص";
    const productImage = item.product?.productImages
        ? `/api/products/images/${extractFilename(item.product.productImages)}`
        : "/images/placeholder.svg";
    const originalPrice = item.product?.productPrice || 0; // This is the original price
    const discount = item.product?.productDiscount || 0;
    const discountedPrice = item.priceAtOrderTime || 0; // This is the discounted price at order time
    const quantity = item.quantity || 0;
    const totalOriginalPrice = originalPrice * quantity;
    const totalDiscountedPrice = discountedPrice * quantity;

    productDiv.innerHTML = `
        <img src="${productImage}" alt="${productName}" class="product-image" 
             onerror="this.src='/images/placeholder.svg'">
        <div class="product-info">
            <h4>${productName}</h4>
            <div class="product-details">
                <div class="product-quantity">
                    <i class="fas fa-box"></i>
                    ${quantity} عدد
                </div>
                <div class="product-price-info">
                    ${
                        discount > 0
                            ? `
                        <div class="price-row">
                            <span class="original-price">قیمت اصلی: ${formatPrice(
                                originalPrice
                            )} تومان</span>
                            <span class="discount-badge">${discount}% تخفیف</span>
                        </div>
                         <div class="discounted-price">قیمت با تخفیف: ${formatPrice(
                             discountedPrice
                         )} تومان</div>
                    `
                            : `
                        <div class="product-price">${formatPrice(
                            originalPrice
                        )} تومان</div>
                    `
                    }
                </div>
            </div>
            <div class="product-total">
                ${
                    discount > 0
                        ? `
                    <div class="total-row">
                        <span class="original-total">${formatPrice(
                            totalOriginalPrice
                        )} تومان</span>
                         <span class="discounted-total">${formatPrice(
                             totalDiscountedPrice
                         )} تومان</span>
                    </div>
                    <div class="savings">صرفه‌جویی: ${formatPrice(
                        totalOriginalPrice - totalDiscountedPrice
                    )} تومان</div>
                `
                        : `
                    ${formatPrice(totalOriginalPrice)} تومان
                `
                }
            </div>
        </div>
    `;

    return productDiv;
}

// Display order actions based on user role and order status
function displayOrderActions() {
    const actionsContainer = document.getElementById("order-actions");
    if (!actionsContainer) return;

    const roles = JSON.parse(localStorage.getItem("roles") || "[]");
    const isAdmin = roles.includes("ADMIN");
    const isOwner = currentOrder.user?.id == localStorage.getItem("userId");

    let actionsHTML = "";

    // Back button
    actionsHTML += `
        <button class="btn btn-secondary" onclick="goBack()">
            <i class="fas fa-arrow-right"></i>
            بازگشت
        </button>
    `;

    // Admin actions
    if (isAdmin) {
        actionsHTML += `
            <button class="btn btn-primary" onclick="openStatusModal()">
                <i class="fas fa-edit"></i>
                تغییر وضعیت
            </button>
        `;
    }

    // Owner actions
    if (isOwner && currentOrder.status === "PENDING") {
        actionsHTML += `
            <button class="btn btn-danger" onclick="cancelOrder()">
                <i class="fas fa-times"></i>
                لغو سفارش
            </button>
        `;
    }

    actionsContainer.innerHTML = actionsHTML;
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

// Go back
function goBack() {
    const roles = JSON.parse(localStorage.getItem("roles") || "[]");
    if (roles.includes("ADMIN")) {
        window.location.href = "/admin/orders";
    } else {
        window.location.href = "/dashboard/orders";
    }
}

// Open status update modal
function openStatusModal() {
    const modal = document.getElementById("statusModal");
    const statusSelect = document.getElementById("new-status");

    if (modal && statusSelect) {
        statusSelect.value = currentOrder.status;
        modal.style.display = "block";
    }
}

// Close status modal
function closeStatusModal() {
    const modal = document.getElementById("statusModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Update order status
async function updateOrderStatus() {
    const newStatus = document.getElementById("new-status").value;
    if (!newStatus) return;

    try {
        const response = await apiRequest(
            `/api/orders/${orderId}/status?status=${newStatus}`,
            {
                method: "PUT",
            }
        );

        if (response && response.ok) {
            showMessage("وضعیت سفارش با موفقیت بروزرسانی شد", "success");
            closeStatusModal();
            // Reload order details
            loadOrderDetails();
        } else {
            throw new Error("Failed to update order status");
        }
    } catch (error) {
        console.error("Error updating order status:", error);
        showMessage("خطا در بروزرسانی وضعیت سفارش", "error");
    }
}

// Cancel order
async function cancelOrder() {
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
            // Reload order details
            loadOrderDetails();
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
    document.getElementById("order-content").style.display = "none";
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

// Close modal when clicking outside
document.addEventListener("click", function (event) {
    const modal = document.getElementById("statusModal");
    if (modal && event.target === modal) {
        closeStatusModal();
    }
});
