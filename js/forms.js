async function handleRegistration(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('.nav-btn.submit');

    // Validate all steps
    for (let i = 1; i <= totalSteps; i++) {
        if (!validateStep(i)) {
            currentStep = i;
            showStep(i);
            updateProgress(i);
            shakeForm();
            return;
        }
    }

    // Check terms
    const termsCheckbox = form.querySelector('#terms');
    if (!termsCheckbox || !termsCheckbox.checked) {
        showFieldError('terms', 'You must accept the terms and conditions');
        return;
    }

    // Validate payment screenshot
    const screenshotInput = form.querySelector('#payment-screenshot');
    if (!screenshotInput || !screenshotInput.files.length) {
        showFieldError('screenshot', 'Payment screenshot is required');
        return;
    }

    // Show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    try {
        // Create FormData for file upload
        const formDataObj = new FormData(form);

        // Call Flask API
        const response = await fetch('/api/register', {
            method: 'POST',
            body: formDataObj
        });

        const result = await response.json();

        if (!result.success) {
            // Check if registration is closed
            if (result.registrationsClosed) {
                showRegistrationClosedPopup(result.message);
                return;
            }
            throw new Error(result.message || 'Registration failed');
        }

        // Show success modal with EPOCH ID
        showRegistrationSuccess(result.epochId);

    } catch (error) {
        alert(`Registration failed: ${error.message}`);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Complete Registration';
    }
}

function collectFormData(form) {
    const formData = new FormData(form);
    const data = {};

    // Basic fields
    for (let [key, value] of formData.entries()) {
        if (data[key]) {
            // Handle multiple values (checkboxes)
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    }

    // Get selected events
    const selectedEvents = [];
    document.querySelectorAll('.event-checkbox:checked').forEach(checkbox => {
        selectedEvents.push(checkbox.value);
    });
    data.events = selectedEvents;

    return data;
}

async function simulateRegistration(data) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check for duplicate email (demo)
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    if (existingUsers.some(user => user.email === data.email)) {
        throw new Error('This email is already registered');
    }

    return true;
}

function storeUserData(data) {
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    existingUsers.push({
        ...data,
        registrationDate: new Date().toISOString()
    });
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

    // Auto-login
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', data.name);
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('playerNumber', data.playerNumber);
}

function showRegistrationSuccess(epochId) {
    const modal = document.querySelector('.success-modal');
    if (modal) {
        // Update modal content for EPOCH ID
        const playerNumLabel = modal.querySelector('.player-number-label');
        if (playerNumLabel) playerNumLabel.textContent = 'Your EPOCH ID';

        const playerNumDisplay = modal.querySelector('.player-number-value');
        if (playerNumDisplay) playerNumDisplay.textContent = epochId;

        modal.classList.add('show');
        modal.classList.add('active');

        // Confetti effect
        createConfetti();

        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 5000);
    }
}

// ============================================
// 4. Multi-Step Form Navigation
// ============================================
let currentStep = 1;
const totalSteps = 3;

function initFormStepNavigation() {
    const form = document.getElementById('registration-form');
    if (!form) {
        console.log('Registration form not found');
        return;
    }

    console.log('Initializing form step navigation');
    const nextBtns = document.querySelectorAll('.nav-btn.next');
    const prevBtns = document.querySelectorAll('.nav-btn.prev');

    console.log('Found next buttons:', nextBtns.length);
    console.log('Found prev buttons:', prevBtns.length);

    // Next button handlers
    nextBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Next button clicked, current step:', currentStep);
            if (validateStep(currentStep)) {
                currentStep++;
                showStep(currentStep);
                updateProgress(currentStep);
                updateNavigationAlignment();
            } else {
                shakeForm();
            }
        });
    });

    // Previous button handlers
    prevBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Previous button clicked, current step:', currentStep);
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
                updateProgress(currentStep);
                updateNavigationAlignment();
            }
        });
    });

    // Form submission handler
    form.addEventListener('submit', handleRegistration);

    // Initialize first step
    showStep(1);
    updateProgress(1);
    updateNavigationAlignment();
}

function updateNavigationAlignment() {
    // Update navigation button alignment based on visible buttons
    const formSteps = document.querySelectorAll('.form-step');
    formSteps.forEach(step => {
        const navigation = step.querySelector('.form-navigation');
        if (navigation) {
            const prevBtn = navigation.querySelector('.nav-btn.prev');
            const hasNoPrevButton = !prevBtn || window.getComputedStyle(prevBtn).display === 'none';
            
            if (hasNoPrevButton) {
                navigation.classList.add('only-next');
            } else {
                navigation.classList.remove('only-next');
            }
        }
    });
}

function validateStep(step) {
    const stepElement = document.getElementById(`step-${step}`);
    if (!stepElement) {
        console.log('❌ Step element not found:', step);
        return false;
    }

    console.log('✅ Validating step', step);
    const requiredFields = stepElement.querySelectorAll('input[required], select[required]');
    let isValid = true;

    console.log('Found', requiredFields.length, 'required fields in step', step);

    requiredFields.forEach((field, index) => {
        const fieldValue = field.value ? field.value.trim() : '';
        console.log(`  Field ${index + 1}: ${field.id} = "${fieldValue}" (empty: ${!fieldValue})`);
        
        clearFieldError(field.id);

        if (!fieldValue) {
            // Get field name from label
            const label = field.parentElement.querySelector('label');
            const fieldName = label ? label.textContent.replace(' *', '').trim() : (field.name || 'This field');
            console.log(`  ❌ Field ${field.id} is empty - showing error`);
            showFieldError(field.id, `${fieldName} is required`);
            isValid = false;
        } else if (field.type === 'email' && !validateEmail(fieldValue)) {
            console.log(`  ❌ Field ${field.id} has invalid email`);
            showFieldError(field.id, 'Please enter a valid email address');
            isValid = false;
        } else if (field.type === 'tel' && !validatePhone(fieldValue)) {
            console.log(`  ❌ Field ${field.id} has invalid phone`);
            showFieldError(field.id, 'Please enter a valid 10-digit phone number');
            isValid = false;
        } else if (field.id === 'confirm-password') {
            const password = document.getElementById('password');
            if (password && fieldValue !== password.value) {
                console.log(`  ❌ Field ${field.id} doesn't match password`);
                showFieldError(field.id, 'Passwords do not match');
                isValid = false;
            }
        } else if (field.id === 'password') {
            // Check minimum password length
            if (fieldValue.length < 6) {
                console.log(`  ❌ Field ${field.id} is too short`);
                showFieldError(field.id, 'Password must be at least 6 characters');
                isValid = false;
            }
        }
        
        if (isValid) {
            console.log(`  ✅ Field ${field.id} is valid`);
        }
    });

    console.log(`Step ${step} validation result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    return isValid;
}

function showStep(step) {
    const steps = document.querySelectorAll('.form-step');
    steps.forEach((stepEl, index) => {
        stepEl.classList.toggle('active', index + 1 === step);
    });

    // Scroll to top of form smoothly
    const registrationCard = document.querySelector('.registration-card');
    if (registrationCard) {
        registrationCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function updateProgress(step) {
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLine = document.querySelector('.progress-line-active');

    progressSteps.forEach((stepEl, index) => {
        const stepNum = index + 1;
        if (stepNum < step) {
            stepEl.classList.add('completed');
            stepEl.classList.remove('active');
        } else if (stepNum === step) {
            stepEl.classList.add('active');
            stepEl.classList.remove('completed');
        } else {
            stepEl.classList.remove('active', 'completed');
        }
    });

    // Update progress line
    if (progressLine) {
        const progress = ((step - 1) / (totalSteps - 1)) * 100;
        progressLine.style.width = `${progress}%`;
    }
}

// ============================================
// 5. Event Selection Handler
// ============================================
function initEventSelection() {
    const eventCards = document.querySelectorAll('.event-select-card');
    const maxEvents = 5; // Maximum events allowed

    eventCards.forEach(card => {
        card.addEventListener('click', () => {
            const checkbox = card.querySelector('.event-checkbox');
            const selectedCount = document.querySelectorAll('.event-checkbox:checked').length;

            if (!checkbox.checked && selectedCount >= maxEvents) {
                showEventLimitMessage();
                return;
            }

            checkbox.checked = !checkbox.checked;
            card.classList.toggle('selected', checkbox.checked);

            // Update counter
            updateEventCounter();

            // Add animation
            if (checkbox.checked) {
                card.style.animation = 'selectPulse 0.3s ease';
                setTimeout(() => {
                    card.style.animation = '';
                }, 300);
            }
        });
    });
}

function updateEventCounter() {
    const selectedCount = document.querySelectorAll('.event-checkbox:checked').length;
    const counterElement = document.querySelector('.event-counter');

    if (counterElement) {
        counterElement.textContent = `${selectedCount} event(s) selected`;
        counterElement.className = `event-counter ${selectedCount > 0 ? 'active' : ''}`;
    }
}

function showEventLimitMessage() {
    const toast = document.createElement('div');
    toast.className = 'limit-toast';
    toast.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>Maximum 5 events allowed per participant</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// 5. Password Features
// ============================================
function initPasswordToggles() {
    console.log('Initializing password toggles...');
    const toggles = document.querySelectorAll('.password-toggle');
    console.log('Found', toggles.length, 'password toggles');
    
    toggles.forEach((toggle, index) => {
        console.log('Setting up toggle', index + 1);
        
        // Remove any existing listeners
        const newToggle = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(newToggle, toggle);
        
        newToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Password toggle clicked');
            
            // Find the input field
            const inputWrapper = newToggle.closest('.login-input-wrapper, .floating-label');
            const input = inputWrapper ? inputWrapper.querySelector('input[type="password"], input[type="text"]') : null;
            const icon = newToggle.querySelector('i');
            
            console.log('Found input:', !!input);
            console.log('Found icon:', !!icon);

            if (input && icon) {
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                    console.log('Changed to text');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                    console.log('Changed to password');
                }
            }
        });
    });
    
    console.log('Password toggles initialized');
}

function initPasswordStrength() {
    const passwordInput = document.getElementById('password');
    if (!passwordInput) return;

    const strengthMeter = document.createElement('div');
    strengthMeter.className = 'password-strength-meter';
    strengthMeter.innerHTML = `
        <div class="strength-bars">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
        </div>
        <span class="strength-text">Password Strength</span>
    `;

    // Append to password field
    passwordInput.parentElement.appendChild(strengthMeter);

    // Add hidden ghost meter under Confirm Password to keep equal height/alignment
    const confirmInput = document.getElementById('confirm-password');
    if (confirmInput) {
        const ghostMeter = strengthMeter.cloneNode(true);
        ghostMeter.classList.add('ghost-meter');
        ghostMeter.style.visibility = 'hidden';
        ghostMeter.style.pointerEvents = 'none';
        confirmInput.parentElement.appendChild(ghostMeter);
    }

    passwordInput.addEventListener('input', () => {
        const strength = calculatePasswordStrength(passwordInput.value);
        updateStrengthMeter(strengthMeter, strength);
    });
}

function calculatePasswordStrength(password) {
    let strength = 0;

    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    return Math.min(strength, 4);
}

function updateStrengthMeter(meter, strength) {
    const bars = meter.querySelectorAll('.bar');
    const text = meter.querySelector('.strength-text');
    const strengthLevels = ['Weak', 'Fair', 'Good', 'Strong'];
    // No green; use red -> orange -> gold -> pink
    const colors = ['#ff4757', '#ffa502', '#ffd700', '#ED1B76'];

    bars.forEach((bar, index) => {
        if (index < strength) {
            bar.style.background = colors[strength - 1];
            bar.style.opacity = '1';
        } else {
            bar.style.background = '#333';
            bar.style.opacity = '0.3';
        }
    });

    text.textContent = strengthLevels[Math.max(0, strength - 1)];
    text.style.color = colors[Math.max(0, strength - 1)];
}

// ============================================
// 6. Social Login Handlers
// ============================================
function initSocialLogins() {
    const socialButtons = document.querySelectorAll('.social-btn');

    socialButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const provider = btn.classList.contains('google') ? 'Google' : 'Facebook';
            handleSocialLogin(provider);
        });
    });
}

function handleSocialLogin(provider) {
    // Show loading
    const loadingModal = createSocialLoadingModal(provider);
    document.body.appendChild(loadingModal);

    // Simulate OAuth flow
    setTimeout(() => {
        loadingModal.remove();

        // Simulate success
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', `${provider} User`);
        localStorage.setItem('playerNumber', generatePlayerNumber());

        showLoginSuccess(`${provider} User`);

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }, 2000);
}

function createSocialLoadingModal(provider) {
    const modal = document.createElement('div');
    modal.className = 'social-loading-modal';
    modal.innerHTML = `
        <div class="social-loading-content">
            <i class="fab fa-${provider.toLowerCase()} fa-spin"></i>
            <p>Connecting to ${provider}...</p>
        </div>
    `;
    return modal;
}

// ============================================
// 7. Helper Functions
// ============================================
function initRememberMe() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        const usernameField = document.getElementById('login-username');
        const rememberCheckbox = document.getElementById('remember-me');

        if (usernameField) usernameField.value = rememberedUser;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }
}

function initTermsCheckbox() {
    const termsCheckbox = document.getElementById('terms');
    const submitBtn = document.querySelector('.nav-btn.submit');

    if (termsCheckbox && submitBtn) {
        termsCheckbox.addEventListener('change', () => {
            submitBtn.disabled = !termsCheckbox.checked;
            submitBtn.style.opacity = termsCheckbox.checked ? '1' : '0.5';
        });
    }
}

function initDemoCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.dataset.copy;
            if (text) {
                copyToClipboard(text);

                // Visual feedback
                const icon = btn.querySelector('i');
                icon.classList.remove('fa-copy');
                icon.classList.add('fa-check');

                setTimeout(() => {
                    icon.classList.remove('fa-check');
                    icon.classList.add('fa-copy');
                }, 2000);
            }
        });
    });
}

function initFormValidation() {
    // Add validation styles (no green)
    const style = document.createElement('style');
    style.textContent = `
        .field-error {
            color: #ff4757;
            font-size: 0.8rem;
            margin-top: 5px;
            display: none;
        }
        
        .field-error.show {
            display: block;
            animation: shake 0.3s;
        }
        
        .input-error {
            border-color: #ff4757 !important;
            background: rgba(255, 71, 87, 0.05) !important;
        }
        
        .field-success {
            border-color: var(--primary-pink) !important;
            background: rgba(237, 27, 118, 0.05) !important;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.add('input-error');
    field.classList.remove('field-success');

    // Look for error element with ID pattern (e.g., 'name-error' for 'full-name')
    let errorId = fieldId + '-error';
    // Handle special cases like 'full-name' -> 'name-error'
    if (fieldId === 'full-name') errorId = 'name-error';
    
    let errorEl = document.getElementById(errorId);
    
    // If not found by ID, look for .field-error in parent
    if (!errorEl) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            errorEl = formGroup.querySelector('.field-error');
        }
    }
    
    // If still not found, create one
    if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'field-error';
        errorEl.id = errorId;
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.appendChild(errorEl);
        } else {
            field.parentElement.appendChild(errorEl);
        }
    }

    errorEl.textContent = message;
    errorEl.classList.add('show');
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.remove('input-error');
    
    // Look for error element with ID pattern
    let errorId = fieldId + '-error';
    if (fieldId === 'full-name') errorId = 'name-error';
    
    let errorEl = document.getElementById(errorId);
    
    // If not found by ID, look for .field-error in parent
    if (!errorEl) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            errorEl = formGroup.querySelector('.field-error');
        }
    }
    
    if (errorEl) {
        errorEl.classList.remove('show');
        errorEl.textContent = '';
    }
}

function shakeForm() {
    const form = document.querySelector('.registration-card') || document.querySelector('.login-card');
    if (form) {
        form.style.animation = 'shake 0.5s';
        setTimeout(() => {
            form.style.animation = '';
        }, 500);
    }
}

function createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'login-loading';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.querySelector('.login-card')?.appendChild(overlay);
    return overlay;
}

function createSuccessOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'login-success';
    overlay.innerHTML = `
        <div class="success-checkmark">
            <i class="fas fa-check"></i>
        </div>
        <div class="success-message">Login Successful!</div>
        <div class="welcome-player"></div>
    `;
    document.querySelector('.login-card')?.appendChild(overlay);
    return overlay;
}

function createConfetti() {
    // No green in confetti
    const colors = ['#ED1B76', '#FFD700', '#FF4D94', '#ffa502'];
    const confettiCount = 100;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            top: -10px;
            opacity: ${Math.random() + 0.5};
            transform: rotate(${Math.random() * 360}deg);
            animation: confettiFall ${Math.random() * 2 + 2}s ease-out;
        `;
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4000);
    }
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[0-9]{10}$/.test(phone);
}

function generatePlayerNumber() {
    return Math.floor(Math.random() * 456) + 1;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function playSound(type) {
    try {
        const audio = new Audio(`assets/sounds/${type}.mp3`);
        audio.volume = 0.3;
        audio.play();
    } catch (e) {
        console.log('Audio not available');
    }
}

// Add animation styles
const formStyles = document.createElement('style');
formStyles.textContent = `
    @keyframes selectPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
    
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    .password-strength-meter {
        margin-top: 10px;
    }
    
    .strength-bars {
        display: flex;
        gap: 5px;
        margin-bottom: 5px;
    }
    
    .strength-bars .bar {
        flex: 1;
        height: 4px;
        background: #333;
        border-radius: 2px;
        transition: all 0.3s;
    }
    
    .strength-text {
        font-size: 0.8rem;
        color: #666;
        transition: color 0.3s;
    }
    
    .event-counter {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-card);
        border: 2px solid var(--primary-pink);
        padding: 10px 20px;
        border-radius: 30px;
        font-weight: 600;
        opacity: 0;
        transition: opacity 0.3s;
        z-index: 100;
    }
    
    .event-counter.active {
        opacity: 1;
    }
    
    .error-toast,
    .limit-toast {
        position: fixed;
        top: 100px;
        right: 30px;
        background: var(--bg-card);
        border-left: 4px solid #ff4757;
        padding: 15px 20px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateX(150%);
        transition: transform 0.3s;
        z-index: 1000;
    }
    
    .limit-toast {
        border-left-color: var(--accent-gold);
    }
    
    .error-toast.show,
    .limit-toast.show {
        transform: translateX(0);
    }
    
    .social-loading-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    }
    
    .social-loading-content {
        text-align: center;
        color: white;
    }
    
    .social-loading-content i {
        font-size: 3rem;
        margin-bottom: 20px;
    }
`;
document.head.appendChild(formStyles);

// ============================================
// 8. Event Registration Module
// ============================================

// Define which events use the EPOCH ID based form (2 participants)
const EPOCH_FORM_EVENTS = [
    'paper-presentation',
    'binary-battle',
    'prompt-arena',
    'connection',
    'flipflop'
];

// Events that have 3 participants (optional 3rd)
const THREE_PARTICIPANT_EVENTS = [
    'paper-presentation'
];

// Define Tech and Non-Tech events for registration limits
const TECH_EVENTS = [
    'paper-presentation',
    'binary-battle',
    'prompt-arena'
];

const NONTECH_EVENTS = [
    'connection',
    'flipflop'
];

// Registration limits per EPOCH ID
const MAX_TECH_EVENTS = 2;
const MAX_NONTECH_EVENTS = 1;

function initEventRegistration() {
    const modal = document.getElementById('eventRegisterModal');
    const closeBtn = document.getElementById('closeEventModal');
    const form = document.getElementById('eventRegistrationForm');
    const registerButtons = document.querySelectorAll('.register-event-btn');
    const addMember3Btn = document.getElementById('addMember3Btn');
    const member3Section = document.getElementById('member3Section');
    const addParticipant3Btn = document.getElementById('addParticipant3Btn');
    const participant3Section = document.getElementById('participant3Section');

    if (!modal) return;

    // Open modal when clicking register button
    registerButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();

            // Check if user is logged in
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            const epochId = localStorage.getItem('epochId');

            if (!isLoggedIn || !epochId) {
                // Show login required message
                showToast('Please login to register for events', 'error');
                // Redirect to login page after a short delay
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }

            const eventId = this.dataset.eventId;
            const eventName = this.dataset.eventName;
            const eventFee = this.dataset.eventFee;
            const teamMin = this.dataset.eventTeamMin;
            const teamMax = this.dataset.eventTeamMax;

            openEventModal(eventId, eventName, eventFee, teamMin, teamMax);
        });
    });

    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', closeEventModal);
    }

    // Close on backdrop click
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeEventModal();
        }
    });

    // Close on ESC key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeEventModal();
        }
    });

    // Add Member 3 (Standard form)
    if (addMember3Btn && member3Section) {
        addMember3Btn.addEventListener('click', function () {
            member3Section.style.display = 'block';
            this.style.display = 'none';
            member3Section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    // Add Participant 3 (Paper Presentation form)
    if (addParticipant3Btn && participant3Section) {
        addParticipant3Btn.addEventListener('click', function () {
            participant3Section.style.display = 'block';
            this.style.display = 'none';
            participant3Section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            handleEventRegistration();
        });
    }
}

function openEventModal(eventId, eventName, eventFee, teamMin, teamMax) {
    const modal = document.getElementById('eventRegisterModal');
    const addMember3Btn = document.getElementById('addMember3Btn');
    const member3Section = document.getElementById('member3Section');
    const addParticipant3Btn = document.getElementById('addParticipant3Btn');
    const participant3Section = document.getElementById('participant3Section');

    // Paper Presentation specific elements
    const paperPresentationFields = document.getElementById('paperPresentationFields');
    const teamNameSection = document.getElementById('teamNameSection');
    const participant1Section = document.getElementById('participant1Section');
    const participant2Section = document.getElementById('participant2Section');

    // Standard form elements
    const leaderSection = document.getElementById('leaderSection');
    const member2Section = document.getElementById('member2Section');

    // Reset form
    document.getElementById('eventRegistrationForm').reset();

    // Set hidden fields
    document.getElementById('eventId').value = eventId;
    document.getElementById('eventName').value = eventName;
    document.getElementById('eventTeamMin').value = teamMin;
    document.getElementById('eventTeamMax').value = teamMax;

    // Update display
    document.getElementById('modalEventName').textContent = eventName;
    document.getElementById('displayEventName').textContent = eventName;
    document.getElementById('displayFee').textContent = '₹' + eventFee + ' per team';
    document.getElementById('displayTeamSize').textContent = teamMin + '-' + teamMax + ' Members';

    const maxTeam = parseInt(teamMax);
    const isEpochForm = EPOCH_FORM_EVENTS.includes(eventId);
    const isPaperPresentation = eventId === 'paper-presentation';

    // Hide all form sections first
    if (paperPresentationFields) paperPresentationFields.style.display = 'none';
    if (teamNameSection) teamNameSection.style.display = 'none';
    if (participant1Section) participant1Section.style.display = 'none';
    if (participant2Section) participant2Section.style.display = 'none';
    if (participant3Section) participant3Section.style.display = 'none';
    if (addParticipant3Btn) addParticipant3Btn.style.display = 'none';
    if (leaderSection) leaderSection.style.display = 'none';
    if (member2Section) member2Section.style.display = 'none';
    if (member3Section) member3Section.style.display = 'none';
    if (addMember3Btn) addMember3Btn.style.display = 'none';

    // Toggle form sections based on event type
    if (isEpochForm) {
        if (isPaperPresentation) {
            if (paperPresentationFields) paperPresentationFields.style.display = 'block';
            if (addParticipant3Btn) addParticipant3Btn.style.display = 'block';
        } else {
            if (teamNameSection) teamNameSection.style.display = 'block';
        }

        if (participant1Section) participant1Section.style.display = 'block';
        if (participant2Section) participant2Section.style.display = 'block';
    } else {
        if (leaderSection) leaderSection.style.display = 'block';
        if (member2Section) member2Section.style.display = 'block';

        if (maxTeam >= 3 && addMember3Btn) {
            addMember3Btn.style.display = 'block';
        }
    }

    // Pre-fill user data if logged in
    prefillUserData(isEpochForm);

    // Open modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeEventModal() {
    const modal = document.getElementById('eventRegisterModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function prefillUserData(isEpochForm) {
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userPhone = localStorage.getItem('userPhone');
    const userCollege = localStorage.getItem('userCollege');
    const epochId = localStorage.getItem('epochId');

    if (isEpochForm) {
        const p1EpochId = document.getElementById('participant1EpochId');
        const p1Name = document.getElementById('participant1Name');
        const p1College = document.getElementById('participant1College');
        const p1Mobile = document.getElementById('participant1Mobile');

        if (epochId && p1EpochId) p1EpochId.value = epochId;
        if (userName && p1Name) p1Name.value = userName;
        if (userCollege && p1College) p1College.value = userCollege;
        if (userPhone && p1Mobile) p1Mobile.value = userPhone;
    } else {
        const leaderName = document.getElementById('leaderName');
        const leaderEmail = document.getElementById('leaderEmail');
        const leaderPhone = document.getElementById('leaderPhone');
        const leaderCollege = document.getElementById('leaderCollege');

        if (userName && leaderName) leaderName.value = userName;
        if (userEmail && leaderEmail) leaderEmail.value = userEmail;
        if (userPhone && leaderPhone) leaderPhone.value = userPhone;
        if (userCollege && leaderCollege) leaderCollege.value = userCollege;
    }
}

function showLimitExceededPopup(message) {
    const overlay = document.createElement('div');
    overlay.className = 'limit-popup-overlay';
    overlay.innerHTML = `
        <div class="limit-popup">
            <div class="limit-popup-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Registration Limit Reached!</h3>
            <p>${message}</p>
            <div class="limit-info">
                <div class="limit-item">
                    <i class="fas fa-microchip"></i>
                    <span>Tech Events: Max ${MAX_TECH_EVENTS} per participant</span>
                </div>
                <div class="limit-item">
                    <i class="fas fa-palette"></i>
                    <span>Non-Tech Events: Max ${MAX_NONTECH_EVENTS} per participant</span>
                </div>
            </div>
            <button class="btn btn-primary" onclick="this.closest('.limit-popup-overlay').remove()">
                <i class="fas fa-check"></i> Got it
            </button>
        </div>
    `;

    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;

    const popup = overlay.querySelector('.limit-popup');
    popup.style.cssText = `
        background: linear-gradient(145deg, #1a1a2e, #16213e);
        border: 2px solid #ED1B76;
        border-radius: 20px;
        padding: 40px;
        max-width: 450px;
        text-align: center;
        animation: scaleIn 0.3s ease;
        box-shadow: 0 20px 60px rgba(237, 27, 118, 0.3);
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

function showEventFullPopup(eventName, currentCount, maxLimit, message) {
    const overlay = document.createElement('div');
    overlay.className = 'event-full-popup-overlay';
    overlay.innerHTML = `
        <div class="event-full-popup">
            <div class="event-full-icon">
                <i class="fas fa-users-slash"></i>
            </div>
            <h3>Event Registration Closed!</h3>
            <div class="event-full-badge">
                <i class="fas fa-file-alt"></i>
                <span>${eventName}</span>
            </div>
            <p class="event-full-message">${message}</p>
            <div class="event-full-stats">
                <div class="stat-item">
                    <i class="fas fa-check-circle"></i>
                    <span>Registered Teams</span>
                    <strong>${currentCount}</strong>
                </div>
                <div class="stat-item">
                    <i class="fas fa-trophy"></i>
                    <span>Maximum Limit</span>
                    <strong>${maxLimit}</strong>
                </div>
            </div>
            <div class="event-full-note">
                <i class="fas fa-info-circle"></i>
                <p>Try registering for other exciting events available!</p>
            </div>
            <button class="btn btn-primary btn-close-full" onclick="this.closest('.event-full-popup-overlay').remove()">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
    `;

    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
        backdrop-filter: blur(5px);
    `;

    const popup = overlay.querySelector('.event-full-popup');
    popup.style.cssText = `
        background: linear-gradient(145deg, #1a1a2e, #16213e);
        border: 2px solid #ff4757;
        border-radius: 20px;
        padding: 40px;
        max-width: 500px;
        width: 90%;
        text-align: center;
        animation: bounceIn 0.5s ease;
        box-shadow: 0 20px 60px rgba(255, 71, 87, 0.4);
    `;

    // Add styles for popup elements
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounceIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
        }
        
        .event-full-icon {
            width: 100px;
            height: 100px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #ff4757 0%, #ff6348 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 30px rgba(255, 71, 87, 0.5);
            animation: iconPulse 2s ease-in-out infinite;
        }
        
        @keyframes iconPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        .event-full-icon i {
            font-size: 3rem;
            color: white;
        }
        
        .event-full-popup h3 {
            font-family: 'Orbitron', sans-serif;
            font-size: 1.8rem;
            color: #ff4757;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .event-full-badge {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: rgba(237, 27, 118, 0.2);
            padding: 10px 20px;
            border-radius: 25px;
            border: 1px solid var(--primary-pink);
            margin-bottom: 20px;
        }
        
        .event-full-badge i {
            color: var(--primary-pink);
            font-size: 1.2rem;
        }
        
        .event-full-badge span {
            color: var(--text-primary);
            font-weight: 600;
        }
        
        .event-full-message {
            color: var(--text-secondary);
            font-size: 1rem;
            line-height: 1.6;
            margin-bottom: 25px;
            padding: 0 20px;
        }
        
        .event-full-stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 25px;
        }
        
        .stat-item {
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .stat-item i {
            font-size: 1.5rem;
            color: var(--primary-pink);
            display: block;
            margin-bottom: 8px;
        }
        
        .stat-item span {
            display: block;
            color: var(--text-muted);
            font-size: 0.8rem;
            margin-bottom: 5px;
        }
        
        .stat-item strong {
            display: block;
            color: var(--text-primary);
            font-size: 1.5rem;
            font-family: 'Orbitron', sans-serif;
        }
        
        .event-full-note {
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .event-full-note i {
            color: var(--accent-gold);
            font-size: 1.2rem;
            flex-shrink: 0;
        }
        
        .event-full-note p {
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin: 0;
            text-align: left;
        }
        
        .btn-close-full {
            width: 100%;
            padding: 15px;
            font-size: 1rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        @media (max-width: 480px) {
            .event-full-popup {
                padding: 30px 20px !important;
            }
            
            .event-full-icon {
                width: 80px;
                height: 80px;
            }
            
            .event-full-icon i {
                font-size: 2.5rem;
            }
            
            .event-full-popup h3 {
                font-size: 1.4rem;
            }
            
            .event-full-stats {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

async function handleEventRegistration() {
    const submitBtn = document.getElementById('submitEventReg');
    const originalText = submitBtn.innerHTML;
    const eventId = document.getElementById('eventId').value;
    const isEpochForm = EPOCH_FORM_EVENTS.includes(eventId);
    const isPaperPresentation = eventId === 'paper-presentation';

    if (!validateEventForm(isEpochForm, isPaperPresentation)) {
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validating...';

    let formData;
    if (isEpochForm) {
        formData = collectEpochFormData(isPaperPresentation);
    } else {
        formData = collectStandardFormData();
    }

    if (isEpochForm) {
        const epochIds = [];
        if (formData.participant1?.epochId) epochIds.push(formData.participant1.epochId);
        if (formData.participant2?.epochId) epochIds.push(formData.participant2.epochId);
        if (formData.participant3?.epochId) epochIds.push(formData.participant3.epochId);

        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validating EPOCH IDs...';

            const validateResponse = await fetch('/api/validate-epoch-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ epochIds: epochIds })
            });

            const validateResult = await validateResponse.json();

            if (!validateResult.valid) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                showLimitExceededPopup(`Invalid EPOCH IDs not found in database: ${validateResult.invalidIds.join(', ')}. Please ensure all participants have registered for EPOCH 2026 first.`);
                return;
            }
        } catch (error) {
            console.error('EPOCH ID validation error:', error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            showToast('Failed to validate EPOCH IDs. Please try again.', 'error');
            return;
        }
    }

    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';

        const registerResponse = await fetch('/api/register-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const registerResult = await registerResponse.json();

        if (registerResult.success) {
            const leaderName = isEpochForm ? formData.participant1.name : formData.leader.name;
            showEventRegistrationSuccess(registerResult.eventName, registerResult.registrationId, leaderName, registerResult.teamName);
        } else {
            if (registerResult.eventFull) {
                closeEventModal(); // Close the registration modal first
                showEventFullPopup(registerResult.eventName, registerResult.currentCount, registerResult.maxLimit, registerResult.message);
            } else if (registerResult.limitExceeded) {
                showLimitExceededPopup(registerResult.message);
            } else if (registerResult.invalidIds) {
                showLimitExceededPopup(`Invalid EPOCH IDs: ${registerResult.invalidIds.join(', ')}. Please ensure all participants have registered for EPOCH 2026 first.`);
            } else {
                showToast(registerResult.message || 'Registration failed. Please try again.', 'error');
            }
        }

        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

    } catch (error) {
        console.error('Registration error:', error);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        showToast('Failed to submit registration. Please try again.', 'error');
    }
}

function collectEpochFormData(isPaperPresentation) {
    const teamNameEl = isPaperPresentation ? document.getElementById('teamName') : document.getElementById('teamNameOnly');

    return {
        eventId: document.getElementById('eventId').value,
        eventName: document.getElementById('eventName').value,
        teamName: teamNameEl ? teamNameEl.value.trim() : '',
        paperTitle: isPaperPresentation ? (document.getElementById('paperTitle')?.value.trim() || '') : '',
        participant1: {
            epochId: document.getElementById('participant1EpochId')?.value.trim().toUpperCase() || '',
            name: document.getElementById('participant1Name')?.value.trim() || '',
            college: document.getElementById('participant1College')?.value.trim() || '',
            mobile: document.getElementById('participant1Mobile')?.value.trim() || ''
        },
        participant2: {
            epochId: document.getElementById('participant2EpochId')?.value.trim().toUpperCase() || '',
            name: document.getElementById('participant2Name')?.value.trim() || '',
            college: document.getElementById('participant2College')?.value.trim() || '',
            mobile: document.getElementById('participant2Mobile')?.value.trim() || ''
        },
        participant3: isPaperPresentation ? {
            epochId: document.getElementById('participant3EpochId')?.value.trim().toUpperCase() || '',
            name: document.getElementById('participant3Name')?.value.trim() || '',
            college: document.getElementById('participant3College')?.value.trim() || '',
            mobile: document.getElementById('participant3Mobile')?.value.trim() || ''
        } : null,
        registrationTime: new Date().toISOString()
    };
}

function collectStandardFormData() {
    return {
        eventId: document.getElementById('eventId').value,
        eventName: document.getElementById('eventName').value,
        leader: {
            name: document.getElementById('leaderName')?.value.trim() || '',
            email: document.getElementById('leaderEmail')?.value.trim() || '',
            phone: document.getElementById('leaderPhone')?.value.trim() || '',
            college: document.getElementById('leaderCollege')?.value.trim() || ''
        },
        member2: {
            name: document.getElementById('member2Name')?.value.trim() || '',
            email: document.getElementById('member2Email')?.value.trim() || '',
            phone: document.getElementById('member2Phone')?.value.trim() || ''
        },
        member3: {
            name: document.getElementById('member3Name')?.value.trim() || '',
            email: document.getElementById('member3Email')?.value.trim() || '',
            phone: document.getElementById('member3Phone')?.value.trim() || ''
        },
        registrationTime: new Date().toISOString()
    };
}

function validateEventForm(isEpochForm, isPaperPresentation) {
    if (isEpochForm) {
        return validateEpochForm(isPaperPresentation);
    } else {
        return validateStandardForm();
    }
}

function validateEpochForm(isPaperPresentation) {
    const teamNameEl = isPaperPresentation ? document.getElementById('teamName') : document.getElementById('teamNameOnly');
    const teamName = teamNameEl ? teamNameEl.value.trim() : '';
    const paperTitle = isPaperPresentation ? (document.getElementById('paperTitle')?.value.trim() || '') : '';

    const p1EpochId = document.getElementById('participant1EpochId')?.value.trim() || '';
    const p1Name = document.getElementById('participant1Name')?.value.trim() || '';
    const p1College = document.getElementById('participant1College')?.value.trim() || '';
    const p1Mobile = document.getElementById('participant1Mobile')?.value.trim() || '';

    const p2EpochId = document.getElementById('participant2EpochId')?.value.trim() || '';
    const p2Name = document.getElementById('participant2Name')?.value.trim() || '';
    const p2College = document.getElementById('participant2College')?.value.trim() || '';
    const p2Mobile = document.getElementById('participant2Mobile')?.value.trim() || '';

    const agreeTerms = document.getElementById('agreeTerms')?.checked || false;

    if (!teamName) {
        showToast('Please enter Team Name', 'error');
        return false;
    }

    if (isPaperPresentation && !paperTitle) {
        showToast('Please enter Paper Title', 'error');
        return false;
    }

    if (!p1EpochId || !p1Name || !p1College || !p1Mobile) {
        showToast('Please fill all Participant 1 details', 'error');
        return false;
    }

    if (!p2EpochId || !p2Name || !p2College || !p2Mobile) {
        showToast('Please fill all Participant 2 details', 'error');
        return false;
    }

    const epochIdRegex = /^EPOCH\d{3}$/i;
    if (!epochIdRegex.test(p1EpochId)) {
        showToast('Please enter a valid EPOCH ID for Participant 1 (e.g., EPOCH001)', 'error');
        return false;
    }
    if (!epochIdRegex.test(p2EpochId)) {
        showToast('Please enter a valid EPOCH ID for Participant 2 (e.g., EPOCH002)', 'error');
        return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(p1Mobile)) {
        showToast('Please enter a valid 10-digit mobile number for Participant 1', 'error');
        return false;
    }
    if (!phoneRegex.test(p2Mobile)) {
        showToast('Please enter a valid 10-digit mobile number for Participant 2', 'error');
        return false;
    }

    if (isPaperPresentation) {
        const participant3Section = document.getElementById('participant3Section');
        if (participant3Section && participant3Section.style.display !== 'none') {
            const p3EpochId = document.getElementById('participant3EpochId')?.value.trim() || '';
            const p3Name = document.getElementById('participant3Name')?.value.trim() || '';
            const p3College = document.getElementById('participant3College')?.value.trim() || '';
            const p3Mobile = document.getElementById('participant3Mobile')?.value.trim() || '';

            if (p3EpochId || p3Name || p3College || p3Mobile) {
                if (!p3EpochId || !p3Name || !p3College || !p3Mobile) {
                    showToast('Please fill all Participant 3 details or leave all empty', 'error');
                    return false;
                }
                if (!epochIdRegex.test(p3EpochId)) {
                    showToast('Please enter a valid EPOCH ID for Participant 3', 'error');
                    return false;
                }
                if (!phoneRegex.test(p3Mobile)) {
                    showToast('Please enter a valid 10-digit mobile number for Participant 3', 'error');
                    return false;
                }
            }
        }
    }

    if (!agreeTerms) {
        showToast('Please agree to the terms and conditions', 'error');
        return false;
    }

    return true;
}

function validateStandardForm() {
    const leaderName = document.getElementById('leaderName')?.value.trim() || '';
    const leaderEmail = document.getElementById('leaderEmail')?.value.trim() || '';
    const leaderPhone = document.getElementById('leaderPhone')?.value.trim() || '';
    const leaderCollege = document.getElementById('leaderCollege')?.value.trim() || '';

    const member2Name = document.getElementById('member2Name')?.value.trim() || '';
    const member2Email = document.getElementById('member2Email')?.value.trim() || '';
    const member2Phone = document.getElementById('member2Phone')?.value.trim() || '';

    const agreeTerms = document.getElementById('agreeTerms')?.checked || false;

    if (!leaderName || !leaderEmail || !leaderPhone || !leaderCollege) {
        showToast('Please fill all Team Leader details', 'error');
        return false;
    }

    if (!member2Name || !member2Email || !member2Phone) {
        showToast('Please fill all Team Member 2 details', 'error');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leaderEmail)) {
        showToast('Please enter a valid email for Team Leader', 'error');
        return false;
    }
    if (!emailRegex.test(member2Email)) {
        showToast('Please enter a valid email for Member 2', 'error');
        return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(leaderPhone)) {
        showToast('Please enter a valid 10-digit phone for Team Leader', 'error');
        return false;
    }
    if (!phoneRegex.test(member2Phone)) {
        showToast('Please enter a valid 10-digit phone for Member 2', 'error');
        return false;
    }

    const member3Section = document.getElementById('member3Section');
    if (member3Section && member3Section.style.display !== 'none') {
        const member3Name = document.getElementById('member3Name')?.value.trim() || '';
        const member3Email = document.getElementById('member3Email')?.value.trim() || '';
        const member3Phone = document.getElementById('member3Phone')?.value.trim() || '';

        if (member3Name || member3Email || member3Phone) {
            if (!member3Name || !member3Email || !member3Phone) {
                showToast('Please fill all Member 3 details or leave all empty', 'error');
                return false;
            }
            if (!emailRegex.test(member3Email)) {
                showToast('Please enter a valid email for Member 3', 'error');
                return false;
            }
            if (!phoneRegex.test(member3Phone)) {
                showToast('Please enter a valid 10-digit phone for Member 3', 'error');
                return false;
            }
        }
    }

    if (!agreeTerms) {
        showToast('Please agree to the terms and conditions', 'error');
        return false;
    }

    return true;
}

function showEventRegistrationSuccess(eventName, registrationId, leaderName, teamName) {
    const modalContent = document.querySelector('.event-register-content');
    const eventId = document.getElementById('eventId').value;
    const isEpochForm = EPOCH_FORM_EVENTS.includes(eventId);
    const isPaperPresentation = eventId === 'paper-presentation';

    let teamSize = 2;
    if (isPaperPresentation) {
        const p3Name = document.getElementById('participant3Name')?.value.trim();
        if (p3Name) teamSize = 3;
    } else if (!isEpochForm) {
        const member3Name = document.getElementById('member3Name')?.value.trim();
        if (member3Name) teamSize = 3;
    }

    let additionalInfo = '';
    if (teamName) {
        additionalInfo = `<p><strong>Team Name:</strong> ${teamName}</p>`;
    }

    modalContent.innerHTML = `
        <button class="close-modal" onclick="closeEventModal()">
            <i class="fas fa-times"></i>
        </button>
        
        <div class="registration-success">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            
            <h3>Registration Successful! 🎉</h3>
            <p>Your team has been registered for <strong>${eventName}</strong></p>
            
            <div class="registration-id">
                <p>Registration ID</p>
                <span>${registrationId}</span>
                <button class="copy-btn" onclick="copyRegistrationId('${registrationId}')">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
            
            <div class="team-summary">
                <h4><i class="fas fa-users"></i> Team Details</h4>
                ${additionalInfo}
                <p><strong>Team Leader:</strong> ${leaderName}</p>
                <p><strong>Team Size:</strong> ${teamSize} members</p>
                <p><strong>Event:</strong> ${eventName}</p>
            </div>
            
            <div class="success-note">
                <i class="fas fa-info-circle"></i>
                <p>Please save your Registration ID for future reference.</p>
            </div>
            
            <div class="success-buttons">
                <button class="btn btn-primary" onclick="closeEventModal()">
                    <i class="fas fa-check"></i> Done
                </button>
                <button class="btn btn-outline" onclick="registerAnother()">
                    <i class="fas fa-plus"></i> Register Another Event
                </button>
            </div>
        </div>
    `;
}

function copyRegistrationId(id) {
    navigator.clipboard.writeText(id).then(() => {
        showToast('Registration ID copied!', 'success');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = id;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Registration ID copied!', 'success');
    });
}

function registerAnother() {
    closeEventModal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(message, type = 'info') {
    if (typeof Toast !== 'undefined' && Toast.show) {
        Toast.show(message, type);
    } else {
        const toast = document.createElement('div');
        toast.className = `simple-toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: ${type === 'success' ? '#ED1B76' : '#ED1B76'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Global functions
window.closeEventModal = closeEventModal;
window.copyRegistrationId = copyRegistrationId;
window.registerAnother = registerAnother;

// Login form handler
async function handleLogin(e) {
    e.preventDefault();
    console.log('Login handler called');
    
    const form = e.target;
    const emailInput = form.querySelector('#login-email');
    const passwordInput = form.querySelector('#login-password');
    const submitBtn = form.querySelector('.login-btn');
    const loadingOverlay = document.querySelector('.login-loading');
    const successOverlay = document.querySelector('.login-success');
    
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    // Validate inputs
    if (!emailInput.value.trim()) {
        showFieldError('login-email', 'Email is required');
        return;
    }
    
    if (!passwordInput.value) {
        showFieldError('login-password', 'Password is required');
        return;
    }
    
    // Show loading
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    }
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: emailInput.value.trim(),
                password: passwordInput.value
            })
        });
        
        const result = await response.json();
        
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        
        if (!result.success) {
            throw new Error(result.message || 'Login failed');
        }
        
        // Store user data in session
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', result.user.name);
        localStorage.setItem('userEmail', result.user.email);
        localStorage.setItem('epochId', result.user.epochId);
        localStorage.setItem('userCollege', result.user.college || '');
        localStorage.setItem('userDepartment', result.user.department || '');
        localStorage.setItem('userPhone', result.user.phone || '');
        
        // Show success
        if (successOverlay) {
            const welcomePlayer = successOverlay.querySelector('.welcome-player');
            if (welcomePlayer) {
                welcomePlayer.textContent = `Welcome, ${result.user.name}!`;
            }
            successOverlay.style.display = 'flex';
        }
        
        // Redirect to tech events page (dashboard)
        setTimeout(() => {
            window.location.href = 'tech-events.html';
        }, 1500);
        
    } catch (error) {
        console.error('Login error:', error);
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        
        // Show error message
        const emailError = document.getElementById('email-error');
        if (emailError) {
            emailError.textContent = error.message;
            emailError.style.display = 'block';
        }
        
        // Reset button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login to Play';
        }
    }
}

// Export for debugging
window.FormManager = {
    handleLogin,
    handleRegistration,
    validateStep,
    showStep,
    updateProgress,
    currentStep: () => currentStep,
    totalSteps: () => totalSteps
};

console.log('📝 Forms.js loaded - starting initialization...');

// Initialize event registration on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - initializing forms...');
    initEventRegistration();
    initFormStepNavigation();
    initPasswordToggles();
    initPasswordStrength();
    
    // Initialize login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log('✅ Login form found - attaching handler');
        loginForm.addEventListener('submit', handleLogin);
    }
    
    console.log('✅ All form initializations complete');
});

console.log('📝 Forms loaded successfully!');