// Checkout Page JavaScript

let currentCart = null;
let cartItems = [];
let totalAmount = 0;

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

    // Load checkout data
    loadCheckoutData();
});

// Load checkout data
async function loadCheckoutData() {
    try {
        showLoading();

        const userId = localStorage.getItem("userId");
        if (!userId) {
            throw new Error("User ID not found");
        }

        // Get or create shopping cart
        const cart = await getOrCreateShoppingCart(userId);
        if (!cart) {
            throw new Error("Failed to load shopping cart");
        }

        currentCart = cart;

        // Get cart items
        const items = await getCartItems(cart.id);
        if (!items || items.length === 0) {
            showEmptyCart();
            return;
        }

        cartItems = items;

        // Calculate total amount
        totalAmount = calculateTotalAmount(items);

        // Display checkout data
        displayCheckoutData();

        // Set username
        const username = localStorage.getItem("username");
        const usernameInput = document.getElementById("username");
        if (usernameInput) {
            usernameInput.value = username || "نام کاربری";
        }
    } catch (error) {
        console.error("Error loading checkout data:", error);
        showError("خطا در بارگذاری اطلاعات سفارش");
    }
}

// Calculate total amount
function calculateTotalAmount(items) {
    return items.reduce((total, item) => {
        const originalPrice = item.product?.productPrice || 0;
        const discount = item.product?.productDiscount || 0;
        const discountedPrice =
            originalPrice - (originalPrice * discount) / 100;
        const quantity = item.quantity || 0;
        return total + discountedPrice * quantity;
    }, 0);
}

// Display checkout data
function displayCheckoutData() {
    hideAllStates();
    document.getElementById("checkout-content").style.display = "block";

    // Display order items
    displayOrderItems();

    // Update totals
    updateTotals();
}

// Display order items
function displayOrderItems() {
    const summaryItems = document.getElementById("summary-items");
    if (!summaryItems) return;

    summaryItems.innerHTML = "";

    cartItems.forEach((item) => {
        const itemElement = createSummaryItemElement(item);
        summaryItems.appendChild(itemElement);
    });
}

// Create summary item element
function createSummaryItemElement(item) {
    const productName = item.product?.productName || "محصول نامشخص";
    const productImage = item.product?.productImages
        ? `/api/products/images/${extractFilename(item.product.productImages)}`
        : "/images/placeholder.svg";
    const originalPrice = item.product?.productPrice || 0;
    const discount = item.product?.productDiscount || 0;
    const discountedPrice = originalPrice - (originalPrice * discount) / 100;
    const quantity = item.quantity || 0;

    const itemDiv = document.createElement("div");
    itemDiv.className = "summary-item";

    itemDiv.innerHTML = `
        <img src="${productImage}" alt="${productName}" class="summary-item-image" 
             onerror="this.src='/images/placeholder.svg'">
        <div class="summary-item-details">
            <div class="summary-item-name">${productName}</div>
            <div class="summary-item-price-info">
                ${
                    discount > 0
                        ? `
                    <div class="price-row">
                        <span class="original-price">${formatPrice(
                            originalPrice
                        )} تومان</span>
                        <span class="discount-badge">${discount}% تخفیف</span>
                    </div>
                    <div class="discounted-price">${formatPrice(
                        discountedPrice
                    )} تومان</div>
                `
                        : `
                    <div class="summary-item-price">${formatPrice(
                        originalPrice
                    )} تومان</div>
                `
                }
            </div>
        </div>
        <div class="summary-item-quantity">${quantity}</div>
    `;

    return itemDiv;
}

// Update totals
function updateTotals() {
    const totalItems = cartItems.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
    );

    document.getElementById("total-items").textContent = totalItems;
    document.getElementById("total-price").textContent =
        formatPrice(totalAmount) + " تومان";
    document.getElementById("final-price").textContent =
        formatPrice(totalAmount) + " تومان";
}

// Proceed to payment
async function proceedToPayment() {
    const proceedBtn = document.getElementById("proceed-payment-btn");
    if (proceedBtn) {
        proceedBtn.disabled = true;
        proceedBtn.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> در حال پردازش...';
    }

    try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            throw new Error("User ID not found");
        }

        // Create order with totalAmount: 0
        const order = await createOrder(userId);

        // Get the latest order ID for this user (AFTER creating the order)
        const latestOrder = await getLatestOrderForUser(userId);
        if (!latestOrder || !latestOrder.id) {
            throw new Error("Failed to get latest order ID");
        }

        const orderId = latestOrder.id;

        // Store cart items in localStorage for later use in payment success
        localStorage.setItem(
            `order_${orderId}_cartItems`,
            JSON.stringify(cartItems)
        );

        // Get payment method
        const paymentMethod = document.querySelector(
            'input[name="payment"]:checked'
        ).value;

        if (paymentMethod === "zarinpal") {
            // Store amount and orderId in localStorage for payment verification
            localStorage.setItem(
                `order_${orderId}_amount`,
                totalAmount.toString()
            );
            localStorage.setItem("currentOrderId", orderId.toString());
            // Initiate Zarinpal payment directly
            await initiateZarinpalPayment(totalAmount, orderId);
        } else {
            // Cash payment - add order products, update status, and clear cart
            await addOrderProducts(orderId);
            await updateOrderStatus(orderId, "PAID");
            await clearShoppingCart();

            showMessage(
                "سفارش شما با موفقیت ثبت شد. پرداخت در محل انجام خواهد شد.",
                "success"
            );
            setTimeout(() => {
                window.location.href = `/dashboard/orders`;
            }, 3000);
        }
    } catch (error) {
        console.error("Error proceeding to payment:", error);
        showMessage("خطا در ایجاد سفارش", "error");

        if (proceedBtn) {
            proceedBtn.disabled = false;
            proceedBtn.innerHTML =
                '<i class="fas fa-credit-card"></i> ادامه پرداخت';
        }
    }
}

// Create order
async function createOrder(userId) {
    try {
        const response = await apiRequest("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: parseInt(userId),
                totalAmount: 0,
            }),
        });

        if (!response || !response.ok) {
            console.error(
                "Order creation failed:",
                response.status,
                response.statusText
            );
            const errorText = await response.text();
            console.error("Error response:", errorText);
            throw new Error("Failed to create order");
        }

        const orderData = await response.json();
        console.log("Order API response:", orderData);

        // Return the order data - the main function will handle getting the ID if needed
        return orderData;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
}

// Add order products
async function addOrderProducts(orderId) {
    console.log("Adding order products for order ID:", orderId);
    console.log("Cart items:", cartItems);

    const promises = cartItems.map(async (item, index) => {
        // Calculate discounted price
        const originalPrice = item.product.productPrice;
        const discount = item.product.productDiscount || 0;
        const discountedPrice =
            originalPrice - (originalPrice * discount) / 100;

        const requestBody = {
            order_id: orderId,
            product_id: item.product.productId,
            quantity: item.quantity,
            priceAtOrderTime: discountedPrice, // Use discounted price
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
                const errorText = await response.text();
                console.error("Error response:", errorText);
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
}

// Update order status
async function updateOrderStatus(orderId, status) {
    try {
        const response = await apiRequest(
            `/api/orders/${orderId}/status?status=${status}`,
            {
                method: "PUT",
            }
        );

        if (!response || !response.ok) {
            throw new Error("Failed to update order status");
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
}

// Go back to cart
function goBackToCart() {
    window.location.href = "/shopping-cart";
}

// Show loading state
function showLoading() {
    hideAllStates();
    document.getElementById("loading-state").style.display = "block";
}

// Show empty cart state
function showEmptyCart() {
    hideAllStates();
    document.getElementById("empty-cart-state").style.display = "block";
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
    document.getElementById("empty-cart-state").style.display = "none";
    document.getElementById("checkout-content").style.display = "none";
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

// Get latest order for user (fallback when order creation doesn't return ID)
async function getLatestOrderForUser(userId) {
    try {
        const response = await apiRequest(`/api/orders/user/${userId}`);
        if (response && response.ok) {
            const orders = await response.json();
            if (orders && orders.length > 0) {
                // Sort orders by date (newest first)
                const sortedOrders = orders.sort(
                    (a, b) => new Date(b.date) - new Date(a.date)
                );

                // Return the most recent order
                return sortedOrders[0];
            }
        }
        return null;
    } catch (error) {
        console.error("Error getting latest order:", error);
        return null;
    }
}

// Clear shopping cart
async function clearShoppingCart() {
    try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        // Get current cart
        const cart = await getOrCreateShoppingCart(userId);
        if (!cart) return;

        // Get cart items
        const cartItems = await getCartItems(cart.id);
        if (!cartItems || cartItems.length === 0) return;

        // Delete all cart items
        const deletePromises = cartItems.map((item) =>
            apiRequest(`/api/cart-items/${item.id}`, {
                method: "DELETE",
            })
        );

        await Promise.all(deletePromises);
        console.log("Shopping cart cleared successfully");
    } catch (error) {
        console.error("Error clearing shopping cart:", error);
    }
}

// Initiate Zarinpal payment
async function initiateZarinpalPayment(amount, orderId) {
    try {
        // Get user info for metadata
        const userId = localStorage.getItem("userId");

        // Create request body according to your backend API specification
        const requestBody = {
            merchant_id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // Replace with your actual merchant ID
            amount: parseInt(amount),
            description: `پرداخت سفارش شماره ${orderId}`,
            callback_url: `http://localhost:8080/callback`,
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
            // Try to get error details from response
            let errorMessage = "Failed to initiate payment";
            try {
                const errorData = await response.json();
                errorMessage =
                    errorData.message ||
                    errorData.errors?.[0]?.message ||
                    errorMessage;
            } catch (e) {
                // If we can't parse JSON, use status text
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();

        // Check if the response has the expected structure
        if (result.data && result.data.code === 100 && result.data.authority) {
            // Redirect to Zarinpal payment page
            const paymentUrl = `https://sandbox.zarinpal.com/pg/StartPay/${result.data.authority}`;
            window.location.href = paymentUrl;
        } else {
            throw new Error(
                result.data?.message || "Invalid response from payment gateway"
            );
        }
    } catch (error) {
        console.error("Error calling Zarinpal API:", error);
        showMessage("خطا در ایجاد درخواست پرداخت", "error");
        throw error;
    }
}
