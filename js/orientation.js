/**
 * Handle device orientation changes for responsive UI
 */

/**
 * Detect if the device is a mobile device
 * @returns {boolean} True if the device is mobile, false otherwise
 */
function detectMobileDevice() {
    // Check for touch support
    const hasTouchSupport = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // Check for mobile user agent patterns
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(userAgent);

    // Check screen size (typical mobile devices are under 1024px width)
    const smallScreen = window.innerWidth < 1024;

    // More reliable detection for tablets and mobile devices
    const isMobileOrTablet = /(android|iphone|ipad|ipod|blackberry|iemobile|opera mini|tablet)/i.test(userAgent);

    // Desktop computers can have touch screens too, so we need to be more specific
    // Only consider it a mobile device if it has a mobile user agent
    if (mobileUserAgent || isMobileOrTablet) {
        return true;
    }

    // For devices without a clear mobile user agent, use touch support AND small screen as fallback
    return hasTouchSupport && smallScreen;
}

// Global variable to track if the device is mobile - initialize immediately
window.isMobileDevice = detectMobileDevice();
console.log(`Device initially detected as: ${window.isMobileDevice ? 'Mobile' : 'Desktop'}`);

// Add device class to body immediately
if (document.body) {
    document.body.classList.add(window.isMobileDevice ? 'mobile-device' : 'desktop-device');
}

// Store the initial orientation for mobile devices
window.initialOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
console.log(`Initial orientation: ${window.initialOrientation}`);

// Flag to track if we've already refreshed to prevent infinite refresh loops
window.hasRefreshedForOrientation = false;

document.addEventListener('DOMContentLoaded', () => {
    // Re-check device type on DOM load (to be safe)
    window.isMobileDevice = detectMobileDevice();
    console.log(`Device confirmed as: ${window.isMobileDevice ? 'Mobile' : 'Desktop'}`);

    // Add appropriate class to body (in case it wasn't added earlier)
    document.body.classList.add(window.isMobileDevice ? 'mobile-device' : 'desktop-device');

    // Check if we've already refreshed for orientation change
    if (sessionStorage.getItem('orientationRefreshed') === 'true') {
        console.log('Page was refreshed due to orientation change');
        window.hasRefreshedForOrientation = true;
        // Clear the flag so future orientation changes can trigger refreshes
        sessionStorage.removeItem('orientationRefreshed');
        // Update the initial orientation to the current one
        window.initialOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }

    // Initial check for orientation
    checkOrientation();

    // Listen for orientation changes
    window.addEventListener('resize', () => {
        // Re-check device type on resize (in case of window resizing on desktop)
        window.isMobileDevice = detectMobileDevice();
        document.body.classList.remove('mobile-device', 'desktop-device');
        document.body.classList.add(window.isMobileDevice ? 'mobile-device' : 'desktop-device');

        // Check orientation
        checkOrientation();
    });

    // For mobile devices that support the orientation change event
    window.addEventListener('orientationchange', checkOrientation);
});

/**
 * Check device orientation and apply appropriate classes
 */
function checkOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight;
    const body = document.body;
    const isMobile = window.isMobileDevice || false;
    const currentOrientation = isLandscape ? 'landscape' : 'portrait';

    // Remove existing orientation classes
    body.classList.remove('portrait-mode', 'landscape-mode');

    // Add appropriate orientation class
    if (isLandscape) {
        body.classList.add('landscape-mode');
        console.log('Landscape mode detected');
    } else {
        body.classList.add('portrait-mode');
        console.log('Portrait mode detected');
    }

    // Make sure device type class is also applied
    if (!body.classList.contains('mobile-device') && !body.classList.contains('desktop-device')) {
        body.classList.add(isMobile ? 'mobile-device' : 'desktop-device');
    }

    // Log current device and orientation state
    console.log(`Device: ${isMobile ? 'Mobile' : 'Desktop'}, Orientation: ${currentOrientation}`);

    // Check if we need to refresh for mobile landscape mode
    if (isMobile &&
        window.initialOrientation === 'portrait' &&
        currentOrientation === 'landscape' &&
        !window.hasRefreshedForOrientation) {

        console.log('Mobile device switching from portrait to landscape - refreshing page');
        window.hasRefreshedForOrientation = true;

        // Set a flag in sessionStorage to prevent infinite refresh loops
        sessionStorage.setItem('orientationRefreshed', 'true');

        // Refresh the page after a short delay to allow logging
        setTimeout(() => {
            window.location.reload();
        }, 100);

        return; // Exit early since we're refreshing
    }

    // Adjust UI elements based on orientation and device type
    adjustUIForOrientation(isLandscape);
}

/**
 * Make specific UI adjustments based on orientation and device type
 * @param {boolean} isLandscape - Whether device is in landscape mode
 */
function adjustUIForOrientation(isLandscape) {
    const startScreen = document.getElementById('startScreen');
    const instructions = document.querySelector('.instructions');
    const tutorialContent = document.getElementById('tutorialContent');
    const hud = document.getElementById('hud');
    const abilityButtons = document.getElementById('ability-buttons');
    const isMobile = window.isMobileDevice || false;

    if (!startScreen || !instructions) return;

    // MOBILE DEVICE ADJUSTMENTS
    if (isMobile) {
        if (isLandscape) {
            // Mobile Landscape-specific adjustments
            if (instructions) {
                // Calculate optimal height based on screen size
                const screenHeight = window.innerHeight;
                const maxHeight = Math.min(screenHeight * 0.9, 500); // Cap at 500px or 90% of screen height
                instructions.style.maxHeight = `${maxHeight}px`;
                instructions.style.overflowY = 'hidden';
                instructions.style.width = '72%';
                instructions.style.float = 'right';
                instructions.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                instructions.style.border = '1px solid rgba(79, 195, 247, 0.4)';
                instructions.style.padding = '0.3rem';

                // Optimize mission and controls sections
                const missionHeader = instructions.querySelector('h3:first-of-type');
                const controlsHeader = instructions.querySelector('h3:nth-of-type(2)');
                const particlesHeader = instructions.querySelector('h3:nth-of-type(3)');

                // Apply styles to all headers
                const allHeaders = instructions.querySelectorAll('h3');
                allHeaders.forEach(header => {
                    header.style.marginTop = '0.2rem';
                    header.style.marginBottom = '0.1rem';
                    header.style.textAlign = 'left';
                    header.style.fontSize = '0.8rem';
                    header.style.color = '#4fc3f7';
                    header.style.borderBottom = '1px solid rgba(79, 195, 247, 0.3)';
                    header.style.paddingBottom = '0.1rem';
                    header.style.letterSpacing = '-0.2px';
                });

                // Special case for first header
                if (missionHeader) {
                    missionHeader.style.marginTop = '0';
                }

                // Optimize mobile controls layout
                const mobileControls = instructions.querySelector('.mobile-only');
                if (mobileControls) {
                    mobileControls.style.display = 'flex';
                    mobileControls.style.flexWrap = 'wrap';
                    mobileControls.style.justifyContent = 'space-between';
                    mobileControls.style.width = '100%';
                    mobileControls.style.marginTop = '0.1rem';
                }

                // Adjust paragraphs for landscape
                const paragraphs = instructions.querySelectorAll('p');
                paragraphs.forEach(p => {
                    p.style.margin = '0.05rem 0';
                    p.style.fontSize = '0.65rem';
                    p.style.lineHeight = '1.05';
                    p.style.letterSpacing = '-0.2px';
                });

                // Make mobile controls more compact
                const mobileOnlyParagraphs = mobileControls ? mobileControls.querySelectorAll('p') : [];
                mobileOnlyParagraphs.forEach(p => {
                    p.style.width = '32%';
                    p.style.margin = '0.05rem 0';
                    p.style.padding = '0';
                    p.style.fontSize = '0.65rem';
                    p.style.lineHeight = '1.1';
                });

                // Hide desktop-only content in landscape
                const desktopOnly = instructions.querySelector('.desktop-only');
                if (desktopOnly) {
                    desktopOnly.style.display = 'none';
                }

                // Adjust the dot indicators for particles
                const dots = instructions.querySelectorAll('.green-dot, .red-dot, .blue-dot, .yellow-dot, .dust-dot');
                dots.forEach(dot => {
                    dot.style.width = '6px';
                    dot.style.height = '6px';
                    dot.style.marginRight = '2px';
                    dot.style.display = 'inline-block';
                    dot.style.verticalAlign = 'middle';
                });

                // Adjust the logo and title container
                const logoContainer = startScreen.querySelector('.logo-container');
                const title = startScreen.querySelector('h1');
                const tagline = startScreen.querySelector('.tagline');
                const buttonContainer = startScreen.querySelector('.button-container');

                if (logoContainer) logoContainer.style.width = '25%';
                if (title) title.style.width = '25%';
                if (tagline) tagline.style.width = '25%';
                if (buttonContainer) {
                    buttonContainer.style.width = '25%';
                    buttonContainer.style.flexDirection = 'column';
                    buttonContainer.style.marginRight = '1%';
                }
            }

            // Tutorial adjustments for landscape
            if (tutorialContent) {
                tutorialContent.style.maxHeight = `${window.innerHeight * 0.8}px`;
            }

            // Game HUD adjustments for landscape
            if (hud) {
                // In landscape, we can use a horizontal layout
                hud.style.flexDirection = 'row';
                hud.style.justifyContent = 'flex-start';
                hud.style.top = '10px';
                hud.style.left = '10px';
                hud.style.right = 'auto';
                hud.style.maxWidth = '50%';
                hud.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                hud.style.padding = '5px 10px';
                hud.style.borderRadius = '8px';
            }

            // Ability buttons adjustments for landscape
            if (abilityButtons && window.getComputedStyle(abilityButtons).display !== 'none') {
                abilityButtons.style.flexDirection = 'row';
                abilityButtons.style.left = 'auto';
                abilityButtons.style.right = '15px';
                abilityButtons.style.transform = 'none';
                abilityButtons.style.bottom = '10px';
                abilityButtons.style.padding = '8px 15px';
                abilityButtons.style.gap = '15px';
                abilityButtons.style.borderRadius = '30px';
            }
        } else {
            // Mobile Portrait-specific adjustments
            if (instructions) {
                // Calculate optimal height based on screen size to prevent scrolling
                const screenHeight = window.innerHeight;
                const maxHeight = Math.min(screenHeight * 0.58, 400); // Cap at 400px or 58% of screen height
                instructions.style.maxHeight = `${maxHeight}px`;
                instructions.style.width = '95%';
                instructions.style.padding = '0.6rem';
                instructions.style.marginTop = '0.3rem';
                instructions.style.overflow = 'hidden';
                instructions.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                instructions.style.border = '1px solid rgba(79, 195, 247, 0.4)';

                // Make the mobile controls more compact
                const mobileControls = instructions.querySelector('.mobile-only');
                if (mobileControls) {
                    mobileControls.style.display = 'flex';
                    mobileControls.style.flexWrap = 'wrap';
                    mobileControls.style.justifyContent = 'space-between';
                    mobileControls.style.marginTop = '0.1rem';
                }

                // Adjust the headers and paragraphs
                const headers = instructions.querySelectorAll('h3');
                headers.forEach((header, index) => {
                    if (index === 0) {
                        // First header (MISSION)
                        header.style.marginTop = '0.1rem';
                    } else if (index === 2) {
                        // Third header (PARTICLES)
                        header.style.marginTop = '0.3rem';
                    } else {
                        header.style.marginTop = '0.5rem';
                    }
                    header.style.marginBottom = '0.1rem';
                    header.style.fontSize = '1rem';
                    header.style.color = '#4fc3f7';
                });

                const paragraphs = instructions.querySelectorAll('p');
                paragraphs.forEach(p => {
                    p.style.margin = '0.1rem 0';
                    p.style.lineHeight = '1.2';
                    p.style.fontSize = '0.8rem';
                });

                // Make the mobile-only paragraphs even smaller
                const mobileOnlyParagraphs = mobileControls ? mobileControls.querySelectorAll('p') : [];
                mobileOnlyParagraphs.forEach(p => {
                    p.style.fontSize = '0.75rem';
                    p.style.lineHeight = '1.1';
                    p.style.margin = '0.1rem 0';
                });

                // Adjust the dot indicators for particles
                const dots = instructions.querySelectorAll('.green-dot, .red-dot, .blue-dot, .yellow-dot, .dust-dot');
                dots.forEach(dot => {
                    dot.style.width = '8px';
                    dot.style.height = '8px';
                    dot.style.marginRight = '3px';
                });

                // Adjust the key elements
                const keys = instructions.querySelectorAll('.key');
                keys.forEach(key => {
                    key.style.padding = '1px 3px';
                    key.style.fontSize = '0.7rem';
                    key.style.backgroundColor = 'rgba(79, 195, 247, 0.3)';
                    key.style.border = '1px solid rgba(79, 195, 247, 0.5)';
                });
            }

            // Adjust logo and title for mobile portrait
            const logo = startScreen.querySelector('#game-logo');
            const title = startScreen.querySelector('h1');
            const tagline = startScreen.querySelector('.tagline');
            const startButton = startScreen.querySelector('#startButton');
            const tutorialButtonMobile = startScreen.querySelector('#tutorialButton-mobile');

            if (logo) logo.style.maxWidth = '150px';
            if (title) {
                title.style.fontSize = '1.8rem';
                title.style.marginBottom = '0.2rem';
            }
            if (tagline) {
                tagline.style.fontSize = '0.9rem';
                tagline.style.marginBottom = '0.3rem';
            }
            if (startButton) {
                startButton.style.marginTop = '5px';
                startButton.style.padding = '8px 10px';
                startButton.style.fontSize = '0.9rem';
            }
            if (tutorialButtonMobile) {
                tutorialButtonMobile.style.marginTop = '0.3rem';
                tutorialButtonMobile.style.width = '70%';
                tutorialButtonMobile.style.maxWidth = '180px';
                tutorialButtonMobile.style.fontSize = '0.85rem';
                tutorialButtonMobile.style.padding = '6px 12px';
            }

            // Tutorial adjustments for portrait
            if (tutorialContent) {
                tutorialContent.style.maxHeight = `${window.innerHeight * 0.9}px`;
            }

            // Game HUD adjustments for portrait
            if (hud) {
                // In portrait, use a vertical layout
                hud.style.flexDirection = 'column';
                hud.style.justifyContent = 'flex-start';
                hud.style.top = '20px';
            }

            // Ability buttons adjustments for portrait
            if (abilityButtons && window.getComputedStyle(abilityButtons).display !== 'none') {
                abilityButtons.style.bottom = '20px';
            }
        }
    }
    // DESKTOP DEVICE ADJUSTMENTS
    else {
        // Desktop adjustments (mostly landscape)
        if (instructions) {
            // Desktop instructions can be taller
            instructions.style.maxHeight = `${window.innerHeight * 0.8}px`;
        }

        // Tutorial adjustments for desktop
        if (tutorialContent) {
            tutorialContent.style.maxHeight = `${window.innerHeight * 0.9}px`;
        }

        // Game HUD adjustments for desktop
        if (hud) {
            // On desktop, always use horizontal layout
            hud.style.flexDirection = 'row';
            hud.style.justifyContent = 'space-between';
            hud.style.top = '20px';
        }

        // Ability buttons adjustments for desktop
        if (abilityButtons && window.getComputedStyle(abilityButtons).display !== 'none') {
            abilityButtons.style.bottom = '30px';
        }
    }
}
