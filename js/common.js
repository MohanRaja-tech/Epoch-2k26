/* ============================================
   EPOCH 2026 - COMMON JAVASCRIPT
   Shared Functions & Utilities
   ============================================ */

// ============================================
// 1. DOM Ready & Initialization
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all common features
    initNavigation();


    initParticles();
    initScrollEffects();
    initTooltips();
    initLazyLoad();
    checkUserSession();

    // Initialize AOS (Animate On Scroll) if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50,
            disable: window.innerWidth < 768 ? true : false
        });
    }
});

// ============================================
// 2. Background Video Initialization
// ============================================

// ============================================
// 3. Navigation System
// ============================================
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile Menu Toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';

            // Animate menu items
            navLinks.forEach((link, index) => {
                if (navMenu.classList.contains('active')) {
                    setTimeout(() => {
                        link.style.animation = `fadeInRight 0.3s ease forwards`;
                    }, index * 100);
                } else {
                    link.style.animation = '';
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Navbar Scroll Effect
    if (navbar) {
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Hide/show on scroll
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }

            lastScrollY = currentScrollY;
        });
    }

    // Active Link Highlighting
    highlightActiveLink();
}

function highlightActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || (currentPage === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ============================================
// 4. Particle System
// ============================================
function initParticles() {
    const particlesContainer = document.querySelector('.particles-container');
    if (!particlesContainer) return;

    const particleCount = window.innerWidth < 768 ? 20 : 40;

    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Random properties
    const size = Math.random() * 4 + 2;
    const left = Math.random() * 100;
    const animationDelay = Math.random() * 15;
    const animationDuration = Math.random() * 10 + 10;

    particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        animation-delay: ${animationDelay}s;
        animation-duration: ${animationDuration}s;
    `;

    container.appendChild(particle);
}

// ============================================
// 5. Scroll Effects
// ============================================
function initScrollEffects() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                const offset = 80; // Navbar height
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Parallax effects
    initParallax();

    // Reveal animations
    initRevealAnimations();
}

function initParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');

    if (parallaxElements.length === 0) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;

        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length === 0) return;

    const revealOnScroll = () => {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            const revealPoint = 100;

            if (elementTop < windowHeight - revealPoint) {
                element.classList.add('revealed');
            }
        });
    };

    window.addEventListener('scroll', throttle(revealOnScroll, 100));
    revealOnScroll(); // Check on load
}

// ============================================
// 6. Toast Notification System
// ============================================
class ToastNotification {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 3000;
                pointer-events: none;
            `;
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    show(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type} show`;
        toast.style.pointerEvents = 'auto';

        const icon = this.getIcon(type);

        toast.innerHTML = `
            <div class="toast-content">
                <i class="${icon}"></i>
                <span>${message}</span>
            </div>
        `;

        this.container.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease forwards';
        }, 10);

        // Remove after duration
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }

    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }
}

// Global toast instance
const Toast = new ToastNotification();

// ============================================
// 7. Form Utilities
// ============================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
    const re = /^[0-9]{10}$/;
    return re.test(String(phone));
}

function validatePassword(password) {
    // At least 6 characters
    return password.length >= 6;
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.add('input-error');
    field.classList.remove('field-success');

    let errorElement = field.parentElement.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'field-error';
        field.parentElement.appendChild(errorElement);
    }

    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.remove('input-error');

    const errorElement = field.parentElement.querySelector('.field-error');
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const button = input.parentElement.querySelector('.password-toggle');
    if (!button) return;

    const icon = button.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// ============================================
// 8. Countdown Timer
// ============================================
class CountdownTimer {
    constructor(elementIds, targetDate) {
        this.elements = {
            days: document.getElementById(elementIds.days),
            hours: document.getElementById(elementIds.hours),
            minutes: document.getElementById(elementIds.minutes),
            seconds: document.getElementById(elementIds.seconds)
        };
        this.targetDate = new Date(targetDate).getTime();
        this.interval = null;

        if (this.elements.days) {
            this.start();
        }
    }

    start() {
        this.update();
        this.interval = setInterval(() => this.update(), 1000);
    }

    update() {
        const now = new Date().getTime();
        const distance = this.targetDate - now;

        if (distance < 0) {
            this.stop();
            this.setValues(0, 0, 0, 0);
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        this.setValues(days, hours, minutes, seconds);
    }

    setValues(days, hours, minutes, seconds) {
        if (this.elements.days) this.elements.days.textContent = String(days).padStart(2, '0');
        if (this.elements.hours) this.elements.hours.textContent = String(hours).padStart(2, '0');
        if (this.elements.minutes) this.elements.minutes.textContent = String(minutes).padStart(2, '0');
        if (this.elements.seconds) this.elements.seconds.textContent = String(seconds).padStart(2, '0');
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }
}

// ============================================
// 9. Statistics Counter Animation
// ============================================
function animateStats() {
    const statElements = document.querySelectorAll('.stat-number');

    statElements.forEach(stat => {
        const target = parseInt(stat.dataset.target);
        if (!target) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateValue(stat, 0, target, 2000);
                    observer.unobserve(stat);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(stat);
    });
}

function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }

        // Format number
        let displayValue = Math.floor(current);
        if (displayValue >= 1000) {
            displayValue = displayValue.toLocaleString();
        }

        // Check if there's a suffix (like + or K)
        const suffix = element.dataset.suffix || '';
        element.textContent = displayValue + suffix;
    }, 16);
}

// ============================================
// 10. User Session Management & Player Badge
// ============================================
function checkUserSession() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userName = localStorage.getItem('userName');
    const epochId = localStorage.getItem('epochId');
    const playerNumber = localStorage.getItem('playerNumber');

    // Display player badge in navbar if logged in
    // Check for either epochId (new system) or playerNumber (old system)
    if (isLoggedIn && (epochId || playerNumber)) {
        displayPlayerBadge(epochId || playerNumber, userName);
    }

    // Handle event registration buttons based on login status
    const eventRegisterButtons = document.querySelectorAll('.register-event-btn');
    eventRegisterButtons.forEach(btn => {
        if (!isLoggedIn || !epochId) {
            // Disable button for non-logged-in users
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
            btn.title = 'Please login to register for events';
        } else {
            // Enable button for logged-in users
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.title = '';
        }
    });
}

function displayPlayerBadge(playerNumber, userName) {
    // 1. Remove existing badge if present
    const existingBadge = document.querySelector('.player-badge-li');
    if (existingBadge) existingBadge.remove();

    // 2. Find the navbar menu and login link
    const navMenu = document.querySelector('.nav-menu');
    const loginLink = document.querySelector('.nav-link[href*="login"]');

    if (!navMenu) return;

    // 3. Create player badge list item
    const badgeLi = document.createElement('li');
    badgeLi.className = 'player-badge-li';

    // 4. Build badge HTML - playerNumber can be epochId like "EPOCH001" or just a number
    const displayId = String(playerNumber).startsWith('EPOCH') ? playerNumber : `EPOCH${String(playerNumber).padStart(3, '0')}`;
    badgeLi.innerHTML = `
        <div class="player-badge-nav">
            <!-- Visible Badge -->
            <div class="badge-visible">
                <span class="badge-icon"><i class="fas fa-user-astronaut"></i></span>
                <div class="badge-info">
                    <span class="p-label">PLAYER</span>
                    <span class="p-num">${displayId}</span>
                </div>
                <i class="fas fa-chevron-down dropdown-arrow"></i>
            </div>
            
            <!-- Dropdown Menu -->
            <div class="badge-dropdown">
                <div class="dropdown-header">
                    <div class="squid-symbols-mini">
                        <span class="sym-circle"></span>
                        <span class="sym-triangle"></span>
                        <span class="sym-square"></span>
                    </div>
                    <p class="player-name">${userName || 'Player'}</p>
                    <p class="player-id">${displayId}</p>
                </div>
                <ul class="dropdown-list">
                    <li><a href="#" class="view-player-card"><i class="fas fa-id-card"></i> Player Card</a></li>
                    <li><a href="registration.html"><i class="fas fa-calendar-check"></i> My Events</a></li>
                    <li class="divider"></li>
                    <li><a href="#" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
                </ul>
            </div>
        </div>
    `;

    // 5. Replace login button with badge
    if (loginLink && loginLink.closest('li')) {
        loginLink.closest('li').replaceWith(badgeLi);
    } else {
        navMenu.appendChild(badgeLi);
    }

    // 5.1 Hide all Register links when logged in
    const registerLinks = document.querySelectorAll('a[href*="registration"]');
    registerLinks.forEach(link => {
        if (link.closest('li')) {
            link.closest('li').style.display = 'none';
        } else {
            link.style.display = 'none';
        }
    });

    // 6. Add event listeners
    const badge = badgeLi.querySelector('.player-badge-nav');
    const badgeVisible = badge.querySelector('.badge-visible');
    const viewCardLink = badge.querySelector('.view-player-card');
    const logoutBtn = badge.querySelector('.logout-btn');

    // Toggle dropdown
    badgeVisible.addEventListener('click', (e) => {
        e.stopPropagation();
        badge.classList.toggle('active');
    });

    // View player card
    viewCardLink.addEventListener('click', (e) => {
        e.preventDefault();
        viewPlayerCard();
        badge.classList.remove('active');
    });

    // Logout
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        confirmLogout();
        badge.classList.remove('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!badge.contains(e.target)) {
            badge.classList.remove('active');
        }
    });
}

function viewPlayerCard() {
    const epochId = localStorage.getItem('epochId');
    const playerNumber = localStorage.getItem('playerNumber');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');

    // Display ID - prefer epochId, fallback to playerNumber
    const displayId = epochId || (playerNumber ? `EPOCH${String(playerNumber).padStart(3, '0')}` : 'N/A');

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'player-card-modal';
    modal.innerHTML = `
        <div class="player-card-content">
            <button class="close-modal">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="player-card">
                <div class="card-header">
                    <div class="squid-symbols small">
                        <div class="symbol circle"><i class="fas fa-circle"></i></div>
                        <div class="symbol triangle"></div>
                        <div class="symbol square"><i class="fas fa-square"></i></div>
                    </div>
                    <h2>EPOCH 2026</h2>
                    <p>Player Identification Card</p>
                </div>
                
                <div class="card-body">
                    <div class="player-avatar">
                        <i class="fas fa-user-astronaut"></i>
                    </div>
                    
                    <div class="player-number-large">
                        ${displayId}
                    </div>
                    
                    <div class="player-details">
                        <p class="detail-name">${userName || 'Player'}</p>
                        <p class="detail-email">${userEmail || 'N/A'}</p>
                        <p class="detail-status"><i class="fas fa-check-circle"></i> Registered</p>
                    </div>
                </div>
                
                <div class="card-footer">
                    <p>February 7, 2026</p>
                    <div class="barcode">||||| |||| ||||| ||||</div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close button
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function confirmLogout() {
    // Create confirmation modal
    const modal = document.createElement('div');
    modal.className = 'logout-confirm-modal';
    modal.innerHTML = `
        <div class="logout-confirm-content">
            <div class="logout-icon">
                <i class="fas fa-sign-out-alt"></i>
            </div>
            <h3>Logout Confirmation</h3>
            <p>Are you sure you want to leave the games?</p>
            <div class="logout-buttons">
                <button class="btn btn-secondary cancel-logout">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button class="btn btn-primary confirm-logout">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Cancel button
    modal.querySelector('.cancel-logout').addEventListener('click', () => {
        modal.remove();
    });

    // Confirm logout button
    modal.querySelector('.confirm-logout').addEventListener('click', () => {
        modal.remove();
        logout();
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function logout() {
    // Clear all user data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('playerNumber');
    localStorage.removeItem('epochId');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('rememberedUser');

    // Close any open modals
    document.querySelectorAll('.logout-confirm-modal, .player-card-modal').forEach(m => m.remove());

    // Show toast
    Toast.show('Logged out successfully. See you next game!', 'success');

    // Redirect after delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Show player number popup after registration
function showPlayerNumberPopup(playerNumber, userName) {
    const popup = document.createElement('div');
    popup.className = 'player-popup-overlay';
    popup.innerHTML = `
        <div class="player-popup">
            <div class="popup-celebration">
                <div class="confetti-container"></div>
            </div>
            
            <div class="popup-content">
                <div class="popup-icon">
                    <div class="success-circle">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
                
                <h2>Welcome to the Games!</h2>
                <p class="popup-subtitle">Registration Successful</p>
                
                <div class="squid-symbols small">
                    <div class="symbol circle"><i class="fas fa-circle"></i></div>
                    <div class="symbol triangle"></div>
                    <div class="symbol square"><i class="fas fa-square"></i></div>
                </div>
                
                <div class="player-number-box">
                    <p class="number-label">Your Player Number</p>
                    <p class="number-value">#${String(playerNumber).padStart(3, '0')}</p>
                    <p class="number-hint">Remember this number!</p>
                </div>
                
                <p class="welcome-message">
                    Welcome, <strong>${userName || 'Player'}</strong>! 
                    Your journey in EPOCH 2026 begins now.
                </p>
                
                <div class="popup-buttons">
                    <button class="btn btn-primary btn-large close-popup-btn">
                        <i class="fas fa-gamepad"></i> Let's Play!
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    // Create confetti
    createPopupConfetti(popup.querySelector('.confetti-container'));

    // Animate in
    setTimeout(() => {
        popup.classList.add('show');
    }, 100);

    // Close button handler
    popup.querySelector('.close-popup-btn').addEventListener('click', () => {
        closePlayerPopup();
    });
}

function closePlayerPopup() {
    const popup = document.querySelector('.player-popup-overlay');
    if (popup) {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.remove();
            // Redirect to home
            window.location.href = 'index.html';
        }, 500);
    }
}

function createPopupConfetti(container) {
    if (!container) return;

    const colors = ['#ED1B76', '#0FBA81', '#FFD700', '#FF4D94', '#00D4AA'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.cssText = `
            left: ${Math.random() * 100}%;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            animation-delay: ${Math.random() * 2}s;
            animation-duration: ${Math.random() * 2 + 2}s;
        `;
        container.appendChild(confetti);
    }
}

// ============================================
// 11. Utility Functions
// ============================================

// Debounce function
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

// Throttle function
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

// Copy to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            Toast.show('Copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        Toast.show('Copied to clipboard!', 'success');
    } catch (err) {
        Toast.show('Failed to copy', 'error');
    }

    document.body.removeChild(textarea);
}

// Format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

// Generate random player number
function generatePlayerNumber() {
    return Math.floor(Math.random() * 456) + 1;
}

// ============================================
// 12. Lazy Loading
// ============================================
function initLazyLoad() {
    const lazyElements = document.querySelectorAll('[data-lazy]');

    if ('IntersectionObserver' in window) {
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;

                    if (element.tagName === 'IMG') {
                        element.src = element.dataset.lazy;
                    } else if (element.tagName === 'VIDEO') {
                        element.src = element.dataset.lazy;
                        element.load();
                    } else {
                        element.style.backgroundImage = `url(${element.dataset.lazy})`;
                    }

                    element.removeAttribute('data-lazy');
                    lazyObserver.unobserve(element);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        lazyElements.forEach(element => {
            lazyObserver.observe(element);
        });
    } else {
        // Fallback for older browsers
        lazyElements.forEach(element => {
            if (element.tagName === 'IMG') {
                element.src = element.dataset.lazy;
            } else if (element.tagName === 'VIDEO') {
                element.src = element.dataset.lazy;
            } else {
                element.style.backgroundImage = `url(${element.dataset.lazy})`;
            }
        });
    }
}

// ============================================
// 13. Tooltips
// ============================================
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');

    tooltipElements.forEach(element => {
        let tooltip = null;

        element.addEventListener('mouseenter', () => {
            const text = element.dataset.tooltip;
            const position = element.dataset.tooltipPosition || 'top';

            tooltip = document.createElement('div');
            tooltip.className = `tooltip tooltip-${position}`;
            tooltip.textContent = text;
            document.body.appendChild(tooltip);

            positionTooltip(element, tooltip, position);
        });

        element.addEventListener('mouseleave', () => {
            if (tooltip) {
                tooltip.remove();
                tooltip = null;
            }
        });
    });
}

function positionTooltip(element, tooltip, position) {
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let top, left;

    switch (position) {
        case 'top':
            top = rect.top - tooltipRect.height - 10;
            left = rect.left + (rect.width - tooltipRect.width) / 2;
            break;
        case 'bottom':
            top = rect.bottom + 10;
            left = rect.left + (rect.width - tooltipRect.width) / 2;
            break;
        case 'left':
            top = rect.top + (rect.height - tooltipRect.height) / 2;
            left = rect.left - tooltipRect.width - 10;
            break;
        case 'right':
            top = rect.top + (rect.height - tooltipRect.height) / 2;
            left = rect.right + 10;
            break;
    }

    tooltip.style.top = `${top + window.scrollY}px`;
    tooltip.style.left = `${left + window.scrollX}px`;
}

// ============================================
// 14. Export Functions for Global Access
// ============================================
window.EpochUtils = {
    Toast,
    CountdownTimer,
    validateEmail,
    validatePhone,
    validatePassword,
    showFieldError,
    clearFieldError,
    togglePassword,
    copyToClipboard,
    formatDate,
    generatePlayerNumber,
    animateStats,
    logout,
    debounce,
    throttle
};

// Export for global access (needed for inline onclick handlers)
window.showPlayerNumberPopup = showPlayerNumberPopup;
window.closePlayerPopup = closePlayerPopup;
window.viewPlayerCard = viewPlayerCard;
window.confirmLogout = confirmLogout;
window.logout = logout;
window.togglePassword = togglePassword;

// ============================================
// 15. Console Easter Egg
// ============================================
console.log('%c🦑 EPOCH 2026 - SQUID GAMES 🦑', 'color: #ED1B76; font-size: 24px; font-weight: bold;');
console.log('%cWelcome, Player! Ready to compete?', 'color: #0FBA81; font-size: 14px;');
console.log('%cType "EpochUtils" in console to see available functions', 'color: #FFD700; font-size: 12px;');