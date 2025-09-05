// Wishlist Page JavaScript
let wishlistItems = [];

// Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    console.log("Wishlist page loaded");

    // Wait for navigation to load
    setTimeout(() => {
        initializeWishlist();
    }, 100);
});

// Initialize wishlist functionality
async function initializeWishlist() {
    const token = localStorage.getItem("token");
    const roles = localStorage.getItem("roles");

    if (!token) {
        window.location.href = "/login";
        return;
    }

    // Check if user has USER, PROVIDER, or ADMIN role
    try {
        const rolesArray = JSON.parse(roles);
        const hasRequiredRole = rolesArray.some(
            (role) =>
                role.authority === "USER" ||
                role.authority === "PROVIDER" ||
                role.authority === "ADMIN"
        );

        if (!hasRequiredRole) {
            showMessage("شما دسترسی به این صفحه را ندارید", "error");
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 2000);
            return;
        }
    } catch (e) {
        console.error("Error parsing roles:", e);
        window.location.href = "/dashboard";
        return;
    }

    // Load wishlist items
    await loadWishlist();
}

// Load wishlist items from API
async function loadWishlist() {
    try {
        showLoading();

        const userId = localStorage.getItem("userId");
        if (!userId) {
            throw new Error("User ID not found");
        }

        const response = await fetch(`/api/wish-list/${userId}`, {
            headers: getAuthHeaders(),
        });

        if (response.ok) {
            wishlistItems = await response.json();
            displayWishlist();
        } else if (response.status === 404) {
            // No wishlist items found
            wishlistItems = [];
            displayWishlist();
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error loading wishlist:", error);
        showMessage("خطا در بارگذاری لیست علاقه‌مندی‌ها", "error");
        showEmptyState();
    } finally {
        hideLoading();
    }
}

// Display wishlist items
function displayWishlist() {
    const grid = document.getElementById("wishlist-grid");
    const emptyState = document.getElementById("empty-wishlist");
    const actions = document.getElementById("wishlist-actions");

    if (wishlistItems.length === 0) {
        showEmptyState();
        return;
    }

    // Show wishlist grid and actions
    grid.style.display = "grid";
    emptyState.style.display = "none";
    actions.style.display = "flex";

    // Create wishlist cards
    grid.innerHTML = wishlistItems
        .map((item) => createWishlistCard(item))
        .join("");
}

function createWishlistCard(item) {
    const product = item.product;
    const hasDiscount = product.productDiscount && product.productDiscount > 0;
    const discountedPrice = hasDiscount
        ? product.productPrice -
          (product.productPrice * product.productDiscount) / 100
        : product.productPrice;

    const imagePath = product.productImages
        ? `/api/products/images/${extractFilename(product.productImages)}`
        : null;

    // Escape product name for attributes
    const safeName = product.productName
        ? product.productName.replace(/"/g, "&quot;")
        : "بدون نام";

    return `
        <div class="wishlist-card" data-id="${item.id}">
            <div class="wishlist-image">
                ${
                    imagePath
                        ? `<img src="${imagePath}" 
                                 alt="${safeName}" 
                                 onerror="this.onerror=null; this.style.display='none'; this.insertAdjacentHTML('afterend','<div class=&quot;no-image&quot;><i class=&quot;fas fa-image&quot;></i></div>')">`
                        : `<div class="no-image"><i class="fas fa-image"></i></div>`
                }
                ${
                    hasDiscount
                        ? `<div class="product-badge">${product.productDiscount}% تخفیف</div>`
                        : ""
                }
            </div>
            <div class="wishlist-info">
                <div class="wishlist-category">${
                    product.category?.name || "بدون دسته‌بندی"
                }</div>
                <h3 class="wishlist-title">${safeName}</h3>
                <p class="wishlist-description">${
                    product.productDescription || ""
                }</p>
                
                <div class="wishlist-price-section">
                    <span class="wishlist-price">${formatPrice(
                        discountedPrice
                    )} تومان</span>
                    ${
                        hasDiscount
                            ? `<span class="wishlist-original-price">${formatPrice(
                                  product.productPrice
                              )} تومان</span>`
                            : ""
                    }
                    ${
                        hasDiscount
                            ? `<span class="wishlist-discount">${product.productDiscount}%</span>`
                            : ""
                    }
                </div>
                
                <div class="wishlist-actions">
                    <button class="btn btn-view" onclick="viewProduct(${
                        product.productId
                    })" title="مشاهده محصول">
                        <i class="fas fa-eye"></i>
                        مشاهده محصول
                    </button>
                    <button class="btn btn-remove" onclick="removeFromWishlist(${
                        item.id
                    })" title="حذف از علاقه‌مندی‌ها">
                        <i class="fas fa-trash"></i>
                        حذف
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Remove item from wishlist
async function removeFromWishlist(wishlistItemId) {
    try {
        const response = await fetch(`/api/wish-list/${wishlistItemId}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });

        if (response.ok) {
            // Remove from local array
            wishlistItems = wishlistItems.filter(
                (item) => item.id !== wishlistItemId
            );

            // Update display
            displayWishlist();

            showMessage("از علاقه‌مندی‌ها حذف شد", "success");
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        showMessage("خطا در حذف از علاقه‌مندی‌ها", "error");
    }
}

// Clear all wishlist items
async function clearWishlist() {
    if (wishlistItems.length === 0) {
        return;
    }

    if (!confirm("آیا از پاک کردن همه علاقه‌مندی‌ها اطمینان دارید؟")) {
        return;
    }

    try {
        showMessage("در حال پاک کردن علاقه‌مندی‌ها...", "info");

        // Remove all items one by one
        for (const item of wishlistItems) {
            await removeFromWishlist(item.id);
        }

        showMessage("همه علاقه‌مندی‌ها پاک شدند", "success");
    } catch (error) {
        console.error("Error clearing wishlist:", error);
        showMessage("خطا در پاک کردن علاقه‌مندی‌ها", "error");
    }
}

// View product detail
function viewProduct(productId) {
    window.location.href = `/products/${productId}`;
}

// Show loading state
function showLoading() {
    document.getElementById("loading-state").style.display = "block";
    document.getElementById("wishlist-grid").style.display = "none";
    document.getElementById("empty-wishlist").style.display = "none";
    document.getElementById("wishlist-actions").style.display = "none";
}

// Hide loading state
function hideLoading() {
    document.getElementById("loading-state").style.display = "none";
}

// Show empty state
function showEmptyState() {
    document.getElementById("wishlist-grid").style.display = "none";
    document.getElementById("empty-wishlist").style.display = "block";
    document.getElementById("wishlist-actions").style.display = "none";
}

// Format price with Persian numbers
function formatPrice(price) {
    return new Intl.NumberFormat("fa-IR").format(Math.round(price));
}

// Get auth headers for API requests
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

// Show message to user
function showMessage(message, type = "info") {
    // Create message element
    const messageDiv = document.createElement("div");
    messageDiv.className = `message message-${type}`;
    messageDiv.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add to page
    document.body.appendChild(messageDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, 5000);
}
