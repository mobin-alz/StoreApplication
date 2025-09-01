// Product Detail Page JavaScript

let currentProduct = null;
let currentQuantity = 1;
let cartItemQuantity = 0; // Quantity of this product in cart

// Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    loadNavigation();
    loadFooter();

    // Get product ID from URL
    const productId = getProductIdFromUrl();
    if (productId) {
        loadProductDetails(productId);
    } else {
        showError("شناسه محصول یافت نشد");
    }

    // Initialize tab functionality
    initializeTabs();

    // Initialize quantity controls
    initializeQuantityControls();

    // Check wishlist status and update button
    checkInitialWishlistStatus();

    // Check cart status and update button
    checkInitialCartStatus();

    // Initialize comments functionality
    initializeComments();

    // Ensure delete modal is hidden by default
    const deleteModal = document.getElementById("deleteCommentModal");
    if (deleteModal) {
        deleteModal.style.display = "none";
    }
});

// Get product ID from URL
function getProductIdFromUrl() {
    const pathSegments = window.location.pathname.split("/");
    return pathSegments[pathSegments.length - 1];
}

// Load product details from API
async function loadProductDetails(productId) {
    try {
        showLoading();

        if (typeof apiRequest !== "function") {
            throw new Error("API utilities not loaded");
        }

        const response = await apiRequest(`/api/products/${productId}`);

        if (!response || !response.ok) {
            if (response && response.status === 404) {
                showError("محصول مورد نظر یافت نشد");
            } else {
                throw new Error(
                    `HTTP error! status: ${response?.status || "Unknown"}`
                );
            }
            return;
        }

        const product = await response.json();
        currentProduct = product;

        displayProductDetails(product);

        // Load comments for this product
        if (typeof loadComments === "function") {
            loadComments();
        }
    } catch (error) {
        console.error("Error loading product details:", error);
        showError("خطا در بارگذاری اطلاعات محصول");
    }
}

// Display product details in the UI
function displayProductDetails(product) {
    // Update breadcrumb
    const breadcrumbElement = document.getElementById(
        "product-name-breadcrumb"
    );
    if (breadcrumbElement) {
        breadcrumbElement.textContent = product.productName;
    }

    // Update main image
    const mainImage = document.getElementById("main-image");
    const imagePath =
        product.productImages && typeof extractFilename === "function"
            ? `/api/products/images/${extractFilename(product.productImages)}`
            : null;

    if (mainImage) {
        if (imagePath) {
            mainImage.src = imagePath;
            mainImage.alt = product.productName;
            mainImage.onerror = function () {
                if (this.parentElement) {
                    this.parentElement.innerHTML =
                        '<div class="no-image"><i class="fas fa-image"></i></div>';
                }
            };
        } else {
            if (mainImage.parentElement) {
                mainImage.parentElement.innerHTML =
                    '<div class="no-image"><i class="fas fa-image"></i></div>';
            }
        }
    }

    // Update product info
    const productTitle = document.getElementById("product-title");
    const productCategory = document.getElementById("product-category");

    if (productTitle) {
        productTitle.textContent = product.productName;
    }
    if (productCategory) {
        productCategory.textContent =
            product.category?.name || "بدون دسته‌بندی";
    }

    // Update price section
    const hasDiscount = product.productDiscount && product.productDiscount > 0;
    const discountedPrice = hasDiscount
        ? product.productPrice -
          (product.productPrice * product.productDiscount) / 100
        : product.productPrice;

    const currentPrice = document.getElementById("current-price");
    if (currentPrice) {
        currentPrice.textContent = formatPrice(discountedPrice) + " تومان";
    }

    if (hasDiscount) {
        const originalPrice = document.getElementById("original-price");
        const discountBadge = document.getElementById("discount-badge");

        if (originalPrice) {
            originalPrice.textContent =
                formatPrice(product.productPrice) + " تومان";
            originalPrice.style.display = "inline";
        }
        if (discountBadge) {
            discountBadge.textContent = product.productDiscount + "% تخفیف";
            discountBadge.style.display = "inline";
        }
    }

    // Update description content
    const descriptionContent = document.getElementById("description-content");
    if (descriptionContent) {
        descriptionContent.innerHTML = `
            <p>${product.productDescription}</p>
            <div class="product-specs">
                <h4>مشخصات کلی:</h4>
                <ul>
                    <li><strong>نام محصول:</strong> ${product.productName}</li>
                    <li><strong>دسته‌بندی:</strong> ${
                        product.category?.name || "بدون دسته‌بندی"
                    }</li>
                    <li><strong>قیمت اصلی:</strong> ${formatPrice(
                        product.productPrice
                    )} تومان</li>
                    ${
                        hasDiscount
                            ? `<li><strong>قیمت با تخفیف:</strong> ${formatPrice(
                                  discountedPrice
                              )} تومان</li>`
                            : ""
                    }
                    ${
                        hasDiscount
                            ? `<li><strong>میزان تخفیف:</strong> ${product.productDiscount}%</li>`
                            : ""
                    }
                    <li><strong>موجودی:</strong> ${
                        product.productQuantity
                    } عدد</li>
                </ul>
            </div>
        `;
    }

    // Update specifications content
    const specificationsContent = document.getElementById(
        "specifications-content"
    );
    if (specificationsContent) {
        specificationsContent.innerHTML = `
            <div class="spec-item">
                <span class="spec-label">نام محصول</span>
                <span class="spec-value">${product.productName}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">دسته‌بندی</span>
                <span class="spec-value">${
                    product.category?.name || "بدون دسته‌بندی"
                }</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">قیمت اصلی</span>
                <span class="spec-value">${formatPrice(
                    product.productPrice
                )} تومان</span>
            </div>
            ${
                hasDiscount
                    ? `
            <div class="spec-item">
                <span class="spec-label">قیمت با تخفیف</span>
                <span class="spec-value">${formatPrice(
                    discountedPrice
                )} تومان</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">میزان تخفیف</span>
                <span class="spec-value">${product.productDiscount}%</span>
            </div>
            `
                    : ""
            }
            <div class="spec-item">
                <span class="spec-label">موجودی</span>
                <span class="spec-value">${product.productQuantity} عدد</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">وضعیت</span>
                <span class="spec-value">${
                    product.productQuantity > 0 ? "موجود" : "ناموجود"
                }</span>
            </div>
        `;
    }

    // Update quantity input max attribute
    const quantityInput = document.getElementById("quantity");
    if (quantityInput) {
        quantityInput.max = product.productQuantity || 1;
    }

    // Show product content and tabs
    const productContent = document.getElementById("product-content");
    const productTabs = document.getElementById("product-tabs");

    if (productContent) {
        productContent.style.display = "grid";
    }
    if (productTabs) {
        productTabs.style.display = "block";
    }

    hideLoading();
}

// Initialize tab functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabPanes = document.querySelectorAll(".tab-pane");

    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const targetTab = button.getAttribute("data-tab");

            // Remove active class from all buttons and panes
            tabButtons.forEach((btn) => btn.classList.remove("active"));
            tabPanes.forEach((pane) => pane.classList.remove("active"));

            // Add active class to clicked button and corresponding pane
            button.classList.add("active");
            const targetTabPane = document.getElementById(`${targetTab}-tab`);
            if (targetTabPane) {
                targetTabPane.classList.add("active");
            }
        });
    });
}

// Initialize quantity controls
function initializeQuantityControls() {
    const quantityInput = document.getElementById("quantity");

    if (quantityInput) {
        quantityInput.addEventListener("input", function () {
            const value = parseInt(this.value);
            const maxQuantity = currentProduct?.productQuantity || 1;

            if (value < 1) this.value = 1;
            if (value > maxQuantity) {
                this.value = maxQuantity;
                showMessage(`حداکثر تعداد موجود: ${maxQuantity}`, "warning");
            }
            currentQuantity = parseInt(this.value) || 1;
        });
    }
}

// Increase quantity
function increaseQuantity() {
    const quantityInput = document.getElementById("quantity");
    if (quantityInput) {
        const currentValue = parseInt(quantityInput.value) || 1;
        const maxQuantity = currentProduct?.productQuantity || 1;

        if (currentValue < maxQuantity) {
            quantityInput.value = currentValue + 1;
            currentQuantity = currentValue + 1;
        } else {
            showMessage(`حداکثر تعداد موجود: ${maxQuantity}`, "warning");
        }
    }
}

// Decrease quantity
function decreaseQuantity() {
    const quantityInput = document.getElementById("quantity");
    if (quantityInput) {
        const currentValue = parseInt(quantityInput.value) || 1;
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
            currentQuantity = currentValue - 1;
        }
    }
}

// Add to cart functionality
async function addToCart() {
    console.log("addToCart function called");
    console.log("currentProduct:", currentProduct);

    if (!currentProduct) {
        console.log("No current product");
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        console.log("No token found");
        showMessage("لطفاً ابتدا وارد شوید", "error");
        setTimeout(() => {
            window.location.href = "/login";
        }, 2000);
        return;
    }

    try {
        // Get user ID from localStorage
        const userId = localStorage.getItem("userId");
        if (!userId) {
            showMessage("خطا در شناسایی کاربر", "error");
            return;
        }

        // First, get or create shopping cart
        console.log("Getting or creating shopping cart for user:", userId);
        const cart = await getOrCreateShoppingCart(userId);
        console.log("Cart result:", cart);
        if (!cart) {
            throw new Error("خطا در ایجاد یا دریافت سبد خرید");
        }

        // Add product to cart
        console.log("Adding item to cart:", {
            cartId: cart.id,
            productId: currentProduct.productId,
            quantity: currentQuantity,
            price: currentProduct.productPrice || 0,
        });

        const result = await addItemToCart(
            cart.id,
            currentProduct.productId,
            currentQuantity,
            currentProduct.productPrice || 0
        );

        console.log("Add to cart result:", result);

        if (result) {
            cartItemQuantity = currentQuantity;
            updateCartButton();
            showMessage("محصول با موفقیت به سبد خرید اضافه شد", "success");
            // Update cart count in navigation
            updateCartCount();
        } else {
            showMessage("خطا در افزودن به سبد خرید", "error");
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
        showMessage("خطا در افزودن به سبد خرید", "error");
    }
}

// Helper function to extract filename from path
function extractFilename(filePath) {
    if (!filePath) return null;
    const filename = filePath.split(/[\\\/]/).pop();
    return filename;
}

// Add to wishlist functionality
async function addToWishlist() {
    const token = localStorage.getItem("token");
    if (!token) {
        showMessage("لطفاً ابتدا وارد شوید", "error");
        setTimeout(() => {
            window.location.href = "/login";
        }, 2000);
        return;
    }

    try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            showMessage("خطا در شناسایی کاربر", "error");
            return;
        }

        const productId = getProductIdFromUrl();
        if (!productId) {
            showMessage("خطا در شناسایی محصول", "error");
            return;
        }

        // Check if product is already in wishlist
        const isInWishlist = await checkWishlistStatus(productId);

        if (isInWishlist) {
            // Remove from wishlist
            await removeFromWishlist(productId);
            updateWishlistButton(false);
            showMessage("محصول از علاقه‌مندی‌ها حذف شد", "success");
        } else {
            // Add to wishlist
            await addToWishlistAPI(productId, userId);
            updateWishlistButton(true);
            showMessage("محصول به علاقه‌مندی‌ها اضافه شد", "success");
        }
    } catch (error) {
        console.error("Error toggling wishlist:", error);
        showMessage("خطا در عملیات علاقه‌مندی", "error");
    }
}

// Check if product is in wishlist
async function checkWishlistStatus(productId) {
    try {
        const userId = localStorage.getItem("userId");

        const response = await apiRequest(`/api/wish-list/${userId}`);

        if (response && response.ok) {
            const wishlist = await response.json();
            return wishlist.some(
                (item) => item.product.productId === parseInt(productId)
            );
        }
        return false;
    } catch (error) {
        console.error("Error checking wishlist status:", error);
        return false;
    }
}

// Add product to wishlist API
async function addToWishlistAPI(productId, userId) {
    const response = await apiRequest("/api/wish-list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            userId: parseInt(userId),
            productId: parseInt(productId),
        }),
    });

    if (!response || !response.ok) {
        throw new Error("Failed to add to wishlist");
    }
}

// Remove product from wishlist API
async function removeFromWishlist(productId) {
    try {
        const userId = localStorage.getItem("userId");

        // First get the wishlist to find the item ID
        const response = await apiRequest(`/api/wish-list/${userId}`);

        if (response && response.ok) {
            const wishlist = await response.json();
            const wishlistItem = wishlist.find(
                (item) => item.product.productId === parseInt(productId)
            );

            if (wishlistItem) {
                // Delete the wishlist item
                const deleteResponse = await apiRequest(
                    `/api/wish-list/${wishlistItem.id}`,
                    {
                        method: "DELETE",
                    }
                );

                if (!deleteResponse || !deleteResponse.ok) {
                    throw new Error("Failed to remove from wishlist");
                }
            }
        }
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        throw error;
    }
}

// Update wishlist button appearance
function updateWishlistButton(isInWishlist) {
    const wishlistBtn = document.querySelector(".btn-wishlist");
    if (wishlistBtn) {
        if (isInWishlist) {
            wishlistBtn.innerHTML =
                '<i class="fas fa-heart"></i> حذف از علاقه‌مندی‌ها';
            wishlistBtn.classList.add("in-wishlist");
        } else {
            wishlistBtn.innerHTML =
                '<i class="fas fa-heart"></i> افزودن به علاقه‌مندی‌ها';
            wishlistBtn.classList.remove("in-wishlist");
        }
    }
}

// Check initial wishlist status when page loads
async function checkInitialWishlistStatus() {
    const token = localStorage.getItem("token");
    if (!token) {
        return; // User not logged in, button stays in default state
    }

    try {
        const productId = getProductIdFromUrl();
        if (productId) {
            const isInWishlist = await checkWishlistStatus(productId);
            updateWishlistButton(isInWishlist);
        }
    } catch (error) {
        console.error("Error checking initial wishlist status:", error);
    }
}

// Check initial cart status when page loads
async function checkInitialCartStatus() {
    const token = localStorage.getItem("token");
    if (!token) {
        return; // User not logged in, button stays in default state
    }

    try {
        const productId = getProductIdFromUrl();
        if (productId) {
            const quantityInCart = await getProductQuantityInCart(productId);
            cartItemQuantity = quantityInCart;
            updateCartButton();
        }
    } catch (error) {
        console.error("Error checking initial cart status:", error);
    }
}

// Get quantity of product in cart
async function getProductQuantityInCart(productId) {
    try {
        const userId = localStorage.getItem("userId");
        if (!userId) return 0;

        const cart = await getOrCreateShoppingCart(userId);
        if (!cart) return 0;

        const items = await getCartItems(cart.id);
        if (!items) return 0;

        const cartItem = items.find(
            (item) => item.product.productId === parseInt(productId)
        );
        return cartItem ? cartItem.quantity : 0;
    } catch (error) {
        console.error("Error getting product quantity in cart:", error);
        return 0;
    }
}

// Update cart button based on current state
function updateCartButton() {
    const addToCartBtn = document.getElementById("add-to-cart-btn");
    if (!addToCartBtn) return;

    if (cartItemQuantity > 0) {
        // Product is in cart - show "Update Cart" style
        addToCartBtn.innerHTML = `
            <i class="fas fa-shopping-cart"></i>
            <span class="cart-quantity-badge">${cartItemQuantity}</span>
            <span class="btn-text">در سبد خرید</span>
            <span class="btn-subtext">کلیک برای تغییر</span>
        `;
        addToCartBtn.className = "btn-add-cart in-cart";
        addToCartBtn.onclick = () => updateCartQuantity();
    } else {
        // Product not in cart - show "Add to Cart" style
        addToCartBtn.innerHTML = `
            <i class="fas fa-shopping-cart"></i>
            افزودن به سبد خرید
        `;
        addToCartBtn.className = "btn-add-cart";
        addToCartBtn.onclick = () => addToCart();
    }
}

// Update cart quantity (when product is already in cart)
async function updateCartQuantity() {
    if (!currentProduct) return;

    const token = localStorage.getItem("token");
    if (!token) {
        showMessage("لطفاً ابتدا وارد شوید", "error");
        setTimeout(() => {
            window.location.href = "/login";
        }, 2000);
        return;
    }

    try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            showMessage("خطا در شناسایی کاربر", "error");
            return;
        }

        const cart = await getOrCreateShoppingCart(userId);
        if (!cart) {
            throw new Error("خطا در ایجاد یا دریافت سبد خرید");
        }

        const items = await getCartItems(cart.id);
        if (!items) {
            throw new Error("خطا در دریافت آیتم‌های سبد خرید");
        }

        const cartItem = items.find(
            (item) => item.product.productId === currentProduct.productId
        );
        if (!cartItem) {
            // If not found, add to cart
            addToCart();
            return;
        }

        // Update existing item
        const result = await updateCartItem(
            cartItem.id,
            cart.id,
            currentProduct.productId,
            currentQuantity,
            currentProduct.productPrice
        );

        if (result) {
            cartItemQuantity = currentQuantity;
            updateCartButton();
            updateCartCount();
            showMessage(
                `تعداد محصول در سبد خرید به ${currentQuantity} تغییر یافت`,
                "success"
            );
        } else {
            showMessage("خطا در بروزرسانی سبد خرید", "error");
        }
    } catch (error) {
        console.error("Error updating cart quantity:", error);
        showMessage("خطا در بروزرسانی سبد خرید", "error");
    }
}

// Zoom image functionality
function zoomImage() {
    const mainImage = document.getElementById("main-image");
    const zoomedImage = document.getElementById("zoomed-image");
    const zoomModal = document.getElementById("zoomModal");

    if (
        mainImage &&
        mainImage.src &&
        !mainImage.src.includes("no-image") &&
        zoomedImage &&
        zoomModal
    ) {
        zoomedImage.src = mainImage.src;
        zoomedImage.alt = mainImage.alt;
        zoomModal.style.display = "flex";
    }
}

// Close zoom modal
function closeZoomModal() {
    const zoomModal = document.getElementById("zoomModal");
    if (zoomModal) {
        zoomModal.style.display = "none";
    }
}

// Close modal when clicking outside
document.addEventListener("click", function (event) {
    const modal = document.getElementById("zoomModal");
    if (modal && event.target === modal) {
        closeZoomModal();
    }
});

// View product (navigate to product page)
function viewProduct(productId) {
    window.location.href = `/products/${productId}`;
}

// Show loading state
function showLoading() {
    const loadingState = document.getElementById("loading-state");
    const productContent = document.getElementById("product-content");
    const productTabs = document.getElementById("product-tabs");
    const errorState = document.getElementById("error-state");

    if (loadingState) loadingState.style.display = "block";
    if (productContent) productContent.style.display = "none";
    if (productTabs) productTabs.style.display = "none";
    if (errorState) errorState.style.display = "none";
}

// Hide loading state
function hideLoading() {
    const loadingState = document.getElementById("loading-state");
    if (loadingState) loadingState.style.display = "none";
}

// Show error state
function showError(message) {
    const loadingState = document.getElementById("loading-state");
    const productContent = document.getElementById("product-content");
    const productTabs = document.getElementById("product-tabs");
    const errorState = document.getElementById("error-state");

    if (loadingState) loadingState.style.display = "none";
    if (productContent) productContent.style.display = "none";
    if (productTabs) productTabs.style.display = "none";

    if (errorState) {
        const errorMessage = errorState.querySelector("p");
        if (errorMessage) errorMessage.textContent = message;
        errorState.style.display = "block";
    }
}

// Format price with Persian numbers
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

// ===== COMMENTS FUNCTIONALITY =====

let currentComments = [];
let commentToDelete = null;

// Initialize comments functionality
function initializeComments() {
    const commentForm = document.getElementById("comment-form");
    if (commentForm) {
        commentForm.addEventListener("submit", handleAddComment);
    }
}

// Handle adding a new comment
async function handleAddComment(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
        showMessage("لطفاً ابتدا وارد شوید", "error");
        setTimeout(() => {
            window.location.href = "/login";
        }, 2000);
        return;
    }

    const commentTextElement = document.getElementById("comment-text");
    if (!commentTextElement) {
        showMessage("خطا در بارگذاری فرم نظر", "error");
        return;
    }

    const commentText = commentTextElement.value.trim();
    if (!commentText) {
        showMessage("لطفاً متن نظر را وارد کنید", "error");
        return;
    }

    try {
        const userId = localStorage.getItem("userId");
        const productId = getProductIdFromUrl();

        if (!userId || !productId) {
            showMessage("خطا در شناسایی کاربر یا محصول", "error");
            return;
        }

        // Add comment using API
        if (typeof addCommentAPI !== "function") {
            throw new Error("Comment functionality not available");
        }

        const response = await addCommentAPI(productId, userId, commentText);

        if (response) {
            // Clear form
            const commentTextElement = document.getElementById("comment-text");
            if (commentTextElement) {
                commentTextElement.value = "";
            }

            // Reload comments
            await loadComments();

            // Show success message
            showMessage("نظر شما با موفقیت ثبت شد", "success");

            // Switch to comments tab
            const commentsTab = document.querySelector('[data-tab="comments"]');
            if (commentsTab) {
                commentsTab.click();
            }
        }
    } catch (error) {
        console.error("Error adding comment:", error);
        showMessage("خطا در ثبت نظر", "error");
    }
}

// Add comment using API
async function addCommentAPI(productId, userId, commentText) {
    try {
        const response = await apiRequest("/api/comments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: parseInt(userId),
                productId: parseInt(productId),
                comment: commentText,
            }),
        });

        if (!response || !response.ok) {
            throw new Error("Failed to add comment");
        }

        return await response.json();
    } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
    }
}

// Load comments for the current product
async function loadComments() {
    try {
        const productId = getProductIdFromUrl();
        if (!productId) return;

        const response = await apiRequest(`/api/comments/${productId}`);

        if (response && response.ok) {
            const comments = await response.json();
            currentComments = comments;
            displayComments(comments);
            updateCommentsCount(comments.length);
        } else if (response && response.status === 404) {
            // No comments found
            currentComments = [];
            displayComments([]);
            updateCommentsCount(0);
        } else {
            throw new Error("Failed to load comments");
        }
    } catch (error) {
        console.error("Error loading comments:", error);
        showMessage("خطا در بارگذاری نظرات", "error");
    }
}

// Display comments in the UI
function displayComments(comments) {
    const commentsList = document.getElementById("comments-list");
    const noComments = document.getElementById("no-comments");

    if (!commentsList || !noComments) return;

    if (comments.length === 0) {
        commentsList.style.display = "none";
        noComments.style.display = "block";
        return;
    }

    commentsList.style.display = "block";
    noComments.style.display = "none";

    commentsList.innerHTML = comments
        .map((comment) => createCommentHTML(comment))
        .join("");
}

// Create HTML for a single comment
function createCommentHTML(comment) {
    const currentUserId = localStorage.getItem("userId");
    const canDelete =
        currentUserId && comment.userName === localStorage.getItem("username");

    return `
        <div class="comment-item" data-comment-id="${comment.id}">
            <div class="comment-header">
                <div class="comment-user">
                    <i class="fas fa-user-circle"></i>
                    <span class="username">${comment.userName}</span>
                </div>
                ${
                    canDelete
                        ? `
                    <button class="btn-delete-comment" onclick="showDeleteCommentModal(${comment.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                `
                        : ""
                }
            </div>
            <div class="comment-content">
                <p>${comment.comment}</p>
            </div>
        </div>
    `;
}

// Update comments count in the tab button
function updateCommentsCount(count) {
    const commentsCount = document.getElementById("comments-count");
    if (commentsCount) {
        commentsCount.textContent = `(${count})`;
    }
}

// Show delete comment confirmation modal
function showDeleteCommentModal(commentId) {
    commentToDelete = commentId;
    const modal = document.getElementById("deleteCommentModal");
    if (modal) {
        modal.style.display = "flex";
    }
}

// Close delete comment modal
function closeDeleteCommentModal() {
    commentToDelete = null;
    const modal = document.getElementById("deleteCommentModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Confirm and delete comment
async function confirmDeleteComment() {
    if (!commentToDelete) return;

    try {
        const response = await apiRequest(`/api/comments/${commentToDelete}`, {
            method: "DELETE",
        });

        if (response && response.ok) {
            showMessage("نظر با موفقیت حذف شد", "success");

            // Reload comments
            await loadComments();

            // Close modal
            closeDeleteCommentModal();
        } else {
            throw new Error("Failed to delete comment");
        }
    } catch (error) {
        console.error("Error deleting comment:", error);
        showMessage("خطا در حذف نظر", "error");
    }
}

// Close modal when clicking outside
document.addEventListener("click", function (event) {
    const modal = document.getElementById("deleteCommentModal");
    if (modal && event.target === modal) {
        closeDeleteCommentModal();
    }
});
