// Shopping Cart Page JavaScript

let currentCart = null;
let cartItems = [];

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

    // Load cart
    loadCart();
});

// Load shopping cart data
async function loadCart() {
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
        if (items) {
            cartItems = items;
            displayCart();
        } else {
            showEmptyCart();
        }
    } catch (error) {
        console.error("Error loading cart:", error);
        showError("خطا در بارگذاری سبد خرید");
    }
}

// Display cart items
function displayCart() {
    if (!cartItems || cartItems.length === 0) {
        showEmptyCart();
        return;
    }

    hideAllStates();
    document.getElementById("cart-content").style.display = "block";

    // Display cart items
    const cartItemsContainer = document.getElementById("cart-items");
    cartItemsContainer.innerHTML = "";

    cartItems.forEach((item) => {
        const cartItemElement = createCartItemElement(item);
        cartItemsContainer.appendChild(cartItemElement);
    });

    // Update summary
    updateCartSummary();
}

// Create cart item element
function createCartItemElement(item) {
    const cartItemDiv = document.createElement("div");
    cartItemDiv.className = "cart-item";
    cartItemDiv.dataset.itemId = item.id;

    // Get product details from API response
    const productName = item.product?.productName || "محصول نامشخص";
    const productImage = item.product?.productImages
        ? `/api/products/images/${extractFilename(item.product.productImages)}`
        : "/images/placeholder.jpg";
    const productPrice = item.product?.productPrice || 0;
    const quantity = item.quantity || 1;
    const maxQuantity = item.product?.productQuantity || 1;

    cartItemDiv.innerHTML = `
        <img src="${productImage}" alt="${productName}" class="cart-item-image" 
             onerror="this.src='/images/placeholder.jpg'"
             onclick="goToProduct(${item.product.productId})">
        
        <div class="cart-item-details" onclick="goToProduct(${
            item.product.productId
        })">
            <h4>${productName}</h4>
            <p>قیمت واحد: ${formatPrice(productPrice)} تومان</p>
        </div>
        
        <div class="cart-item-price">
            ${formatPrice(productPrice * quantity)} تومان
        </div>
        
        <div class="cart-item-quantity">
            <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${
        quantity - 1
    })" 
                    ${quantity <= 1 ? "disabled" : ""}>
                <i class="fas fa-minus"></i>
            </button>
            <input type="number" class="quantity-input" value="${quantity}" min="1" max="${maxQuantity}"
                   onchange="updateQuantity(${item.id}, this.value)">
            <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${
        quantity + 1
    })" 
                    ${quantity >= maxQuantity ? "disabled" : ""}>
                <i class="fas fa-plus"></i>
            </button>
        </div>
        
        <div class="cart-item-actions">
            <button class="remove-btn" onclick="removeCartItem(${item.id})">
                <i class="fas fa-trash"></i>
                حذف
            </button>
        </div>
    `;

    return cartItemDiv;
}

// Update quantity of cart item
async function updateQuantity(itemId, newQuantity) {
    try {
        newQuantity = parseInt(newQuantity);
        if (newQuantity < 1) return;

        const item = cartItems.find((item) => item.id === itemId);
        if (!item) return;

        // Check if quantity exceeds available stock
        const maxQuantity = item.product?.productQuantity || 1;
        if (newQuantity > maxQuantity) {
            showMessage(`حداکثر تعداد موجود: ${maxQuantity}`, "warning");
            return;
        }

        // Update quantity via API
        const result = await updateCartItem(
            itemId,
            currentCart.id,
            item.product.productId,
            newQuantity,
            item.product.productPrice
        );

        if (result) {
            // Update local data
            item.quantity = newQuantity;

            // Refresh display
            displayCart();

            // Update cart count in navigation
            updateCartCount();

            showMessage("تعداد محصول بروزرسانی شد", "success");
        } else {
            showMessage("خطا در بروزرسانی تعداد", "error");
        }
    } catch (error) {
        console.error("Error updating quantity:", error);
        showMessage("خطا در بروزرسانی تعداد", "error");
    }
}

// Remove item from cart
async function removeCartItem(itemId) {
    try {
        const result = await removeFromCart(itemId);

        if (result) {
            // Remove from local data
            cartItems = cartItems.filter((item) => item.id !== itemId);

            // Refresh display
            displayCart();

            // Update cart count in navigation
            updateCartCount();

            showMessage("محصول از سبد خرید حذف شد", "success");
        } else {
            showMessage("خطا در حذف محصول", "error");
        }
    } catch (error) {
        console.error("Error removing from cart:", error);
        showMessage("خطا در حذف محصول", "error");
    }
}

// Clear entire cart
function clearCart() {
    const modal = document.getElementById("clearCartModal");
    if (modal) {
        modal.style.display = "flex";
    }
}

// Close clear cart modal
function closeClearCartModal() {
    const modal = document.getElementById("clearCartModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Confirm clear cart
async function confirmClearCart() {
    try {
        if (currentCart) {
            const result = await deleteShoppingCart(currentCart.id);
            if (result) {
                cartItems = [];
                currentCart = null;
                showEmptyCart();
                updateCartCount();
                showMessage("سبد خرید خالی شد", "success");
                closeClearCartModal();
            } else {
                showMessage("خطا در خالی کردن سبد خرید", "error");
            }
        }
    } catch (error) {
        console.error("Error clearing cart:", error);
        showMessage("خطا در خالی کردن سبد خرید", "error");
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (!cartItems || cartItems.length === 0) {
        showMessage("سبد خرید شما خالی است", "warning");
        return;
    }

    // For now, just show a message
    // In a real application, this would redirect to checkout page
    showMessage("این قابلیت در نسخه فعلی در دسترس نیست", "info");
}

// Update cart summary
function updateCartSummary() {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce(
        (sum, item) => sum + (item.product?.productPrice || 0) * item.quantity,
        0
    );

    // Update items count in header
    const itemsCountElement = document.getElementById("items-count");
    if (itemsCountElement) {
        itemsCountElement.textContent = `${cartItems.length} محصول`;
    }

    document.getElementById("total-items").textContent = totalItems;
    document.getElementById("total-price").textContent =
        formatPrice(totalPrice) + " تومان";
    document.getElementById("final-price").textContent =
        formatPrice(totalPrice) + " تومان";
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
    document.getElementById("error-state").style.display = "block";
    document.getElementById("error-state").querySelector("p").textContent =
        message;
}

// Hide all states
function hideAllStates() {
    document.getElementById("loading-state").style.display = "none";
    document.getElementById("empty-cart-state").style.display = "none";
    document.getElementById("cart-content").style.display = "none";
    document.getElementById("error-state").style.display = "none";
}

// Format price with thousand separators
function formatPrice(price) {
    return new Intl.NumberFormat("fa-IR").format(price);
}

// Navigate to product detail page
function goToProduct(productId) {
    if (productId) {
        window.location.href = `/products/${productId}`;
    }
}

// Close modal when clicking outside
document.addEventListener("click", function (event) {
    const modal = document.getElementById("clearCartModal");
    if (modal && event.target === modal) {
        closeClearCartModal();
    }
});

// Extract filename from path (helper function)
function extractFilename(filePath) {
    if (!filePath) return null;
    const filename = filePath.split(/[\\\/]/).pop();
    return filename;
}
