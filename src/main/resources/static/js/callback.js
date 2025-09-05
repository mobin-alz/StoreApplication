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
        // Check if we have the required parameters
        if (!authority || !status) {
            showError("پارامترهای پرداخت یافت نشد");
            return;
        }

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
        // Get order ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get("orderId");

        if (orderId) {
            // Add order products
            await addOrderProductsToOrder(orderId);

            // Update order status to PAID
            await updateOrderStatus(orderId, "PAID");

            // Clear the shopping cart
            await clearShoppingCart();
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
function handleFailedPayment() {
    // Show error state
    document.getElementById("loading-state").style.display = "none";
    document.getElementById("error-state").style.display = "block";
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

// Go to home page
function goToHome() {
    window.location.href = "/";
}

// Add order products to order
async function addOrderProductsToOrder(orderId) {
    try {
        // Get cart items from localStorage
        const cartItemsJson = localStorage.getItem(
            `order_${orderId}_cartItems`
        );
        if (!cartItemsJson) {
            console.warn("No cart items found for order:", orderId);
            return;
        }

        const cartItems = JSON.parse(cartItemsJson);
        console.log("Adding order products for order ID:", orderId);
        console.log("Cart items:", cartItems);

        const promises = cartItems.map(async (item, index) => {
            const requestBody = {
                order_id: parseInt(orderId),
                product_id: item.product.productId,
                quantity: item.quantity,
                priceAtOrderTime: item.product.productPrice,
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

        // Clean up localStorage
        localStorage.removeItem(`order_${orderId}_cartItems`);
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
