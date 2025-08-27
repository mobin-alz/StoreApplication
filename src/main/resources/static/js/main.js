// Check if user is already logged in on page load
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    if (token) {
        // Wait for navigation to load first
        setTimeout(() => {
            updateAuthUI(true);
        }, 100);
    }

    // Load real products for the main page
    loadMainPageProducts();
});

// Load real products for the main page
async function loadMainPageProducts() {
    try {
        const response = await apiRequest("/api/products");
        if (response && response.ok) {
            const products = await response.json();
            displayMainPageProducts(products.slice(0, 6)); // Show first 6 products
        }
    } catch (error) {
        console.error("Error loading main page products:", error);
    }
}

// Display products on the main page
function displayMainPageProducts(products) {
    const productsGrid = document.querySelector(".products-grid");
    if (!productsGrid) return;

    productsGrid.innerHTML = "";

    products.forEach((product) => {
        const productCard = createMainPageProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create product card for main page
function createMainPageProductCard(product) {
    const productCard = document.createElement("div");
    productCard.className = "product-card";

    const imagePath = product.productImages
        ? `/api/products/images/${extractFilename(product.productImages)}`
        : "https://via.placeholder.com/300x200/cccccc/666666?text=بدون+تصویر";

    const hasDiscount = product.productDiscount && product.productDiscount > 0;
    const discountedPrice = hasDiscount
        ? product.productPrice -
          (product.productPrice * product.productDiscount) / 100
        : product.productPrice;

    productCard.innerHTML = `
        <div class="product-image">
            <img src="${imagePath}" alt="${product.productName}" />
            ${
                hasDiscount
                    ? `<div class="product-badge">${product.productDiscount}% تخفیف</div>`
                    : ""
            }
        </div>
        <div class="product-info">
            <h3>${product.productName}</h3>
            <p class="price">
                ${
                    hasDiscount
                        ? `<span class="original-price">${formatPrice(
                              product.productPrice
                          )} تومان</span>`
                        : ""
                }
                ${formatPrice(discountedPrice)} تومان
            </p>
            <a href="/products/${product.productId}" class="btn btn-secondary">
                مشاهده محصول
            </a>
        </div>
    `;

    return productCard;
}

// Format price with Persian numbers
function formatPrice(price) {
    return new Intl.NumberFormat("fa-IR").format(Math.round(price));
}

// Show message to user
function showMessage(message, type) {
    // Create message element
    const messageDiv = document.createElement("div");
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;

    // Style the message
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;

    if (type === "success") {
        messageDiv.style.backgroundColor = "#28a745";
    } else {
        messageDiv.style.backgroundColor = "#dc3545";
    }

    // Add to page
    document.body.appendChild(messageDiv);

    // Remove after 3 seconds
    setTimeout(() => {
        messageDiv.style.animation = "slideOut 0.3s ease";
        setTimeout(() => {
            if (messageDiv.parentNode) {
                document.body.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// Update authentication UI
function updateAuthUI(isLoggedIn) {
    const authButtons = document.querySelector(".auth-buttons");

    // Check if element exists before using it
    if (!authButtons) return;

    if (isLoggedIn) {
        const username = localStorage.getItem("username");
        authButtons.innerHTML = `
            <span class="user-welcome">خوش آمدید ${username}</span>
            <button class="btn btn-secondary" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i>
                خروج
            </button>
        `;
    } else {
        authButtons.innerHTML = `
            <a href="/login" class="btn btn-login">
                <i class="fas fa-sign-in-alt"></i>
                ورود
            </a>
            <a href="/register" class="btn btn-register">
                <i class="fas fa-user-plus"></i>
                ثبت‌ نام
            </a>
        `;
    }
}

// Logout function
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("roles");
    updateAuthUI(false);
    showMessage("خروج موفقیت‌آمیز بود", "success");
}

// Add CSS animations
const mainStyle = document.createElement("style");
mainStyle.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .user-welcome {
        color: white;
        font-weight: 500;
        margin-left: 1rem;
    }
`;
document.head.appendChild(mainStyle);
