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

// Handle form submission
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> در حال ورود...';
        submitBtn.disabled = true;

        try {
            const formData = {
                username: document.getElementById("username").value.trim(),
                password: document.getElementById("password").value,
            };

            // Use regular fetch for login (no token needed)
            const response = await fetch("/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response && response.ok) {
                const data = await response.json();

                // Store token and user info
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", data.username);
                localStorage.setItem("userId", data.id);
                localStorage.setItem("roles", JSON.stringify(data.roles));

                showMessage(
                    "ورود موفقیت‌آمیز بود! در حال انتقال...",
                    "success"
                );

                // Redirect to home page after 2 seconds
                setTimeout(() => {
                    window.location.href = "/";
                }, 2000);
            } else {
                const data = await response.json();
                showMessage(
                    data.message || "نام کاربری یا رمز عبور اشتباه است",
                    "error"
                );
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
`;
document.head.appendChild(style);
