// Check if user is logged in and has provider role
let allCategories = [];
let currentPage = 1;
const categoriesPerPage = 12;

document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");

    const roles = localStorage.getItem("roles");

    if (!token) {
        window.location.href = "/login";

        return;
    }

    // Check if user has provider role

    try {
        const rolesArray = JSON.parse(roles);

        const hasProviderRole = rolesArray.some(
            (role) => role.authority === "PROVIDER"
        );

        if (!hasProviderRole) {
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
});

function initializePage() {
    loadCategories();

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
}

// Load all categories

async function loadCategories() {
    try {
        const response = await apiRequest("/api/categories");

        if (response && response.ok) {
            allCategories = await response.json();
            currentPage = 1;
            displayCategories();
            updatePagination();
        } else {
            showMessage("خطا در بارگذاری دسته‌بندی‌ها", "error");
        }
    } catch (error) {
        console.error("Error loading categories:", error);

        showMessage("خطا در اتصال به سرور", "error");
    }
}

// Display categories in grid

function displayCategories() {
    const grid = document.getElementById("categories-grid");

    const countElement = document.getElementById("category-count");

    // Update count

    countElement.textContent = `${allCategories.length} دسته‌بندی`;

    if (allCategories.length === 0) {
        grid.innerHTML = `

            <div class="no-categories">

                <i class="fas fa-tags"></i>

                <p>هیچ دسته‌بندی موجود نیست</p>

                <p>اولین دسته‌بندی را ایجاد کنید!</p>

            </div>

        `;

        return;
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * categoriesPerPage;
    const endIndex = startIndex + categoriesPerPage;
    const currentCategories = allCategories.slice(startIndex, endIndex);

    grid.innerHTML = currentCategories

        .map(
            (category) => `

        <div class="category-card" data-id="${category.id}">

            <div class="category-image">

                ${
                    category.categoryImage
                        ? `<img src="/api/categories/images/${extractFilename(
                              category.categoryImage
                          )}" alt="${category.name}" />`
                        : `<div class="no-image"><i class="fas fa-image"></i></div>`
                }

            </div>

            <div class="category-info">

                <h4>${category.name}</h4>

                <div class="category-actions">

                    <button class="btn btn-sm btn-primary" onclick="editCategory(${
                        category.id
                    })">

                        <i class="fas fa-edit"></i>

                        ویرایش

                    </button>

                    <button class="btn btn-sm btn-danger" onclick="showDeleteConfirmation(${
                        category.id
                    }, '${category.name}')">

                        <i class="fas fa-trash"></i>

                        حذف

                    </button>

                </div>

            </div>

        </div>

    `
        )

        .join("");
}

// Initialize create form

function initializeCreateForm() {
    const form = document.getElementById("create-category-form");

    if (form) {
        form.addEventListener("submit", handleCreateSubmit);
    }

    // Enhanced file input handling

    const imageInput = document.getElementById("category-image");

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
    document.getElementById("category-image").value = "";

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

        const categoryName = document.getElementById("category-name").value;

        const imageFile = document.getElementById("category-image").files[0];

        // Validate required fields

        if (!categoryName.trim()) {
            showMessage("نام دسته‌بندی الزامی است", "error");

            return;
        }

        if (!imageFile) {
            showMessage("تصویر دسته‌بندی الزامی است", "error");

            return;
        }

        const categoryRequest = {
            categoryName: categoryName.trim(),
        };

        formData.append(
            "req",

            new Blob([JSON.stringify(categoryRequest)], {
                type: "application/json",
            })
        );

        formData.append("image", imageFile);

        const response = await multipartApiRequest("/api/categories", {
            method: "POST",

            body: formData,
        });

        const data = await response.json();

        if (data.success) {
            showMessage(
                data.message || "دسته‌بندی با موفقیت ایجاد شد",

                "success"
            );

            hideCreateForm();

            loadCategories();
        } else {
            showMessage(data.message || "خطا در ایجاد دسته‌بندی", "error");
        }
    } catch (error) {
        console.error("Error creating category:", error);

        showMessage("خطا در ارتباط با سرور", "error");
    } finally {
        submitBtn.innerHTML = originalText;

        submitBtn.disabled = false;
    }
}

// Show create form

function showCreateForm() {
    // Reset form before showing
    resetCreateForm();

    document.getElementById("create-category-section").style.display = "block";

    // Hide the create button if it exists

    const createBtn = document.querySelector(
        '.btn-primary[onclick="showCreateForm()"]'
    );

    if (createBtn) {
        createBtn.style.display = "none";
    }
}

// Hide create form

function hideCreateForm() {
    document.getElementById("create-category-section").style.display = "none";

    // Show the create button again

    const createBtn = document.querySelector(
        '.btn-primary[onclick="showCreateForm()"]'
    );

    if (createBtn) {
        createBtn.style.display = "inline-flex";
    }
}

// Reset create form completely
function resetCreateForm() {
    // Reset form fields
    const form = document.getElementById("create-category-form");
    if (form) {
        form.reset();
    }

    // Clear individual fields as backup
    const nameField = document.getElementById("category-name");
    if (nameField) nameField.value = "";

    const imageField = document.getElementById("category-image");
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

// Edit category

async function editCategory(categoryId) {
    try {
        const response = await apiRequest(`/api/categories/${categoryId}`);

        if (response && response.ok) {
            const category = await response.json();

            showEditModal(category);
        } else {
            showMessage("خطا در بارگذاری اطلاعات دسته‌بندی", "error");
        }
    } catch (error) {
        console.error("Error loading category:", error);

        showMessage("خطا در اتصال به سرور", "error");
    }
}

// Show edit modal

function showEditModal(category) {
    // Reset form before populating with new data
    resetEditForm();

    document.getElementById("editCategoryId").value = category.id;

    document.getElementById("editCategoryName").value = category.name;

    // Show current image if exists
    if (category.categoryImage) {
        const imagePath = `/api/categories/images/${category.categoryImage
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
    const idField = document.getElementById("editCategoryId");
    if (idField) idField.value = "";

    const nameField = document.getElementById("editCategoryName");
    if (nameField) nameField.value = "";

    const imageField = document.getElementById("editCategoryImage");
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

    const editImageInput = document.getElementById("editCategoryImage");

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
    document.getElementById("editCategoryImage").value = "";

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
        const categoryId = document.getElementById("editCategoryId").value;

        const formData = new FormData();

        // Add category data as a JSON string in the 'req' part

        const categoryData = {
            categoryName: document

                .getElementById("editCategoryName")

                .value.trim(),
        };

        formData.append(
            "req",

            new Blob([JSON.stringify(categoryData)], {
                type: "application/json",
            })
        );

        // Add image file if selected

        const imageFile = document.getElementById("editCategoryImage").files[0];

        if (imageFile) {
            formData.append("image", imageFile);
        }

        // Use multipartApiRequest for proper authentication
        const response = await multipartApiRequest(
            `/api/categories/${categoryId}`,
            {
                method: "PUT",

                body: formData,
            }
        );

        if (response && response.ok) {
            showMessage("دسته‌بندی با موفقیت ویرایش شد!", "success");

            closeEditModal();

            loadCategories(); // Reload the list
        } else {
            const data = await response.json();

            showMessage(data.message || "خطا در ویرایش دسته‌بندی", "error");
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

function showDeleteConfirmation(categoryId, categoryName) {
    const modal = document.getElementById("confirmModal");

    const message = document.getElementById("confirmMessage");

    message.textContent = `آیا از حذف دسته‌بندی "${categoryName}" اطمینان دارید؟`;

    // Store category ID for deletion

    modal.dataset.categoryId = categoryId;

    modal.style.display = "block";
}

// Close confirmation modal

function closeConfirmModal() {
    document.getElementById("confirmModal").style.display = "none";
}

// Confirm delete

function confirmDelete() {
    const modal = document.getElementById("confirmModal");

    const categoryId = modal.dataset.categoryId;

    closeConfirmModal();

    deleteCategory(categoryId);
}

// Delete category

async function deleteCategory(categoryId) {
    try {
        const response = await apiRequest(`/api/categories/${categoryId}`, {
            method: "DELETE",
        });

        if (response && response.ok) {
            showMessage("دسته‌بندی با موفقیت حذف شد!", "success");

            loadCategories(); // Reload the list
        } else {
            const data = await response.json();

            showMessage(data.message || "خطا در حذف دسته‌بندی", "error");
        }
    } catch (error) {
        console.error("Error deleting category:", error);

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
    } else {
        messageDiv.style.backgroundColor = "#dc3545";
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

// Validate create form
function validateCreateForm() {
    let isValid = true;

    // Clear all previous errors
    clearErrors();

    // Validate category name
    const nameField = document.getElementById("category-name");
    if (!nameField || !nameField.value.trim()) {
        showFieldError("category-name", "نام دسته‌بندی الزامی است");
        isValid = false;
    } else if (nameField.value.trim().length < 2) {
        showFieldError(
            "category-name",
            "نام دسته‌بندی باید حداقل ۲ کاراکتر باشد"
        );
        isValid = false;
    }

    // Validate image (optional but if selected, check file type)
    const imageField = document.getElementById("category-image");
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
                "category-image",
                "فقط فایل‌های تصویری مجاز هستند (JPG, PNG, GIF)"
            );
            isValid = false;
        }

        if (file.size > 5 * 1024 * 1024) {
            // 5MB limit
            showFieldError(
                "category-image",
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

    // Validate category name
    const nameField = document.getElementById("editCategoryName");
    if (!nameField || !nameField.value.trim()) {
        showFieldError("editCategoryName", "نام دسته‌بندی الزامی است");
        isValid = false;
    } else if (nameField.value.trim().length < 2) {
        showFieldError(
            "editCategoryName",
            "نام دسته‌بندی باید حداقل ۲ کاراکتر باشد"
        );
        isValid = false;
    }

    // Validate image (optional but if selected, check file type)
    const imageField = document.getElementById("editCategoryImage");
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
                "editCategoryImage",
                "فقط فایل‌های تصویری مجاز هستند (JPG, PNG, GIF)"
            );
            isValid = false;
        }

        if (file.size > 5 * 1024 * 1024) {
            // 5MB limit
            showFieldError(
                "editCategoryImage",
                "حجم فایل نباید بیشتر از ۵ مگابایت باشد"
            );
            isValid = false;
        }
    }

    return isValid;
}

// Pagination functions
function updatePagination() {
    const totalPages = Math.ceil(allCategories.length / categoriesPerPage);
    const paginationContainer = document.getElementById("pagination");

    if (!paginationContainer) return;

    if (totalPages <= 1) {
        paginationContainer.style.display = "none";
        return;
    }

    paginationContainer.style.display = "flex";

    let paginationHTML = `
        <button class="pagination-btn" onclick="changePage(${
            currentPage - 1
        })" ${currentPage === 1 ? "disabled" : ""}>
            <i class="fas fa-chevron-right"></i>
            قبلی
        </button>
        
        <div class="page-numbers">`;

    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 2 && i <= currentPage + 2)
        ) {
            paginationHTML += `
                <button class="page-number ${
                    i === currentPage ? "active" : ""
                }" onclick="changePage(${i})">
                    ${i}
                </button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += `<span class="page-ellipsis">...</span>`;
        }
    }

    paginationHTML += `
        </div>
        
        <button class="pagination-btn" onclick="changePage(${
            currentPage + 1
        })" ${currentPage === totalPages ? "disabled" : ""}>
            بعدی
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(allCategories.length / categoriesPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    displayCategories();
    updatePagination();

    // Scroll to top of categories section
    document
        .getElementById("categories-section")
        .scrollIntoView({ behavior: "smooth" });
}
