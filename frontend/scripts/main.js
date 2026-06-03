// ===== DOM ELEMENTS =====
const houseButtons = document.querySelectorAll('.house-button');
const scrollContainer = document.querySelector('.scroll-container');
const analyticsCards = document.querySelectorAll('.analytics-card');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    observeElements();
    setupScrollAnimations();
});

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    // House button clicks
    houseButtons.forEach(button => {
        button.addEventListener('click', handleHouseClick);
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleHouseClick.call(button);
            }
        });
    });

    // Smooth scroll for scroll container
    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', handleScroll);
    }
}

// ===== HOUSE BUTTON CLICK HANDLER =====
function handleHouseClick(event) {
    const modelId = this.getAttribute('data-model');
    
    if (!modelId) {
        console.error('Model ID not found');
        return;
    }

    // Add click animation
    this.style.animation = 'none';
    setTimeout(() => {
        this.style.animation = '';
    }, 10);

    // Navigate to model dashboard
    navigateToModel(modelId);
}

// ===== NAVIGATION FUNCTIONS =====
function navigateToModel(modelId) {
    const modelPage = 'predict.html';
    console.log(`Navigating to model: ${modelId}`);
    window.location.href = modelPage;
}

function navigateToDashboard() {
    console.log('Navigating to main dashboard');
    showNotification('Opening main dashboard...');
    // window.location.href = '/dashboard.html';
}

function navigateToDocumentation() {
    console.log('Navigating to documentation');
    showNotification('Opening documentation...');
    // window.location.href = '/docs/index.html';
}

// ===== SCROLL ANIMATIONS =====
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                if (entry.target.classList.contains('reveal')) {
                    observer.unobserve(entry.target);
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    document.querySelectorAll('.reveal, .analytics-card').forEach(el => {
        observer.observe(el);
    });
}

// ===== SCROLL EVENT HANDLER =====
function handleScroll(event) {
    const scrollTop = event.target.scrollTop;
    const sections = document.querySelectorAll('section');

    // Update active section
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top + scrollTop;
        const sectionHeight = rect.height;

        if (scrollTop >= sectionTop - window.innerHeight / 2 &&
            scrollTop < sectionTop + sectionHeight - window.innerHeight / 2) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });

    // Update scroll progress
    updateScrollProgress(scrollTop);
}

// ===== SCROLL PROGRESS TRACKER =====
function updateScrollProgress(scrollTop) {
    const totalHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
    const progress = (scrollTop / totalHeight) * 100;

    // Log progress for debugging
    // console.log(`Scroll progress: ${progress.toFixed(2)}%`);
}

// ===== OBSERVE ELEMENTS FOR ANIMATIONS =====
function observeElements() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    analyticsCards.forEach(card => {
        observer.observe(card);
    });
}

// ===== UTILITY FUNCTIONS =====
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #2a7fb5, #1e5a96);
        color: white;
        padding: 16px 24px;
        border-radius: 4px;
        border-left: 4px solid #4db8ff;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideIn 0.4s ease-out;
        font-size: 0.95rem;
        font-weight: 500;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.4s ease-out forwards';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// ===== KEYBOARD NAVIGATION =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
        scrollToNextSection();
    } else if (e.key === 'ArrowUp') {
        scrollToPreviousSection();
    }
});

function scrollToNextSection() {
    const sections = document.querySelectorAll('section');
    const currentScroll = scrollContainer.scrollTop;

    for (let section of sections) {
        const sectionTop = section.offsetTop;
        if (sectionTop > currentScroll + 50) {
            smoothScroll(sectionTop);
            return;
        }
    }
}

function scrollToPreviousSection() {
    const sections = document.querySelectorAll('section');
    const currentScroll = scrollContainer.scrollTop;

    for (let i = sections.length - 1; i >= 0; i--) {
        const sectionTop = sections[i].offsetTop;
        if (sectionTop < currentScroll - 50) {
            smoothScroll(sectionTop);
            return;
        }
    }
}

function smoothScroll(target) {
    if (!scrollContainer) return;

    const start = scrollContainer.scrollTop;
    const distance = target - start;
    const duration = 800;
    let elapsed = 0;

    const easeInOutCubic = (t) => {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };

    const animate = () => {
        elapsed += 16;
        const progress = Math.min(elapsed / duration, 1);
        scrollContainer.scrollTop = start + distance * easeInOutCubic(progress);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };

    animate();
}

// ===== MOUSE WHEEL SCROLL ENHANCEMENT =====
scrollContainer?.addEventListener('wheel', (e) => {
    // Allow natural scrolling behavior
    // Can be enhanced with custom scroll handling if needed
});

// ===== TOUCH SUPPORT FOR MOBILE =====
let touchStartY = 0;
let touchEndY = 0;

scrollContainer?.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
});

scrollContainer?.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const difference = touchStartY - touchEndY;

    if (Math.abs(difference) > swipeThreshold) {
        if (difference > 0) {
            // Swiped up
            scrollToNextSection();
        } else {
            // Swiped down
            scrollToPreviousSection();
        }
    }
}

// ===== HOVER EFFECTS FOR ANALYTICS CARDS =====
analyticsCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// ===== FOCUS MANAGEMENT =====
function setFocusContext(element) {
    element.setAttribute('tabindex', '0');
    element.focus();
}

// ===== SCROLL SNAP POLYFILL FOR OLDER BROWSERS =====
if (!CSS.supports('scroll-snap-type: y mandatory')) {
    console.log('CSS scroll-snap not supported, using polyfill');
    // Fallback to smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
}

// ===== PERFORMANCE OPTIMIZATION - THROTTLE SCROLL =====
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

const throttledScroll = throttle(() => {
    updateScrollProgress(scrollContainer?.scrollTop || 0);
}, 100);

scrollContainer?.addEventListener('scroll', throttledScroll);

// ===== ANIMATION FRAME OPTIMIZATION =====
let animationFrameId = null;

function updateAnimations() {
    // Update any ongoing animations here
    analyticsCards.forEach(card => {
        // Custom animation logic
    });

    animationFrameId = requestAnimationFrame(updateAnimations);
}

// Start animation loop
updateAnimations();

// ===== CLEANUP ON PAGE UNLOAD =====
window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
});

// ===== LOGGER FOR DEBUGGING =====
const logger = {
    log: (message, data = null) => {
        if (data) {
            console.log(`[AquaSense] ${message}:`, data);
        } else {
            console.log(`[AquaSense] ${message}`);
        }
    },
    error: (message, error = null) => {
        if (error) {
            console.error(`[AquaSense Error] ${message}:`, error);
        } else {
            console.error(`[AquaSense Error] ${message}`);
        }
    },
    warn: (message, data = null) => {
        if (data) {
            console.warn(`[AquaSense Warning] ${message}:`, data);
        } else {
            console.warn(`[AquaSense Warning] ${message}`);
        }
    }
};

// Log initialization
logger.log('AquaSense frontend initialized successfully');

// ===== ACCESSIBILITY ENHANCEMENTS =====
// Add ARIA labels for screen readers
houseButtons.forEach((button, index) => {
    button.setAttribute('role', 'button');
    button.setAttribute('aria-label', `Water Quality Prediction Model ${index + 1}`);
    button.setAttribute('tabindex', '0');
});

// Add skip to main content link
const skipLink = document.createElement('a');
skipLink.href = '#models';
skipLink.textContent = 'Skip to main content';
skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: #4db8ff;
    color: #0d1620;
    padding: 8px;
    z-index: 100;
`;
skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
});
skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
});

document.body.prepend(skipLink);

// ===== DYNAMIC SECTION ATTRIBUTES =====
const sections = document.querySelectorAll('section');
sections.forEach((section, index) => {
    section.setAttribute('id', `section-${index}`);
});

// Export functions for external use
window.AquaSense = {
    navigateToModel,
    navigateToDashboard,
    navigateToDocumentation,
    showNotification,
    logger
};
