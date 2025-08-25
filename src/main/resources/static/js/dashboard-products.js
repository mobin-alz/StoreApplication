// Dashboard Products Management JavaScript
let allProducts = [];
let categories = [];

// Check if user is logged in and has provider/admin role
document.addEventListener("DOMContentLoaded", function () {
    console.log("Dashboard products page loaded"); // Debug log

    // Wait a bit for navigation to load
    setTimeout(() => {
        initializeDashboardProducts();
    }, 100);
});

function initializeDashboardProducts() {
    console.log("Initializing dashboard products"); // Debug log
    const token = localStorage.getItem("token");
    const roles = localStorage.getItem("roles");

    if (!token) {
        window.location.href = "/login";
        return;
    }

    // Check if user has provider or admin role
    try {
        const rolesArray = JSON.parse(roles);
        const hasRequiredRole = rolesArray.some(
            (role) =>
                role.authority === "PROVIDER" || role.authority === "ADMIN"
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

    // Initialize page
    initializePage();
}

function initializePage() {
    loadCategories();
    loadProducts();
    initializeCreateForm();
    initializeEditForm();

    // Reset all forms on page load
    resetAllForms();

    // Add event listeners for form reset on page visibility change
    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") {
            // Page became visible again, reset forms
            resetAllForms();
        }
    });

    // Add event listener for beforeunload to reset forms
    window.addEventListener("beforeunload", function () {
        resetAllForms();
    });

    // Test if create button exists and is clickable
    testCreateButton();

    // Add direct event listener to create button as backup
    const createBtn = document.getElementById("create-product-btn");
    if (createBtn) {
        console.log("Adding direct event listener to create button"); // Debug log
        createBtn.addEventListener("click", function (e) {
            e.preventDefault();
            console.log("Direct event listener triggered"); // Debug log
            showCreateForm();
        });
    } else {
        console.error("Create button not found during initialization"); // Debug log
    }
}

// Test function to check create button
function testCreateButton() {
    console.log("Testing create button..."); // Debug log

    // Check if button exists
    const createBtn = document.getElementById("create-product-btn");
    if (createBtn) {
        console.log("Create button found:", createBtn); // Debug log
        console.log("Button onclick:", createBtn.onclick); // Debug log
        console.log("Button classes:", createBtn.className); // Debug log
        console.log("Button style:", createBtn.style.cssText); // Debug log
        console.log(
            "Button computed style:",
            window.getComputedStyle(createBtn)
        ); // Debug log
    } else {
        console.error("Create button not found"); // Debug log

        // List all buttons on the page
        const allButtons = document.querySelectorAll("button");
        console.log("All buttons on page:", allButtons); // Debug log
        allButtons.forEach((btn, index) => {
            console.log(
                `Button ${index}:`,
                btn.textContent,
                btn.onclick,
                btn.className
            ); // Debug log
        });
    }
}

// Load all categories for product creation/editing
async function loadCategories() {
    try {
        const response = await fetch("/api/categories");
        if (response.ok) {
            categories = await response.json();
            populateCategorySelects();
        }
    } catch (error) {
        console.error("Error loading categories:", error);
        showMessage("خطا در بارگذاری دسته‌بندی‌ها", "error");
    }
}

// Populate category select dropdowns
function populateCategorySelects() {
    const createSelect = document.getElementById("product-category");
    const editSelect = document.getElementById("editProductCategory");

    const options = categories
        .map(
            (category) =>
                `<option value="${category.id}">${category.name}</option>`
        )
        .join("");

    if (createSelect) {
        createSelect.innerHTML =
            '<option value="">انتخاب دسته‌بندی</option>' + options;
    }

    if (editSelect) {
        editSelect.innerHTML =
            '<option value="">انتخاب دسته‌بندی</option>' + options;
    }
}

// Load all products
async function loadProducts() {
    try {
        const response = await fetch("/api/products");
        if (response.ok) {
            allProducts = await response.json();
            displayProducts();
        } else {
            throw new Error("Failed to load products");
        }
    } catch (error) {
        console.error("Error loading products:", error);
        showMessage("خطا در بارگذاری محصولات", "error");
    } finally {
        document.getElementById("loading-state").style.display = "none";
    }
}

// Display products in grid
function displayProducts() {
    const grid = document.getElementById("products-grid");
    const countElement = document.getElementById("product-count");

    // Update count
    countElement.textContent = `${allProducts.length} محصول`;

    if (allProducts.length === 0) {
        grid.innerHTML = "";
        document.getElementById("no-products").style.display = "block";
        return;
    }

    document.getElementById("no-products").style.display = "none";

    grid.innerHTML = allProducts
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
        ? `/api/products/images/${product.productImages.split("/").pop()}`
        : null;

    return `
        <div class="product-card" data-id="${product.productId}">
            <div class="product-image">
                ${
                    imagePath
                        ? `<img src="${imagePath}" alt="${product.productName}" onerror="this.parentElement.innerHTML='<div class=\\"no-image\\"><i class=\\"fas fa-image\\"></i></div>'">`
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
                <h3 class="product-title">${product.productName}</h3>
                <p class="product-description">${product.productDescription}</p>
                
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
                
                <div class="product-quantity">
                    <i class="fas fa-boxes"></i>
                    موجودی: ${product.productQuantity} عدد
                </div>
                
                <div class="product-actions">
                    <button class="btn-sm btn-primary" onclick="editProduct(${
                        product.productId
                    })">
                        <i class="fas fa-edit"></i>
                        ویرایش
                    </button>
                    <button class="btn-sm btn-danger" onclick="showDeleteConfirmation(${
                        product.productId
                    }, '${product.productName}')">
                        <i class="fas fa-trash"></i>
                        حذف
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Format price with Persian numbers
function formatPrice(price) {
    return new Intl.NumberFormat("fa-IR").format(Math.round(price));
}

// Initialize create form
function initializeCreateForm() {
    const form = document.getElementById("create-product-form");
    if (form) {
        form.addEventListener("submit", handleCreateSubmit);
    }

    // Enhanced file input handling
    const imageInput = document.getElementById("product-image");
    if (imageInput) {
        imageInput.addEventListener("change", handleImageChange);
    }
}

// Handle image change for create form
function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("preview-image").src = e.target.result;
            document.getElementById("image-preview").style.display = "block";
        };
        reader.readAsDataURL(file);
    }
}

// Remove image preview
function removeImage() {
    document.getElementById("product-image").value = "";
    document.getElementById("image-preview").style.display = "none";
    document.getElementById("preview-image").src = "";
}

// Handle create form submission
async function handleCreateSubmit(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> در حال ایجاد...';
    submitBtn.disabled = true;

    try {
        const formData = new FormData();
        const productName = document.getElementById("product-name").value;
        const productDescription = document.getElementById(
            "product-description"
        ).value;
        const productPrice = document.getElementById("product-price").value;
        const productDiscount =
            document.getElementById("product-discount").value;
        const productQuantity =
            document.getElementById("product-quantity").value;
        const categoryId = document.getElementById("product-category").value;
        const imageFile = document.getElementById("product-image").files[0];

        // Validate required fields
        if (
            !productName.trim() ||
            !productDescription.trim() ||
            !productPrice ||
            !productQuantity ||
            !categoryId
        ) {
            showMessage("لطفاً تمام فیلدهای الزامی را پر کنید", "error");
            return;
        }

        if (!imageFile) {
            showMessage("تصویر محصول الزامی است", "error");
            return;
        }

        const productRequest = {
            productName: productName.trim(),
            productDescription: productDescription.trim(),
            productPrice: parseFloat(productPrice),
            productDiscount: productDiscount ? parseInt(productDiscount) : 0,
            productQuantity: parseInt(productQuantity),
            categoryId: parseInt(categoryId),
        };

        formData.append(
            "req",
            new Blob([JSON.stringify(productRequest)], {
                type: "application/json",
            })
        );
        formData.append("image", imageFile);

        const response = await multipartApiRequest("/api/products", {
            method: "POST",
            body: formData,
        });

        if (response && response.ok) {
            const data = await response.json();
            showMessage(data.message || "محصول با موفقیت ایجاد شد", "success");
            hideCreateForm();
            loadProducts();
        } else {
            const data = await response.json();
            showMessage(data.message || "خطا در ایجاد محصول", "error");
        }
    } catch (error) {
        console.error("Error creating product:", error);
        showMessage("خطا در ارتباط با سرور", "error");
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Show create form
function showCreateForm() {
    console.log("showCreateForm called"); // Debug log

    // Reset form before showing
    resetCreateForm();

    const createSection = document.getElementById("create-product-section");
    if (createSection) {
        createSection.style.display = "block";
        console.log("Create section shown"); // Debug log
    } else {
        console.error("Create section not found"); // Debug log
    }

    // Hide the create button
    const createBtn = document.getElementById("create-product-btn");
    if (createBtn) {
        createBtn.style.display = "none";
        console.log("Create button hidden"); // Debug log
    } else {
        console.error("Create button not found"); // Debug log
    }
}

// Hide create form
function hideCreateForm() {
    console.log("hideCreateForm called"); // Debug log
    const createSection = document.getElementById("create-product-section");
    if (createSection) {
        createSection.style.display = "none";
        console.log("Create section hidden"); // Debug log
    }

    // Show the create button again
    const createBtn = document.getElementById("create-product-btn");
    if (createBtn) {
        createBtn.style.display = "inline-flex";
        console.log("Create button shown"); // Debug log
    }
}

// Reset create form completely
function resetCreateForm() {
    // Reset form fields
    const form = document.getElementById("create-product-form");
    if (form) {
        form.reset();
    }

    // Clear individual fields as backup
    const nameField = document.getElementById("productName");
    if (nameField) nameField.value = "";

    const descriptionField = document.getElementById("productDescription");
    if (descriptionField) descriptionField.value = "";

    const priceField = document.getElementById("productPrice");
    if (priceField) priceField.value = "";

    const discountField = document.getElementById("productDiscount");
    if (discountField) discountField.value = "";

    const quantityField = document.getElementById("productQuantity");
    if (quantityField) quantityField.value = "";

    const categoryField = document.getElementById("productCategory");
    if (categoryField) categoryField.value = "";

    const imageField = document.getElementById("productImage");
    if (imageField) imageField.value = "";

    // Hide image preview
    const imagePreview = document.getElementById("image-preview");
    if (imagePreview) imagePreview.style.display = "none";

    // Clear any error messages
    clearErrors();
}

// Cancel create
function cancelCreate() {
    hideCreateForm();
    // Reset form completely
    resetCreateForm();
}

// Clear form errors
function clearErrors() {
    const errorElements = document.querySelectorAll(".field-error");
    errorElements.forEach((element) => element.remove());

    // Also remove any error styling from form fields
    const formFields = document.querySelectorAll(".enhanced-input");
    formFields.forEach((field) => {
        field.classList.remove("error");
        field.style.borderColor = "#d1d5db";
    });
}

// Show field error with styling
function showFieldError(fieldId, message) {
    // Clear existing error for this field
    clearFieldError(fieldId);

    const field = document.getElementById(fieldId);
    if (!field) return;

    // Add error styling to the field
    field.classList.add("error");

    // Create error message element
    const errorDiv = document.createElement("div");
    errorDiv.className = "field-error";
    errorDiv.textContent = message;

    // Insert error message after the field
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
}

// Clear field error
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // Remove error styling
    field.classList.remove("error");

    // Remove error message
    const errorElement = field.parentNode.querySelector(".field-error");
    if (errorElement) {
        errorElement.remove();
    }
}

// General function to reset all forms on the page
function resetAllForms() {
    // Reset create form
    resetCreateForm();

    // Reset edit form
    resetEditForm();

    // Clear all error messages
    clearErrors();
}

// Function to reset forms when switching between modes
function resetFormsOnModeSwitch() {
    // Hide all forms first
    hideCreateForm();
    closeEditModal();

    // Then reset them
    resetAllForms();
}

// Edit product
async function editProduct(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
            const product = await response.json();
            showEditModal(product);
        } else {
            showMessage("خطا در بارگذاری اطلاعات محصول", "error");
        }
    } catch (error) {
        console.error("Error loading product:", error);
        showMessage("خطا در اتصال به سرور", "error");
    }
}

// Show edit modal
function showEditModal(product) {
    // Reset form before populating with new data
    resetEditForm();

    document.getElementById("editProductId").value = product.productId;
    document.getElementById("editProductName").value = product.productName;
    document.getElementById("editProductDescription").value =
        product.productDescription;
    document.getElementById("editProductPrice").value = product.productPrice;
    document.getElementById("editProductDiscount").value =
        product.productDiscount || "";
    document.getElementById("editProductQuantity").value =
        product.productQuantity;
    document.getElementById("editProductCategory").value =
        product.category?.id || "";

    // Show current image if exists
    if (product.productImages) {
        const imagePath = `/api/products/images/${product.productImages
            .split("/")
            .pop()}`;
        document.getElementById("editPreviewImg").src = imagePath;
        document.getElementById("editImagePreview").style.display = "block";
    } else {
        document.getElementById("editImagePreview").style.display = "none";
    }

    document.getElementById("editModal").style.display = "block";
}

// Close edit modal
function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
    // Reset form completely
    resetEditForm();
}

// Reset edit form completely
function resetEditForm() {
    // Reset form fields
    const form = document.getElementById("editForm");
    if (form) {
        form.reset();
    }

    // Clear individual fields as backup
    const idField = document.getElementById("editProductId");
    if (idField) idField.value = "";

    const nameField = document.getElementById("editProductName");
    if (nameField) nameField.value = "";

    const descriptionField = document.getElementById("editProductDescription");
    if (descriptionField) descriptionField.value = "";

    const priceField = document.getElementById("editProductPrice");
    if (priceField) priceField.value = "";

    const discountField = document.getElementById("editProductDiscount");
    if (discountField) discountField.value = "";

    const quantityField = document.getElementById("editProductQuantity");
    if (quantityField) quantityField.value = "";

    const categoryField = document.getElementById("editProductCategory");
    if (categoryField) categoryField.value = "";

    const imageField = document.getElementById("editProductImage");
    if (imageField) imageField.value = "";

    // Hide image preview
    const imagePreview = document.getElementById("editImagePreview");
    if (imagePreview) imagePreview.style.display = "none";

    // Clear any error messages
    clearErrors();
}

// Initialize edit form
function initializeEditForm() {
    const form = document.getElementById("editForm");
    form.addEventListener("submit", handleEditSubmit);

    // Enhanced file input handling for edit
    const editImageInput = document.getElementById("editProductImage");
    editImageInput.addEventListener("change", handleEditImageChange);
}

// Handle image change for edit form
function handleEditImageChange(e) {
    const file = e.target.files[0];
    const preview = document.getElementById("editImagePreview");

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const previewImg = document.getElementById("editPreviewImg");
            previewImg.src = e.target.result;
            preview.style.display = "block";
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = "none";
    }
}

// Remove image from edit form
function removeEditImage() {
    document.getElementById("editProductImage").value = "";
    document.getElementById("editImagePreview").style.display = "none";
}

// Handle edit form submission
async function handleEditSubmit(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...';
    submitBtn.disabled = true;

    try {
        const productId = document.getElementById("editProductId").value;
        const formData = new FormData();

        // Add product data as a JSON string in the 'req' part
        const productData = {
            productName: document
                .getElementById("editProductName")
                .value.trim(),
            productDescription: document
                .getElementById("editProductDescription")
                .value.trim(),
            productPrice: parseFloat(
                document.getElementById("editProductPrice").value
            ),
            productDiscount:
                parseInt(
                    document.getElementById("editProductDiscount").value
                ) || 0,
            productQuantity: parseInt(
                document.getElementById("editProductQuantity").value
            ),
            categoryId: parseInt(
                document.getElementById("editProductCategory").value
            ),
        };

        formData.append(
            "req",
            new Blob([JSON.stringify(productData)], {
                type: "application/json",
            })
        );

        // Add image file if selected
        const imageFile = document.getElementById("editProductImage").files[0];
        if (imageFile) {
            formData.append("image", imageFile);
        }

        // Use multipartApiRequest for proper authentication
        const response = await multipartApiRequest(
            `/api/products/${productId}`,
            {
                method: "PUT",
                body: formData,
            }
        );

        if (response && response.ok) {
            showMessage("محصول با موفقیت ویرایش شد!", "success");
            closeEditModal();
            loadProducts(); // Reload the list
        } else {
            const data = await response.json();
            showMessage(data.message || "خطا در ویرایش محصول", "error");
        }
    } catch (error) {
        console.error("Error:", error);
        showMessage("خطا در اتصال به سرور", "error");
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Show delete confirmation
function showDeleteConfirmation(productId, productName) {
    const modal = document.getElementById("confirmModal");
    const message = document.getElementById("confirmMessage");

    message.textContent = `آیا از حذف محصول "${productName}" اطمینان دارید؟`;

    // Store product ID for deletion
    modal.dataset.productId = productId;

    modal.style.display = "block";
}

// Close confirmation modal
function closeConfirmModal() {
    document.getElementById("confirmModal").style.display = "none";
}

// Confirm delete
function confirmDelete() {
    const modal = document.getElementById("confirmModal");
    const productId = modal.dataset.productId;

    closeConfirmModal();
    deleteProduct(productId);
}

// Delete product
async function deleteProduct(productId) {
    try {
        const response = await apiRequest(`/api/products/${productId}`, {
            method: "DELETE",
        });

        if (response && response.ok) {
            showMessage("محصول با موفقیت حذف شد!", "success");
            loadProducts(); // Reload the list
        } else {
            const data = await response.json();
            showMessage(data.message || "خطا در حذف محصول", "error");
        }
    } catch (error) {
        console.error("Error deleting product:", error);
        showMessage("خطا در اتصال به سرور", "error");
    }
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
    
    .product-badge {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 8px;
        font-size: 0.7rem;
        font-weight: 600;
        z-index: 2;
    }
`;
document.head.appendChild(style);

// Validate create form
function validateCreateForm() {
    let isValid = true;

    // Clear all previous errors
    clearErrors();

    // Validate product name
    const nameField = document.getElementById("productName");
    if (!nameField || !nameField.value.trim()) {
        showFieldError("productName", "نام محصول الزامی است");
        isValid = false;
    } else if (nameField.value.trim().length < 2) {
        showFieldError("productName", "نام محصول باید حداقل ۲ کاراکتر باشد");
        isValid = false;
    }

    // Validate description
    const descriptionField = document.getElementById("productDescription");
    if (!descriptionField || !descriptionField.value.trim()) {
        showFieldError("productDescription", "توضیحات محصول الزامی است");
        isValid = false;
    } else if (descriptionField.value.trim().length < 10) {
        showFieldError(
            "productDescription",
            "توضیحات محصول باید حداقل ۱۰ کاراکتر باشد"
        );
        isValid = false;
    }

    // Validate price
    const priceField = document.getElementById("productPrice");
    if (!priceField || !priceField.value) {
        showFieldError("productPrice", "قیمت محصول الزامی است");
        isValid = false;
    } else if (isNaN(priceField.value) || parseFloat(priceField.value) <= 0) {
        showFieldError("productPrice", "قیمت محصول باید عدد مثبت باشد");
        isValid = false;
    }

    // Validate quantity
    const quantityField = document.getElementById("productQuantity");
    if (!quantityField || !quantityField.value) {
        showFieldError("productQuantity", "تعداد محصول الزامی است");
        isValid = false;
    } else if (
        isNaN(quantityField.value) ||
        parseInt(quantityField.value) < 0
    ) {
        showFieldError("productQuantity", "تعداد محصول باید عدد غیرمنفی باشد");
        isValid = false;
    }

    // Validate category
    const categoryField = document.getElementById("productCategory");
    if (!categoryField || !categoryField.value) {
        showFieldError("productCategory", "انتخاب دسته‌بندی الزامی است");
        isValid = false;
    }

    // Validate image (optional but if selected, check file type)
    const imageField = document.getElementById("productImage");
    if (imageField && imageField.files.length > 0) {
        const file = imageField.files[0];
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
        ];

        if (!allowedTypes.includes(file.type)) {
            showFieldError(
                "productImage",
                "فقط فایل‌های تصویری مجاز هستند (JPG, PNG, GIF)"
            );
            isValid = false;
        }

        if (file.size > 5 * 1024 * 1024) {
            // 5MB limit
            showFieldError(
                "productImage",
                "حجم فایل نباید بیشتر از ۵ مگابایت باشد"
            );
            isValid = false;
        }
    }

    return isValid;
}

// Validate edit form
function validateEditForm() {
    let isValid = true;

    // Clear all previous errors
    clearErrors();

    // Validate product name
    const nameField = document.getElementById("editProductName");
    if (!nameField || !nameField.value.trim()) {
        showFieldError("editProductName", "نام محصول الزامی است");
        isValid = false;
    } else if (nameField.value.trim().length < 2) {
        showFieldError(
            "editProductName",
            "نام محصول باید حداقل ۲ کاراکتر باشد"
        );
        isValid = false;
    }

    // Validate description
    const descriptionField = document.getElementById("editProductDescription");
    if (!descriptionField || !descriptionField.value.trim()) {
        showFieldError("editProductDescription", "توضیحات محصول الزامی است");
        isValid = false;
    } else if (descriptionField.value.trim().length < 10) {
        showFieldError(
            "editProductDescription",
            "توضیحات محصول باید حداقل ۱۰ کاراکتر باشد"
        );
        isValid = false;
    }

    // Validate price
    const priceField = document.getElementById("editProductPrice");
    if (!priceField || !priceField.value) {
        showFieldError("editProductPrice", "قیمت محصول الزامی است");
        isValid = false;
    } else if (isNaN(priceField.value) || parseFloat(priceField.value) <= 0) {
        showFieldError("editProductPrice", "قیمت محصول باید عدد مثبت باشد");
        isValid = false;
    }

    // Validate quantity
    const quantityField = document.getElementById("editProductQuantity");
    if (!quantityField || !quantityField.value) {
        showFieldError("editProductQuantity", "تعداد محصول الزامی است");
        isValid = false;
    } else if (
        isNaN(quantityField.value) ||
        parseInt(quantityField.value) < 0
    ) {
        showFieldError(
            "editProductQuantity",
            "تعداد محصول باید عدد غیرمنفی باشد"
        );
        isValid = false;
    }

    // Validate category
    const categoryField = document.getElementById("editProductCategory");
    if (!categoryField || !categoryField.value) {
        showFieldError("editProductCategory", "انتخاب دسته‌بندی الزامی است");
        isValid = false;
    }

    // Validate image (optional but if selected, check file type)
    const imageField = document.getElementById("editProductImage");
    if (imageField && imageField.files.length > 0) {
        const file = imageField.files[0];
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
        ];

        if (!allowedTypes.includes(file.type)) {
            showFieldError(
                "editProductImage",
                "فقط فایل‌های تصویری مجاز هستند (JPG, PNG, GIF)"
            );
            isValid = false;
        }

        if (file.size > 5 * 1024 * 1024) {
            // 5MB limit
            showFieldError(
                "editProductImage",
                "حجم فایل نباید بیشتر از ۵ مگابایت باشد"
            );
            isValid = false;
        }
    }

    return isValid;
}
