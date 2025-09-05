// Payment Success Page JavaScript

let orderId = null;
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
    orderId = urlParams.get("orderId");
    authority = urlParams.get("Authority");
    status = urlParams.get("Status");

    if (!orderId) {
        // If no order ID, redirect to home
        window.location.href = "/";
        return;
    }

    // Check if this is a Zarinpal callback
    if (authority && status) {
        handleZarinpalCallback();
    } else {
        // Direct access to success page (for cash payments)
        updateOrderStatus();
        displayOrderInfo();
    }
});

// Handle Zarinpal callback
async function handleZarinpalCallback() {
    try {
        // Check if status is OK
        if (status !== "OK") {
            showError("پرداخت ناموفق بود یا توسط کاربر لغو شد");
            return;
        }

        // Verify payment with Zarinpal
        const verificationResult = await verifyZarinpalPayment();

        if (verificationResult.success) {
            // Update order status to PAID
            await updateOrderStatus();
            displayOrderInfo();
            showSuccessMessage();
        } else {
            showError(verificationResult.message || "خطا در تایید پرداخت");
        }
    } catch (error) {
        console.error("Error handling Zarinpal callback:", error);
        showError("خطا در پردازش پرداخت");
    }
}

// Verify Zarinpal payment
async function verifyZarinpalPayment() {
    try {
        // Get the amount from the order (you might need to store this in localStorage or get it from the order)
        const amount =
            localStorage.getItem(`order_${orderId}_amount`) || "1000"; // Default amount

        // Check if merchant ID is set
        const merchantId = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"; // Replace with your actual merchant ID
        if (merchantId === "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx") {
            return {
                success: false,
                message: "Merchant ID not configured",
            };
        }

        const requestBody = {
            merchant_id: merchantId,
            amount: parseInt(amount),
            authority: authority,
        };

        const response = await apiRequest("/api/zarin/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response || !response.ok) {
            return {
                success: false,
                message: "خطا در ارتباط با درگاه پرداخت",
            };
        }

        const result = await response.json();

        // Check if verification was successful
        if (
            result.data &&
            (result.data.code === 100 || result.data.code === 101)
        ) {
            return {
                success: true,
                refId: result.data.ref_id,
                message: "پرداخت با موفقیت انجام شد",
            };
        } else {
            return {
                success: false,
                message: result.data?.message || "پرداخت ناموفق بود",
            };
        }
    } catch (error) {
        console.error("Error verifying Zarinpal payment:", error);
        return {
            success: false,
            message: "خطا در تایید پرداخت",
        };
    }
}

// Update order status to PAID
async function updateOrderStatus() {
    try {
        const response = await apiRequest(
            `/api/orders/${orderId}/status?status=PAID`,
            {
                method: "PUT",
            }
        );

        if (!response || !response.ok) {
            console.error("Failed to update order status");
        }
    } catch (error) {
        console.error("Error updating order status:", error);
    }
}

// Display order information
async function displayOrderInfo() {
    try {
        // Get order details
        const response = await apiRequest(`/api/orders/${orderId}`);

        if (response && response.ok) {
            const order = await response.json();

            // Display order ID
            document.getElementById("order-id").textContent =
                order.id || orderId;

            // Display order date
            const orderDate = new Date(order.date);
            const formattedDate = orderDate.toLocaleDateString("fa-IR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
            document.getElementById("order-date").textContent = formattedDate;
        } else {
            // Fallback if order details can't be loaded
            document.getElementById("order-id").textContent = orderId;
            document.getElementById("order-date").textContent =
                new Date().toLocaleDateString("fa-IR");
        }
    } catch (error) {
        console.error("Error loading order details:", error);
        // Fallback values
        document.getElementById("order-id").textContent = orderId;
        document.getElementById("order-date").textContent =
            new Date().toLocaleDateString("fa-IR");
    }
}

// Go to home page
function goToHome() {
    window.location.href = "/";
}

// Go to orders page
function goToOrders() {
    window.location.href = "/dashboard/orders";
}

// Show success message
function showSuccessMessage() {
    const successMessage = document.getElementById("success-message");
    if (successMessage) {
        successMessage.style.display = "block";
    }
}

// Show error message
function showError(message) {
    const errorMessage = document.getElementById("error-message");
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
    }

    // Hide success message if showing
    const successMessage = document.getElementById("success-message");
    if (successMessage) {
        successMessage.style.display = "none";
    }
}
