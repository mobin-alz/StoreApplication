// Callback Page JavaScript

let authority = null;
let status = null;

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

    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    authority = urlParams.get("Authority");
    status = urlParams.get("Status");

    console.log("Callback parameters:", { authority, status });

    // Process the callback
    processCallback();
});

// Process the Zarinpal callback
async function processCallback() {
    try {
        // Get URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const authority = urlParams.get("Authority");
        const status = urlParams.get("Status");

        // Get orderId from localStorage
        const orderId = localStorage.getItem("currentOrderId");

        if (!orderId) {
            showError("شناسه سفارش یافت نشد");
            return;
        }

        // Check if we have the required parameters
        if (!authority || !status) {
            showError("پارامترهای پرداخت یافت نشد");
            return;
        }

        // Always add products to the order (regardless of payment status)
        await addOrderProductsToOrder(orderId);

        // Check payment status
        if (status === "OK") {
            // Payment was successful
            await handleSuccessfulPayment();
        } else {
            // Payment failed or was cancelled
            handleFailedPayment();
        }
    } catch (error) {
        console.error("Error processing callback:", error);
        showError("خطا در پردازش پرداخت");
    }
}

// Handle successful payment
async function handleSuccessfulPayment() {
    try {
        // Get order ID from localStorage (stored during payment initiation)
        const orderId = localStorage.getItem("currentOrderId");

        if (orderId) {
            // Update order status to PAID
            await updateOrderStatus(orderId, "PAID");

            // Clear the shopping cart
            await clearShoppingCart();

            // Clean up localStorage after successful payment
            localStorage.removeItem(`order_${orderId}_cartItems`);
            localStorage.removeItem(`order_${orderId}_amount`);
            localStorage.removeItem("currentOrderId");
        }

        // Show success state
        document.getElementById("loading-state").style.display = "none";
        document.getElementById("success-state").style.display = "block";

        // Auto redirect to orders page after 3 seconds
        setTimeout(() => {
            window.location.href = "/dashboard/orders";
        }, 3000);
    } catch (error) {
        console.error("Error handling successful payment:", error);
        showError("خطا در به‌روزرسانی وضعیت سفارش");
    }
}

// Handle failed payment
async function handleFailedPayment() {
    // Get order ID from localStorage (stored during payment initiation)
    const orderId = localStorage.getItem("currentOrderId");

    // Set a timer to delete the order after 24 hours if not paid
    if (orderId) {
        setTimeout(async () => {
            try {
                // Check if order is still PENDING
                const orderResponse = await apiRequest(
                    `/api/orders/${orderId}`
                );
                if (orderResponse && orderResponse.ok) {
                    const order = await orderResponse.json();
                    if (order.status === "PENDING") {
                        console.log(
                            "Deleting order after 24 hours due to non-payment"
                        );
                        await apiRequest(`/api/orders/${orderId}`, {
                            method: "DELETE",
                        });
                    }
                }
            } catch (error) {
                console.error("Error deleting expired order:", error);
            }
        }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

        console.log("Order will be deleted after 24 hours if not paid");
    }

    // Show error state
    document.getElementById("loading-state").style.display = "none";
    document.getElementById("error-state").style.display = "block";

    // Update the retry button to include order ID
    if (orderId) {
        const retryButton = document.getElementById("retry-payment-btn");
        if (retryButton) {
            retryButton.onclick = () => retryPayment(orderId);
        }
    }
}

// Show error message
function showError(message) {
    document.getElementById("loading-state").style.display = "none";
    document.getElementById("success-state").style.display = "none";

    const errorState = document.getElementById("error-state");
    if (errorState) {
        const errorMessage = errorState.querySelector("p");
        if (errorMessage) errorMessage.textContent = message;
        errorState.style.display = "block";
    }
}

// Go to orders page
function goToOrders() {
    window.location.href = "/dashboard/orders";
}

// Go to checkout page
function goToCheckout() {
    window.location.href = "/checkout";
}

// Retry payment for failed order
async function retryPayment(orderId) {
    try {
        // Get order details to get the amount
        const response = await apiRequest(`/api/orders/${orderId}`);
        if (!response || !response.ok) {
            // If order doesn't exist, redirect to checkout to create a new one
            if (response.status === 404) {
                alert("سفارش یافت نشد. در حال انتقال به صفحه تسویه حساب...");
                window.location.href = "/checkout";
                return;
            }
            alert("خطا در دریافت اطلاعات سفارش");
            return;
        }

        const order = await response.json();
        const amount = order.totalAmount;

        // Check if order is still PENDING
        if (order.status !== "PENDING") {
            alert("این سفارش قبلاً پرداخت شده است");
            window.location.href = "/dashboard/orders";
            return;
        }

        // Store order info for callback
        localStorage.setItem(`order_${orderId}_amount`, amount.toString());

        // Initiate Zarinpal payment
        await initiateZarinpalPayment(amount, orderId);
    } catch (error) {
        console.error("Error retrying payment:", error);
        alert("خطا در شروع پرداخت مجدد");
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

// Go to home page
function goToHome() {
    window.location.href = "/";
}

// Add order products to order
async function addOrderProductsToOrder(orderId) {
    try {
        // First check if order already has products
        const orderResponse = await apiRequest(`/api/orders/${orderId}`);
        if (orderResponse && orderResponse.ok) {
            const order = await orderResponse.json();
            if (order.orderProducts && order.orderProducts.length > 0) {
                return;
            }
        }

        // Get cart items from localStorage
        const cartItemsJson = localStorage.getItem(
            `order_${orderId}_cartItems`
        );

        if (!cartItemsJson) {
            return;
        }

        const cartItems = JSON.parse(cartItemsJson);

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
                priceAtOrderTime: discountedPrice, // Use discounted price
            };

            try {
                const response = await apiRequest("/api/order-product/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                });

                if (!response || !response.ok) {
                    const errorText = await response.text();
                    console.error("Error adding product:", errorText);
                    return null;
                }

                const result = await response.json();
                return result;
            } catch (error) {
                console.error("Error adding product:", error);
                return null;
            }
        });

        const results = await Promise.all(promises);

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
