/* ============================================
   EPOCH 2026 - HOME PAGE JAVASCRIPT
   Home Page Specific Functionality
   ============================================ */

// ============================================
// 1. Home Page Initialization
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize home page features
    initBackgroundVideo();
    initHeroAnimations();
    initCountdownTimer();
    initEventTabs();
    initStatsAnimation();
    initTestimonials();
    initHomeParticles();
    initScrollIndicator();
    typewriterEffect();
    
    // Initialize Squid Game specific effects
    
});

// ============================================
// 2. Background Video Management
// ============================================
function initBackgroundVideo() {
    const videoContainer = document.querySelector('.video-background');
    if (!videoContainer) return;
    
    // Create video element
    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    
    // Add multiple sources for browser compatibility
    const sources = [
        { src: 'assests/videos/back.mp4', type: 'video/mp4' },
        { src: 'assests/videos/squid-game-bg.webm', type: 'video/webm' }
    ];
    
    sources.forEach(source => {
        const sourceElement = document.createElement('source');
        sourceElement.src = source.src;
        sourceElement.type = source.type;
        video.appendChild(sourceElement);
    });
    
    // Fallback for video load failure
    video.onerror = function() {
        console.warn('Video failed to load, using fallback background');
        videoContainer.style.display = 'none';
        document.querySelector('.hero-fallback-bg').style.display = 'block';
    };
    
    // Optimize for mobile
    if (window.innerWidth < 768) {
        video.setAttribute('data-mobile', 'true');
        // Use lower quality video for mobile
        sources[0].src = 'assests/videos/squid-game-bg-mobile.mp4';
    }
    
    videoContainer.appendChild(video);
    
    // Play/Pause on visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            video.pause();
        } else {
            video.play();
        }
    });
    
    // Add video controls for accessibility
    
}

function addVideoControls(video) {
    const controlButton = document.createElement('button');
    controlButton.className = 'video-control-btn';
    controlButton.innerHTML = '<i class="fas fa-pause"></i>';
    controlButton.setAttribute('aria-label', 'Pause/Play background video');
    
    controlButton.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            controlButton.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            video.pause();
            controlButton.innerHTML = '<i class="fas fa-play"></i>';
        }
    });
    
    document.querySelector('.hero').appendChild(controlButton);
}

// ============================================
// 3. Hero Section Animations
// ============================================
function initHeroAnimations() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    // Animate hero elements on load
    const animateElements = [
        { selector: '.hero-badge', delay: 0 },
        { selector: '.squid-symbols', delay: 200 },
        { selector: '.hero-title', delay: 400 },
        { selector: '.hero-subtitle', delay: 600 },
        { selector: '.hero-tagline', delay: 800 },
        { selector: '.countdown-wrapper', delay: 1000 },
        { selector: '.hero-buttons', delay: 1200 }
    ];
    
    animateElements.forEach(item => {
        const element = hero.querySelector(item.selector);
        if (element) {
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
                element.classList.add('animate-fade-up');
            }, item.delay);
        }
    });
    
    // Mouse movement parallax effect
    hero.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        const moveX = (clientX - centerX) / 50;
        const moveY = (clientY - centerY) / 50;
        
        const heroContent = hero.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
    });
    
    // Reset on mouse leave
    hero.addEventListener('mouseleave', () => {
        const heroContent = hero.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.transform = 'translate(0, 0)';
        }
    });
}

// ============================================
// 4. Countdown Timer
// ============================================
function initCountdownTimer() {
    // Set event date - March 15, 2026, 9:00 AM
    const eventDate = new Date('2026-02-07T09:00:00').getTime();
    
    const countdown = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds')
    };
    
    if (!countdown.days) return;
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = eventDate - now;
        
        if (distance < 0) {
            // Event has started
            countdown.days.textContent = '00';
            countdown.hours.textContent = '00';
            countdown.minutes.textContent = '00';
            countdown.seconds.textContent = '00';
            
            // Show event started message
            showEventStarted();
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Update with animation
        updateCounterWithAnimation(countdown.days, days);
        updateCounterWithAnimation(countdown.hours, hours);
        updateCounterWithAnimation(countdown.minutes, minutes);
        updateCounterWithAnimation(countdown.seconds, seconds);
    }
    
    // Update immediately and then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function updateCounterWithAnimation(element, value) {
    const currentValue = element.textContent;
    const newValue = String(value).padStart(2, '0');
    
    if (currentValue !== newValue) {
        element.style.transform = 'scale(1.2)';
        element.style.color = 'var(--primary-pink-light)';
        element.textContent = newValue;
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = 'var(--primary-pink)';
        }, 300);
    }
}

function showEventStarted() {
    const countdownWrapper = document.querySelector('.countdown-wrapper');
    if (countdownWrapper && !countdownWrapper.classList.contains('event-started')) {
        countdownWrapper.classList.add('event-started');
        countdownWrapper.innerHTML = `
            <div class="event-started-message">
                <h3> The Games Have Begun! </h3>
                
            </div>
        `;
    }
}

// ============================================
// 5. Event Tabs Functionality
// ============================================
function initEventTabs() {
    const tabs = document.querySelectorAll('.event-tab');
    const eventGrids = document.querySelectorAll('.events-tab-content');
    
    if (tabs.length === 0) return;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Get tab type
            const tabType = tab.dataset.tab;
            
            // Filter events
            filterEvents(tabType);
            
            // Add ripple effect
            createRippleEffect(tab, event);
        });
    });
}

function filterEvents(type) {
    const allEvents = document.querySelectorAll('.event-preview-card');
    
    allEvents.forEach(event => {
        if (type === 'all') {
            event.style.display = 'block';
            setTimeout(() => {
                event.style.opacity = '1';
                event.style.transform = 'scale(1)';
            }, 100);
        } else if (event.classList.contains(type)) {
            event.style.display = 'block';
            setTimeout(() => {
                event.style.opacity = '1';
                event.style.transform = 'scale(1)';
            }, 100);
        } else {
            event.style.opacity = '0';
            event.style.transform = 'scale(0.9)';
            setTimeout(() => {
                event.style.display = 'none';
            }, 300);
        }
    });
    
    // Animate grid layout
    animateGrid();
}

function animateGrid() {
    const visibleEvents = document.querySelectorAll('.event-preview-card[style*="block"]');
    visibleEvents.forEach((event, index) => {
        event.style.animation = 'none';
        setTimeout(() => {
            event.style.animation = `fadeInUp 0.5s ease forwards`;
            event.style.animationDelay = `${index * 0.1}s`;
        }, 10);
    });
}

function createRippleEffect(element, event) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// ============================================
// 6. Statistics Animation
// ============================================
function initStatsAnimation() {
    const stats = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                animateStatNumber(stat);
                statsObserver.unobserve(stat);
            }
        });
    }, observerOptions);
    
    stats.forEach(stat => {
        statsObserver.observe(stat);
    });
}

function animateStatNumber(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const updateNumber = () => {
        current += increment;
        if (current >= target) {
            current = target;
            
            // Format final number
            let displayValue = target;
            if (target >= 1000) {
                displayValue = target.toLocaleString();
            }
            
            // Add suffix if exists
            const suffix = element.dataset.suffix || '';
            element.innerHTML = displayValue + suffix;
            
            // Add completion effect
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 300);
            
            return;
        }
        
        element.textContent = Math.floor(current);
        requestAnimationFrame(updateNumber);
    };
    
    updateNumber();
}

// ============================================
// 7. Typewriter Effect
// ============================================
function typewriterEffect() {
    const tagline = document.querySelector('.hero-tagline');
    if (!tagline || !tagline.dataset.text) return;
    
    const text = tagline.dataset.text || tagline.textContent;
    const speed = 50;
    let index = 0;
    
    tagline.textContent = '';
    tagline.style.visibility = 'visible';
    
    function type() {
        if (index < text.length) {
            tagline.textContent += text.charAt(index);
            index++;
            setTimeout(type, speed);
        } else {
            // Add cursor blink effect
            tagline.innerHTML = text + '<span class="cursor">|</span>';
        }
    }
    
    // Start typing after delay
    setTimeout(type, 1500);
}

// ============================================
// 8. Testimonials Carousel
// ============================================
function initTestimonials() {
    const testimonials = document.querySelector('.testimonials-carousel');
    if (!testimonials) return;
    
    const slides = testimonials.querySelectorAll('.testimonial-slide');
    const dots = testimonials.querySelectorAll('.dot');
    let currentSlide = 0;
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    // Auto-play
    setInterval(nextSlide, 5000);
    
    // Manual navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
}

// ============================================
// 9. Home Page Particles
// ============================================
function initHomeParticles() {
    const particlesContainer = document.querySelector('.particles-container');
    if (!particlesContainer) return;
    
    // Create special particles for home page
    const particleTypes = [
        { class: 'particle-circle', symbol: '○', color: 'var(--primary-pink)' },
        { class: 'particle-triangle', symbol: '△', color: 'var(--secondary-teal)' },
        { class: 'particle-square', symbol: '□', color: 'var(--accent-gold)' }
    ];
    
    for (let i = 0; i < 15; i++) {
        const type = particleTypes[i % 3];
        const particle = document.createElement('div');
        particle.className = `shape-particle ${type.class}`;
        particle.textContent = type.symbol;
        particle.style.cssText = `
            position: absolute;
            font-size: ${Math.random() * 20 + 10}px;
            color: ${type.color};
            opacity: ${Math.random() * 0.3 + 0.1};
            left: ${Math.random() * 100}%;
            animation: floatShape ${Math.random() * 10 + 15}s infinite linear;
            animation-delay: ${Math.random() * 10}s;
        `;
        particlesContainer.appendChild(particle);
    }
}

// ============================================
// 10. Scroll Indicator
// ============================================
function initScrollIndicator() {
    const indicator = document.querySelector('.scroll-indicator');
    if (!indicator) return;
    
    // Hide indicator on scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            indicator.style.opacity = '0';
            indicator.style.pointerEvents = 'none';
        } else {
            indicator.style.opacity = '1';
            indicator.style.pointerEvents = 'auto';
        }
        
        // Show/hide based on scroll position
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (window.scrollY < 100) {
                indicator.style.opacity = '1';
            }
        }, 1000);
    });
    
    // Smooth scroll on click
    indicator.addEventListener('click', () => {
        const target = document.querySelector('#features');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// ============================================
// 11. Squid Game Special Effects
// ============================================
function initSquidGameEffects() {
    // Add red light / green light effect to hero
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    let isGreenLight = true;
    const lightIndicator = document.createElement('div');
    lightIndicator.className = 'light-indicator';
    lightIndicator.innerHTML = '<span class="light-text">GREEN LIGHT</span>';
    hero.appendChild(lightIndicator);
    
    setInterval(() => {
        isGreenLight = !isGreenLight;
        
        if (isGreenLight) {
            lightIndicator.innerHTML = '<span class="light-text green">GREEN LIGHT</span>';
            lightIndicator.style.background = 'rgba(15, 186, 129, 0.2)';
            lightIndicator.style.borderColor = 'var(--secondary-teal)';
        } else {
            lightIndicator.innerHTML = '<span class="light-text red">RED LIGHT</span>';
            lightIndicator.style.background = 'rgba(237, 27, 118, 0.2)';
            lightIndicator.style.borderColor = 'var(--primary-pink)';
            
            // Freeze animations briefly
            document.querySelectorAll('.particle').forEach(p => {
                p.style.animationPlayState = 'paused';
                setTimeout(() => {
                    p.style.animationPlayState = 'running';
                }, 2000);
            });
        }
    }, 5000);
    
    // Add doll sound effect (optional)
    addSoundEffects();
}

function addSoundEffects() {
    // Create audio elements for sound effects
    const sounds = {
        hover: new Audio('assests/sounds/hover.mp3'),
        click: new Audio('assests/sounds/click.mp3'),
        success: new Audio('assests/sounds/success.mp3')
    };
    
    // Set volumes
    Object.values(sounds).forEach(sound => {
        sound.volume = 0.3;
    });
    
    // Add hover sound to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            sounds.hover.currentTime = 0;
            sounds.hover.play().catch(() => {});
        });
        
        btn.addEventListener('click', () => {
            sounds.click.currentTime = 0;
            sounds.click.play().catch(() => {});
        });
    });
}

// ============================================
// 12. Dynamic Content Loading
// ============================================
function loadDynamicContent() {
    // Load latest announcements
    loadAnnouncements();
    
    // Load sponsor logos
    loadSponsors();
}

function loadAnnouncements() {
    const announcementBar = document.querySelector('.announcement-bar');
    if (!announcementBar) return;
    
   
    
    let currentIndex = 0;
    
    function showNextAnnouncement() {
        announcementBar.style.opacity = '0';
        setTimeout(() => {
            announcementBar.textContent = announcements[currentIndex];
            announcementBar.style.opacity = '1';
            currentIndex = (currentIndex + 1) % announcements.length;
        }, 500);
    }
    
    showNextAnnouncement();
    setInterval(showNextAnnouncement, 5000);
}

function loadSponsors() {
    const sponsorsGrid = document.querySelector('.sponsors-grid');
    if (!sponsorsGrid) return;
    
    const sponsors = [
        { name: 'Tech Corp', logo: 'sponsor1.png' },
        { name: 'Innovation Labs', logo: 'sponsor2.png' },
        { name: 'Digital Future', logo: 'sponsor3.png' },
        { name: 'Code Masters', logo: 'sponsor4.png' }
    ];
    
    sponsors.forEach((sponsor, index) => {
        const sponsorElement = document.createElement('div');
        sponsorElement.className = 'sponsor-logo';
        sponsorElement.innerHTML = `
            <img src="assests/sponsors/${sponsor.logo}" alt="${sponsor.name}" 
                 onerror="this.src='assests/placeholder-sponsor.png'">
        `;
        sponsorElement.style.animationDelay = `${index * 0.1}s`;
        sponsorsGrid.appendChild(sponsorElement);
    });
}

// ============================================
// 13. Performance Monitoring
// ============================================
function monitorPerformance() {
    // Monitor page load time
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page loaded in ${loadTime}ms`);
        
        // Send analytics if needed
        if (loadTime > 3000) {
            console.warn('Page load time is slow. Consider optimizing resources.');
        }
    });
    
    // Monitor FPS for animations
    let lastTime = performance.now();
    let frames = 0;
    
    function checkFPS() {
        frames++;
        const currentTime = performance.now();
        
        if (currentTime >= lastTime + 1000) {
            const fps = Math.round((frames * 1000) / (currentTime - lastTime));
            
            if (fps < 30) {
                // Reduce animations on low-end devices
                document.body.classList.add('reduce-motion');
            }
            
            frames = 0;
            lastTime = currentTime;
        }
        
        requestAnimationFrame(checkFPS);
    }
    
    // Start monitoring after page load
    setTimeout(checkFPS, 1000);
}

// ============================================
// 14. Initialize Everything
// ============================================
window.addEventListener('load', () => {
    loadDynamicContent();
    monitorPerformance();
});

// Add necessary styles for new elements
const homeStyles = document.createElement('style');
homeStyles.textContent = `
    .video-control-btn {
        position: absolute;
        bottom: 30px;
        left: 30px;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid var(--primary-pink);
        color: var(--primary-pink);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10;
        transition: var(--transition-normal);
    }
    
    .video-control-btn:hover {
        background: var(--primary-pink);
        color: var(--text-primary);
    }
    
    .light-indicator {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(237, 27, 118, 0.2);
    border: 2px solid var(--primary-pink);
    padding: 10px 20px;
    border-radius: 30px;
    z-index: 1001;  /* ✅ ABOVE NAVBAR */
    transition: all 0.5s ease;
}
    
    .light-text {
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 0.9rem;
        letter-spacing: 2px;
        text-transform: uppercase;
    }
    
    .light-text.green {
        color: var(--secondary-teal);
    }
    
    .light-text.red {
        color: var(--primary-pink);
    }
    
    .cursor {
        animation: cursorBlink 1s infinite;
    }
    
    @keyframes cursorBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
    }
    
    @keyframes floatShape {
        0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 0.2;
        }
        90% {
            opacity: 0.2;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(237, 27, 118, 0.3);
        transform: scale(0);
        animation: rippleEffect 0.6s ease-out;
    }
    
    @keyframes rippleEffect {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    .event-started-message {
        text-align: center;
        animation: pulse 2s ease-in-out infinite;
    }
    
    .event-started-message h3 {
        color: var(--secondary-teal);
        font-size: 1.5rem;
        margin-bottom: 10px;
    }
    
    .reduce-motion * {
        animation: none !important;
        transition: none !important;
    }
`;
document.head.appendChild(homeStyles);

// Export for debugging
window.HomePageManager = {
    initBackgroundVideo,
    initCountdownTimer,
    initEventTabs,
    filterEvents,
    initSquidGameEffects
};

console.log('🏠 Home page loaded successfully!');