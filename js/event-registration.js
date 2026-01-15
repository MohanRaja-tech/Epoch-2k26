/* ============================================
   EPOCH 2026 - Event Registration (COMPLETE FIXED VERSION)
   ============================================ */

// Define which events use the EPOCH ID based form
const EPOCH_FORM_EVENTS = [
    'paper-presentation',
    'binary-battle',
    'prompt-arena',
    'connection',
    'flipflop'
];

// Events that allow 3 participants (optional 3rd member)
// ONLY Paper Presentation and Prompt Arena show "Add Participant 3" button
const THREE_PARTICIPANT_EVENTS = [
    'paper-presentation',
    'prompt-arena'
];

// SOLO EVENTS (1 participant only)
const SOLO_EVENTS = [
    'flipflop'
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

document.addEventListener('DOMContentLoaded', function () {
    initEventRegistration();
});

function initEventRegistration() {
    const modal = document.getElementById('eventRegisterModal');
    const closeBtn = document.getElementById('closeEventModal');
    const form = document.getElementById('eventRegistrationForm');
    const registerButtons = document.querySelectorAll('.register-event-btn');
    
    const addParticipant3Btn = document.getElementById('addParticipant3Btn');
    const participant3Section = document.getElementById('participant3Section');
    const removeParticipant3Btn = document.getElementById('removeParticipant3Btn');
    
    const addMember3Btn = document.getElementById('addMember3Btn');
    const member3Section = document.getElementById('member3Section');

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
            const teamMin = this.dataset.eventTeamMin;
            const teamMax = this.dataset.eventTeamMax;

            openEventModal(eventId, eventName, teamMin, teamMax);
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

    // Add Participant 3 Button Click
    if (addParticipant3Btn) {
        addParticipant3Btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (participant3Section) {
                participant3Section.style.display = 'block';
                this.style.display = 'none';
                participant3Section.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // Remove Participant 3 Button Click
    if (removeParticipant3Btn) {
        removeParticipant3Btn.addEventListener('click', function () {
            if (participant3Section) {
                // Clear participant 3 fields
                const p3EpochId = document.getElementById('participant3EpochId');
                const p3Name = document.getElementById('participant3Name');
                const p3College = document.getElementById('participant3College');
                const p3Mobile = document.getElementById('participant3Mobile');
                
                if (p3EpochId) p3EpochId.value = '';
                if (p3Name) p3Name.value = '';
                if (p3College) p3College.value = '';
                if (p3Mobile) p3Mobile.value = '';
                
                // Hide section and show add button
                participant3Section.style.display = 'none';
                if (addParticipant3Btn) {
                    addParticipant3Btn.style.display = 'block';
                }
            }
        });
    }

    // Add Member 3 Button Click (Standard form - for future use)
    if (addMember3Btn) {
        addMember3Btn.addEventListener('click', function () {
            if (member3Section) {
                member3Section.style.display = 'block';
                this.style.display = 'none';
                member3Section.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
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

function openEventModal(eventId, eventName, teamMin, teamMax) {
    const modal = document.getElementById('eventRegisterModal');
    
    // Get all form section elements
    const paperPresentationFields = document.getElementById('paperPresentationFields');
    const teamNameSection = document.getElementById('teamNameSection');
    const participant1Section = document.getElementById('participant1Section');
    const participant2Section = document.getElementById('participant2Section');
    const participant3Section = document.getElementById('participant3Section');
    const addParticipant3Btn = document.getElementById('addParticipant3Btn');
    const participant1Title = document.getElementById('participant1Title');
    
    // Standard form elements
    const leaderSection = document.getElementById('leaderSection');
    const member2Section = document.getElementById('member2Section');
    const member3Section = document.getElementById('member3Section');
    const addMember3Btn = document.getElementById('addMember3Btn');

    // Reset form
    const form = document.getElementById('eventRegistrationForm');
    if (form) form.reset();

    // Set hidden fields
    document.getElementById('eventId').value = eventId;
    document.getElementById('eventName').value = eventName;
    document.getElementById('eventTeamMin').value = teamMin;
    document.getElementById('eventTeamMax').value = teamMax;

    // Update display info
    document.getElementById('modalEventName').textContent = eventName;
    document.getElementById('displayEventName').textContent = eventName;
    
    const displayTeamSize = document.getElementById('displayTeamSize');
    if (displayTeamSize) {
        if (teamMin === '1' && teamMax === '1') {
            displayTeamSize.textContent = 'Solo (1 Member)';
        } else if (teamMin === teamMax) {
            displayTeamSize.textContent = teamMin + ' Members';
        } else {
            displayTeamSize.textContent = teamMin + '-' + teamMax + ' Members';
        }
    }

    // Determine event type
    const isEpochForm = EPOCH_FORM_EVENTS.includes(eventId);
    const isPaperPresentation = eventId === 'paper-presentation';
    const isSoloEvent = SOLO_EVENTS.includes(eventId);
    
    // Check if team allows 3rd participant based on ACTUAL teamMax value
    const teamMaxInt = parseInt(teamMax);
    const allowsThirdParticipant = teamMaxInt > 2;

    // ============================================
    // HIDE ALL SECTIONS FIRST
    // ============================================
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

    // ============================================
    // SHOW APPROPRIATE SECTIONS BASED ON EVENT TYPE
    // ============================================
    if (isEpochForm) {
        // Always show participant 1
        if (participant1Section) participant1Section.style.display = 'block';

        if (isSoloEvent) {
            // SOLO EVENT (Flip Flop): Only Participant 1, NO team name, NO Participant 2
            if (participant1Title) {
                participant1Title.innerHTML = '<i class="fas fa-user"></i> Your Details';
            }
            // Hide team name and participant 2 for solo events
            if (teamNameSection) teamNameSection.style.display = 'none';
            if (participant2Section) participant2Section.style.display = 'none';
            // Explicitly hide participant 3 and button for solo events
            if (participant3Section) {
                participant3Section.style.setProperty('display', 'none', 'important');
                participant3Section.classList.add('hidden');
            }
            if (addParticipant3Btn) {
                addParticipant3Btn.style.setProperty('display', 'none', 'important');
                addParticipant3Btn.classList.add('hidden');
                console.log('✓ Solo Event (Flip Flop): Add Participant 3 button HIDDEN');
            }
            
        } else {
            // Team events (Binary Battle, Paper Presentation, Prompt Arena, Connection)
            if (teamNameSection) teamNameSection.style.display = 'block';
            if (participant2Section) participant2Section.style.display = 'block';
            
            // SHOW "Add Participant 3" button ONLY if teamMax > 2
            if (teamMaxInt > 2) {
                if (addParticipant3Btn) {
                    addParticipant3Btn.classList.remove('hidden');
                    addParticipant3Btn.style.setProperty('display', 'block', 'important');
                    addParticipant3Btn.removeAttribute('hidden');
                    console.log('✓ Add Participant 3 button SHOWN (teamMax=' + teamMaxInt + ')');
                }
                // Show participant 3 section when button is shown
                if (participant3Section) {
                    participant3Section.style.setProperty('display', 'none', 'important');
                    participant3Section.classList.remove('hidden');
                }
            } else {
                // Hide button for exactly 2-member events
                if (participant3Section) {
                    participant3Section.style.setProperty('display', 'none', 'important');
                    participant3Section.classList.add('hidden');
                    console.log('✓ Participant 3 section HIDDEN (teamMax=' + teamMaxInt + ')');
                }
                if (addParticipant3Btn) {
                    addParticipant3Btn.classList.add('hidden');
                    addParticipant3Btn.setAttribute('hidden', '');
                    addParticipant3Btn.style.setProperty('display', 'none', 'important');
                    console.log('✓ Add Participant 3 button HIDDEN (teamMax=' + teamMaxInt + ')');
                }
            }
            
            // Paper Presentation specific
            if (isPaperPresentation) {
                if (paperPresentationFields) paperPresentationFields.style.display = 'block';
                if (participant1Title) {
                    participant1Title.innerHTML = '<i class="fas fa-user-crown"></i> Participant 1 (Team Leader)';
                }
            } else {
                if (participant1Title) {
                    participant1Title.innerHTML = '<i class="fas fa-user-crown"></i> Participant 1 (Team Leader)';
                }
            }
        }
    } else {
        // Standard form (for future events that don't use EPOCH ID)
        if (leaderSection) leaderSection.style.display = 'block';
        if (member2Section) member2Section.style.display = 'block';
        
        const maxTeam = parseInt(teamMax);
        if (maxTeam >= 3 && addMember3Btn) {
            addMember3Btn.style.display = 'block';
        }
    }

    // Pre-fill user data if logged in
    prefillUserData(isEpochForm);

    // Open modal with animation
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus on first input after a short delay
    setTimeout(() => {
        if (isSoloEvent) {
            const firstInput = document.getElementById('participant1EpochId');
            if (firstInput) firstInput.focus();
        } else if (isPaperPresentation) {
            const teamNameInput = document.getElementById('teamName');
            if (teamNameInput) teamNameInput.focus();
        } else {
            const teamNameOnlyInput = document.getElementById('teamNameOnly');
            if (teamNameOnlyInput) teamNameOnlyInput.focus();
        }
    }, 300);
}

function closeEventModal() {
    const modal = document.getElementById('eventRegisterModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset participant 3 section and button visibility with !important
        const participant3Section = document.getElementById('participant3Section');
        if (participant3Section) {
            participant3Section.style.setProperty('display', 'none', 'important');
            participant3Section.classList.add('hidden');
        }
        
        const addParticipant3Btn = document.getElementById('addParticipant3Btn');
        if (addParticipant3Btn) {
            addParticipant3Btn.style.setProperty('display', 'none', 'important');
            addParticipant3Btn.classList.add('hidden');
            addParticipant3Btn.setAttribute('hidden', '');
        }
    }
}

function prefillUserData(isEpochForm) {
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userPhone = localStorage.getItem('userPhone');
    const userCollege = localStorage.getItem('userCollege');
    const epochId = localStorage.getItem('epochId');

    if (isEpochForm) {
        // Pre-fill Participant 1 for EPOCH form events
        const p1EpochId = document.getElementById('participant1EpochId');
        const p1Name = document.getElementById('participant1Name');
        const p1College = document.getElementById('participant1College');
        const p1Mobile = document.getElementById('participant1Mobile');

        if (epochId && p1EpochId) p1EpochId.value = epochId;
        if (userName && p1Name) p1Name.value = userName;
        if (userCollege && p1College) p1College.value = userCollege;
        if (userPhone && p1Mobile) p1Mobile.value = userPhone;
    } else {
        // Pre-fill leader for standard form
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

// Get registration counts for a specific EPOCH ID
function getRegistrationCounts(epochId) {
    const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
    let techCount = 0;
    let nonTechCount = 0;

    registrations.forEach(reg => {
        const isParticipant =
            (reg.participant1 && reg.participant1.epochId && reg.participant1.epochId.toUpperCase() === epochId.toUpperCase()) ||
            (reg.participant2 && reg.participant2.epochId && reg.participant2.epochId.toUpperCase() === epochId.toUpperCase()) ||
            (reg.participant3 && reg.participant3.epochId && reg.participant3.epochId.toUpperCase() === epochId.toUpperCase());

        if (isParticipant) {
            if (TECH_EVENTS.includes(reg.eventId)) {
                techCount++;
            } else if (NONTECH_EVENTS.includes(reg.eventId)) {
                nonTechCount++;
            }
        }
    });

    return { techCount, nonTechCount };
}

// Check if an EPOCH ID can register for a specific event
function canRegisterForEvent(epochId, eventId) {
    const { techCount, nonTechCount } = getRegistrationCounts(epochId);
    const isTechEvent = TECH_EVENTS.includes(eventId);
    const isNonTechEvent = NONTECH_EVENTS.includes(eventId);

    if (isTechEvent && techCount >= MAX_TECH_EVENTS) {
        return {
            allowed: false,
            message: `EPOCH ID ${epochId} has already registered for ${MAX_TECH_EVENTS} technical events. Maximum limit reached!`,
            type: 'tech'
        };
    }

    if (isNonTechEvent && nonTechCount >= MAX_NONTECH_EVENTS) {
        return {
            allowed: false,
            message: `EPOCH ID ${epochId} has already registered for ${MAX_NONTECH_EVENTS} non-technical event. Maximum limit reached!`,
            type: 'nontech'
        };
    }

    return { allowed: true };
}

// Show limit exceeded popup
function showLimitExceededPopup(message) {
    const overlay = document.createElement('div');
    overlay.className = 'limit-popup-overlay';
    overlay.innerHTML = `
        <div class="limit-popup">
            <div class="limit-popup-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Registration Issue!</h3>
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

    const icon = overlay.querySelector('.limit-popup-icon');
    icon.style.cssText = `
        width: 80px;
        height: 80px;
        background: linear-gradient(145deg, #ED1B76, #ff4757);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
        font-size: 36px;
        color: white;
    `;

    const h3 = overlay.querySelector('h3');
    h3.style.cssText = `
        color: #ED1B76;
        font-family: 'Orbitron', sans-serif;
        font-size: 1.5rem;
        margin-bottom: 15px;
    `;

    const p = overlay.querySelector('.limit-popup p');
    p.style.cssText = `
        color: #fff;
        font-size: 1rem;
        margin-bottom: 20px;
        line-height: 1.6;
    `;

    const limitInfo = overlay.querySelector('.limit-info');
    limitInfo.style.cssText = `
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 25px;
    `;

    const limitItems = overlay.querySelectorAll('.limit-item');
    limitItems.forEach(item => {
        item.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            color: #ccc;
            padding: 8px 0;
            font-size: 0.9rem;
        `;
        item.querySelector('i').style.color = '#0FBA81';
    });

    const btn = overlay.querySelector('button');
    btn.style.cssText = `
        background: linear-gradient(145deg, #ED1B76, #ff4757);
        border: none;
        color: white;
        padding: 12px 30px;
        border-radius: 25px;
        font-family: 'Orbitron', sans-serif;
        cursor: pointer;
        transition: transform 0.3s ease;
    `;

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

    // Validate form first
    if (!validateEventForm(isEpochForm, isPaperPresentation)) {
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validating...';

    // Collect form data based on event type
    let formData;
    if (isEpochForm) {
        formData = collectEpochFormData(isPaperPresentation);
    } else {
        formData = collectStandardFormData();
    }

    // For EPOCH form events, validate EPOCH IDs with the server first
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

    // Submit registration to backend
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';

        const registerResponse = await fetch('/api/register-event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const registerResult = await registerResponse.json();

        if (registerResult.success) {
            const leaderName = isEpochForm ? formData.participant1.name : formData.leader.name;
            showRegistrationSuccess(registerResult.eventName, registerResult.registrationId, leaderName, registerResult.teamName);
        } else {
            if (registerResult.limitExceeded) {
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
    const eventId = document.getElementById('eventId').value;
    const isSoloEvent = SOLO_EVENTS.includes(eventId);
    
    // Get team name from appropriate field
    let teamName = '';
    if (!isSoloEvent) {
        if (isPaperPresentation) {
            const teamNameEl = document.getElementById('teamName');
            teamName = teamNameEl ? teamNameEl.value.trim() : '';
        } else {
            const teamNameOnlyEl = document.getElementById('teamNameOnly');
            teamName = teamNameOnlyEl ? teamNameOnlyEl.value.trim() : '';
        }
    }

    // Check if participant 3 section is visible and has data
    let participant3Data = null;
    const allowsThirdParticipant = THREE_PARTICIPANT_EVENTS.includes(eventId);
    if (allowsThirdParticipant) {
        const participant3Section = document.getElementById('participant3Section');
        if (participant3Section && participant3Section.style.display !== 'none') {
            const p3EpochId = document.getElementById('participant3EpochId')?.value.trim().toUpperCase() || '';
            const p3Name = document.getElementById('participant3Name')?.value.trim() || '';
            
            if (p3EpochId && p3Name) {
                participant3Data = {
                    epochId: p3EpochId,
                    name: p3Name,
                    college: document.getElementById('participant3College')?.value.trim() || '',
                    mobile: document.getElementById('participant3Mobile')?.value.trim() || ''
                };
            }
        }
    }

    // For solo events, participant2 will be null
    let participant2Data = null;
    if (!isSoloEvent) {
        participant2Data = {
            epochId: document.getElementById('participant2EpochId')?.value.trim().toUpperCase() || '',
            name: document.getElementById('participant2Name')?.value.trim() || '',
            college: document.getElementById('participant2College')?.value.trim() || '',
            mobile: document.getElementById('participant2Mobile')?.value.trim() || ''
        };
    }

    return {
        eventId: eventId,
        eventName: document.getElementById('eventName').value,
        teamName: teamName,
        paperTitle: isPaperPresentation ? (document.getElementById('paperTitle')?.value.trim() || '') : '',
        isSoloEvent: isSoloEvent,
        participant1: {
            epochId: document.getElementById('participant1EpochId')?.value.trim().toUpperCase() || '',
            name: document.getElementById('participant1Name')?.value.trim() || '',
            college: document.getElementById('participant1College')?.value.trim() || '',
            mobile: document.getElementById('participant1Mobile')?.value.trim() || ''
        },
        participant2: participant2Data,
        participant3: participant3Data,
        registrationTime: new Date().toISOString()
    };
}

function collectStandardFormData() {
    // Check if member 3 section is visible and has data
    let member3Data = null;
    const member3Section = document.getElementById('member3Section');
    if (member3Section && member3Section.style.display !== 'none') {
        const m3Name = document.getElementById('member3Name')?.value.trim() || '';
        if (m3Name) {
            member3Data = {
                name: m3Name,
                email: document.getElementById('member3Email')?.value.trim() || '',
                phone: document.getElementById('member3Phone')?.value.trim() || ''
            };
        }
    }

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
        member3: member3Data,
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
    const eventId = document.getElementById('eventId').value;
    const isSoloEvent = SOLO_EVENTS.includes(eventId);
    const allowsThirdParticipant = THREE_PARTICIPANT_EVENTS.includes(eventId);
    
    // Get team name from appropriate field (skip for solo events)
    let teamName = '';
    if (!isSoloEvent) {
        if (isPaperPresentation) {
            const teamNameEl = document.getElementById('teamName');
            teamName = teamNameEl ? teamNameEl.value.trim() : '';
        } else {
            const teamNameOnlyEl = document.getElementById('teamNameOnly');
            teamName = teamNameOnlyEl ? teamNameOnlyEl.value.trim() : '';
        }
        
        if (!teamName) {
            showToast('Please enter Team Name', 'error');
            return false;
        }
    }

    // Paper title (only for paper presentation)
    const paperTitle = isPaperPresentation ? (document.getElementById('paperTitle')?.value.trim() || '') : '';
    if (isPaperPresentation && !paperTitle) {
        showToast('Please enter Paper Title', 'error');
        return false;
    }

    // Participant 1 (always required)
    const p1EpochId = document.getElementById('participant1EpochId')?.value.trim() || '';
    const p1Name = document.getElementById('participant1Name')?.value.trim() || '';
    const p1College = document.getElementById('participant1College')?.value.trim() || '';
    const p1Mobile = document.getElementById('participant1Mobile')?.value.trim() || '';

    if (!p1EpochId || !p1Name || !p1College || !p1Mobile) {
        showToast('Please fill all your details', 'error');
        return false;
    }

    // Validate EPOCH ID format
    const epochIdRegex = /^EPOCH\d{3}$/i;
    if (!epochIdRegex.test(p1EpochId)) {
        showToast('Please enter a valid EPOCH ID (e.g., EPOCH001)', 'error');
        return false;
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(p1Mobile)) {
        showToast('Please enter a valid 10-digit mobile number', 'error');
        return false;
    }

    // Validate Participant 2 (skip for solo events)
    if (!isSoloEvent) {
        const p2EpochId = document.getElementById('participant2EpochId')?.value.trim() || '';
        const p2Name = document.getElementById('participant2Name')?.value.trim() || '';
        const p2College = document.getElementById('participant2College')?.value.trim() || '';
        const p2Mobile = document.getElementById('participant2Mobile')?.value.trim() || '';

        if (!p2EpochId || !p2Name || !p2College || !p2Mobile) {
            showToast('Please fill all Participant 2 details', 'error');
            return false;
        }

        if (!epochIdRegex.test(p2EpochId)) {
            showToast('Please enter a valid EPOCH ID for Participant 2', 'error');
            return false;
        }

        if (!phoneRegex.test(p2Mobile)) {
            showToast('Please enter a valid 10-digit mobile number for Participant 2', 'error');
            return false;
        }
    }

    // Validate Participant 3 if visible (only for events that allow 3rd participant)
    if (allowsThirdParticipant) {
        const participant3Section = document.getElementById('participant3Section');
        if (participant3Section && participant3Section.style.display !== 'none') {
            const p3EpochId = document.getElementById('participant3EpochId')?.value.trim() || '';
            const p3Name = document.getElementById('participant3Name')?.value.trim() || '';
            const p3College = document.getElementById('participant3College')?.value.trim() || '';
            const p3Mobile = document.getElementById('participant3Mobile')?.value.trim() || '';

            if (p3EpochId || p3Name || p3College || p3Mobile) {
                if (!p3EpochId || !p3Name || !p3College || !p3Mobile) {
                    showToast('Please fill all Participant 3 details or remove the participant', 'error');
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

    // Check terms
    const agreeTerms = document.getElementById('agreeTerms')?.checked || false;
    if (!agreeTerms) {
        showToast('Please agree to the terms and conditions', 'error');
        return false;
    }

    return true;
}

function validateStandardForm() {
    // Leader validation
    const leaderName = document.getElementById('leaderName')?.value.trim() || '';
    const leaderEmail = document.getElementById('leaderEmail')?.value.trim() || '';
    const leaderPhone = document.getElementById('leaderPhone')?.value.trim() || '';
    const leaderCollege = document.getElementById('leaderCollege')?.value.trim() || '';

    // Member 2 validation
    const member2Name = document.getElementById('member2Name')?.value.trim() || '';
    const member2Email = document.getElementById('member2Email')?.value.trim() || '';
    const member2Phone = document.getElementById('member2Phone')?.value.trim() || '';

    const agreeTerms = document.getElementById('agreeTerms')?.checked || false;

    // Check leader fields
    if (!leaderName || !leaderEmail || !leaderPhone || !leaderCollege) {
        showToast('Please fill all Team Leader details', 'error');
        return false;
    }

    // Check member 2 fields
    if (!member2Name || !member2Email || !member2Phone) {
        showToast('Please fill all Team Member 2 details', 'error');
        return false;
    }

    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leaderEmail)) {
        showToast('Please enter a valid email for Team Leader', 'error');
        return false;
    }
    if (!emailRegex.test(member2Email)) {
        showToast('Please enter a valid email for Member 2', 'error');
        return false;
    }

    // Validate phones
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(leaderPhone)) {
        showToast('Please enter a valid 10-digit phone for Team Leader', 'error');
        return false;
    }
    if (!phoneRegex.test(member2Phone)) {
        showToast('Please enter a valid 10-digit phone for Member 2', 'error');
        return false;
    }

    // Validate Member 3 if visible and filled
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

    // Check terms
    if (!agreeTerms) {
        showToast('Please agree to the terms and conditions', 'error');
        return false;
    }

    return true;
}

function showRegistrationSuccess(eventName, registrationId, leaderName, teamName) {
    const modalContent = document.querySelector('.event-register-content');
    const eventId = document.getElementById('eventId').value;
    const isSoloEvent = SOLO_EVENTS.includes(eventId);
    const allowsThirdParticipant = THREE_PARTICIPANT_EVENTS.includes(eventId);

    // Count team members
    let teamSize = isSoloEvent ? 1 : 2;
    if (allowsThirdParticipant) {
        const participant3Section = document.getElementById('participant3Section');
        if (participant3Section && participant3Section.style.display !== 'none') {
            const p3Name = document.getElementById('participant3Name')?.value.trim();
            if (p3Name) teamSize = 3;
        }
    }

    let additionalInfo = '';
    if (teamName && !isSoloEvent) {
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
            <p>${isSoloEvent ? 'You have' : 'Your team has'} been registered for <strong>${eventName}</strong></p>
            
            <div class="registration-id">
                <p>Registration ID</p>
                <span>${registrationId}</span>
                <button class="copy-btn" onclick="copyRegistrationId('${registrationId}')">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
            
            <div class="team-summary">
                <h4><i class="fas fa-${isSoloEvent ? 'user' : 'users'}"></i> ${isSoloEvent ? 'Participant' : 'Team'} Details</h4>
                ${additionalInfo}
                <p><strong>${isSoloEvent ? 'Name' : 'Team Leader'}:</strong> ${leaderName}</p>
                ${!isSoloEvent ? `<p><strong>Team Size:</strong> ${teamSize} members</p>` : ''}
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
    const existingToast = document.querySelector('.simple-toast');
    if (existingToast) existingToast.remove();

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
        background: ${type === 'success' ? '#0FBA81' : '#ED1B76'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10001;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        max-width: 350px;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Global functions
window.closeEventModal = closeEventModal;
window.copyRegistrationId = copyRegistrationId;
window.registerAnother = registerAnother;

// Add animation styles
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes scaleIn {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    /* Remove Participant Button Styling */
    .remove-participant-btn {
        margin-top: 15px;
        border-color: #ff4757 !important;
        color: #ff4757 !important;
        transition: all 0.3s ease;
    }
    
    .remove-participant-btn:hover {
        background: rgba(255, 71, 87, 0.1) !important;
        border-color: #ff6b6b !important;
        transform: translateY(-2px);
    }
    
    /* Add Participant Button Styling */
    .add-participant-btn {
        margin-top: 20px;
        border-color: #0FBA81 !important;
        color: #0FBA81 !important;
        background: transparent !important;
        transition: all 0.3s ease;
    }
    
    .add-participant-btn:hover {
        background: rgba(15, 186, 129, 0.1) !important;
        border-color: #10d394 !important;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(15, 186, 129, 0.2);
    }
    
    .add-participant-btn:active {
        transform: translateY(0);
    }
`;
document.head.appendChild(animationStyles);

console.log('📝 Event Registration module loaded');