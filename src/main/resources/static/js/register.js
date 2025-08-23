// Password visibility toggle
function togglePassword() {
    const passwordInput = document.getElementById("password");
    const toggleBtn = document.querySelector(".password-toggle i");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleBtn.className = "fas fa-eye-slash";
    } else {
        passwordInput.type = "password";
        toggleBtn.className = "fas fa-eye";
    }
}

function toggleConfirmPassword() {
    const passwordInput = document.getElementById("confirmPassword");
    const toggleBtn = document.querySelectorAll(".password-toggle i")[1];

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleBtn.className = "fas fa-eye-slash";
    } else {
        passwordInput.type = "password";
        toggleBtn.className = "fas fa-eye";
    }
}

// Form validation
function validateForm() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.getElementById("role").value;

    // Clear previous error messages
    clearErrors();

    let isValid = true;

    // Username validation
    if (username.length < 3) {
        showFieldError("username", "نام کاربری باید حداقل ۳ کاراکتر باشد");
        isValid = false;
    }

    // Password validation
    if (password.length < 6) {
        showFieldError("password", "رمز عبور باید حداقل ۶ کاراکتر باشد");
        isValid = false;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
        showFieldError("confirmPassword", "رمز عبور و تأیید آن مطابقت ندارند");
        isValid = false;
    }

    // Role validation
    if (!role) {
        showFieldError("role", "لطفاً نوع کاربر را انتخاب کنید");
        isValid = false;
    }

    return isValid;
}

// Show field error
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.createElement("div");
    errorDiv.className = "field-error";
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
    `;

    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = "#dc3545";
}
// Clear all errors
function clearErrors() {
    const errors = document.querySelectorAll(".field-error");
    errors.forEach((error) => error.remove());

    const fields = document.querySelectorAll("input, select");
    fields.forEach((field) => {
        field.style.borderColor = "#ddd";
    });
}
// Handle form submission
document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");

    registerForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Show loading state
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> در حال ثبت‌نام...';
        submitBtn.disabled = true;

        try {
            const formData = {
                username: document.getElementById("username").value.trim(),
                password: document.getElementById("password").value,
                role: document.getElementById("role").value,
            };

            const response = await fetch("/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(
                    "ثبت‌نام موفقیت‌آمیز بود! در حال انتقال به داشبورد...",
                    "success"
                );

                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 2000);
            } else {
                showMessage(data.message || "خطا در ثبت‌نام", "error");
            }
        } catch (error) {
            console.error("Error:", error);
            showMessage("خطا در اتصال به سرور", "error");
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
});

// Show message to user
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
    
    .field-error {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
    
    .form-help {
        color: #6c757d;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
`;
document.head.appendChild(style);
