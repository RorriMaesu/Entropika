/**
 * Game class to manage the particle collection game
 */
class ParticleGame {
    /**
     * Create a new game
     * @param {HTMLCanvasElement} canvas - Canvas element
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Resize canvas to fill window
        this.resizeCanvas();

        // Game state
        this.state = 'start'; // start, playing, levelComplete, gameOver, tutorial
        this.score = 20; // Start with more energy
        this.level = 1;
        this.lives = 3;
        this.targetScore = 100; // Score needed to complete a level
        this.tutorialStep = 1;
        this.totalTutorialSteps = 7;
        this.totalTargetsCollected = 0;
        this.totalTargetsInLevel = 0;

        // Game objects
        this.player = null;
        this.particles = [];
        this.targetParticles = [];
        this.obstacleParticles = [];
        this.boostParticles = [];
        this.shieldParticles = [];
        this.gravityWells = [];
        this.weaponParticles = [];
        this.repulsorEnergyParticles = []; // Blue particles that refill repulsor energy
        this.tractorEnergyParticles = []; // Purple particles that refill tractor beam energy

        // Enemy behavior
        this.obstacleAggressiveness = 0.005; // Base chase force
        this.enemyIntelligence = 0; // Increases with level, affects enemy behavior
        this.enemyDetectionRadius = 250; // Distance at which enemies become more aggressive
        this.enemyChaseMultiplier = 3.0; // How much more aggressive enemies are when in chase mode

        // Physics settings
        this.gravity = 0.02;
        this.windForce = { x: 0, y: 0 };
        this.windChangeInterval = 300; // frames
        this.windTimer = 0;
        this.gravityWellTimer = 0;
        this.gravityWellInterval = 600; // frames (10 seconds at 60fps)

        // Black hole settings
        this.blackHoles = [];
        this.blackHoleChance = 1.0; // 100% chance to spawn a black hole when timer is up
        this.blackHoleStrength = 0.15; // Greatly increased strength of black hole gravity
        this.blackHoleMaxDuration = 660; // 11 seconds at 60fps
        this.blackHoleTimer = 0;
        this.blackHoleInterval = 3600; // 60 seconds at 60fps (once per minute)

        // Particle effects
        this.particleEffects = [];

        // Game settings
        this.particleCount = 500; // Reduced for better performance
        this.targetCount = 10;
        this.obstacleCount = 5;
        this.boostCount = 3;
        this.shieldCount = 2;
        this.gravityWellCount = 1;
        this.speedFactor = 1;
        this.interactionRadius = 50;
        this.behavior = 'flock';
        this.difficulty = 'medium';

        // Controls
        this.mousePosition = { x: null, y: null };
        this.touchPosition = { x: null, y: null };
        this.usingTouchControls = false;
        this.usingMouseControls = false;

        // UI state
        this.hudVisible = true;
        this.showFps = false;
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;

        // Initialize event listeners
        this.initEventListeners();

        // Initialize UI elements
        this.initUI();
    }

    /**
     * Initialize event listeners for canvas and window
     */
    initEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });

        // Game control buttons
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('nextLevelButton').addEventListener('click', () => {
            this.nextLevel();
        });

        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });

        // Tutorial buttons are now handled in setupTutorialButtons()

        // COMPLETE REWRITE OF BUTTON HANDLING
        // First, remove all existing buttons from the container
        const abilityButtonsContainer = document.getElementById('ability-buttons');
        if (abilityButtonsContainer) {
            // Clear all existing buttons
            abilityButtonsContainer.innerHTML = '';

            // Create new repulsor button
            const repulsorButton = document.createElement('button');
            repulsorButton.id = 'repulsor-button';
            repulsorButton.className = 'ability-button';
            repulsorButton.innerHTML = `
                <div class="button-icon repulsor-icon"></div>
                <div class="button-label">Repulsor</div>
            `;
            abilityButtonsContainer.appendChild(repulsorButton);

            // Create new tractor button
            const tractorButton = document.createElement('button');
            tractorButton.id = 'tractor-button';
            tractorButton.className = 'ability-button';
            tractorButton.innerHTML = `
                <div class="button-icon tractor-icon"></div>
                <div class="button-label">Tractor</div>
            `;
            abilityButtonsContainer.appendChild(tractorButton);

            // Create new boost button
            const boostButton = document.createElement('button');
            boostButton.id = 'boost-button';
            boostButton.className = 'ability-button';
            boostButton.innerHTML = `
                <div class="button-icon boost-icon"></div>
                <div class="button-label">Boost</div>
            `;
            abilityButtonsContainer.appendChild(boostButton);

            // Add event listeners to repulsor button
            repulsorButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                e.preventDefault(); // Prevent default action
                console.log('Repulsor button clicked');
                if (this.player && this.state === 'playing') {
                    console.log('Activating shield pulse from button');
                    this.player.activateShieldPulse();
                }
                return false; // Prevent default action
            });

            repulsorButton.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent default action
                e.stopPropagation(); // Prevent event bubbling
                console.log('Repulsor button touched');
                if (this.player && this.state === 'playing') {
                    console.log('Activating shield pulse from touch');
                    this.player.activateShieldPulse();
                }
                return false; // Prevent default action
            });

            // Add event listeners to tractor button
            tractorButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                e.preventDefault(); // Prevent default action
                console.log('Tractor button clicked');
                if (this.player && this.state === 'playing') {
                    console.log('Activating attract field from button');

                    // Call the proper method to activate the attract field
                    this.player.activateAttractField();
                }
                return false; // Prevent default action
            });

            tractorButton.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent default action
                e.stopPropagation(); // Prevent event bubbling
                console.log('Tractor button touched');
                if (this.player && this.state === 'playing') {
                    console.log('Activating attract field from touch');

                    // Call the proper method to activate the attract field
                    this.player.activateAttractField();
                }
                return false; // Prevent default action
            });

            // Add event listeners to boost button
            boostButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                e.preventDefault(); // Prevent default action
                console.log('Boost button clicked');
                if (this.player && this.state === 'playing') {
                    console.log('Activating boost launch from button');
                    // Use the new boost launch ability instead of speed boost
                    this.player.activateBoostLaunch();
                }
                return false; // Prevent default action
            });

            boostButton.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevent default action
                e.stopPropagation(); // Prevent event bubbling
                console.log('Boost button touched');
                if (this.player && this.state === 'playing') {
                    console.log('Activating boost launch from touch');
                    // Use the new boost launch ability instead of speed boost
                    this.player.activateBoostLaunch();
                }
                return false; // Prevent default action
            });
        }

        // Settings controls
        document.getElementById('particleCount').addEventListener('input', (e) => {
            this.particleCount = parseInt(e.target.value);
            document.getElementById('particleCountValue').textContent = this.particleCount;
        });

        document.getElementById('particleSpeed').addEventListener('input', (e) => {
            this.speedFactor = parseFloat(e.target.value);
            document.getElementById('particleSpeedValue').textContent = this.speedFactor.toFixed(1);
        });

        document.getElementById('interactionRadius').addEventListener('input', (e) => {
            this.interactionRadius = parseInt(e.target.value);
            document.getElementById('interactionRadiusValue').textContent = this.interactionRadius;
        });

        document.getElementById('behaviorSelect').addEventListener('change', (e) => {
            this.behavior = e.target.value;
        });

        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.updateDifficulty();
        });

        document.getElementById('resetButton').addEventListener('click', () => {
            this.resetGame();
        });

        // Mouse controls - only used for mobile devices
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePosition.x = e.clientX - rect.left;
            this.mousePosition.y = e.clientY - rect.top;

            // Check if we're on a mobile device
            const isMobile = window.isMobileDevice || false;

            // Only enable mouse controls on mobile devices
            if (this.state === 'playing' && !this.usingTouchControls && isMobile) {
                this.usingMouseControls = true;
            }
        });

        this.canvas.addEventListener('mousedown', (e) => {
            // Only track mouse position for movement on mobile devices
            const isMobile = window.isMobileDevice || false;

            if (this.state === 'playing' && this.player && !this.usingTouchControls && isMobile) {
                // Update mouse position for player movement
                const rect = this.canvas.getBoundingClientRect();
                this.mousePosition.x = e.clientX - rect.left;
                this.mousePosition.y = e.clientY - rect.top;
            }
        });

        // Prevent context menu on right-click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => {
            // Only handle events if the target is the canvas itself
            if (e.target === this.canvas) {
                e.preventDefault();
                if (this.state === 'playing' && this.player) {
                    this.usingTouchControls = true;
                    this.usingMouseControls = false;

                    // Single tap: move to location
                    if (e.touches.length === 1) {
                        const rect = this.canvas.getBoundingClientRect();
                        this.touchPosition.x = e.touches[0].clientX - rect.left;
                        this.touchPosition.y = e.touches[0].clientY - rect.top;

                        // Apply an immediate impulse toward the touch position if player has energy
                        if (this.score > 0) {
                            const dx = this.touchPosition.x - this.player.x;
                            const dy = this.touchPosition.y - this.player.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            if (distance > this.player.size * 2) {
                                // Use the player's moveTowardTarget method with a reduced force multiplier
                                // This handles energy consumption properly
                                // We'll apply a 0.5 multiplier to the result to make it even slower
                                const energyCost = this.player.moveTowardTarget(
                                    this.touchPosition.x,
                                    this.touchPosition.y,
                                    this.score * 0.5 // Further reduce available energy to limit movement
                                );

                                // Deduct energy cost
                                if (energyCost > 0) {
                                    this.score = Math.max(0, this.score - energyCost);
                                }
                            }
                        }
                    }
                    // Double tap: Shield pulse
                    else if (e.touches.length === 2) {
                        this.player.activateShieldPulse();
                    }
                    // Triple tap: Speed boost
                    else if (e.touches.length === 3) {
                        if (this.score >= this.player.abilities.speedBoost.energyCost) {
                            this.player.keys.shift = true;
                            setTimeout(() => {
                                this.player.keys.shift = false;
                            }, 500);
                        }
                    }
                }
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            // Only handle events if the target is the canvas itself
            if (e.target === this.canvas) {
                e.preventDefault();
                if (this.state === 'playing' && this.player && this.usingTouchControls) {
                    const rect = this.canvas.getBoundingClientRect();
                    this.touchPosition.x = e.touches[0].clientX - rect.left;
                    this.touchPosition.y = e.touches[0].clientY - rect.top;
                }
            }
        });

        this.canvas.addEventListener('touchend', (e) => {
            // Only handle events if the target is the canvas itself
            if (e.target === this.canvas && e.touches.length === 0) {
                this.touchPosition.x = null;
                this.touchPosition.y = null;
            }
        });

        // Keyboard shortcut for toggling HUD
        window.addEventListener('keydown', (e) => {
            // H key to toggle HUD
            if (e.key.toLowerCase() === 'h') {
                this.hudVisible = !this.hudVisible;
                document.getElementById('hud').style.display = this.hudVisible ? 'flex' : 'none';
            }
            // F key to toggle FPS display
            else if (e.key.toLowerCase() === 'f') {
                this.showFps = !this.showFps;
            }
        });
    }

    /**
     * Initialize UI elements
     */
    initUI() {
        // Show start screen
        this.showScreen('startScreen');

        // Hide HUD initially
        document.getElementById('hud').style.display = 'none';

        // Hide ability buttons initially
        document.getElementById('ability-buttons').style.display = 'none';

        // Initialize ability cooldown indicators
        this.updateAbilityCooldowns();

        // Initialize tutorial
        this.initTutorial();
    }

    /**
     * Initialize tutorial system
     */
    initTutorial() {
        // Hide all tutorial steps initially
        const tutorialSteps = document.querySelectorAll('.tutorial-step');
        tutorialSteps.forEach(step => {
            step.classList.remove('active');
        });

        // Hide tutorial overlay
        document.getElementById('tutorial').classList.remove('active');

        // Add event listeners to tutorial buttons
        this.setupTutorialButtons();
    }

    /**
     * Set up tutorial button event listeners
     */
    setupTutorialButtons() {
        // Tutorial button on start screen
        // Tutorial button is now handled in tutorial.js
        // Removing this to avoid conflicts

        // Tutorial buttons are now handled in tutorial.js
        // Removing this to avoid conflicts
    }

    /**
     * Start the tutorial
     */
    startTutorial() {
        console.log('Starting tutorial');
        this.state = 'tutorial';
        this.tutorialStep = 1;

        // Show tutorial overlay
        const tutorialElement = document.getElementById('tutorial');
        tutorialElement.classList.add('active');

        // Show first step
        this.showTutorialStep(1);

        // Make sure buttons are set up
        this.setupTutorialButtons();
    }

    /**
     * Show a specific tutorial step
     * @param {number} step - Step number to show
     */
    showTutorialStep(step) {
        console.log(`Showing tutorial step ${step}`);

        // Hide all steps
        const tutorialSteps = document.querySelectorAll('.tutorial-step');
        tutorialSteps.forEach(stepEl => {
            stepEl.classList.remove('active');
            stepEl.style.display = 'none';
        });

        // Show requested step
        const currentStep = document.getElementById(`tutorialStep${step}`);
        if (currentStep) {
            currentStep.classList.add('active');
            currentStep.style.display = 'block';
            console.log(`Step ${step} activated:`, currentStep);

            // Make sure the tutorial overlay is visible
            const tutorialElement = document.getElementById('tutorial');
            if (tutorialElement) {
                tutorialElement.classList.add('active');
            }
        } else {
            console.error(`Tutorial step ${step} not found`);
        }
    }

    /**
     * Advance to the next tutorial step
     */
    nextTutorialStep() {
        console.log(`Current step: ${this.tutorialStep}, Total steps: ${this.totalTutorialSteps}`);

        if (this.tutorialStep < this.totalTutorialSteps) {
            this.tutorialStep++;
            this.showTutorialStep(this.tutorialStep);
        } else {
            // If we're at the last step, end the tutorial
            this.endTutorial();
        }
    }

    /**
     * End the tutorial and start the game
     */
    endTutorial() {
        console.log('Ending tutorial');
        const tutorial = document.getElementById('tutorial');
        if (tutorial) {
            tutorial.style.display = 'none';
            tutorial.classList.remove('active');
        }

        // Hide all screens
        this.showScreen(null);

        // Start the game (this will set state to playing after initialization)
        this.startGame();

        console.log('Game started from endTutorial()');
    }

    /**
     * Update ability cooldown indicators
     */
    updateAbilityCooldowns() {
        if (!this.player) return;

        // Shield pulse cooldown
        const shieldPulseEl = document.querySelector('#shieldPulse .cooldown');
        if (shieldPulseEl) {
            const cooldownPercent = this.player.abilities.shieldPulse.cooldown /
                this.player.abilities.shieldPulse.maxCooldown;

            if (cooldownPercent > 0) {
                shieldPulseEl.classList.add('active');
                shieldPulseEl.style.setProperty('--cooldown-percent', cooldownPercent * 100 + '%');
            } else {
                shieldPulseEl.classList.remove('active');
            }
        }

        // Warp Speed indicator
        const warpBoostEl = document.querySelector('#warpBoost');
        if (warpBoostEl) {
            // Update the charges display
            const warpCharges = warpBoostEl.querySelector('#warpCharges');
            const maxWarpCharges = warpBoostEl.querySelector('#maxWarpCharges');
            if (warpCharges && maxWarpCharges) {
                warpCharges.textContent = this.player.abilities.boostLaunch.charges;
                maxWarpCharges.textContent = this.player.abilities.boostLaunch.maxCharges;
            }

            // Add active class if boost is active
            if (this.player.abilities.boostLaunch.active) {
                warpBoostEl.classList.add('active');
            } else {
                warpBoostEl.classList.remove('active');
            }
        }
    }

    /**
     * Show a specific screen and hide others
     * @param {string} screenId - ID of the screen to show
     */
    showScreen(screenId) {
        const screens = ['startScreen', 'levelCompleteScreen', 'gameOverScreen'];

        screens.forEach(screen => {
            const element = document.getElementById(screen);
            if (screen === screenId) {
                element.classList.add('active');
            } else {
                element.classList.remove('active');
            }
        });
    }

    /**
     * Create a particle effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} type - Effect type ('collect', 'hit', 'shield', 'boost', 'weapon', 'explosion')
     */
    createParticleEffect(x, y, type) {
        let count, color, size, speed, lifetime;

        switch (type) {
            case 'collect':
                count = 10;
                color = '#81c784'; // Green
                size = 2;
                speed = 2;
                lifetime = 30;
                break;
            case 'hit':
                count = 15;
                color = '#e57373'; // Red
                size = 2;
                speed = 3;
                lifetime = 30;
                break;
            case 'shield':
                count = 20;
                color = '#fff176'; // Yellow
                size = 3;
                speed = 2;
                lifetime = 40;
                break;
            case 'weapon':
                count = 15;
                color = '#9c27b0'; // Purple
                size = 2;
                speed = 2;
                lifetime = 30;
                break;
            case 'explosion':
                count = 30;
                color = '#ff5722'; // Orange/red
                size = 4;
                speed = 4;
                lifetime = 45;
                break;
            case 'repulsorEnergy':
                count = 15;
                color = '#2196f3'; // Blue
                size = 3;
                speed = 2;
                lifetime = 35;
                break;
            case 'tractorEnergy':
                count = 15;
                color = '#9c27b0'; // Purple
                size = 3;
                speed = 2;
                lifetime = 35;
                break;
            case 'blackHole':
                count = 8;
                color = '#9c27b0'; // Purple
                size = 2;
                speed = 1;
                lifetime = 15;
                break;
            case 'dustCollect':
                count = 5;
                color = '#ffb74d'; // Orange
                size = 1;
                speed = 1;
                lifetime = 10;
                break;
            case 'shieldBreak':
                count = 15;
                color = '#64b5f6'; // Blue
                size = 3;
                speed = 3;
                lifetime = 20;
                break;
            default: // boost
                count = 8;
                color = '#64b5f6'; // Blue
                size = 2;
                speed = 2;
                lifetime = 30;
        }

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * speed;

            this.particleEffects.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: Math.random() * size + 1,
                color: color,
                lifetime: Math.random() * lifetime + 10,
                maxLifetime: lifetime,
                type: type
            });
        }
    }

    /**
     * Update particle effects
     */
    updateParticleEffects() {
        for (let i = this.particleEffects.length - 1; i >= 0; i--) {
            const effect = this.particleEffects[i];

            // Update position
            effect.x += effect.vx;
            effect.y += effect.vy;

            // Apply gravity to hit particles
            if (effect.type === 'hit') {
                effect.vy += 0.1;
            }

            // Apply drag
            effect.vx *= 0.97;
            effect.vy *= 0.97;

            // Update lifetime
            effect.lifetime--;

            // Remove dead particles
            if (effect.lifetime <= 0) {
                this.particleEffects.splice(i, 1);
            }
        }
    }

    /**
     * Draw particle effects
     */
    drawParticleEffects() {
        for (const effect of this.particleEffects) {
            this.ctx.beginPath();
            this.ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);

            // Fade out based on lifetime
            const alpha = effect.lifetime / effect.maxLifetime;
            this.ctx.fillStyle = effect.color.replace(')', `, ${alpha})`);

            this.ctx.fill();
        }
    }

    /**
     * Check if player is near UI elements and update transparency
     * Only applies to mobile devices
     */
    checkPlayerProximityToUI() {
        // Only apply this on mobile devices
        const isMobile = window.isMobileDevice || false;
        if (!isMobile || !this.player) return;

        // Get UI elements
        const hud = document.getElementById('hud');
        const abilityButtons = document.getElementById('ability-buttons');
        if (!hud || !abilityButtons) return;

        // Get ability buttons position
        const buttonRect = abilityButtons.getBoundingClientRect();
        const buttonCenterX = buttonRect.left + buttonRect.width / 2;
        const buttonCenterY = buttonRect.top + buttonRect.height / 2;

        // Get HUD position
        const hudRect = hud.getBoundingClientRect();
        const hudCenterX = hudRect.left + hudRect.width / 2;
        const hudCenterY = hudRect.top + hudRect.height / 2;

        // Convert player canvas coordinates to screen coordinates
        const canvasRect = this.canvas.getBoundingClientRect();
        const playerScreenX = this.player.x * (canvasRect.width / this.canvas.width) + canvasRect.left;
        const playerScreenY = this.player.y * (canvasRect.height / this.canvas.height) + canvasRect.top;

        // Calculate distances
        const distanceToButtons = Math.sqrt(
            Math.pow(playerScreenX - buttonCenterX, 2) +
            Math.pow(playerScreenY - buttonCenterY, 2)
        );

        const distanceToHud = Math.sqrt(
            Math.pow(playerScreenX - hudCenterX, 2) +
            Math.pow(playerScreenY - hudCenterY, 2)
        );

        // Check if we're in landscape or portrait mode
        const isLandscape = window.innerWidth > window.innerHeight;

        // Define proximity thresholds (in pixels) - adjusted for new layout
        // Use smaller thresholds in landscape mode since UI is more spread out
        const buttonProximityThreshold = isLandscape ?
            buttonRect.width * 1.2 : // Landscape - smaller threshold
            buttonRect.width * 1.8;  // Portrait - larger threshold for column layout

        const hudProximityThreshold = isLandscape ?
            hudRect.width * 0.6 : // Landscape - smaller threshold
            hudRect.width * 1.0;  // Portrait - larger threshold

        // Update UI transparency based on proximity
        if (distanceToButtons < buttonProximityThreshold) {
            abilityButtons.classList.add('player-nearby');
        } else {
            abilityButtons.classList.remove('player-nearby');
        }

        if (distanceToHud < hudProximityThreshold) {
            hud.classList.add('player-nearby');
        } else {
            hud.classList.remove('player-nearby');
        }
    }

    /**
     * Update the HUD with current game state
     */
    updateHUD() {
        // Check player proximity to UI elements (for mobile transparency)
        this.checkPlayerProximityToUI();

        // Format score to show one decimal place for fractional energy from dust
        document.getElementById('scoreValue').textContent = Math.floor(this.score * 10) / 10;
        document.getElementById('levelValue').textContent = this.level;
        document.getElementById('livesValue').textContent = this.lives;

        // Update energy bar
        const energyBar = document.getElementById('energyBar');
        if (energyBar) {
            const energyPercent = Math.min(100, this.score);
            energyBar.style.width = `${energyPercent}%`;

            // Add a data attribute to show exact energy value on hover
            energyBar.setAttribute('data-energy', Math.floor(this.score * 10) / 10);

            // Change color based on energy level
            if (energyPercent < 10) {
                energyBar.style.backgroundColor = '#f44336'; // Bright red when critically low
                energyBar.classList.add('critical'); // Add pulsing effect

                // Show warning message when energy is critically low
                if (energyPercent < 5 && this.state === 'playing' && Math.random() < 0.01) {
                    this.showMessage('WARNING: Energy Critical!', '#f44336');
                }
            } else if (energyPercent < 20) {
                energyBar.classList.remove('critical'); // Remove pulsing effect
                energyBar.style.backgroundColor = '#e57373'; // Red when low
            } else if (energyPercent < 50) {
                energyBar.style.backgroundColor = '#ffb74d'; // Orange when medium
            } else {
                energyBar.style.backgroundColor = '#81c784'; // Green when high
            }
        }

        // Update particle collection progress
        if (this.totalTargetsInLevel > 0) {
            // Find or create the energy particle progress container
            let energyProgressContainer = document.getElementById('energyProgress');
            if (!energyProgressContainer) {
                energyProgressContainer = document.createElement('div');
                energyProgressContainer.id = 'energyProgress';
                energyProgressContainer.className = 'progress-container';

                const label = document.createElement('div');
                label.className = 'progress-label';
                label.textContent = 'Energy:';

                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar-container';

                const progressFill = document.createElement('div');
                progressFill.className = 'progress-bar-fill';
                progressFill.id = 'energyProgressFill';

                const progressText = document.createElement('div');
                progressText.className = 'progress-text';
                progressText.id = 'energyProgressText';

                progressBar.appendChild(progressFill);
                energyProgressContainer.appendChild(label);
                energyProgressContainer.appendChild(progressBar);
                energyProgressContainer.appendChild(progressText);

                // Add to HUD
                const hudContainer = document.querySelector('.hud-container');
                if (hudContainer) {
                    hudContainer.appendChild(energyProgressContainer);
                }
            }

            // Update energy progress bar
            const energyProgressFill = document.getElementById('energyProgressFill');
            const energyProgressText = document.getElementById('energyProgressText');

            if (energyProgressFill && energyProgressText) {
                const collected = this.totalTargetsCollected || 0;
                const total = this.totalTargetsInLevel;
                const percent = Math.floor((collected / total) * 100);

                energyProgressFill.style.width = `${percent}%`;
                energyProgressText.textContent = `${collected}/${total}`;

                // Change color based on progress
                if (percent < 25) {
                    energyProgressFill.style.backgroundColor = '#e57373'; // Red when just starting
                } else if (percent < 75) {
                    energyProgressFill.style.backgroundColor = '#ffb74d'; // Orange when in progress
                } else {
                    energyProgressFill.style.backgroundColor = '#81c784'; // Green when almost done
                }
            }
        }

        // Update dust collection progress
        if (this.totalDustParticles > 0) {
            // Find or create the dust progress container
            let dustProgressContainer = document.getElementById('dustProgress');
            if (!dustProgressContainer) {
                dustProgressContainer = document.createElement('div');
                dustProgressContainer.id = 'dustProgress';
                dustProgressContainer.className = 'progress-container';

                const label = document.createElement('div');
                label.className = 'progress-label';
                label.textContent = 'Dust (Optional):';

                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar-container';

                const progressFill = document.createElement('div');
                progressFill.className = 'progress-bar-fill';
                progressFill.id = 'dustProgressFill';

                const progressText = document.createElement('div');
                progressText.className = 'progress-text';
                progressText.id = 'dustProgressText';

                progressBar.appendChild(progressFill);
                dustProgressContainer.appendChild(label);
                dustProgressContainer.appendChild(progressBar);
                dustProgressContainer.appendChild(progressText);

                // Add to HUD
                const hudContainer = document.querySelector('.hud-container');
                if (hudContainer) {
                    hudContainer.appendChild(dustProgressContainer);
                }
            }

            // Update dust progress bar
            const dustProgressFill = document.getElementById('dustProgressFill');
            const dustProgressText = document.getElementById('dustProgressText');

            if (dustProgressFill && dustProgressText) {
                const collected = this.collectedDustParticles || 0;
                const total = this.totalDustParticles;
                const percent = Math.floor((collected / total) * 100);

                dustProgressFill.style.width = `${percent}%`;
                dustProgressText.textContent = `${collected}/${total}`;

                // Change color based on progress
                if (percent < 25) {
                    dustProgressFill.style.backgroundColor = '#ffb74d'; // Orange when just starting
                } else if (percent < 75) {
                    dustProgressFill.style.backgroundColor = '#ffd54f'; // Yellow when in progress
                } else {
                    dustProgressFill.style.backgroundColor = '#fff176'; // Light yellow when almost done
                }
            }
        }

        // Update ability cooldowns
        if (this.player) {
            // Shield pulse cooldown and energy
            const shieldCooldown = document.getElementById('shieldCooldown');
            if (shieldCooldown) {
                const cooldownPercent = (this.player.abilities.shieldPulse.cooldown / this.player.abilities.shieldPulse.maxCooldown) * 100;
                shieldCooldown.style.setProperty('--cooldown-percent', `${cooldownPercent}%`);
                shieldCooldown.classList.toggle('active', cooldownPercent > 0);
            }

            // Update Warp Speed Hail Mary charges
            const warpCharges = document.getElementById('warpCharges');
            const maxWarpCharges = document.getElementById('maxWarpCharges');
            if (warpCharges && maxWarpCharges) {
                warpCharges.textContent = this.player.abilities.boostLaunch.charges;
                maxWarpCharges.textContent = this.player.abilities.boostLaunch.maxCharges;
            }

            const shieldPulseEnergy = document.getElementById('shieldPulseEnergy');
            if (shieldPulseEnergy) {
                const energyPercent = (this.player.abilities.shieldPulse.energy / this.player.abilities.shieldPulse.maxEnergy) * 100;
                shieldPulseEnergy.style.width = `${energyPercent}%`;

                // Change color based on energy level
                if (energyPercent >= 100) {
                    shieldPulseEnergy.style.backgroundColor = '#4fc3f7'; // Bright blue when full
                } else {
                    shieldPulseEnergy.style.backgroundColor = '#2196f3'; // Normal blue when charging
                }
            }

            // Attract field cooldown and energy
            const attractCooldown = document.getElementById('attractCooldown');
            if (attractCooldown) {
                const cooldownPercent = (this.player.abilities.attractField.cooldown / this.player.abilities.attractField.maxCooldown) * 100;
                attractCooldown.style.setProperty('--cooldown-percent', `${cooldownPercent}%`);
                attractCooldown.classList.toggle('active', cooldownPercent > 0);
            }

            const attractFieldEnergy = document.getElementById('attractFieldEnergy');
            if (attractFieldEnergy) {
                const energyPercent = (this.player.abilities.attractField.energy / this.player.abilities.attractField.maxEnergy) * 100;
                attractFieldEnergy.style.width = `${energyPercent}%`;

                // Change color based on energy level
                if (energyPercent >= 100) {
                    attractFieldEnergy.style.backgroundColor = '#ce93d8'; // Bright purple when full
                } else {
                    attractFieldEnergy.style.backgroundColor = '#9c27b0'; // Normal purple when charging
                }
            }

            // Weapon status
            const weaponStatus = document.getElementById('weaponStatus');
            if (weaponStatus) {
                if (this.player.abilities.weapon.active) {
                    const durationPercent = (this.player.abilities.weapon.duration / this.player.abilities.weapon.maxDuration) * 100;
                    weaponStatus.style.setProperty('--duration-percent', `${durationPercent}%`);
                    weaponStatus.classList.add('active');
                } else {
                    weaponStatus.classList.remove('active');
                }
            }

            // Update ability buttons
            this.updateAbilityButtons();
        }

        // Show FPS if enabled
        if (this.showFps) {
            // Calculate FPS every 30 frames
            this.frameCount++;
            const now = performance.now();

            if (now - this.lastFpsUpdate > 1000) { // Update every second
                this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
                this.frameCount = 0;
                this.lastFpsUpdate = now;
            }

            // Draw FPS counter
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`FPS: ${this.fps}`, this.canvas.width - 10, 20);
            this.ctx.textAlign = 'left';
        }
    }

    /**
     * Resize canvas to fill window
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    /**
     * Update difficulty settings based on selected difficulty
     */
    updateDifficulty() {
        switch (this.difficulty) {
            case 'easy':
                this.targetCount = 15;
                this.obstacleCount = 3;
                this.boostCount = 4;
                this.shieldCount = 3;
                this.gravityWellCount = 0;
                this.targetScore = 80;
                this.gravity = 0.01;
                break;
            case 'medium':
                this.targetCount = 10;
                this.obstacleCount = 5;
                this.boostCount = 3;
                this.shieldCount = 2;
                this.gravityWellCount = 1;
                this.targetScore = 100;
                this.gravity = 0.02;
                break;
            case 'hard':
                this.targetCount = 7;
                this.obstacleCount = 10;
                this.boostCount = 2;
                this.shieldCount = 1;
                this.gravityWellCount = 2;
                this.targetScore = 120;
                this.gravity = 0.03;
                break;
        }
    }

    /**
     * Create a gravity well
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} strength - Gravity strength
     * @param {number} radius - Gravity radius
     */
    createGravityWell(x, y, strength = 0.05, radius = 150) {
        this.gravityWells.push({
            x: x,
            y: y,
            strength: strength,
            radius: radius,
            pulsePhase: 0
        });
    }

    /**
     * Apply gravity well forces to a particle
     * @param {Particle} particle - Particle to apply forces to
     */
    applyGravityWellForces(particle) {
        for (const well of this.gravityWells) {
            const dx = well.x - particle.x;
            const dy = well.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < well.radius && distance > 0) {
                // Calculate gravitational force (stronger when closer)
                const force = well.strength * (1 - distance / well.radius);

                // Apply force towards gravity well
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;

                particle.applyForce(fx, fy);
            }
        }
    }

    /**
     * Update gravity wells
     */
    updateGravityWells() {
        // Update gravity well timer
        this.gravityWellTimer++;

        // Create new gravity well periodically
        if (this.gravityWellTimer >= this.gravityWellInterval && this.state === 'playing') {
            this.gravityWellTimer = 0;

            // 30% chance to create a random gravity well
            if (Math.random() < 0.3) {
                // Place gravity well away from player
                let x, y;
                let tooClose = true;

                while (tooClose && this.player) {
                    x = Math.random() * this.canvas.width;
                    y = Math.random() * this.canvas.height;

                    const dx = x - this.player.x;
                    const dy = y - this.player.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > 200) {
                        tooClose = false;
                    }
                }

                // Random properties
                const strength = (Math.random() < 0.5 ? 1 : -1) * (0.02 + Math.random() * 0.04); // Random strength, can be negative (repulsive)
                const radius = 100 + Math.random() * 150; // Random radius

                // Create the gravity well with limited lifetime
                this.createGravityWell(x, y, strength, radius);

                // Add lifetime property to the last created well
                if (this.gravityWells.length > 0) {
                    const well = this.gravityWells[this.gravityWells.length - 1];
                    well.lifetime = 300 + Math.random() * 300; // 5-10 seconds at 60fps
                }
            }
        }

        // Update existing gravity wells
        for (let i = this.gravityWells.length - 1; i >= 0; i--) {
            const well = this.gravityWells[i];

            // Update pulse animation
            well.pulsePhase = (well.pulsePhase + 0.02) % (Math.PI * 2);

            // Update lifetime if it exists
            if (well.lifetime !== undefined) {
                well.lifetime--;

                // Remove expired gravity wells
                if (well.lifetime <= 0) {
                    this.gravityWells.splice(i, 1);
                }
            }
        }
    }

    /**
     * Create a black hole
     */
    createBlackHole() {
        // Create black hole in the center of the screen for maximum effect
        const x = this.canvas.width / 2;
        const y = this.canvas.height / 2;

        // Strength increases with level
        const strength = this.blackHoleStrength * (1 + (this.level * 0.1));
        const radius = 120 + (this.level * 5); // Larger radius

        // Create black hole object
        const blackHole = {
            x: x,
            y: y,
            strength: strength,
            radius: radius,
            rotationSpeed: 0.03 + (Math.random() * 0.04), // Faster rotation
            rotationAngle: 0,
            lifetime: this.blackHoleMaxDuration,
            element: null,
            innerElement: null,
            outerRingElement: null
        };

        // Create visual elements
        const element = document.createElement('div');
        element.classList.add('black-hole-outer');
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.width = `${radius * 2}px`;
        element.style.height = `${radius * 2}px`;
        element.style.marginLeft = `-${radius}px`;
        element.style.marginTop = `-${radius}px`;

        // Add an outer ring for more dramatic effect
        const outerRingElement = document.createElement('div');
        outerRingElement.classList.add('black-hole-outer-ring');
        element.appendChild(outerRingElement);

        const innerElement = document.createElement('div');
        innerElement.classList.add('black-hole-inner');
        element.appendChild(innerElement);

        document.body.appendChild(element);
        blackHole.element = element;
        blackHole.innerElement = innerElement;
        blackHole.outerRingElement = outerRingElement;

        this.blackHoles.push(blackHole);

        // Show message with stronger warning
        this.showMessage('CRITICAL WARNING: Black hole detected! Use Warp Speed Hail Mary to escape the event horizon!', '#9c27b0');

        // Show follow-up warning about energy costs
        setTimeout(() => {
            this.showMessage('WARNING: Black hole gravity increases energy consumption!', '#f44336');
        }, 3000);

        // Create a dramatic effect when the black hole appears
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = radius * (0.5 + Math.random() * 1.5);
            const effectX = x + Math.cos(angle) * distance;
            const effectY = y + Math.sin(angle) * distance;
            this.createParticleEffect(effectX, effectY, 'blackHole');
        }
    }

    /**
     * Update black holes
     */
    updateBlackHoles() {
        // Update existing black holes
        for (let i = this.blackHoles.length - 1; i >= 0; i--) {
            const blackHole = this.blackHoles[i];

            // Update rotation (only every other frame for performance)
            if (this.frameCount % 2 === 0) {
                blackHole.rotationAngle += blackHole.rotationSpeed;
                if (blackHole.innerElement) {
                    blackHole.innerElement.style.transform = `rotate(${blackHole.rotationAngle}rad)`;
                }
            }

            // Update lifetime
            blackHole.lifetime--;

            // Apply black hole gravity to all particles
            this.applyBlackHoleForces(blackHole);

            // Create occasional particle effects around the black hole (reduced frequency)
            if (Math.random() < 0.05 && this.state === 'playing') {
                const angle = Math.random() * Math.PI * 2;
                const distance = blackHole.radius * (0.8 + Math.random() * 0.5);
                const effectX = blackHole.x + Math.cos(angle) * distance;
                const effectY = blackHole.y + Math.sin(angle) * distance;
                this.createParticleEffect(effectX, effectY, 'blackHole');
            }

            // Show countdown warning when black hole is about to disappear
            if (blackHole.lifetime <= 180 && blackHole.lifetime % 60 === 0) { // Every second in last 3 seconds
                const secondsLeft = Math.ceil(blackHole.lifetime / 60);
                this.showMessage(`Black hole collapsing in ${secondsLeft}...`, '#9c27b0');
            }

            // Remove expired black holes
            if (blackHole.lifetime <= 0) {
                // Create a final explosion effect (reduced particle count)
                for (let j = 0; j < 15; j++) {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = blackHole.radius * (0.2 + Math.random() * 1.5);
                    const effectX = blackHole.x + Math.cos(angle) * distance;
                    const effectY = blackHole.y + Math.sin(angle) * distance;
                    this.createParticleEffect(effectX, effectY, 'explosion');
                }

                if (blackHole.element) {
                    blackHole.element.remove();
                }
                this.blackHoles.splice(i, 1);

                // Show message
                this.showMessage('Black hole collapsed!', '#9c27b0');
            }
        }
    }

    /**
     * Apply black hole forces to all particles
     * @param {Object} blackHole - The black hole object
     */
    applyBlackHoleForces(blackHole) {
        // Apply to a subset of background particles each frame for better performance
        // This creates a staggered effect but maintains the overall visual impact
        const particleCount = this.particles.length;
        const startIndex = this.frameCount % 4; // Stagger across 4 frames

        for (let i = startIndex; i < particleCount; i += 4) {
            this.applyBlackHoleForceToParticle(blackHole, this.particles[i]);
        }

        // Always apply to gameplay-critical particles

        // Apply to target particles (important for gameplay)
        for (const target of this.targetParticles) {
            this.applyBlackHoleForceToParticle(blackHole, target);
        }

        // Apply to obstacle particles (important for gameplay)
        for (const obstacle of this.obstacleParticles) {
            this.applyBlackHoleForceToParticle(blackHole, obstacle);
        }

        // Apply to power-up particles on alternating frames
        if (this.frameCount % 2 === 0) {
            // Apply to boost particles
            for (const boost of this.boostParticles) {
                this.applyBlackHoleForceToParticle(blackHole, boost);
            }

            // Apply to shield particles
            for (const shield of this.shieldParticles) {
                this.applyBlackHoleForceToParticle(blackHole, shield);
            }
        }

        // Apply to energy particles on alternating frames
        if (this.frameCount % 2 === 1) {
            // Apply to repulsor energy particles
            for (const energy of this.repulsorEnergyParticles) {
                this.applyBlackHoleForceToParticle(blackHole, energy);
            }

            // Apply to tractor energy particles
            for (const energy of this.tractorEnergyParticles) {
                this.applyBlackHoleForceToParticle(blackHole, energy);
            }
        }

        // Always apply to player if not using warpspeed boost
        if (this.player && !this.player.abilities.boostLaunch.active) {
            this.applyBlackHoleForceToParticle(blackHole, this.player);
        }
    }

    /**
     * Apply black hole force to a specific particle
     * @param {Object} blackHole - The black hole object
     * @param {Particle} particle - The particle to apply force to
     */
    applyBlackHoleForceToParticle(blackHole, particle) {
        const dx = blackHole.x - particle.x;
        const dy = blackHole.y - particle.y;

        // Use squared distance for efficiency (avoid square root calculation)
        const distanceSquared = dx * dx + dy * dy;

        // Skip if exactly at the center (avoid division by zero)
        if (distanceSquared === 0) return;

        // Calculate actual distance only when needed
        const distance = Math.sqrt(distanceSquared);

        // Use pre-calculated map diagonal (optimization)
        if (!this.mapDiagonalSquared) {
            this.mapDiagonalSquared = this.canvas.width * this.canvas.width + this.canvas.height * this.canvas.height;
            this.mapDiagonal = Math.sqrt(this.mapDiagonalSquared);
        }

        // Define event horizon - the point of no return
        const eventHorizon = blackHole.radius * 1.5;

        // Store the distance ratio in the particle for energy cost calculations
        if (particle === this.player) {
            // Store black hole proximity data in player for energy cost calculations
            this.player.blackHoleProximity = {
                active: true,
                distance: distance,
                eventHorizon: eventHorizon,
                ratio: distance / eventHorizon // 1.0 or less means within event horizon
            };
        }

        // Simplified distance ratio calculation
        const distanceRatio = distance / this.mapDiagonal;

        // Determine if particle is the player and if it's using boost
        const isPlayerBoosting = (particle === this.player && this.player.abilities.boostLaunch.active);

        // Calculate force factor based on distance
        let forceFactor;
        const radiusRatio = distance / blackHole.radius;

        if (radiusRatio < 1) {
            // Inside the black hole - extremely strong force
            forceFactor = 6.0 + (1.0 - radiusRatio) * 6.0;

            // If it's the player and not boosting, apply even stronger force
            if (particle === this.player && !isPlayerBoosting) {
                forceFactor *= 1.5; // 50% stronger for player to make escape harder
            }
        } else if (radiusRatio < 3) {
            // Within event horizon - very strong force
            forceFactor = 3.0 + (3.0 - radiusRatio) * 1.0;

            // If it's the player and not boosting, apply stronger force
            if (particle === this.player && !isPlayerBoosting) {
                forceFactor *= 1.3; // 30% stronger for player to make escape harder
            }
        } else {
            // Outside event horizon - still significant force
            forceFactor = 1.5 + Math.max(0, 1.0 - distanceRatio * 0.8);
        }

        // If player is boosting, reduce the force but don't eliminate it completely
        if (isPlayerBoosting) {
            // Boost helps but doesn't completely negate black hole gravity
            forceFactor *= 0.4; // Reduce force by 60% when boosting
        }

        // Calculate force once and reuse
        const force = blackHole.strength * forceFactor / distance;

        // Apply force towards black hole (reuse dx and dy)
        const fx = dx * force;
        const fy = dy * force;
        particle.applyForce(fx, fy);

        // Add rotational force for swirling effect
        if (radiusRatio < 5) {
            // Stronger swirl closer to center
            const swirl = radiusRatio < 1 ? 0.7 : 0.4;
            const tangentialForce = blackHole.strength * swirl * forceFactor / distance;

            // Apply rotational force
            particle.applyForce(-dy * tangentialForce, dx * tangentialForce);

            // Speed up particles very close to the black hole
            if (radiusRatio < 0.5 && Math.random() < 0.05) {
                particle.vx *= 1.1;
                particle.vy *= 1.1;

                // Create occasional particle effects
                if (Math.random() < 0.01 && this.state === 'playing') {
                    this.createParticleEffect(particle.x, particle.y, 'blackHole');
                }

                // If it's the player, show warning message
                if (particle === this.player && Math.random() < 0.1) {
                    this.showMessage('WARNING: Black hole gravity intensifying!', '#f44336');
                }
            }
        }
    }

    /**
     * Draw gravity wells
     */
    drawGravityWells() {
        for (const well of this.gravityWells) {
            // Determine color based on whether it's attractive or repulsive
            const isAttractive = well.strength > 0;
            const baseColor = isAttractive ?
                { r: 64, g: 0, b: 128 } : // Purple for attractive
                { r: 128, g: 0, b: 64 };  // Red for repulsive

            // Draw outer circle with pulsing effect
            const pulseSize = Math.sin(well.pulsePhase) * 10;
            const pulseOpacity = 0.1 + Math.abs(Math.sin(well.pulsePhase)) * 0.2;

            // Draw outer glow
            this.ctx.beginPath();
            this.ctx.arc(well.x, well.y, well.radius + pulseSize, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${pulseOpacity})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw field area
            this.ctx.beginPath();
            this.ctx.arc(well.x, well.y, well.radius, 0, Math.PI * 2);
            const fieldGradient = this.ctx.createRadialGradient(
                well.x, well.y, 0,
                well.x, well.y, well.radius
            );
            fieldGradient.addColorStop(0, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.15)`);
            fieldGradient.addColorStop(1, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0)`);
            this.ctx.fillStyle = fieldGradient;
            this.ctx.fill();

            // Draw inner circle
            this.ctx.beginPath();
            this.ctx.arc(well.x, well.y, 20, 0, Math.PI * 2);

            const gradient = this.ctx.createRadialGradient(
                well.x, well.y, 0,
                well.x, well.y, 20
            );
            gradient.addColorStop(0, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.8)`);
            gradient.addColorStop(1, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.1)`);

            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // Reset line width
            this.ctx.lineWidth = 1;
        }
    }

    /**
     * Apply global physics forces to a particle
     * @param {Particle} particle - Particle to apply forces to
     */
    applyGlobalForces(particle) {
        // Apply gravity with particle-specific factor
        // This creates varying gravity effects for each particle
        const gravityX = (Math.random() * 0.01 - 0.005) * particle.gravityFactor; // Small random horizontal gravity
        const gravityY = this.gravity * particle.mass * particle.gravityFactor; // Vertical gravity with particle factor

        particle.applyForce(gravityX, gravityY);

        // Apply wind force
        particle.applyForce(this.windForce.x, this.windForce.y);

        // Apply gravity well forces
        this.applyGravityWellForces(particle);
    }

    /**
     * Update global physics
     */
    updateGlobalPhysics() {
        // Update wind force periodically
        this.windTimer++;
        if (this.windTimer >= this.windChangeInterval) {
            this.windTimer = 0;

            // Update wind force
            this.windForce = {
                x: (Math.random() * 2 - 1) * 0.01,
                y: (Math.random() * 2 - 1) * 0.01
            };

            // Occasionally vary the global gravity strength
            if (Math.random() < 0.3) { // 30% chance to change gravity
                this.gravity = 0.01 + Math.random() * 0.03; // Range from 0.01 to 0.04
            }
        }

        // Update gravity wells
        this.updateGravityWells();

        // Update black holes
        this.updateBlackHoles();

        // Check if we should spawn a new black hole
        this.blackHoleTimer++;
        if (this.blackHoleTimer >= this.blackHoleInterval) {
            this.blackHoleTimer = 0;

            // Random chance to spawn a black hole based on level
            if (Math.random() < this.blackHoleChance) {
                this.createBlackHole();
            }
        }
    }

    /**
     * Handle level completion
     */
    levelComplete() {
        // Set game state to level complete
        this.state = 'levelComplete';

        // Show level complete screen
        this.showScreen('levelComplete');

        // Update level complete screen with stats
        document.getElementById('levelCompleteLevel').textContent = this.level;
        document.getElementById('levelCompleteScore').textContent = this.score;

        // Show congratulatory message
        this.showMessage('Level Complete!', '#4caf50');

        // Clear any existing black holes
        this.cleanupBlackHoles();
    }

    /**
     * Initialize the game with particles and player
     */
    initialize() {
        // Clear existing particles and effects
        this.particles = [];
        this.targetParticles = [];
        this.obstacleParticles = [];
        this.boostParticles = [];
        this.shieldParticles = [];
        this.gravityWells = [];
        this.blackHoles = [];
        this.particleEffects = [];

        // Create background particles (now collectible)
        for (let i = 0; i < this.particleCount; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = Math.random() * 1.5 + 1;

            // Random color with higher opacity for better visibility
            const hue = (i / this.particleCount) * 360;
            const color = `hsla(${hue}, 80%, 70%, 0.5)`;

            const particle = new Particle(x, y, size, color);
            particle.collectible = true; // Mark as collectible
            particle.collected = false; // Track collection state

            // Slower movement for dust particles
            particle.maxSpeed = 0.5;

            this.particles.push(particle);
        }

        // Track total dust particles for level completion
        this.totalDustParticles = this.particleCount;
        this.collectedDustParticles = 0;

        // Create player at center of screen
        this.player = new Player(
            this.canvas.width / 2,
            this.canvas.height / 2
        );

        // Give player a reference to the game for showing messages
        this.player.game = this;

        // Create target particles (to collect)
        this.createTargetParticles();

        // Create obstacle particles (to avoid)
        this.createObstacleParticles();

        // Create boost particles
        this.createBoostParticles();

        // Create shield particles
        this.createShieldParticles();

        // Create initial repulsor energy particles
        this.createRepulsorEnergyParticles(2);

        // Create initial tractor beam energy particles
        this.createTractorEnergyParticles(2);

        // Create gravity wells (based on level and difficulty)
        if (this.gravityWellCount > 0) {
            for (let i = 0; i < this.gravityWellCount; i++) {
                // Place gravity wells away from player
                let x, y;
                let tooClose = true;

                while (tooClose) {
                    x = Math.random() * this.canvas.width;
                    y = Math.random() * this.canvas.height;

                    const dx = x - this.player.x;
                    const dy = y - this.player.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > 200) {
                        tooClose = false;
                    }
                }

                // Strength increases with level
                const strength = 0.03 + (this.level * 0.005);
                const radius = 150 + (this.level * 5);

                this.createGravityWell(x, y, strength, radius);
            }
        }

        // Reset physics timers
        this.windTimer = 0;
        this.windForce = { x: 0, y: 0 };
    }

    /**
     * Create target particles for the player to collect
     * @param {number} [additionalCount=0] - Optional number of additional particles to create
     */
    createTargetParticles(additionalCount = 0) {
        // Only reset the array if we're not adding additional particles
        if (additionalCount === 0) {
            this.targetParticles = [];
        }

        // Scale target count based on level
        const baseCount = this.targetCount + Math.floor(this.level / 2);
        const count = additionalCount > 0 ? additionalCount : baseCount;

        // Update the total target count for this level (for UI display)
        if (additionalCount === 0) {
            this.totalTargetsInLevel = baseCount;
            this.totalTargetsCollected = 0;
        }

        for (let i = 0; i < count; i++) {
            // Create targets away from player
            let x, y;
            let tooClose = true;

            // Keep trying positions until we find one that's not too close to the player
            while (tooClose) {
                x = Math.random() * this.canvas.width;
                y = Math.random() * this.canvas.height;

                const dx = x - this.player.x;
                const dy = y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Ensure target is at least 100px away from player
                if (distance > 100) {
                    tooClose = false;
                }
            }

            const size = 6;
            const color = '#81c784'; // Green

            const target = new Particle(x, y, size, color);
            target.maxSpeed = 1 + (this.level * 0.1); // Targets get faster with level
            target.mass = 2; // Lighter than player

            // Add some random movement to make particles more interesting to chase
            target.gravityFactor = Math.random() * 2 - 0.5; // Range from -0.5 to 1.5

            this.targetParticles.push(target);
        }

        // Update the HUD to show target count
        this.updateHUD();

        // Show message about particles to collect
        if (additionalCount === 0) {
            this.showMessage(`Collect all ${this.totalTargetsInLevel} particles to complete the level!`, '#81c784');
        }
    }

    /**
     * Create boost particles for speed boost
     */
    createBoostParticles() {
        this.boostParticles = [];

        // Scale boost count based on level
        const count = this.boostCount - Math.floor(this.level / 5); // Fewer boosts at higher levels
        const finalCount = Math.max(1, count); // At least 1 boost

        for (let i = 0; i < finalCount; i++) {
            // Create boosts away from player
            let x, y;
            let tooClose = true;

            // Keep trying positions until we find one that's not too close to the player
            while (tooClose) {
                x = Math.random() * this.canvas.width;
                y = Math.random() * this.canvas.height;

                const dx = x - this.player.x;
                const dy = y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Ensure boost is at least 150px away from player
                if (distance > 150) {
                    tooClose = false;
                }
            }

            const size = 5;
            const color = '#64b5f6'; // Blue

            const boost = new Particle(x, y, size, color);
            boost.maxSpeed = 0.8; // Slower than targets
            boost.mass = 1.5;

            this.boostParticles.push(boost);
        }
    }

    /**
     * Create shield particles for shield restoration
     */
    createShieldParticles() {
        this.shieldParticles = [];

        // Scale shield count based on level and difficulty
        const count = Math.max(1, this.shieldCount - Math.floor(this.level / 3)); // Fewer shields at higher levels

        for (let i = 0; i < count; i++) {
            // Create shields away from player
            let x, y;
            let tooClose = true;

            // Keep trying positions until we find one that's not too close to the player
            while (tooClose) {
                x = Math.random() * this.canvas.width;
                y = Math.random() * this.canvas.height;

                const dx = x - this.player.x;
                const dy = y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Ensure shield is at least 200px away from player
                if (distance > 200) {
                    tooClose = false;
                }
            }

            const size = 5;
            const color = '#fff176'; // Yellow

            const shield = new Particle(x, y, size, color);
            shield.maxSpeed = 0.5; // Very slow
            shield.mass = 3; // Heavy

            this.shieldParticles.push(shield);
        }
    }

    /**
     * Create obstacle particles for the player to avoid
     */
    createObstacleParticles() {
        this.obstacleParticles = [];

        // Scale obstacle count based on level
        const count = this.obstacleCount + Math.floor(this.level / 3);

        for (let i = 0; i < count; i++) {
            // Create obstacles away from player
            let x, y;
            let tooClose = true;

            // Keep trying positions until we find one that's not too close to the player
            while (tooClose) {
                x = Math.random() * this.canvas.width;
                y = Math.random() * this.canvas.height;

                const dx = x - this.player.x;
                const dy = y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Ensure obstacle is at least 150px away from player
                if (distance > 150) {
                    tooClose = false;
                }
            }

            const size = 7;
            const color = '#e57373'; // Red

            const obstacle = new Particle(x, y, size, color);
            obstacle.maxSpeed = 0.5 + (this.level * 0.15); // Base speed when not chasing
            obstacle.chaseSpeed = 1.5 + (this.level * 0.2); // Faster speed when chasing
            obstacle.mass = 5; // Heavier than player
            obstacle.isChasing = false; // Track chase state for visual effects

            // Add shield properties
            obstacle.hasShield = true; // Start with shield active
            obstacle.shieldHealth = 1; // One hit to break shield
            obstacle.shieldColor = '#64b5f6'; // Blue shield
            obstacle.shieldSize = size * 1.5; // Shield is larger than enemy
            obstacle.shieldOpacity = 0.7; // Semi-transparent shield
            obstacle.shieldPulse = 0; // For shield pulse animation

            // Add explosion properties
            obstacle.isExploding = false;
            obstacle.explosionRadius = size * 4; // Explosion radius
            obstacle.explosionDuration = 0; // Explosion duration counter
            obstacle.explosionMaxDuration = 30; // Half second at 60fps
            obstacle.explosionDamage = 2; // Double damage

            this.obstacleParticles.push(obstacle);
        }
    }

    /**
     * Handle player controls from mouse or touch
     */
    handlePlayerControls() {
        if (!this.player) return;

        // Check if we're on a mobile device
        const isMobile = window.isMobileDevice || false;

        // Handle mouse/touch controls only on mobile devices
        if (isMobile) {
            // For mobile: handle both mouse and touch inputs to move toward tap position
            if ((this.usingMouseControls && this.mousePosition.x !== null && this.mousePosition.y !== null) ||
                (this.usingTouchControls && this.touchPosition.x !== null && this.touchPosition.y !== null)) {

                // Determine which position to use (mouse or touch)
                const targetX = this.usingTouchControls ? this.touchPosition.x : this.mousePosition.x;
                const targetY = this.usingTouchControls ? this.touchPosition.y : this.mousePosition.y;

                // Calculate direction to target position
                const dx = targetX - this.player.x;
                const dy = targetY - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Only move if target is far enough away and player has energy
                if (distance > this.player.size * 2 && this.score > 0) {
                    // Use the player's moveTowardTarget method which handles energy consumption
                    // Apply a 0.6 multiplier to limit continuous movement speed
                    const energyCost = this.player.moveTowardTarget(targetX, targetY, this.score * 0.6);

                    // Deduct energy cost
                    if (energyCost > 0) {
                        this.score = Math.max(0, this.score - energyCost);
                    }
                }
            }
        }
        // For desktop: do nothing here - movement is handled entirely by keyboard input
    }

    /**
     * Update all game objects
     */
    update() {
        // Always update background particles regardless of game state
        for (const particle of this.particles) {
            // Apply behavior based on current setting
            switch (this.behavior) {
                case 'flock':
                    ParticleBehaviors.flock(particle, this.particles, this.interactionRadius);
                    break;
                case 'gravity':
                    ParticleBehaviors.gravity(particle, this.particles, this.interactionRadius);
                    break;
                case 'swirl':
                    ParticleBehaviors.swirl(
                        particle,
                        this.canvas.width / 2,
                        this.canvas.height / 2,
                        0.01
                    );
                    break;
                case 'random':
                    ParticleBehaviors.random(particle, 0.05);
                    break;
            }

            // Update particle position
            particle.update(this.speedFactor * 0.5); // Background particles move slower

            // Handle edge behavior
            particle.edges(this.canvas.width, this.canvas.height);
        }

        // Only update gameplay elements if in playing state
        if (this.state !== 'playing') return;

        // Update global physics
        this.updateGlobalPhysics();

        // Update particle effects
        this.updateParticleEffects();

        // Update player and handle energy cost from abilities
        const energyCost = this.player.update(this.speedFactor, this.score);
        if (energyCost > 0) {
            this.score = Math.max(0, this.score - energyCost);
        }
        this.player.edges(this.canvas.width, this.canvas.height);

        // Handle mouse/touch controls
        this.handlePlayerControls();

        // Update background particles (now collectible dust)
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];

            // Skip already collected particles
            if (particle.collected) continue;

            // Apply behavior based on current setting
            switch (this.behavior) {
                case 'flock':
                    ParticleBehaviors.flock(particle, this.particles, this.interactionRadius);
                    break;
                case 'gravity':
                    ParticleBehaviors.gravity(particle, this.particles, this.interactionRadius);
                    break;
                case 'swirl':
                    ParticleBehaviors.swirl(
                        particle,
                        this.canvas.width / 2,
                        this.canvas.height / 2,
                        0.01
                    );
                    break;
                case 'random':
                    ParticleBehaviors.random(particle, 0.05);
                    break;
            }

            // Apply global physics forces
            this.applyGlobalForces(particle);

            // Apply shield pulse force if active
            if (this.player.abilities.shieldPulse.active) {
                this.player.applyShieldPulseForce(particle);
            }

            // Apply attract field force if active
            if (this.player.abilities.attractField.active) {
                // Check if we're on a mobile device to apply optimizations
                const isMobile = window.isMobileDevice || false;

                if (isMobile) {
                    // On mobile, only apply to every other particle to reduce calculations
                    if (i % 2 === 0) {
                        this.player.applyAttractFieldForce(particle);
                    }
                } else {
                    // On desktop, apply to all particles
                    this.player.applyAttractFieldForce(particle);
                }
            }

            // Apply player's gravitational pull to nearby dust particles
            if (this.player && particle.collectible && this.player.gravitationalField.active) {
                const dx = this.player.x - particle.x;
                const dy = this.player.y - particle.y;
                const distanceSquared = dx * dx + dy * dy;
                const distance = Math.sqrt(distanceSquared);

                // Only apply gravity within the player's gravitational field radius
                const attractionRadius = this.player.gravitationalField.radius;

                if (distance < attractionRadius && distance > 0) {
                    // Calculate gravitational force (stronger when closer)
                    // Use inverse square law for realistic gravity
                    const proximityFactor = 1 - (distance / attractionRadius);
                    const gravityStrength = this.player.gravitationalField.strength * proximityFactor * proximityFactor; // Quadratic increase

                    // Apply force toward player
                    const fx = (dx / distance) * gravityStrength;
                    const fy = (dy / distance) * gravityStrength;

                    particle.applyForce(fx, fy);
                }
            }

            // Update particle position
            particle.update(this.speedFactor * 0.5); // Background particles move slower

            // Handle edge behavior
            particle.edges(this.canvas.width, this.canvas.height);

            // Check for collision with player (dust collection)
            if (this.player && particle.collectible) {
                const dx = this.player.x - particle.x;
                const dy = this.player.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Use a slightly larger collection radius for tiny particles
                if (distance < this.player.size + particle.size + 2) {
                    this.collectDustParticle(particle, i);
                }
            }
        }

        // Player controls are now handled in the handlePlayerControls method

        // Update target particles
        for (const target of this.targetParticles) {
            // Targets are slightly attracted to player
            const dx = this.player.x - target.x;
            const dy = this.player.y - target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                // Weak attraction to player
                const force = 0.001;
                target.applyForce((dx / distance) * force, (dy / distance) * force);

                // Also apply some random movement
                ParticleBehaviors.random(target, 0.02);
            }

            // Apply global physics forces
            this.applyGlobalForces(target);

            // Apply shield pulse force if active
            if (this.player.abilities.shieldPulse.active) {
                this.player.applyShieldPulseForce(target);
            }

            // Apply attract field force if active
            if (this.player.abilities.attractField.active) {
                // Target particles are important for gameplay, so always apply the force
                // but with a slight optimization for mobile
                const isMobile = window.isMobileDevice || false;
                if (isMobile) {
                    // Use a slightly reduced force for mobile
                    this.player.applyAttractFieldForce(target, 0.9);
                } else {
                    this.player.applyAttractFieldForce(target);
                }
            }

            // Update target position
            target.update(this.speedFactor);
            target.edges(this.canvas.width, this.canvas.height);

            // Check for collision with player
            if (distance < this.player.size + target.size) {
                // Collect target
                this.collectTarget(target);
            }
        }

        // Update obstacle particles
        for (let i = this.obstacleParticles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacleParticles[i];

            // Handle exploding obstacles
            if (obstacle.isExploding) {
                // Update explosion duration
                obstacle.explosionDuration++;

                // Check if explosion is complete
                if (obstacle.explosionDuration >= obstacle.explosionMaxDuration) {
                    // Remove obstacle
                    this.obstacleParticles.splice(i, 1);

                    // Create final explosion particles
                    this.createParticleEffect(obstacle.x, obstacle.y, 'explosion');

                    // Add score for destroying enemy
                    this.score += 15;

                    // Continue to next obstacle
                    continue;
                }

                // Check for player in explosion radius (only if player is not invulnerable)
                if (!this.player.invulnerable) {
                    const dx = this.player.x - obstacle.x;
                    const dy = this.player.y - obstacle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // If player enters explosion radius during explosion, apply damage
                    if (distance < obstacle.explosionRadius * (obstacle.explosionDuration / obstacle.explosionMaxDuration)) {
                        // Apply damage
                        this.lives--;

                        // Create hit effect
                        this.createParticleEffect(this.player.x, this.player.y, 'hit');

                        // Show message
                        this.showMessage('Caught in explosion!', '#f44336');

                        // Make player invulnerable
                        this.player.makeInvulnerable();

                        // Check for game over
                        if (this.lives <= 0) {
                            this.gameOver();
                        }
                    }
                }

                // Skip normal obstacle behavior for exploding obstacles
                continue;
            }

            // Normal obstacle behavior
            // Obstacles actively chase the player
            const dx = this.player.x - obstacle.x;
            const dy = this.player.y - obstacle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Check if enemy is in detection range for aggressive chase
            const inDetectionRange = distance < this.enemyDetectionRadius;

            // Check if chase state has changed
            if (inDetectionRange !== obstacle.isChasing) {
                // If entering chase mode, play alert sound
                if (inDetectionRange && this.soundEnabled) {
                    // Play chase alert sound
                    const alertSound = document.getElementById('alertSound');
                    if (alertSound) {
                        alertSound.volume = 0.3;
                        alertSound.currentTime = 0;
                        alertSound.play().catch(e => console.log('Error playing sound:', e));
                    }
                }
            }

            // Set chase state for visual indicator
            obstacle.isChasing = inDetectionRange;

            if (distance > 0) {
                // Base force depends on level and aggressiveness
                let force = this.obstacleAggressiveness + (this.level * 0.001);

                // Apply chase multiplier when in detection range
                if (inDetectionRange) {
                    // Increase force based on proximity (closer = more aggressive)
                    const proximityFactor = 1 - (distance / this.enemyDetectionRadius);
                    force *= this.enemyChaseMultiplier * (1 + proximityFactor);

                    // Reduce random movement when actively chasing
                    obstacle.maxSpeed = 1.5 + (this.level * 0.2); // Faster when chasing
                } else {
                    // Normal speed when not in chase mode
                    obstacle.maxSpeed = 0.5 + (this.level * 0.15);
                }

                // Smarter enemies predict player movement at higher levels
                if (this.enemyIntelligence > 0 && this.player.vx !== 0 && this.player.vy !== 0) {
                    // Calculate predicted position based on player velocity
                    // More accurate prediction when in detection range
                    const predictionFactor = inDetectionRange ?
                        this.enemyIntelligence * 15 :
                        this.enemyIntelligence * 10;

                    const predictX = this.player.x + (this.player.vx * predictionFactor);
                    const predictY = this.player.y + (this.player.vy * predictionFactor);

                    // Chase predicted position instead of current position
                    const predDx = predictX - obstacle.x;
                    const predDy = predictY - obstacle.y;
                    const predDistance = Math.sqrt(predDx * predDx + predDy * predDy);

                    if (predDistance > 0) {
                        obstacle.applyForce((predDx / predDistance) * force, (predDy / predDistance) * force);
                    }
                } else {
                    // Basic chase behavior for lower levels
                    obstacle.applyForce((dx / distance) * force, (dy / distance) * force);
                }

                // Apply less random movement when chasing or as intelligence increases
                const intelligenceFactor = Math.max(0.001, 0.01 - (this.enemyIntelligence * 0.002));
                const randomFactor = inDetectionRange ? intelligenceFactor * 0.3 : intelligenceFactor;
                ParticleBehaviors.random(obstacle, randomFactor);
            }

            // Apply global physics forces
            this.applyGlobalForces(obstacle);

            // Apply shield pulse force if active
            if (this.player.abilities.shieldPulse.active) {
                this.player.applyShieldPulseForce(obstacle);
            }

            // Apply attract field force if active
            if (this.player.abilities.attractField.active) {
                // Check if we're on a mobile device to apply optimizations
                const isMobile = window.isMobileDevice || false;

                if (isMobile) {
                    // On mobile, apply reduced force to obstacles and only to every other one
                    if (i % 2 === 0) {
                        this.player.applyAttractFieldForce(obstacle, 0.8);
                    }
                } else {
                    // On desktop, apply to all obstacles
                    this.player.applyAttractFieldForce(obstacle);
                }
            }

            // Update obstacle position
            obstacle.update(this.speedFactor);
            obstacle.edges(this.canvas.width, this.canvas.height);

            // Check for collision with player (only for non-exploding obstacles)
            if (!obstacle.isExploding && distance < this.player.size + obstacle.size && !this.player.invulnerable) {
                // Hit obstacle
                this.hitObstacle(obstacle);
            }
        }

        // Update boost particles
        for (const boost of this.boostParticles) {
            // Boosts slowly drift around
            ParticleBehaviors.random(boost, 0.005);

            // Apply global physics forces
            this.applyGlobalForces(boost);

            // Apply shield pulse force if active
            if (this.player.abilities.shieldPulse.active) {
                this.player.applyShieldPulseForce(boost);
            }

            // Apply attract field force if active
            if (this.player.abilities.attractField.active) {
                // Check if we're on a mobile device to apply optimizations
                const isMobile = window.isMobileDevice || false;

                // Boost particles are important for gameplay, so always apply the force
                if (isMobile) {
                    // Use a slightly reduced force for mobile
                    this.player.applyAttractFieldForce(boost, 0.9);
                } else {
                    this.player.applyAttractFieldForce(boost);
                }
            }

            // Update boost position
            boost.update(this.speedFactor * 0.7);
            boost.edges(this.canvas.width, this.canvas.height);

            // Check for collision with player
            const dx = this.player.x - boost.x;
            const dy = this.player.y - boost.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.player.size + boost.size) {
                // Check if this is a weapon power-up
                if (boost.type === 'weapon') {
                    this.collectWeapon(boost);
                } else {
                    // Regular speed boost
                    this.collectBoost(boost);
                }
            }
        }

        // Update repulsor energy particles
        for (const repulsorEnergy of this.repulsorEnergyParticles) {
            // Particles slowly drift around
            ParticleBehaviors.random(repulsorEnergy, 0.005);

            // Apply global physics forces
            this.applyGlobalForces(repulsorEnergy);

            // Apply shield pulse force if active
            if (this.player.abilities.shieldPulse.active) {
                this.player.applyShieldPulseForce(repulsorEnergy);
            }

            // Apply attract field force if active
            if (this.player.abilities.attractField.active) {
                // Check if we're on a mobile device to apply optimizations
                const isMobile = window.isMobileDevice || false;

                if (isMobile) {
                    // On mobile, apply reduced force to repulsor energy particles
                    this.player.applyAttractFieldForce(repulsorEnergy, 0.8);
                } else {
                    // On desktop, apply normal force
                    this.player.applyAttractFieldForce(repulsorEnergy);
                }
            }

            // Update particle position
            repulsorEnergy.update(this.speedFactor * 0.7);
            repulsorEnergy.edges(this.canvas.width, this.canvas.height);

            // Check for collision with player
            const dx = this.player.x - repulsorEnergy.x;
            const dy = this.player.y - repulsorEnergy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.player.size + repulsorEnergy.size) {
                // Collect repulsor energy
                this.collectRepulsorEnergy(repulsorEnergy);
            }
        }

        // Update tractor beam energy particles
        for (const tractorEnergy of this.tractorEnergyParticles) {
            // Particles slowly drift around
            ParticleBehaviors.random(tractorEnergy, 0.005);

            // Apply global physics forces
            this.applyGlobalForces(tractorEnergy);

            // Apply shield pulse force if active
            if (this.player.abilities.shieldPulse.active) {
                this.player.applyShieldPulseForce(tractorEnergy);
            }

            // Apply attract field force if active
            if (this.player.abilities.attractField.active) {
                // Check if we're on a mobile device to apply optimizations
                const isMobile = window.isMobileDevice || false;

                // Tractor energy particles are important for gameplay, so always apply the force
                if (isMobile) {
                    // Use a slightly stronger force for tractor energy particles on mobile
                    // since these are the particles that refill the tractor beam ability
                    this.player.applyAttractFieldForce(tractorEnergy, 1.1);
                } else {
                    this.player.applyAttractFieldForce(tractorEnergy);
                }
            }

            // Update particle position
            tractorEnergy.update(this.speedFactor * 0.7);
            tractorEnergy.edges(this.canvas.width, this.canvas.height);

            // Check for collision with player
            const dx = this.player.x - tractorEnergy.x;
            const dy = this.player.y - tractorEnergy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.player.size + tractorEnergy.size) {
                // Collect tractor energy
                this.collectTractorEnergy(tractorEnergy);
            }
        }

        // Update shield particles
        for (const shield of this.shieldParticles) {
            // Shields move very slowly
            ParticleBehaviors.random(shield, 0.002);

            // Apply global physics forces
            this.applyGlobalForces(shield);

            // Apply shield pulse force if active
            if (this.player.abilities.shieldPulse.active) {
                this.player.applyShieldPulseForce(shield);
            }

            // Apply attract field force if active
            if (this.player.abilities.attractField.active) {
                this.player.applyAttractFieldForce(shield);
            }

            // Update shield position
            shield.update(this.speedFactor * 0.5);
            shield.edges(this.canvas.width, this.canvas.height);

            // Check for collision with player
            const dx = this.player.x - shield.x;
            const dy = this.player.y - shield.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.player.size + shield.size) {
                // Collect shield
                this.collectShield(shield);
            }
        }

        // Update weapon particles
        for (let i = this.weaponParticles.length - 1; i >= 0; i--) {
            const weapon = this.weaponParticles[i];
            weapon.update(this.speedFactor * 1.5); // Weapons move faster

            // Check for collisions with obstacles
            for (let j = this.obstacleParticles.length - 1; j >= 0; j--) {
                const obstacle = this.obstacleParticles[j];
                const dx = weapon.x - obstacle.x;
                const dy = weapon.y - obstacle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < weapon.size + obstacle.size) {
                    // Hit an obstacle - remove both
                    this.weaponParticles.splice(i, 1);
                    this.obstacleParticles.splice(j, 1);

                    // Create explosion effect
                    this.createParticleEffect(obstacle.x, obstacle.y, 'explosion');

                    // Add score
                    this.score += 5;

                    // Break out of inner loop since weapon is gone
                    break;
                }
            }

            // Remove if out of bounds or lifetime expired
            if (i < this.weaponParticles.length) { // Check if it still exists after collision check
                if (weapon.x < 0 || weapon.x > this.canvas.width ||
                    weapon.y < 0 || weapon.y > this.canvas.height ||
                    (weapon.lifetime !== undefined && weapon.lifetime <= 0)) {
                    this.weaponParticles.splice(i, 1);
                }
            }
        }

        // Level completion is now handled in collectDustParticle method
        // when all dust particles are collected

        // Update HUD
        this.updateHUD();
    }

    /**
     * Handle collecting a target
     * @param {Particle} target - The target particle that was collected
     */
    collectTarget(target) {
        // Remove target from array
        const index = this.targetParticles.indexOf(target);
        if (index > -1) {
            this.targetParticles.splice(index, 1);
        }

        // Add score and track collected targets - less on mobile
        // Check if we're on a mobile device
        const isMobile = window.isMobileDevice || false;

        // Mobile gets less energy per target particle
        if (isMobile) {
            this.score += 5; // Half the energy on mobile
        } else {
            this.score += 10; // Normal energy on desktop
        }

        this.totalTargetsCollected++;

        // Create particle effect
        this.createParticleEffect(target.x, target.y, 'collect');

        // Update HUD to show collection progress
        this.updateHUD();

        // Show message about collection progress
        if (this.targetParticles.length > 0) {
            const percentComplete = Math.floor((this.totalTargetsCollected / this.totalTargetsInLevel) * 100);
            this.showMessage(`Energy particle collected! ${this.targetParticles.length} remaining`, '#81c784');
        } else {
            this.showMessage('All energy particles collected! Level complete!', '#4caf50');
            // Complete the level when all energy particles are collected
            this.levelComplete();
            return;
        }

        // Increase difficulty
        this.increaseDifficulty();
    }

    /**
     * Handle collecting a dust particle
     * @param {Particle} particle - The dust particle that was collected
     * @param {number} index - The index of the particle in the array
     */
    collectDustParticle(particle, index) {
        // Mark as collected but keep in array with invisible state
        particle.collected = true;

        // Track collection progress
        this.collectedDustParticles++;

        // Create small particle effect
        this.createParticleEffect(particle.x, particle.y, 'dustCollect');

        // Add a tiny amount of score (energy) - less on mobile
        // Check if we're on a mobile device
        const isMobile = window.isMobileDevice || false;

        // Mobile gets less energy per dust particle
        if (isMobile) {
            this.score += 0.05; // Half the energy on mobile
        } else {
            this.score += 0.1; // Normal energy on desktop
        }

        // Occasionally increase player's gravitational field strength
        // This creates a positive feedback loop - the more dust you collect, the easier it gets
        if (Math.random() < 0.05) { // 5% chance per dust particle
            const strengthIncrease = 0.001; // Small incremental increase
            this.player.increaseGravitationalStrength(strengthIncrease);

            // Show message about gravitational strength increase
            if (Math.random() < 0.2) { // Only show message 20% of the time to avoid spam
                this.showMessage('Gravitational pull increased!', '#64b5f6');
            }
        }

        // Update HUD
        this.updateHUD();

        // Show occasional messages about progress
        const percentComplete = Math.floor((this.collectedDustParticles / this.totalDustParticles) * 100);

        // Show message at certain milestones
        if (percentComplete % 25 === 0 && percentComplete > 0) {
            // Emphasize gravity benefit over energy
            this.showMessage(`${percentComplete}% of dust collected! Gravitational pull significantly increased!`, '#ffb74d');

            // Give a larger bonus gravitational strength increase at each milestone
            // to compensate for the reduced energy benefit
            this.player.increaseGravitationalStrength(0.008);
        }
    }

    /**
     * Increase game difficulty after collecting energy
     */
    increaseDifficulty() {
        // Increase enemy count based on score milestones
        const scoreThreshold = 30; // Every 3 energy particles collected
        if (this.score % scoreThreshold === 0) {
            // Add a new obstacle
            this.createObstacleParticles(1);

            // Increase chase aggressiveness
            this.obstacleAggressiveness = Math.min(0.02, 0.005 + (this.score / 1000));

            // Increase enemy intelligence and chase behavior
            this.enemyIntelligence = Math.min(0.5, this.level * 0.1);
            this.enemyChaseMultiplier = Math.min(5.0, 3.0 + (this.level * 0.2));

            // Adjust detection radius based on level
            // Higher levels = enemies detect from further away
            this.enemyDetectionRadius = Math.min(350, 250 + (this.level * 10));

            // Add a power-up occasionally
            if (this.score % (scoreThreshold * 3) === 0) {
                this.createPowerup();
            }

            // Spawn ability energy particles
            if (this.score % (scoreThreshold * 2) === 0) {
                // Spawn repulsor energy
                if (this.repulsorEnergyParticles.length < 3) {
                    this.createRepulsorEnergyParticles(1);
                }
            }

            if (this.score % (scoreThreshold * 2 + 10) === 0) {
                // Spawn tractor beam energy
                if (this.tractorEnergyParticles.length < 3) {
                    this.createTractorEnergyParticles(1);
                }
            }
        }
    }

    /**
     * Create a random power-up
     */
    createPowerup() {
        const powerupTypes = ['boost', 'shield', 'weapon'];
        const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];

        switch (type) {
            case 'boost':
                this.createBoostParticles();
                break;
            case 'shield':
                this.createShieldParticles();
                break;
            case 'weapon':
                this.createWeaponPowerup();
                break;
        }
    }

    /**
     * Create repulsor energy particles
     * @param {number} count - Number of particles to create
     */
    createRepulsorEnergyParticles(count = 1) {
        for (let i = 0; i < count; i++) {
            // Create a repulsor energy particle at a random position
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = 12;

            // Create a blue repulsor energy particle
            const repulsorEnergy = new Particle(x, y, size, '#2196f3');
            repulsorEnergy.type = 'repulsorEnergy';
            repulsorEnergy.energyValue = 15; // Amount of energy this particle provides (reduced for incremental use)

            // Add to repulsor energy particles array
            this.repulsorEnergyParticles.push(repulsorEnergy);
        }

        // Show message
        if (count > 0) {
            this.showMessage('Repulsor Energy Available!', '#2196f3');
        }
    }

    /**
     * Create tractor beam energy particles
     * @param {number} count - Number of particles to create
     */
    createTractorEnergyParticles(count = 1) {
        for (let i = 0; i < count; i++) {
            // Create a tractor energy particle at a random position
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = 12;

            // Create a purple tractor energy particle
            const tractorEnergy = new Particle(x, y, size, '#9c27b0');
            tractorEnergy.type = 'tractorEnergy';
            tractorEnergy.energyValue = 15; // Amount of energy this particle provides (reduced for incremental use)

            // Add to tractor energy particles array
            this.tractorEnergyParticles.push(tractorEnergy);
        }

        // Show message
        if (count > 0) {
            this.showMessage('Tractor Beam Energy Available!', '#9c27b0');
        }
    }

    /**
     * Create a weapon power-up
     */
    createWeaponPowerup() {
        // Create a weapon power-up at a random position
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        const size = 15;

        // Create a purple weapon power-up
        const weapon = new Particle(x, y, size, '#9c27b0');
        weapon.type = 'weapon';
        weapon.duration = 600; // 10 seconds at 60fps

        // Add to boost particles array (reusing this for all power-ups)
        this.boostParticles.push(weapon);

        // Show message
        this.showMessage('Weapon Power-up Spawned!', '#9c27b0');
    }

    /**
     * Handle collecting a boost
     * @param {Particle} boost - The boost particle that was collected
     */
    collectBoost(boost) {
        // Remove boost from array
        const index = this.boostParticles.indexOf(boost);
        if (index > -1) {
            this.boostParticles.splice(index, 1);
        }

        // Create particle effect
        this.createParticleEffect(boost.x, boost.y, 'boost');

        // Add a charge to the boost launch ability if not at max
        if (this.player.abilities.boostLaunch.charges < this.player.abilities.boostLaunch.maxCharges) {
            this.player.abilities.boostLaunch.charges++;

            // Show message about boost charge
            this.showMessage(`Warp Speed Hail Mary Charge Added! (${this.player.abilities.boostLaunch.charges}/${this.player.abilities.boostLaunch.maxCharges})`, '#64b5f6');
        } else {
            // Already at max charges
            this.showMessage(`Warp Speed Hail Mary Charges Full! (${this.player.abilities.boostLaunch.maxCharges}/${this.player.abilities.boostLaunch.maxCharges})`, '#64b5f6');
        }

        // Create a new boost if needed
        if (this.boostParticles.length < 1) {
            this.createBoostParticles();
        }
    }

    /**
     * Handle collecting a shield
     * @param {Particle} shield - The shield particle that was collected
     */
    collectShield(shield) {
        // Remove shield from array
        const index = this.shieldParticles.indexOf(shield);
        if (index > -1) {
            this.shieldParticles.splice(index, 1);
        }

        // Create particle effect
        this.createParticleEffect(shield.x, shield.y, 'shield');

        // Add a shield
        this.lives++;

        // Make player temporarily invulnerable
        this.player.makeInvulnerable();

        // Create a new shield if needed (less frequently)
        if (this.shieldParticles.length < 1 && Math.random() < 0.5) {
            this.createShieldParticles();
        }
    }

    /**
     * Handle collecting a repulsor energy particle
     * @param {Particle} particle - The repulsor energy particle that was collected
     */
    collectRepulsorEnergy(particle) {
        // Remove particle from array
        const index = this.repulsorEnergyParticles.indexOf(particle);
        if (index > -1) {
            this.repulsorEnergyParticles.splice(index, 1);
        }

        // Add energy to player's repulsor ability
        this.player.addAbilityEnergy('shieldPulse', particle.energyValue);

        // Create particle effect
        this.createParticleEffect(particle.x, particle.y, 'repulsorEnergy');

        // Show message
        this.showMessage(`+${particle.energyValue} Repulsor Energy`, '#2196f3');
    }

    /**
     * Handle collecting a tractor beam energy particle
     * @param {Particle} particle - The tractor beam energy particle that was collected
     */
    collectTractorEnergy(particle) {
        // Remove particle from array
        const index = this.tractorEnergyParticles.indexOf(particle);
        if (index > -1) {
            this.tractorEnergyParticles.splice(index, 1);
        }

        // Add energy to player's attract field ability
        this.player.addAbilityEnergy('attractField', particle.energyValue);

        // Create particle effect
        this.createParticleEffect(particle.x, particle.y, 'tractorEnergy');

        // Show message
        this.showMessage(`+${particle.energyValue} Tractor Beam Energy`, '#9c27b0');
    }

    /**
     * Handle collecting a weapon power-up
     * @param {Particle} weapon - The weapon particle that was collected
     */
    collectWeapon(weapon) {
        // Remove weapon from array
        const index = this.boostParticles.indexOf(weapon);
        if (index > -1) {
            this.boostParticles.splice(index, 1);
        }

        // Activate weapon ability
        this.player.abilities.weapon.active = true;
        this.player.abilities.weapon.duration = this.player.abilities.weapon.maxDuration;

        // Show weapon UI
        const weaponAbility = document.getElementById('weaponAbility');
        if (weaponAbility) {
            weaponAbility.classList.add('active');
        }

        // Create particle effect
        this.createParticleEffect(weapon.x, weapon.y, 'weapon');

        // Show message
        this.showMessage('Weapon Activated!', '#9c27b0');
    }

    /**
     * Handle hitting an obstacle
     * @param {Particle} obstacle - The obstacle that was hit
     */
    hitObstacle(obstacle) {
        // Calculate distance for knockback and explosion effects
        const dx = this.player.x - obstacle.x;
        const dy = this.player.y - obstacle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Apply knockback to player
        if (distance > 0) {
            const knockbackForce = 0.5;
            this.player.applyForce((dx / distance) * knockbackForce, (dy / distance) * knockbackForce);
        }

        // Check if obstacle has a shield
        if (obstacle.hasShield) {
            // Break the shield
            obstacle.hasShield = false;

            // Create shield break effect
            this.createParticleEffect(obstacle.x, obstacle.y, 'shieldBreak');

            // Show message
            this.showMessage('Enemy shield broken!', '#64b5f6');

            // Make player temporarily invulnerable
            this.player.makeInvulnerable();

            // No life loss for breaking shield
            return;
        }

        // If no shield, start explosion
        if (!obstacle.isExploding) {
            // Start explosion
            obstacle.isExploding = true;
            obstacle.explosionDuration = 0;

            // Create explosion sound effect
            this.createParticleEffect(obstacle.x, obstacle.y, 'explosion');

            // Show message
            this.showMessage('Enemy destroyed!', '#ff9800');

            // Check if player is within explosion radius
            if (distance < obstacle.explosionRadius && !this.player.invulnerable) {
                // Double damage from explosion
                this.lives -= 2;

                // Create hit effect on player
                this.createParticleEffect(this.player.x, this.player.y, 'hit');

                // Show message about explosion damage
                this.showMessage('Caught in explosion! Double damage!', '#f44336');

                // Lose score
                this.score = Math.max(0, this.score - 30);
            } else {
                // Normal damage from direct hit
                this.lives--;

                // Create hit effect on player
                this.createParticleEffect(this.player.x, this.player.y, 'hit');

                // Lose score
                this.score = Math.max(0, this.score - 20);
            }

            // Make player temporarily invulnerable
            this.player.makeInvulnerable();

            // Check for game over
            if (this.lives <= 0) {
                this.gameOver();
            }
        }
    }

    /**
     * Draw all game objects
     */
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw starfield background
        this.drawStarfield();

        // Draw background particles (skip collected ones)
        for (const particle of this.particles) {
            if (!particle.collected) {
                particle.draw(this.ctx);
            }
        }

        // Only draw gameplay elements if in playing state
        if (this.state === 'playing') {
            // Draw gravity wells
            this.drawGravityWells();

            // Player and gameplay particles are only drawn in playing state

            // Draw boost particles
            for (const boost of this.boostParticles) {
                // Draw with glow effect
                this.ctx.shadowColor = '#64b5f6';
                this.ctx.shadowBlur = 15;
                boost.draw(this.ctx);

                // Draw pulsing ring around boost
                const pulseSize = Math.sin(performance.now() * 0.005) * 3 + 3;
                this.ctx.beginPath();
                this.ctx.arc(boost.x, boost.y, boost.size + pulseSize, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(100, 181, 246, 0.5)';
                this.ctx.stroke();
                this.ctx.shadowBlur = 0;
            }

            // Draw shield particles
            for (const shield of this.shieldParticles) {
                // Draw with glow effect
                this.ctx.shadowColor = '#fff176';
                this.ctx.shadowBlur = 15;
                shield.draw(this.ctx);

                // Draw rotating triangles around shield
                const time = performance.now() * 0.001;
                for (let i = 0; i < 3; i++) {
                    const angle = time + (i * Math.PI * 2 / 3);
                    const distance = shield.size * 2;

                    const x1 = shield.x + Math.cos(angle) * distance;
                    const y1 = shield.y + Math.sin(angle) * distance;

                    const x2 = shield.x + Math.cos(angle + 0.3) * (distance * 0.6);
                    const y2 = shield.y + Math.sin(angle + 0.3) * (distance * 0.6);

                    const x3 = shield.x + Math.cos(angle - 0.3) * (distance * 0.6);
                    const y3 = shield.y + Math.sin(angle - 0.3) * (distance * 0.6);

                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.lineTo(x3, y3);
                    this.ctx.closePath();
                    this.ctx.fillStyle = 'rgba(255, 241, 118, 0.5)';
                    this.ctx.fill();
                }
                this.ctx.shadowBlur = 0;
            }

            // Draw target particles
            for (const target of this.targetParticles) {
                // Draw with glow effect
                this.ctx.shadowColor = '#81c784';
                this.ctx.shadowBlur = 10;
                target.draw(this.ctx);
                this.ctx.shadowBlur = 0;
            }

            // Draw repulsor energy particles
            for (const repulsorEnergy of this.repulsorEnergyParticles) {
                // Draw with glow effect
                this.ctx.shadowColor = '#2196f3';
                this.ctx.shadowBlur = 15;
                repulsorEnergy.draw(this.ctx);

                // Draw pulsing ring around repulsor energy
                const pulseSize = Math.sin(performance.now() * 0.005) * 3 + 3;
                this.ctx.beginPath();
                this.ctx.arc(repulsorEnergy.x, repulsorEnergy.y, repulsorEnergy.size + pulseSize, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(33, 150, 243, 0.5)';
                this.ctx.stroke();

                // Draw repulsor icon in center
                this.ctx.beginPath();
                this.ctx.moveTo(repulsorEnergy.x - 5, repulsorEnergy.y);
                this.ctx.lineTo(repulsorEnergy.x + 5, repulsorEnergy.y);
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                this.ctx.lineWidth = 1;
                this.ctx.shadowBlur = 0;
            }

            // Draw tractor beam energy particles
            for (const tractorEnergy of this.tractorEnergyParticles) {
                // Draw with glow effect
                this.ctx.shadowColor = '#9c27b0';
                this.ctx.shadowBlur = 15;
                tractorEnergy.draw(this.ctx);

                // Draw pulsing ring around tractor energy
                const pulseSize = Math.sin(performance.now() * 0.005) * 3 + 3;
                this.ctx.beginPath();
                this.ctx.arc(tractorEnergy.x, tractorEnergy.y, tractorEnergy.size + pulseSize, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(156, 39, 176, 0.5)';
                this.ctx.stroke();

                // Draw tractor icon in center (plus sign)
                this.ctx.beginPath();
                this.ctx.moveTo(tractorEnergy.x - 5, tractorEnergy.y);
                this.ctx.lineTo(tractorEnergy.x + 5, tractorEnergy.y);
                this.ctx.moveTo(tractorEnergy.x, tractorEnergy.y - 5);
                this.ctx.lineTo(tractorEnergy.x, tractorEnergy.y + 5);
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                this.ctx.lineWidth = 1;
                this.ctx.shadowBlur = 0;
            }

            // Draw obstacle particles
            for (const obstacle of this.obstacleParticles) {
                // Skip if exploding (explosion is drawn separately)
                if (obstacle.isExploding) {
                    // Draw explosion
                    const progress = obstacle.explosionDuration / obstacle.explosionMaxDuration;

                    // Draw expanding explosion
                    this.ctx.beginPath();
                    this.ctx.arc(obstacle.x, obstacle.y, obstacle.explosionRadius * progress, 0, Math.PI * 2);

                    // Create gradient for explosion
                    const gradient = this.ctx.createRadialGradient(
                        obstacle.x, obstacle.y, 0,
                        obstacle.x, obstacle.y, obstacle.explosionRadius * progress
                    );
                    gradient.addColorStop(0, 'rgba(255, 200, 50, 0.9)');
                    gradient.addColorStop(0.5, 'rgba(255, 100, 50, 0.7)');
                    gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');

                    this.ctx.fillStyle = gradient;
                    this.ctx.fill();

                    continue;
                }

                // Different visual style based on chase state
                if (obstacle.isChasing) {
                    // Angry red glow when chasing
                    this.ctx.shadowColor = '#ff0000';
                    this.ctx.shadowBlur = 20;

                    // Pulsing effect when chasing
                    const pulseSize = Math.sin(performance.now() * 0.01) * 0.2 + 1.0;
                    obstacle.drawScaled(this.ctx, pulseSize);

                    // Draw detection radius (faint circle)
                    this.ctx.beginPath();
                    this.ctx.arc(obstacle.x, obstacle.y, this.enemyDetectionRadius * 0.3, 0, Math.PI * 2);
                    this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
                    this.ctx.stroke();

                    // Draw more aggressive spikes when chasing
                    const spikeCount = 8;
                    const spikeLength = obstacle.size * 1.2;

                    for (let i = 0; i < spikeCount; i++) {
                        const angle = (i / spikeCount) * Math.PI * 2 + performance.now() * 0.002;
                        const x1 = obstacle.x + Math.cos(angle) * obstacle.size;
                        const y1 = obstacle.y + Math.sin(angle) * obstacle.size;
                        const x2 = obstacle.x + Math.cos(angle) * (obstacle.size + spikeLength);
                        const y2 = obstacle.y + Math.sin(angle) * (obstacle.size + spikeLength);

                        this.ctx.beginPath();
                        this.ctx.moveTo(x1, y1);
                        this.ctx.lineTo(x2, y2);
                        this.ctx.strokeStyle = '#ff0000';
                        this.ctx.lineWidth = 2;
                        this.ctx.stroke();
                    }
                } else {
                    // Normal appearance when not chasing
                    this.ctx.shadowColor = '#e57373';
                    this.ctx.shadowBlur = 10;
                    obstacle.draw(this.ctx);

                    // Draw spikes around obstacles
                    const spikeCount = 5;
                    const spikeLength = obstacle.size * 0.7;

                    for (let i = 0; i < spikeCount; i++) {
                        const angle = (i / spikeCount) * Math.PI * 2;
                        const x1 = obstacle.x + Math.cos(angle) * obstacle.size;
                        const y1 = obstacle.y + Math.sin(angle) * obstacle.size;
                        const x2 = obstacle.x + Math.cos(angle) * (obstacle.size + spikeLength);
                        const y2 = obstacle.y + Math.sin(angle) * (obstacle.size + spikeLength);

                        this.ctx.beginPath();
                        this.ctx.moveTo(x1, y1);
                        this.ctx.lineTo(x2, y2);
                        this.ctx.strokeStyle = '#e57373';
                        this.ctx.lineWidth = 2;
                        this.ctx.stroke();
                    }
                }

                // Draw shield if active
                if (obstacle.hasShield) {
                    // Calculate shield pulse effect
                    obstacle.shieldPulse = (obstacle.shieldPulse + 0.05) % (Math.PI * 2);
                    const pulseScale = 1 + Math.sin(obstacle.shieldPulse) * 0.1; // 10% pulse

                    // Draw shield
                    this.ctx.beginPath();
                    this.ctx.arc(obstacle.x, obstacle.y, obstacle.shieldSize * pulseScale, 0, Math.PI * 2);
                    this.ctx.strokeStyle = obstacle.shieldColor;
                    this.ctx.lineWidth = 2;
                    this.ctx.globalAlpha = obstacle.shieldOpacity;
                    this.ctx.stroke();
                    this.ctx.globalAlpha = 1.0;
                }
            }

            // Reset context properties
            this.ctx.lineWidth = 1;
            this.ctx.shadowBlur = 0;

            // Draw weapon particles
            for (const weapon of this.weaponParticles) {
                // Draw with glow effect
                this.ctx.shadowColor = '#9c27b0';
                this.ctx.shadowBlur = 10;
                weapon.draw(this.ctx);

                // Draw trail behind weapon
                if (weapon.vx !== 0 || weapon.vy !== 0) {
                    const speed = Math.sqrt(weapon.vx * weapon.vx + weapon.vy * weapon.vy);
                    const trailLength = speed * 2;

                    this.ctx.beginPath();
                    this.ctx.moveTo(weapon.x, weapon.y);
                    this.ctx.lineTo(
                        weapon.x - (weapon.vx / speed) * trailLength,
                        weapon.y - (weapon.vy / speed) * trailLength
                    );
                    this.ctx.strokeStyle = '#9c27b0';
                    this.ctx.lineWidth = weapon.size / 2;
                    this.ctx.stroke();
                    this.ctx.lineWidth = 1;
                }

                this.ctx.shadowBlur = 0;
            }

            // Draw particle effects
            this.drawParticleEffects();

            // Draw player
            if (this.player) {
                // Draw player's gravitational field if active
                if (this.player.gravitationalField.active) {
                    const attractionRadius = this.player.gravitationalField.radius;

                    // Ensure all values are finite to prevent canvas errors
                    if (isFinite(this.player.x) && isFinite(this.player.y) &&
                        isFinite(this.player.size) && isFinite(attractionRadius)) {

                        // Draw subtle gravitational field
                        this.ctx.beginPath();
                        this.ctx.arc(this.player.x, this.player.y, attractionRadius, 0, Math.PI * 2);

                        // Create a radial gradient for the gravitational field
                        const gradient = this.ctx.createRadialGradient(
                            this.player.x, this.player.y, this.player.size,
                            this.player.x, this.player.y, attractionRadius
                        );

                        // Adjust opacity based on gravitational strength
                        const baseOpacity = 0.15;
                        const strengthFactor = this.player.gravitationalField.strength / this.player.gravitationalField.baseStrength;
                        const opacity = Math.min(0.3, baseOpacity * strengthFactor);

                        gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
                        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                        this.ctx.fillStyle = gradient;
                        this.ctx.fill();
                    } // Close the isFinite check
                }

                // Draw the player
                this.player.draw(this.ctx);
            }
        }
    }

    /**
     * Draw starfield background
     */
    drawStarfield() {
        // Use a cached starfield if available
        if (!this.starfieldCache) {
            // Create a cached canvas for the starfield
            this.starfieldCache = document.createElement('canvas');
            this.starfieldCache.width = this.canvas.width;
            this.starfieldCache.height = this.canvas.height;
            const ctx = this.starfieldCache.getContext('2d');

            // Draw stars
            const starCount = 200;
            for (let i = 0; i < starCount; i++) {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * this.canvas.height;
                const radius = Math.random() * 1.5;
                const brightness = Math.random() * 0.8 + 0.2;

                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
                ctx.fill();
            }
        }

        // Draw the cached starfield
        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(this.starfieldCache, 0, 0);
        this.ctx.globalAlpha = 1.0;
    }

    /**
     * Main animation loop
     */
    animate() {
        // Increment frame counter for various timing operations
        this.frameCount++;

        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    /**
     * Start the game
     */
    startGame() {
        console.log('Starting game, current state:', this.state);

        // Hide all screens
        this.showScreen(null);

        // Initialize game objects first
        this.initialize();

        // Show HUD
        const hud = document.getElementById('hud');
        if (hud) {
            hud.style.display = 'flex';
        }

        // Show ability buttons
        const abilityButtons = document.getElementById('ability-buttons');
        if (abilityButtons) {
            abilityButtons.style.display = 'flex';
        }



        // Set game state to playing AFTER initialization
        this.state = 'playing';
        console.log('Game state set to playing');

        // Start animation loop if not already running
        this.animate();
    }

    /**
     * Handle level completion
     */
    levelComplete() {
        // Update game state
        this.state = 'levelComplete';

        // Show level complete screen
        document.getElementById('levelScore').textContent = this.score;
        this.showScreen('levelCompleteScreen');

        // Show message
        this.showMessage(`Sector ${this.level} Complete!`, '#4caf50');
    }

    /**
     * Advance to the next level
     */
    nextLevel() {
        // Increment level
        this.level++;

        // Reset score for new level but give a bonus based on level
        this.score = 20 + (this.level * 5); // Start with more energy at higher levels

        // Increase difficulty with each level
        this.obstacleCount += 1; // More enemies
        this.obstacleAggressiveness += 0.002; // Faster chase

        // Increase enemy intelligence with each level
        this.enemyIntelligence = Math.min(0.5, 0.1 + (this.level * 0.05)); // Smarter enemies
        this.enemyChaseMultiplier = Math.min(5.0, 3.0 + (this.level * 0.2)); // More aggressive chase
        this.enemyDetectionRadius = Math.min(350, 250 + (this.level * 10)); // Detect from further away

        // Increase target count for higher levels
        this.targetCount = Math.min(20, 10 + Math.floor(this.level / 2));

        // Reset collection tracking
        this.totalTargetsCollected = 0;
        this.totalTargetsInLevel = 0;

        // Reset player's gravitational field strength but increase base strength with level
        if (this.player) {
            // Increase base gravitational strength with each level
            this.player.gravitationalField.baseStrength = 0.02 + (this.level * 0.002);
            // Reset current strength to slightly above base (to give a small advantage)
            this.player.gravitationalField.strength = this.player.gravitationalField.baseStrength * 1.2;
        }

        // Keep black hole chance at 100% but increase strength at higher levels
        this.blackHoleChance = 1.0; // Always 100% chance when timer is up
        this.blackHoleStrength = Math.min(0.2, 0.15 + (this.level * 0.01)); // Increase strength with level

        // Hide level complete screen
        this.showScreen(null);

        // Initialize new level
        this.initialize();

        // Set game state to playing
        this.state = 'playing';

        // Show message about level objective
        this.showMessage(`Entering Sector ${this.level} - Collect all energy particles to complete the level!`, '#2196f3');

        // Show tutorial message about dust collection if it's the first level
        if (this.level === 1) {
            setTimeout(() => {
                this.showMessage('TIP: Collecting dust particles increases your gravitational pull!', '#ffb74d');
            }, 3000);

            setTimeout(() => {
                this.showMessage('TIP: Your gravity attracts nearby dust toward you!', '#ffb74d');
            }, 6000);

            setTimeout(() => {
                this.showMessage('TIP: Dust provides very little energy, but helps you collect more!', '#ffb74d');
            }, 9000);
        }
    }

    /**
     * Handle game over
     */
    gameOver() {
        // Update game state
        this.state = 'gameOver';

        // Clean up any existing black holes
        this.cleanupBlackHoles();

        // Show game over screen
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.level;
        this.showScreen('gameOverScreen');
    }

    /**
     * Restart the game
     */
    restartGame() {
        // Reset game state
        this.score = 20; // Start with more energy
        this.level = 1;
        this.lives = 3;

        // Clean up any existing black holes
        this.cleanupBlackHoles();

        // Hide game over screen
        this.showScreen(null);

        // Show HUD if not already visible
        document.getElementById('hud').style.display = 'flex';

        // Show ability buttons
        document.getElementById('ability-buttons').style.display = 'flex';

        // Initialize game objects
        this.initialize();

        // Set game state to playing
        this.state = 'playing';
    }

    /**
     * Clean up any existing black holes
     */
    cleanupBlackHoles() {
        // Remove all black hole DOM elements and clear the array
        try {
            for (const blackHole of this.blackHoles) {
                if (blackHole.element) {
                    try {
                        blackHole.element.remove();
                    } catch (e) {
                        console.error('Error removing black hole element:', e);
                    }
                }
            }

            // Clear the black holes array
            this.blackHoles = [];

            // Reset player's black hole proximity data if it exists
            if (this.player && this.player.blackHoleProximity) {
                this.player.blackHoleProximity = {
                    active: false,
                    distance: Infinity,
                    eventHorizon: Infinity,
                    ratio: Infinity
                };
            }
        } catch (e) {
            console.error('Error in cleanupBlackHoles:', e);
        }
    }

    /**
     * Reset the game to start screen
     */
    resetGame() {
        // Reset game state
        this.score = 0;
        this.level = 1;
        this.lives = 3;

        // Clean up any existing black holes
        this.cleanupBlackHoles();

        // Show start screen
        this.showScreen('startScreen');

        // Hide HUD
        document.getElementById('hud').style.display = 'none';

        // Hide ability buttons
        document.getElementById('ability-buttons').style.display = 'none';

        // Set game state
        this.state = 'start';
    }

    /**
     * Update the ability buttons to show cooldowns and availability
     */
    updateAbilityButtons() {
        if (!this.player) return;

        // Repulsor button
        const repulsorButton = document.getElementById('repulsor-button');
        if (repulsorButton) {
            // Check if ability is usable (has any energy and not on cooldown)
            const isUsable = this.player.abilities.shieldPulse.energy > 0 &&
                          this.player.abilities.shieldPulse.cooldown <= 0;

            // Update cooldown overlay
            if (this.player.abilities.shieldPulse.cooldown > 0) {
                const percent = (this.player.abilities.shieldPulse.cooldown / this.player.abilities.shieldPulse.maxCooldown) * 100;
                repulsorButton.style.setProperty('--cooldown-percent', `${percent}%`);
                repulsorButton.classList.add('cooldown');
            } else {
                repulsorButton.style.setProperty('--cooldown-percent', '0%');
                repulsorButton.classList.remove('cooldown');
            }

            // Update disabled state
            if (!isUsable) {
                repulsorButton.classList.add('disabled');
                repulsorButton.classList.remove('ready');
            } else {
                repulsorButton.classList.remove('disabled');

                // Add ready class for mobile devices
                if (window.isMobileDevice) {
                    repulsorButton.classList.add('ready');
                }
            }

            // Update full power state
            if (this.player.abilities.shieldPulse.energy >= this.player.abilities.shieldPulse.maxEnergy) {
                repulsorButton.classList.add('full-power');
            } else {
                repulsorButton.classList.remove('full-power');
            }
        }

        // Tractor button
        const tractorButton = document.getElementById('tractor-button');
        if (tractorButton) {
            // Check if ability is usable (has any energy and not on cooldown)
            const isUsable = this.player.abilities.attractField.energy > 0 &&
                          this.player.abilities.attractField.cooldown <= 0;

            // Update cooldown overlay
            if (this.player.abilities.attractField.cooldown > 0) {
                const percent = (this.player.abilities.attractField.cooldown / this.player.abilities.attractField.maxCooldown) * 100;
                tractorButton.style.setProperty('--cooldown-percent', `${percent}%`);
                tractorButton.classList.add('cooldown');
            } else {
                tractorButton.style.setProperty('--cooldown-percent', '0%');
                tractorButton.classList.remove('cooldown');
            }

            // Update disabled state
            if (!isUsable) {
                tractorButton.classList.add('disabled');
                tractorButton.classList.remove('ready');
            } else {
                tractorButton.classList.remove('disabled');

                // Add ready class for mobile devices
                if (window.isMobileDevice) {
                    tractorButton.classList.add('ready');
                }
            }

            // Update full power state
            if (this.player.abilities.attractField.energy >= this.player.abilities.attractField.maxEnergy) {
                tractorButton.classList.add('full-power');
            } else {
                tractorButton.classList.remove('full-power');
            }
        }

        // Boost button
        const boostButton = document.getElementById('boost-button');
        if (boostButton) {
            // Check if ability is usable (has charges and not on cooldown)
            const isUsable = this.player.abilities.boostLaunch.charges >= this.player.abilities.boostLaunch.chargeCost &&
                          this.player.abilities.boostLaunch.cooldown <= 0;

            // Update cooldown overlay
            if (this.player.abilities.boostLaunch.cooldown > 0) {
                const percent = (this.player.abilities.boostLaunch.cooldown / this.player.abilities.boostLaunch.maxCooldown) * 100;
                boostButton.style.setProperty('--cooldown-percent', `${percent}%`);
                boostButton.classList.add('cooldown');
            } else {
                boostButton.style.setProperty('--cooldown-percent', '0%');
                boostButton.classList.remove('cooldown');
            }

            // Update disabled state
            if (!isUsable) {
                boostButton.classList.add('disabled');
                boostButton.classList.remove('ready');
            } else {
                boostButton.classList.remove('disabled');

                // Add ready class for mobile devices
                if (window.isMobileDevice) {
                    boostButton.classList.add('ready');
                }
            }

            // Update full power state (when at max charges)
            if (this.player.abilities.boostLaunch.charges >= this.player.abilities.boostLaunch.maxCharges) {
                boostButton.classList.add('full-power');
            } else {
                boostButton.classList.remove('full-power');
            }

            // Update active state for boost launch
            boostButton.classList.toggle('active', this.player.abilities.boostLaunch.active);

            // Update charge indicator
            const chargeLabel = boostButton.querySelector('.charge-indicator');
            if (!chargeLabel) {
                // Create charge indicator if it doesn't exist
                const indicator = document.createElement('div');
                indicator.className = 'charge-indicator';
                boostButton.appendChild(indicator);
            }

            // Update charge indicator text
            const indicator = boostButton.querySelector('.charge-indicator');
            if (indicator) {
                indicator.textContent = `${this.player.abilities.boostLaunch.charges}`;

                // Add visual indicator for number of charges
                indicator.className = 'charge-indicator';
                if (this.player.abilities.boostLaunch.charges >= this.player.abilities.boostLaunch.maxCharges) {
                    indicator.classList.add('max-charges');
                } else if (this.player.abilities.boostLaunch.charges === 0) {
                    indicator.classList.add('no-charges');
                }
            }
        }
    }

    /**
     * Show a message to the player
     * @param {string} text - Message text
     * @param {string} color - Message color
     */
    showMessage(text, color = '#ffffff') {
        // Create message element
        const message = document.createElement('div');
        message.classList.add('game-message');
        message.textContent = text;
        message.style.color = color;

        // Add to game container
        const container = document.querySelector('.game-container');
        if (container) {
            container.appendChild(message);

            // Animate in
            setTimeout(() => {
                message.classList.add('active');
            }, 10);

            // Remove after animation
            setTimeout(() => {
                message.classList.remove('active');
                setTimeout(() => {
                    message.remove();
                }, 500);
            }, 2000);
        }
    }
}
