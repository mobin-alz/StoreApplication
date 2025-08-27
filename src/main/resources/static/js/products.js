// Products Page JavaScript
let allProducts = [];
let filteredProducts = [];
let categories = [];
let currentPage = 1;
const productsPerPage = 12;

// Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    initializePage();
});

async function initializePage() {
    try {
        // Load categories first for filtering
        await loadCategories();

        // Load products
        await loadProducts();

        // Initialize event listeners
        initializeEventListeners();

        // Hide loading state
        document.getElementById("loading-state").style.display = "none";
    } catch (error) {
        console.error("Error initializing page:", error);
        showMessage("خطا در بارگذاری صفحه", "error");
    }
}

// Load all categories for filtering
async function loadCategories() {
    try {
        const response = await fetch("/api/categories");
        if (response.ok) {
            categories = await response.json();
            populateCategoryFilter();
        }
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

// Populate category filter dropdown
function populateCategoryFilter() {
    const categoryFilter = document.getElementById("categoryFilter");
    categoryFilter.innerHTML = '<option value="">همه دسته‌بندی‌ها</option>';

    categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categoryFilter.appendChild(option);
    });
}

// Load all products
async function loadProducts() {
    try {
        const response = await fetch("/api/products");
        if (response.ok) {
            allProducts = await response.json();
            filteredProducts = [...allProducts];
            displayProducts();
            updatePagination();
        } else {
            throw new Error("Failed to load products");
        }
    } catch (error) {
        console.error("Error loading products:", error);
        showMessage("خطا در بارگذاری محصولات", "error");
    }
}

// Display products in grid
function displayProducts() {
    const grid = document.getElementById("products-grid");
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);

    if (productsToShow.length === 0) {
        document.getElementById("no-products").style.display = "block";
        grid.innerHTML = "";
        return;
    }

    document.getElementById("no-products").style.display = "none";

    grid.innerHTML = productsToShow
        .map((product) => createProductCard(product))
        .join("");
}

// Create product card HTML
function createProductCard(product) {
    const hasDiscount = product.productDiscount && product.productDiscount > 0;
    const discountedPrice = hasDiscount
        ? product.productPrice -
          (product.productPrice * product.productDiscount) / 100
        : product.productPrice;

    const imagePath = product.productImages
        ? `/api/products/images/${extractFilename(product.productImages)}`
        : null;

    // Escape dangerous characters for alt text
    const safeName = product.productName
        ? product.productName.replace(/"/g, "&quot;")
        : "بدون نام";

    return `
        <div class="product-card" data-id="${product.productId}">
            <div class="product-image">
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
            <div class="product-info">
                <div class="product-category">${
                    product.category?.name || "بدون دسته‌بندی"
                }</div>
                <h3 class="product-title">${safeName}</h3>
                <p class="product-description">${
                    product.productDescription || ""
                }</p>
                
                <div class="product-price-section">
                    <span class="product-price">${formatPrice(
                        discountedPrice
                    )} تومان</span>
                    ${
                        hasDiscount
                            ? `<span class="product-original-price">${formatPrice(
                                  product.productPrice
                              )} تومان</span>`
                            : ""
                    }
                    ${
                        hasDiscount
                            ? `<span class="product-discount">${product.productDiscount}%</span>`
                            : ""
                    }
                </div>
                
                <div class="product-actions">
                    <a href="/products/${
                        product.productId
                    }" class="btn-view-product">
                        <i class="fas fa-eye"></i>
                        مشاهده محصول
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Format price with Persian numbers
function formatPrice(price) {
    return new Intl.NumberFormat("fa-IR").format(Math.round(price));
}

// Initialize event listeners
function initializeEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", debounce(handleSearch, 300));

    // Category filter
    const categoryFilter = document.getElementById("categoryFilter");
    categoryFilter.addEventListener("change", handleFilter);

    // Sort filter
    const sortFilter = document.getElementById("sortFilter");
    sortFilter.addEventListener("change", handleFilter);

    // Pagination
    document
        .getElementById("prevPage")
        .addEventListener("click", () => changePage(currentPage - 1));
    document
        .getElementById("nextPage")
        .addEventListener("click", () => changePage(currentPage + 1));
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle search
function handleSearch() {
    const searchTerm = document
        .getElementById("searchInput")
        .value.toLowerCase()
        .trim();
    applyFilters(searchTerm);
}

// Handle filter changes
function handleFilter() {
    const searchTerm = document
        .getElementById("searchInput")
        .value.toLowerCase()
        .trim();
    applyFilters(searchTerm);
}

// Apply all filters
function applyFilters(searchTerm) {
    let filtered = [...allProducts];

    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(
            (product) =>
                product.productName.toLowerCase().includes(searchTerm) ||
                product.productDescription.toLowerCase().includes(searchTerm) ||
                (product.category?.name &&
                    product.category.name.toLowerCase().includes(searchTerm))
        );
    }

    // Category filter
    const selectedCategory = document.getElementById("categoryFilter").value;
    if (selectedCategory) {
        filtered = filtered.filter(
            (product) => product.category?.id == selectedCategory
        );
    }

    // Sort filter
    const sortBy = document.getElementById("sortFilter").value;
    switch (sortBy) {
        case "price-low":
            filtered.sort((a, b) => a.productPrice - b.productPrice);
            break;
        case "price-high":
            filtered.sort((a, b) => b.productPrice - a.productPrice);
            break;
        case "name":
            filtered.sort((a, b) =>
                a.productName.localeCompare(b.productName, "fa")
            );
            break;
        case "newest":
        default:
            // Keep original order (newest first based on ID)
            break;
    }

    filteredProducts = filtered;
    currentPage = 1;
    displayProducts();
    updatePagination();
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const pagination = document.getElementById("pagination");

    if (totalPages <= 1) {
        pagination.style.display = "none";
        return;
    }

    pagination.style.display = "flex";

    // Update page numbers
    const pageNumbers = document.getElementById("pageNumbers");
    pageNumbers.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const pageNumber = document.createElement("button");
        pageNumber.className = `page-number ${
            i === currentPage ? "active" : ""
        }`;
        pageNumber.textContent = i;
        pageNumber.addEventListener("click", () => changePage(i));
        pageNumbers.appendChild(pageNumber);
    }

    // Update navigation buttons
    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled = currentPage === totalPages;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    displayProducts();
    updatePagination();

    // Scroll to top of products section
    document
        .querySelector(".products-container")
        .scrollIntoView({ behavior: "smooth" });
}

// Show message function
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll(".message");
    existingMessages.forEach((msg) => msg.remove());

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
        max-width: 400px;
        text-align: center;
    `;

    if (type === "success") {
        messageDiv.style.backgroundColor = "#28a745";
    } else if (type === "error") {
        messageDiv.style.backgroundColor = "#dc3545";
    } else if (type === "warning") {
        messageDiv.style.backgroundColor = "#ffc107";
        messageDiv.style.color = "#212529";
    }

    // Add to page
    document.body.appendChild(messageDiv);

    // Remove after 5 seconds
    setTimeout(() => {
        messageDiv.style.animation = "slideOut 0.3s ease";
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 5000);
}

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
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
    
    .quick-view-product {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        align-items: start;
    }
    
    .product-image-large {
        text-align: center;
    }
    
    .product-image-large img {
        max-width: 100%;
        height: auto;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }
    
    .no-image-large {
        width: 200px;
        height: 200px;
        background: #f8fafc;
        border: 2px dashed #e2e8f0;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #cbd5e1;
        font-size: 3rem;
        margin: 0 auto;
    }
    
    .product-details {
        padding: 1rem 0;
    }
    
    .product-title-large {
        font-size: 1.8rem;
        color: #1e293b;
        margin-bottom: 1rem;
        line-height: 1.3;
    }
    
    .product-description-large {
        color: #64748b;
        font-size: 1rem;
        line-height: 1.6;
        margin-bottom: 1.5rem;
    }
    
    .product-price-section-large {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
    }
    
    .product-price-large {
        font-size: 2rem;
        font-weight: 700;
        color: #059669;
    }
    
    .product-original-price-large {
        font-size: 1.3rem;
        color: #94a3b8;
        text-decoration: line-through;
    }
    
    .product-discount-large {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 12px;
        font-size: 0.9rem;
        font-weight: 600;
    }
    
    .product-actions-large {
        margin-top: 2rem;
    }
    
    .btn-add-cart-large {
        width: 100%;
        padding: 1rem 2rem;
        background: linear-gradient(135deg, #a8edea, #fed6e3);
        color: white;
        border: none;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        font-size: 1.1rem;
    }
    
    .btn-add-cart-large:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 25px rgba(168, 237, 234, 0.3);
    }
    
    @media (max-width: 768px) {
        .quick-view-product {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }
        
        .product-title-large {
            font-size: 1.5rem;
        }
        
        .product-price-large {
            font-size: 1.5rem;
        }
    }
`;
document.head.appendChild(style);

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
}

// Show/hide floating action button based on scroll position
window.addEventListener("scroll", function () {
    const floatingBtn = document.querySelector(".floating-action-btn");
    if (floatingBtn) {
        if (window.pageYOffset > 300) {
            floatingBtn.style.display = "flex";
        } else {
            floatingBtn.style.display = "none";
        }
    }
});

// Initialize floating action button visibility
document.addEventListener("DOMContentLoaded", function () {
    const floatingBtn = document.querySelector(".floating-action-btn");
    if (floatingBtn) {
        floatingBtn.style.display = "none";
    }
});
