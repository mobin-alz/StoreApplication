// Contact Us Page JavaScript
document.addEventListener("DOMContentLoaded", function () {
    console.log("Contact Us page loaded");

    // Initialize FAQ functionality
    initializeFAQ();

    // Initialize contact form
    initializeContactForm();

    // Initialize animations
    initializeAnimations();

    // Initialize form validation
    initializeFormValidation();
});

// Initialize FAQ functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach((item) => {
        const question = item.querySelector(".faq-question");

        question.addEventListener("click", function () {
            const isActive = item.classList.contains("active");

            // Close all other FAQ items
            faqItems.forEach((otherItem) => {
                if (otherItem !== item) {
                    otherItem.classList.remove("active");
                }
            });

            // Toggle current item
            if (isActive) {
                item.classList.remove("active");
            } else {
                item.classList.add("active");
            }
        });
    });
}

// Initialize contact form
function initializeContactForm() {
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();
            handleFormSubmission();
        });
    }
}

// Handle form submission
function handleFormSubmission() {
    const formData = new FormData(document.getElementById("contactForm"));
    const submitBtn = document.querySelector(".submit-btn");

    // Disable submit button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> در حال ارسال...';

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        // Show success message
        showMessage(
            "پیام شما با موفقیت ارسال شد. در اسرع وقت با شما تماس خواهیم گرفت.",
            "success"
        );

        // Reset form
        document.getElementById("contactForm").reset();

        // Reset submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> ارسال پیام';

        // Scroll to top of form
        document.querySelector(".contact-form-section").scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }, 2000);
}

// Initialize animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        ".contact-method, .faq-item, .social-link"
    );
    animatedElements.forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "opacity 0.8s ease, transform 0.8s ease";
        observer.observe(el);
    });
}

// Initialize form validation
function initializeFormValidation() {
    const form = document.getElementById("contactForm");
    const inputs = form.querySelectorAll("input, select, textarea");

    inputs.forEach((input) => {
        // Add real-time validation
        input.addEventListener("blur", function () {
            validateField(this);
        });

        input.addEventListener("input", function () {
            clearFieldError(this);
        });
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = "";

    // Remove existing error styling
    clearFieldError(field);

    // Validation rules
    switch (fieldName) {
        case "firstName":
        case "lastName":
            if (value.length < 2) {
                isValid = false;
                errorMessage = "نام باید حداقل ۲ کاراکتر باشد";
            }
            break;

        case "email":
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = "لطفاً یک ایمیل معتبر وارد کنید";
            }
            break;

        case "phone":
            if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
                isValid = false;
                errorMessage = "لطفاً شماره تماس معتبر وارد کنید";
            }
            break;

        case "subject":
            if (!value) {
                isValid = false;
                errorMessage = "لطفاً موضوع را انتخاب کنید";
            }
            break;

        case "message":
            if (value.length < 10) {
                isValid = false;
                errorMessage = "پیام باید حداقل ۱۰ کاراکتر باشد";
            }
            break;
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

// Show field error
function showFieldError(field, message) {
    field.style.borderColor = "#ef4444";
    field.style.backgroundColor = "#fef2f2";

    // Create error message element
    const errorDiv = document.createElement("div");
    errorDiv.className = "field-error";
    errorDiv.textContent = message;
    errorDiv.style.color = "#ef4444";
    errorDiv.style.fontSize = "0.875rem";
    errorDiv.style.marginTop = "5px";
    errorDiv.style.fontWeight = "500";

    // Insert error message after the field
    field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(field) {
    field.style.borderColor = "#e5e7eb";
    field.style.backgroundColor = "#f9fafb";

    // Remove error message
    const errorDiv = field.parentNode.querySelector(".field-error");
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Validate entire form
function validateForm() {
    const form = document.getElementById("contactForm");
    const inputs = form.querySelectorAll("input, select, textarea");
    let isValid = true;

    inputs.forEach((input) => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    return isValid;
}

// Add hover effects for interactive elements
document.addEventListener("DOMContentLoaded", function () {
    // Add hover effects to contact methods
    const contactMethods = document.querySelectorAll(".contact-method");
    contactMethods.forEach((method) => {
        method.addEventListener("mouseenter", function () {
            this.style.transform = "translateY(-10px) scale(1.02)";
        });

        method.addEventListener("mouseleave", function () {
            this.style.transform = "translateY(0) scale(1)";
        });
    });

    // Add hover effects to social links
    const socialLinks = document.querySelectorAll(".social-link");
    socialLinks.forEach((link) => {
        link.addEventListener("mouseenter", function () {
            this.style.transform = "translateY(-10px) scale(1.05)";
        });

        link.addEventListener("mouseleave", function () {
            this.style.transform = "translateY(0) scale(1)";
        });
    });

    // Add click effects to FAQ items
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach((item) => {
        item.addEventListener("click", function () {
            // Add a subtle click effect
            this.style.transform = "scale(0.98)";
            setTimeout(() => {
                this.style.transform = "scale(1)";
            }, 150);
        });
    });
});

// Parallax effect for hero section
window.addEventListener("scroll", function () {
    const scrolled = window.pageYOffset;
    const heroSection = document.querySelector(".hero-section");

    if (heroSection) {
        const rate = scrolled * -0.5;
        heroSection.style.transform = `translateY(${rate}px)`;
    }
});

// Add smooth scrolling for anchor links
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();

            const targetId = this.getAttribute("href");
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        });
    });
}

// Initialize smooth scrolling
document.addEventListener("DOMContentLoaded", initializeSmoothScrolling);

// Add loading animation for form submission
function showLoadingState() {
    const submitBtn = document.querySelector(".submit-btn");
    submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> در حال ارسال...';
    submitBtn.disabled = true;
}

function hideLoadingState() {
    const submitBtn = document.querySelector(".submit-btn");
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> ارسال پیام';
    submitBtn.disabled = false;
}

// Add CSS for field errors
const style = document.createElement("style");
style.textContent = `
    .field-error {
        animation: slideInError 0.3s ease;
    }
    
    @keyframes slideInError {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .contact-form input:invalid,
    .contact-form select:invalid,
    .contact-form textarea:invalid {
        border-color: #ef4444;
    }
    
    .contact-form input:valid,
    .contact-form select:valid,
    .contact-form textarea:valid {
        border-color: #10b981;
    }
`;
document.head.appendChild(style);

// Add form field focus effects
document.addEventListener("DOMContentLoaded", function () {
    const formFields = document.querySelectorAll(
        ".form-group input, .form-group select, .form-group textarea"
    );

    formFields.forEach((field) => {
        field.addEventListener("focus", function () {
            this.parentNode.style.transform = "scale(1.02)";
            this.parentNode.style.transition = "transform 0.2s ease";
        });

        field.addEventListener("blur", function () {
            this.parentNode.style.transform = "scale(1)";
        });
    });
});

// Add character counter for message textarea
document.addEventListener("DOMContentLoaded", function () {
    const messageField = document.getElementById("message");

    if (messageField) {
        const counter = document.createElement("div");
        counter.className = "char-counter";
        counter.style.textAlign = "left";
        counter.style.fontSize = "0.875rem";
        counter.style.color = "#64748b";
        counter.style.marginTop = "5px";

        messageField.parentNode.appendChild(counter);

        function updateCounter() {
            const length = messageField.value.length;
            const maxLength = 1000; // Maximum character limit
            counter.textContent = `${length}/${maxLength}`;

            if (length > maxLength * 0.9) {
                counter.style.color = "#f59e0b";
            } else if (length > maxLength * 0.8) {
                counter.style.color = "#10b981";
            } else {
                counter.style.color = "#64748b";
            }
        }

        messageField.addEventListener("input", updateCounter);
        updateCounter(); // Initial count
    }
});
