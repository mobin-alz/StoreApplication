// Public Category Page JavaScript
let categories = [];

// Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    loadCategories();
});

// Load all categories
async function loadCategories() {
    try {
        const response = await fetch("/api/categories");
        if (response.ok) {
            categories = await response.json();
            displayCategories();
        } else {
            throw new Error("Failed to load categories");
        }
    } catch (error) {
        console.error("Error loading categories:", error);
        showMessage("خطا در بارگذاری دسته‌بندی‌ها", "error");
    } finally {
        document.getElementById("loading-state").style.display = "none";
    }
}

// Display categories in grid
function displayCategories() {
    const grid = document.getElementById("categories-grid");

    if (categories.length === 0) {
        document.getElementById("no-categories").style.display = "block";
        return;
    }

    document.getElementById("no-categories").style.display = "none";

    grid.innerHTML = categories
        .map((category) => createCategoryCard(category))
        .join("");

    // Add click event listeners to category cards
    addCategoryCardListeners();
}

// Create category card HTML
function createCategoryCard(category) {
    const imagePath = category.categoryImage
        ? `/api/categories/images/${category.categoryImage.split("/").pop()}`
        : null;

    return `
        <div class="category-card" data-category-id="${category.id}">
            <div class="category-image">
                ${
                    imagePath
                        ? `<img src="${imagePath}" alt="${category.name}" onerror="this.parentElement.innerHTML='<div class=\\"no-image\\"><i class=\\"fas fa-image\\"></i></div>'">`
                        : `<div class="no-image"><i class="fas fa-image"></i></div>`
                }
                <div class="category-overlay">
                    <a href="/products?category=${
                        category.id
                    }" class="view-products-btn">
                        <i class="fas fa-eye"></i>
                        مشاهده محصولات
                    </a>
                </div>
            </div>
            <div class="category-info">
                <h3>${category.name}</h3>
                <p class="category-description">
                    ${category.description || "دسته‌بندی محصولات فروشگاه"}
                </p>
                <div class="category-stats">
                    <div class="category-stat">
                        <span class="stat-number">${getRandomProductCount()}</span>
                        <span class="stat-label">محصول</span>
                    </div>
                    <div class="category-stat">
                        <span class="stat-number">${getRandomDiscount()}</span>
                        <span class="stat-label">تخفیف</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Add click event listeners to category cards
function addCategoryCardListeners() {
    const categoryCards = document.querySelectorAll(".category-card");

    categoryCards.forEach((card) => {
        card.addEventListener("click", function () {
            const categoryId = this.dataset.categoryId;
            // Navigate to products page with category filter
            window.location.href = `/products?category=${categoryId}`;
        });
    });
}

// Generate random product count for demo purposes
function getRandomProductCount() {
    return Math.floor(Math.random() * 50) + 5;
}

// Generate random discount percentage for demo purposes
function getRandomDiscount() {
    return Math.floor(Math.random() * 30) + 5;
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

// Add CSS animations for messages
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
    
    .no-image {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        font-size: 3rem;
    }
`;
document.head.appendChild(style);
