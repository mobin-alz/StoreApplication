// About Us Page JavaScript
document.addEventListener("DOMContentLoaded", function () {
    console.log("About Us page loaded");

    // Initialize smooth scrolling for anchor links
    initializeSmoothScrolling();

    // Initialize intersection observer for animations
    initializeAnimations();

    // Initialize stats counter animation
    initializeStatsCounter();
});

// Smooth scrolling for anchor links
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

// Initialize animations with intersection observer
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
        ".value-card, .team-member, .timeline-item"
    );
    animatedElements.forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "opacity 0.8s ease, transform 0.8s ease";
        observer.observe(el);
    });
}

// Initialize stats counter animation
function initializeStatsCounter() {
    const statsSection = document.querySelector(".hero-stats");
    if (!statsSection) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    observer.observe(statsSection);
}

// Animate counter numbers
function animateCounters() {
    const counters = document.querySelectorAll(".stat-number");

    counters.forEach((counter) => {
        const target = parseInt(counter.textContent.replace(/[^\d]/g, ""));
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60fps
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }

            // Format number with Persian digits
            const formattedNumber = formatPersianNumber(Math.floor(current));
            counter.textContent = formattedNumber + "+";
        }, 16);
    });
}

// Format number to Persian digits
function formatPersianNumber(num) {
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return num.toString().replace(/\d/g, (x) => persianDigits[x]);
}

// Add hover effects for interactive elements
document.addEventListener("DOMContentLoaded", function () {
    // Add hover effects to value cards
    const valueCards = document.querySelectorAll(".value-card");
    valueCards.forEach((card) => {
        card.addEventListener("mouseenter", function () {
            this.style.transform = "translateY(-10px) scale(1.02)";
        });

        card.addEventListener("mouseleave", function () {
            this.style.transform = "translateY(0) scale(1)";
        });
    });

    // Add hover effects to team members
    const teamMembers = document.querySelectorAll(".team-member");
    teamMembers.forEach((member) => {
        member.addEventListener("mouseenter", function () {
            this.style.transform = "translateY(-5px) scale(1.02)";
        });

        member.addEventListener("mouseleave", function () {
            this.style.transform = "translateY(0) scale(1)";
        });
    });

    // Add click effects to timeline items
    const timelineItems = document.querySelectorAll(".timeline-item");
    timelineItems.forEach((item) => {
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

// Add loading animation for images (if any are added later)
function preloadImages() {
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
        img.addEventListener("load", function () {
            this.style.opacity = "1";
            this.style.transform = "scale(1)";
        });

        img.style.opacity = "0";
        img.style.transform = "scale(0.9)";
        img.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    });
}

// Initialize image loading animations
document.addEventListener("DOMContentLoaded", preloadImages);

// Add scroll-triggered animations
function addScrollAnimations() {
    const elements = document.querySelectorAll(
        ".section-header, .story-text, .story-image"
    );

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("animate-in");
                }
            });
        },
        { threshold: 0.3 }
    );

    elements.forEach((el) => observer.observe(el));
}

// Initialize scroll animations
document.addEventListener("DOMContentLoaded", addScrollAnimations);

// Add CSS for scroll animations
const style = document.createElement("style");
style.textContent = `
    .animate-in {
        animation: slideInFromBottom 0.8s ease forwards;
    }
    
    @keyframes slideInFromBottom {
        from {
            opacity: 0;
            transform: translateY(50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
