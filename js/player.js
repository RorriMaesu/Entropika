/**
 * Player class representing the player-controlled particle
 * Extends the base Particle class with additional functionality
 */
class Player extends Particle {
    /**
     * Create a new player
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {number} size - Player size
     */
    constructor(x, y, size = 10) {
        // Call parent constructor with a distinctive color
        super(x, y, size, '#ffffff');

        // Player-specific properties
        // Check if we're on a mobile device
        const isMobile = window.isMobileDevice || false;

        if (isMobile) {
            // Mobile devices now get slower movement
            this.maxSpeed = 6; // Reduced from 10 to 6
            this.baseMaxSpeed = 6;
            this.acceleration = 0.3; // Reduced from 0.5 to 0.3
            this.friction = 0.96; // Increased friction to slow down faster
            this.mass = 3; // Increased mass for more inertia
        } else {
            // Desktop devices remain unchanged
            this.maxSpeed = 5; // Reduced speed for desktop
            this.baseMaxSpeed = 5;
            this.acceleration = 0.25; // Reduced acceleration for desktop
            this.friction = 0.97; // Slightly higher friction for desktop
            this.mass = 3; // Higher mass for desktop for more inertia
        }

        // Override the gravity factor for player to be minimal
        // This ensures player movement isn't heavily affected by gravity
        this.gravityFactor = 0.1;

        // Player's gravitational field properties
        this.gravitationalField = {
            active: true,           // Always active
            radius: 100,           // Radius of gravitational influence
            strength: 0.02,        // Base strength of gravitational pull
            baseStrength: 0.02     // Store base strength for upgrades
        };

        // Black hole proximity tracking
        this.blackHoleProximity = {
            active: false,          // Whether player is near a black hole
            distance: 0,            // Distance to black hole
            eventHorizon: 0,        // Event horizon radius
            ratio: 10.0            // Distance / eventHorizon (< 1.0 means inside event horizon)
        };

        // Shield properties
        this.invulnerable = false;
        this.invulnerableTime = 0;
        this.maxInvulnerableTime = 90; // frames (1.5 seconds at 60fps)

        // Special abilities
        this.abilities = {
            shieldPulse: {
                active: false,
                cooldown: 0,
                maxCooldown: 180, // 3 seconds at 60fps
                radius: 150,
                force: 2,
                energy: 50,        // Current energy level (starting with 50% energy)
                maxEnergy: 100,   // Energy required to use ability
                recharging: false // Whether ability is recharging
            },
            attractField: {
                active: false,
                cooldown: 0,
                maxCooldown: 240, // 4 seconds at 60fps
                radius: 200,
                force: 6.0, // Significantly increased for stronger tractor beam effect
                energy: 50,        // Current energy level (starting with 50% energy)
                maxEnergy: 100,   // Energy required to use ability
                recharging: false // Whether ability is recharging
            },
            speedBoost: {
                active: false,
                duration: 0,
                maxDuration: 120, // 2 seconds at 60fps
                multiplier: 1.8,
                energyCost: 5
            },
            boostLaunch: {
                active: false,
                cooldown: 0,
                maxCooldown: 120, // 2 seconds at 60fps - increased cooldown for balance
                charges: 1,       // Start with one charge
                maxCharges: 3,    // Maximum number of charges player can have
                chargeCost: 1,    // Cost per use
                force: 40,        // Base force for the launch - increased for more significant distance
                duration: 0,      // Current duration of active boost
                maxDuration: 90,  // 1.5 seconds at 60fps - duration of boost effect and invulnerability
                recharging: false // Whether ability is recharging
            },
            weapon: {
                active: false,
                duration: 0,
                maxDuration: 600, // 10 seconds at 60fps
                cooldown: 0,
                maxCooldown: 30, // 0.5 seconds at 60fps
                damage: 1,
                range: 200
            }
        };

        // Input state
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            space: false, // Shield pulse key
            shift: false, // Speed boost key
            e: false, // Weapon key
            q: false,  // Attract field key (alternative)
            c: false   // Attract field key (primary)
        };

        // Trail effect
        this.maxHistoryLength = 15;

        // Physics properties
        this.elasticity = 0.8; // Bounciness in collisions

        // Initialize input handlers
        this.setupInputHandlers();

        // Effects container
        this.effects = [];
    }

    /**
     * Set up keyboard input handlers
     */
    setupInputHandlers() {
        // Check if we're on a mobile device
        const isMobile = window.isMobileDevice || false;

        // Only set up keyboard controls for desktop devices
        if (!isMobile) {
            // Keyboard controls - only for desktop
            window.addEventListener('keydown', (e) => {
                this.handleKeyDown(e.key);
                // Prevent scrolling with arrow keys and space
                if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                    e.preventDefault();
                }
            });

            window.addEventListener('keyup', (e) => {
                this.handleKeyUp(e.key);
            });
        }
    }

    /**
     * Handle key down events
     * @param {string} key - Key that was pressed
     */
    handleKeyDown(key) {
        switch (key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.keys.up = true;
                break;
            case 's':
            case 'arrowdown':
                this.keys.down = true;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = true;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = true;
                break;
            case ' ':
                this.keys.space = true;
                break;
            case 'shift':
                this.keys.shift = true;
                break;
            case 'e':
                this.keys.e = true;
                this.fireWeapon();
                break;
            case 'q':
                this.keys.q = true;
                break;
            case 'c':
                this.keys.c = true;
                break;
        }
    }

    /**
     * Handle key up events
     * @param {string} key - Key that was released
     */
    handleKeyUp(key) {
        switch (key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.keys.up = false;
                break;
            case 's':
            case 'arrowdown':
                this.keys.down = false;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = false;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = false;
                break;
            case ' ':
                this.keys.space = false;
                break;
            case 'shift':
                this.keys.shift = false;
                this.abilities.speedBoost.active = false;
                break;
            case 'e':
                this.keys.e = false;
                break;
            case 'q':
                this.keys.q = false;
                break;
            case 'c':
                this.keys.c = false;
                break;
        }
    }

    /**
     * Update player position based on input
     * @param {number} speedFactor - Speed multiplier
     * @param {number} energy - Current energy level for abilities
     * @returns {number} Energy cost (if any)
     */
    update(speedFactor = 1, energy = 0) {
        let energyCost = 0;
        const movementEnergyCost = 0.1; // Base energy cost for movement (increased to make it more challenging)
        let isMoving = false;

        // Reset black hole proximity if not updated this frame
        if (this.blackHoleProximity.active) {
            // Gradually decay black hole proximity if not updated
            this.blackHoleProximity.ratio += 0.1;
            if (this.blackHoleProximity.ratio > 10.0) {
                this.blackHoleProximity.active = false;
            }
        }

        // Update ability cooldowns and energy
        this.updateAbilityCooldowns();

        // Update weapon cooldown
        if (this.abilities.weapon.cooldown > 0) {
            this.abilities.weapon.cooldown--;
        }

        // Update weapon duration
        if (this.abilities.weapon.active) {
            this.abilities.weapon.duration--;

            if (this.abilities.weapon.duration <= 0) {
                this.abilities.weapon.active = false;

                // Hide weapon UI
                const weaponAbility = document.getElementById('weaponAbility');
                if (weaponAbility) {
                    weaponAbility.classList.remove('active');
                }
            }
        }

        // Keyboard shortcuts for abilities are disabled
        // Abilities are now only activated by clicking the on-screen buttons

        // Handle speed boost ability
        if (this.keys.shift && energy >= this.abilities.speedBoost.energyCost) {
            const result = this.activateSpeedBoost(energy);
            if (result) {
                // Apply energy cost
                energyCost += this.abilities.speedBoost.energyCost;
            }
        }

        // Update speed boost duration
        if (this.abilities.speedBoost.active) {
            this.abilities.speedBoost.duration--;

            // Create trail effect every few frames
            if (this.abilities.speedBoost.duration % 5 === 0) {
                this.createSpeedTrail();
            }

            if (this.abilities.speedBoost.duration <= 0 || !this.keys.shift) {
                this.abilities.speedBoost.active = false;
                this.maxSpeed = this.baseMaxSpeed;
            }
        }

        // Update boost launch duration
        if (this.abilities.boostLaunch.active) {
            this.abilities.boostLaunch.duration--;

            // Create trail effect every few frames
            if (this.abilities.boostLaunch.duration % 3 === 0) {
                this.createSpeedTrail(); // Reuse speed trail effect
            }

            // Keep player invulnerable while boost is active
            this.invulnerable = true;
            this.invulnerableTime = Math.max(this.invulnerableTime, 5); // Ensure invulnerability doesn't expire early

            if (this.abilities.boostLaunch.duration <= 0) {
                this.abilities.boostLaunch.active = false;
                // Invulnerability will expire naturally through invulnerableTime counter
            }
        }

        // Apply input-based acceleration only if player has energy
        if (energy > 0) {
            if (this.keys.up) {
                this.ay -= this.acceleration;
                isMoving = true;
            }
            if (this.keys.down) {
                this.ay += this.acceleration;
                isMoving = true;
            }
            if (this.keys.left) {
                this.ax -= this.acceleration;
                isMoving = true;
            }
            if (this.keys.right) {
                this.ax += this.acceleration;
                isMoving = true;
            }

            // Apply energy cost for movement
            if (isMoving) {
                // Calculate energy cost multipliers
                let costMultiplier = 1.0;

                // Movement costs more energy when using speed boost
                if (this.abilities.speedBoost.active) {
                    costMultiplier *= 2.0;
                }

                // Movement costs MUCH more energy when near a black hole
                if (this.blackHoleProximity.active) {
                    // Calculate black hole energy drain multiplier
                    // The closer to the center, the higher the energy cost
                    if (this.blackHoleProximity.ratio <= 0.5) {
                        // Deep inside black hole - extreme energy cost
                        costMultiplier *= 8.0;

                        // Show warning about extreme energy drain
                        if (Math.random() < 0.05) {
                            if (this.game) {
                                this.game.showMessage('CRITICAL: Black hole draining energy rapidly!', '#f44336');
                            }
                        }
                    } else if (this.blackHoleProximity.ratio <= 1.0) {
                        // Inside event horizon - very high energy cost
                        costMultiplier *= 5.0;

                        // Show warning about high energy drain
                        if (Math.random() < 0.03) {
                            if (this.game) {
                                this.game.showMessage('WARNING: Black hole draining energy!', '#ff9800');
                            }
                        }
                    } else if (this.blackHoleProximity.ratio <= 2.0) {
                        // Near event horizon - increased energy cost
                        costMultiplier *= 3.0;
                    }
                }

                // Apply the final energy cost
                energyCost += movementEnergyCost * costMultiplier;
            }
        } else {
            // When out of energy, player can't move - reset acceleration and slow down velocity
            this.ax = 0;
            this.ay = 0;
            this.vx *= 0.8; // Stronger friction when out of energy
            this.vy *= 0.8;

            // Show warning about being out of energy occasionally
            if (Math.random() < 0.01 && this.game) {
                this.game.showMessage('Out of energy! Collect particles to recharge.', '#ff0000');
            }
        }

        // Call parent update method with appropriate speed factor
        // Adjust speed factor based on device type and abilities
        let currentSpeedFactor;

        // Check if we're on a mobile device
        const isMobile = window.isMobileDevice || false;

        if (this.abilities.speedBoost.active) {
            // Speed boost is active - use higher speed factor regardless of device
            if (isMobile) {
                currentSpeedFactor = speedFactor * 1.2; // Reduced from 1.5 to 1.2
            } else {
                // Desktop remains unchanged
                currentSpeedFactor = speedFactor * 1.5;
            }
        } else if (isMobile) {
            // Mobile devices now use an even lower speed factor
            currentSpeedFactor = speedFactor * 0.8; // Reduced from 1.0 to 0.8
        } else {
            // Desktop devices remain unchanged
            currentSpeedFactor = speedFactor * 0.7; // 30% slower on desktop
        }
        super.update(currentSpeedFactor);

        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Update invulnerability timer
        if (this.invulnerable) {
            this.invulnerableTime--;
            if (this.invulnerableTime <= 0) {
                this.invulnerable = false;
            }
        }

        // Update visual effects
        this.updateEffects();

        return energyCost;
    }

    /**
     * Handle edge behavior (bounce off edges instead of wrapping)
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    edges(width, height) {
        // Bounce off edges with elasticity
        if (this.x > width - this.size) {
            this.x = width - this.size;
            this.vx *= -this.elasticity;
            this.createCollisionEffect(this.x, this.y);
        } else if (this.x < this.size) {
            this.x = this.size;
            this.vx *= -this.elasticity;
            this.createCollisionEffect(this.x, this.y);
        }

        if (this.y > height - this.size) {
            this.y = height - this.size;
            this.vy *= -this.elasticity;
            this.createCollisionEffect(this.x, this.y);
        } else if (this.y < this.size) {
            this.y = this.size;
            this.vy *= -this.elasticity;
            this.createCollisionEffect(this.x, this.y);
        }
    }

    /**
     * Move toward a specific target point with energy constraints
     * @param {number} targetX - Target X coordinate
     * @param {number} targetY - Target Y coordinate
     * @param {number} energy - Available energy
     * @returns {number} Energy cost
     */
    moveTowardTarget(targetX, targetY, energy) {
        // Calculate direction to target
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return 0; // Already at target

        // Base energy cost for movement - depends on device type
        // Mobile uses less energy per movement to compensate for the stronger force
        const isMobile = window.isMobileDevice || false;
        const movementEnergyCost = isMobile ? 0.05 : 0.1; // Half the energy cost on mobile
        let energyCost = 0;

        // Calculate energy needed to reach the target
        const estimatedEnergyCost = (distance / 50) * movementEnergyCost;

        // Determine if we have enough energy to reach the target
        const availableEnergy = energy;
        const canReachTarget = availableEnergy >= estimatedEnergyCost;

        // Calculate force based on available energy and device type
        let force;

        // We already have the isMobile variable from above

        // Base force value depends on device type
        const baseForce = isMobile ? 0.5 : 0.2; // Reduced from 0.8 to 0.5 for mobile, desktop unchanged

        if (canReachTarget) {
            // Full force if we can reach the target
            force = baseForce;
            energyCost = estimatedEnergyCost;
        } else {
            // Partial force based on available energy
            const energyRatio = availableEnergy / estimatedEnergyCost;
            force = baseForce * energyRatio;
            energyCost = availableEnergy; // Use all available energy
        }

        // Apply force toward target
        this.applyForce((dx / distance) * force, (dy / distance) * force);

        // Apply energy cost multipliers based on conditions
        let costMultiplier = 1.0;

        // Movement costs more energy when using speed boost
        if (this.abilities.speedBoost.active) {
            costMultiplier *= 2.0;
        }

        // Apply black hole proximity multiplier if active
        if (this.blackHoleProximity.active) {
            if (this.blackHoleProximity.ratio <= 0.5) {
                // Deep inside event horizon - extreme energy cost
                costMultiplier *= 10.0;
            } else if (this.blackHoleProximity.ratio <= 1.0) {
                // Inside event horizon - very high energy cost
                costMultiplier *= 5.0;
            } else if (this.blackHoleProximity.ratio <= 2.0) {
                // Near event horizon - increased energy cost
                costMultiplier *= 3.0;
            }
        }

        // Apply the final energy cost
        return energyCost * costMultiplier;
    }

    /**
     * Make the player temporarily invulnerable
     */
    makeInvulnerable() {
        this.invulnerable = true;
        this.invulnerableTime = this.maxInvulnerableTime;
    }

    /**
     * Activate shield pulse ability
     * @returns {boolean} Whether the ability was activated
     */
    activateShieldPulse() {
        // Check if ability is on cooldown
        if (this.abilities.shieldPulse.cooldown > 0) {
            return false;
        }

        // Check if we have any energy at all
        if (this.abilities.shieldPulse.energy <= 0) {
            return false;
        }

        // Activate ability
        this.abilities.shieldPulse.active = true;

        // Cooldown is proportional to energy level
        // Full energy = full cooldown, partial energy = partial cooldown
        const energyRatio = this.abilities.shieldPulse.energy / this.abilities.shieldPulse.maxEnergy;
        this.abilities.shieldPulse.cooldown = Math.max(30, Math.floor(this.abilities.shieldPulse.maxCooldown * energyRatio));

        // The force of the pulse is also proportional to energy level
        const effectiveForce = this.abilities.shieldPulse.force * energyRatio;
        this.abilities.shieldPulse.effectiveForce = effectiveForce;

        // Reset energy and set recharging flag
        this.abilities.shieldPulse.energy = 0;
        this.abilities.shieldPulse.recharging = true;

        // Create shield pulse effect
        this.createShieldPulseEffect();

        return true;
    }

    /**
     * Apply shield pulse force to a particle
     * @param {Particle} particle - Particle to apply force to
     * @returns {boolean} Whether force was applied
     */
    applyShieldPulseForce(particle) {
        if (!this.abilities.shieldPulse.active) return false;

        const dx = particle.x - this.x;
        const dy = particle.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.abilities.shieldPulse.radius && distance > 0) {
            // Calculate force based on distance (closer = stronger)
            // Use effectiveForce if available, otherwise use the base force
            const force = this.abilities.shieldPulse.effectiveForce || this.abilities.shieldPulse.force;
            const forceFactor = (1 - distance / this.abilities.shieldPulse.radius) * force;

            // Apply force away from player
            const fx = (dx / distance) * forceFactor;
            const fy = (dy / distance) * forceFactor;

            particle.applyForce(fx, fy);
            return true;
        }

        return false;
    }

    /**
     * Activate attract field ability
     * @returns {boolean} Whether the ability was activated
     */
    activateAttractField() {
        // Check if ability is on cooldown
        if (this.abilities.attractField.cooldown > 0) {
            return false;
        }

        // Check if we have any energy at all
        if (this.abilities.attractField.energy <= 0) {
            return false;
        }

        // Activate ability
        this.abilities.attractField.active = true;

        // Cooldown is proportional to energy level
        // Full energy = full cooldown, partial energy = partial cooldown
        const energyRatio = this.abilities.attractField.energy / this.abilities.attractField.maxEnergy;
        this.abilities.attractField.cooldown = Math.max(30, Math.floor(this.abilities.attractField.maxCooldown * energyRatio));

        // The force of the attract field is also proportional to energy level
        const effectiveForce = this.abilities.attractField.force * energyRatio;
        this.abilities.attractField.effectiveForce = effectiveForce;

        // Reset energy and set recharging flag
        this.abilities.attractField.energy = 0;
        this.abilities.attractField.recharging = true;

        // Create visual effect
        this.createAttractFieldEffect();

        return true;
    }

    /**
     * Apply attract field force to a particle
     * @param {Particle} particle - Particle to apply force to
     * @param {number} [forceMultiplier=1.0] - Optional multiplier to adjust force strength
     * @returns {boolean} Whether force was applied
     */
    applyAttractFieldForce(particle, forceMultiplier = 1.0) {
        if (!this.abilities.attractField.active) {
            return false;
        }

        // Check if we're on a mobile device to apply optimizations
        const isMobile = window.isMobileDevice || false;

        const dx = particle.x - this.x;
        const dy = particle.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.abilities.attractField.radius && distance > 0) {
            // Calculate force based on distance (closer = stronger for better attraction)
            // Use effectiveForce if available, otherwise use the base force
            const force = (this.abilities.attractField.effectiveForce || this.abilities.attractField.force) * forceMultiplier;

            // Optimize force calculation for mobile
            let forceFactor;
            if (isMobile) {
                // Simplified calculation for mobile - less intensive
                forceFactor = (1 - distance / this.abilities.attractField.radius) * force * 4;
            } else {
                // Original calculation for desktop
                forceFactor = (1 - distance / this.abilities.attractField.radius) * force * 6;
            }

            // IMPORTANT: For a tractor beam, we need to pull particles TOWARD the player
            // dx and dy point from player to particle, so negative signs pull toward player
            // This is the opposite of the repulsor force
            const fx = -(dx / distance) * forceFactor;
            const fy = -(dy / distance) * forceFactor;

            particle.applyForce(fx, fy);
            return true;
        }

        return false;
    }

    /**
     * Create attract field visual effect
     */
    createAttractFieldEffect() {
        // Check if we're on a mobile device to apply optimizations
        const isMobile = window.isMobileDevice || false;

        // Get energy ratio for visual effect intensity
        const energyRatio = this.abilities.attractField.effectiveForce / this.abilities.attractField.force;

        // Create DOM element for effect
        const effect = document.createElement('div');
        effect.classList.add('particle-effect', 'attract-field');

        // Add mobile-specific class for optimized rendering
        if (isMobile) {
            effect.classList.add('mobile-optimized');
        }

        // Add class for partial energy use
        if (energyRatio < 0.9) {
            effect.classList.add('partial-energy');
        }

        effect.style.left = `${this.x}px`;
        effect.style.top = `${this.y}px`;

        // Scale effect size based on energy level and device type
        let effectiveRadius;
        if (isMobile) {
            // Smaller radius on mobile for better performance
            effectiveRadius = this.abilities.attractField.radius * Math.max(0.5, energyRatio) * 0.8;
        } else {
            // Original radius on desktop
            effectiveRadius = this.abilities.attractField.radius * Math.max(0.6, energyRatio);
        }

        effect.style.width = `${effectiveRadius * 2}px`;
        effect.style.height = `${effectiveRadius * 2}px`;
        effect.style.marginLeft = `-${effectiveRadius}px`;
        effect.style.marginTop = `-${effectiveRadius}px`;

        document.body.appendChild(effect);

        // Remove visual effect after animation completes
        // But keep the tractor beam force active longer
        // Shorter duration on mobile for better performance
        const visualDuration = isMobile ? 1500 : 2000; // 1.5 seconds on mobile, 2 seconds on desktop
        const forceDuration = isMobile ? 2500 : 3000; // 2.5 seconds on mobile, 3 seconds on desktop

        // Remove only the visual effect after visual duration
        setTimeout(() => {
            effect.remove();
        }, visualDuration);

        // Deactivate the ability after force duration
        setTimeout(() => {
            this.abilities.attractField.active = false;
        }, forceDuration);
    }

    /**
     * Create shield pulse visual effect
     */
    createShieldPulseEffect() {
        // Get energy ratio for visual effect intensity
        const energyRatio = this.abilities.shieldPulse.effectiveForce / this.abilities.shieldPulse.force;

        // Create DOM element for effect
        const effect = document.createElement('div');
        effect.classList.add('particle-effect', 'shield-pulse');

        // Add class for partial energy use
        if (energyRatio < 0.9) {
            effect.classList.add('partial-energy');
        }

        effect.style.left = `${this.x}px`;
        effect.style.top = `${this.y}px`;

        // Scale effect size based on energy level
        const effectiveRadius = this.abilities.shieldPulse.radius * Math.max(0.6, energyRatio);
        effect.style.width = `${effectiveRadius * 2}px`;
        effect.style.height = `${effectiveRadius * 2}px`;
        effect.style.marginLeft = `-${effectiveRadius}px`;
        effect.style.marginTop = `-${effectiveRadius}px`;

        document.body.appendChild(effect);

        // Remove after animation completes
        // Use longer duration for better effect
        const duration = 1000; // 1 second duration for better effect
        setTimeout(() => {
            effect.remove();
            this.abilities.shieldPulse.active = false;
        }, duration);
    }

    /**
     * Create speed trail effect
     */
    createSpeedTrail() {
        if (this.history.length < 2) return;

        // Get last two positions
        const pos1 = this.history[this.history.length - 1];
        const pos2 = this.history[this.history.length - 2];

        // Create trail element
        const trail = document.createElement('div');
        trail.classList.add('particle-effect', 'speed-trail');

        // Position and size based on movement
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const angle = Math.atan2(dy, dx);
        const length = Math.sqrt(dx * dx + dy * dy) * 3;

        trail.style.left = `${pos2.x}px`;
        trail.style.top = `${pos2.y}px`;
        trail.style.width = `${length}px`;
        trail.style.height = `${this.size}px`;
        trail.style.transform = `rotate(${angle}rad)`;
        trail.style.transformOrigin = 'left center';

        document.body.appendChild(trail);

        // Add to effects array
        this.effects.push({
            element: trail,
            duration: 10
        });
    }

    /**
     * Create a boost launch effect
     * @param {number} angle - Launch angle in radians
     * @param {number} x - X position for the effect (defaults to player's current position)
     * @param {number} y - Y position for the effect (defaults to player's current position)
     */
    createBoostLaunchEffect(angle, x = this.x, y = this.y) {
        // Create DOM element for the main burst effect
        const burstEffect = document.createElement('div');
        burstEffect.classList.add('particle-effect', 'boost-launch-burst');

        // Position at specified coordinates - make burst effect larger
        burstEffect.style.left = `${x}px`;
        burstEffect.style.top = `${y}px`;
        burstEffect.style.width = `${this.size * 20}px`; // Doubled size
        burstEffect.style.height = `${this.size * 20}px`; // Doubled size
        burstEffect.style.marginLeft = `-${this.size * 10}px`;
        burstEffect.style.marginTop = `-${this.size * 10}px`;

        document.body.appendChild(burstEffect);

        // Create trail effect in the direction of launch
        const trailEffect = document.createElement('div');
        trailEffect.classList.add('particle-effect', 'boost-launch-trail');

        // Position at specified coordinates - make trail longer
        trailEffect.style.left = `${x}px`;
        trailEffect.style.top = `${y}px`;
        trailEffect.style.width = `${this.size * 40}px`; // Doubled length
        trailEffect.style.height = `${this.size * 4}px`; // Slightly wider
        trailEffect.style.marginLeft = `-${this.size * 38}px`; // Offset to position behind player
        trailEffect.style.marginTop = `-${this.size * 2}px`;

        // Set rotation to match launch angle
        const degrees = (angle * 180 / Math.PI) % 360;
        trailEffect.style.transform = `rotate(${degrees}deg)`;
        trailEffect.style.transformOrigin = 'right center';

        document.body.appendChild(trailEffect);

        // Create secondary burst for more dramatic effect
        const secondaryBurst = document.createElement('div');
        secondaryBurst.classList.add('particle-effect', 'boost-launch-secondary-burst');

        // Position at specified coordinates
        secondaryBurst.style.left = `${x}px`;
        secondaryBurst.style.top = `${y}px`;
        secondaryBurst.style.width = `${this.size * 15}px`;
        secondaryBurst.style.height = `${this.size * 15}px`;
        secondaryBurst.style.marginLeft = `-${this.size * 7.5}px`;
        secondaryBurst.style.marginTop = `-${this.size * 7.5}px`;

        document.body.appendChild(secondaryBurst);

        // Create multiple small particles in random directions
        for (let i = 0; i < 8; i++) {
            const particleAngle = Math.random() * Math.PI * 2;
            const distance = this.size * (5 + Math.random() * 10);

            const particle = document.createElement('div');
            particle.classList.add('particle-effect', 'boost-launch-particle');

            // Position particles around the specified coordinates
            const particleX = x + Math.cos(particleAngle) * distance;
            const particleY = y + Math.sin(particleAngle) * distance;

            particle.style.left = `${particleX}px`;
            particle.style.top = `${particleY}px`;
            particle.style.width = `${this.size * 2}px`;
            particle.style.height = `${this.size * 2}px`;
            particle.style.marginLeft = `-${this.size}px`;
            particle.style.marginTop = `-${this.size}px`;

            document.body.appendChild(particle);

            // Add to effects array with random duration
            this.effects.push({
                element: particle,
                duration: 10 + Math.floor(Math.random() * 20)
            });
        }

        // Play boost sound if available
        const boostSound = document.getElementById('boostSound');
        if (boostSound) {
            boostSound.currentTime = 0;
            boostSound.play().catch(e => console.log('Error playing sound:', e));
        }

        // Add to effects array with longer duration
        this.effects.push({
            element: burstEffect,
            duration: 20 // Longer duration
        });

        this.effects.push({
            element: secondaryBurst,
            duration: 15
        });

        this.effects.push({
            element: trailEffect,
            duration: 45 // Longer duration
        });
    }

    /**
     * Create an effect for when the player arrives after Warp Speed Hail Mary
     */
    createBoostArrivalEffect() {
        // Create arrival burst effect
        const arrivalBurst = document.createElement('div');
        arrivalBurst.classList.add('particle-effect', 'boost-arrival-burst');

        // Position at player
        arrivalBurst.style.left = `${this.x}px`;
        arrivalBurst.style.top = `${this.y}px`;
        arrivalBurst.style.width = `${this.size * 25}px`;
        arrivalBurst.style.height = `${this.size * 25}px`;
        arrivalBurst.style.marginLeft = `-${this.size * 12.5}px`;
        arrivalBurst.style.marginTop = `-${this.size * 12.5}px`;

        document.body.appendChild(arrivalBurst);

        // Create ripple effect
        const rippleEffect = document.createElement('div');
        rippleEffect.classList.add('particle-effect', 'boost-arrival-ripple');

        // Position at player
        rippleEffect.style.left = `${this.x}px`;
        rippleEffect.style.top = `${this.y}px`;
        rippleEffect.style.width = `${this.size * 30}px`;
        rippleEffect.style.height = `${this.size * 30}px`;
        rippleEffect.style.marginLeft = `-${this.size * 15}px`;
        rippleEffect.style.marginTop = `-${this.size * 15}px`;

        document.body.appendChild(rippleEffect);

        // Create multiple small particles in random directions
        for (let i = 0; i < 12; i++) {
            const particleAngle = Math.random() * Math.PI * 2;
            const distance = this.size * (2 + Math.random() * 5);

            const particle = document.createElement('div');
            particle.classList.add('particle-effect', 'boost-arrival-particle');

            // Position particles around the player
            const particleX = this.x + Math.cos(particleAngle) * distance;
            const particleY = this.y + Math.sin(particleAngle) * distance;

            particle.style.left = `${particleX}px`;
            particle.style.top = `${particleY}px`;
            particle.style.width = `${this.size * 3}px`;
            particle.style.height = `${this.size * 3}px`;
            particle.style.marginLeft = `-${this.size * 1.5}px`;
            particle.style.marginTop = `-${this.size * 1.5}px`;

            document.body.appendChild(particle);

            // Add to effects array with random duration
            this.effects.push({
                element: particle,
                duration: 15 + Math.floor(Math.random() * 15)
            });
        }

        // Add to effects array
        this.effects.push({
            element: arrivalBurst,
            duration: 25
        });

        this.effects.push({
            element: rippleEffect,
            duration: 30
        });
    }

    /**
     * Create collision effect
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    createCollisionEffect(x, y) {
        // Create collision element
        const effect = document.createElement('div');
        effect.classList.add('particle-effect', 'collision');

        effect.style.left = `${x}px`;
        effect.style.top = `${y}px`;
        effect.style.width = `${this.size * 2}px`;
        effect.style.height = `${this.size * 2}px`;
        effect.style.marginLeft = `-${this.size}px`;
        effect.style.marginTop = `-${this.size}px`;

        document.body.appendChild(effect);

        // Add to effects array
        this.effects.push({
            element: effect,
            duration: 15
        });
    }

    /**
     * Update visual effects
     */
    updateEffects() {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.duration--;

            if (effect.duration <= 0) {
                effect.element.remove();
                this.effects.splice(i, 1);
            }
        }
    }

    /**
     * Fire weapon if active and not on cooldown
     */
    fireWeapon() {
        // Check if weapon is active and not on cooldown
        if (this.abilities.weapon.active && this.abilities.weapon.cooldown <= 0) {
            // Set cooldown
            this.abilities.weapon.cooldown = this.abilities.weapon.maxCooldown;

            // Create a projectile in the direction of movement or mouse
            let dirX = 0;
            let dirY = -1; // Default direction is up

            // Use velocity direction if moving
            if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
                const magnitude = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                dirX = this.vx / magnitude;
                dirY = this.vy / magnitude;
            }

            // Create projectile
            const projectile = new Particle(
                this.x + dirX * (this.size + 5),
                this.y + dirY * (this.size + 5),
                5,
                '#9c27b0' // Purple projectile
            );

            // Set projectile properties
            projectile.vx = dirX * 10; // Fast projectile
            projectile.vy = dirY * 10;
            projectile.lifetime = 60; // 1 second at 60fps
            projectile.damage = this.abilities.weapon.damage;
            projectile.type = 'projectile';

            // Add to game's weapon particles
            if (this.game) {
                this.game.weaponParticles.push(projectile);

                // Create muzzle flash effect
                this.createMuzzleFlash(dirX, dirY);
            }
        }
    }

    /**
     * Update ability cooldowns and energy levels
     */
    updateAbilityCooldowns() {
        // Update shield pulse cooldown
        if (this.abilities.shieldPulse.cooldown > 0) {
            this.abilities.shieldPulse.cooldown--;
        }

        // Update attract field cooldown
        if (this.abilities.attractField.cooldown > 0) {
            this.abilities.attractField.cooldown--;
        }

        // Update boost launch cooldown
        if (this.abilities.boostLaunch.cooldown > 0) {
            this.abilities.boostLaunch.cooldown--;
        }

        // Slowly increase energy for abilities that are recharging
        if (this.abilities.shieldPulse.recharging) {
            // Energy is only increased by collecting special particles
            if (this.abilities.shieldPulse.energy >= this.abilities.shieldPulse.maxEnergy) {
                this.abilities.shieldPulse.recharging = false;
                this.abilities.shieldPulse.energy = this.abilities.shieldPulse.maxEnergy;
            }
        }

        if (this.abilities.attractField.recharging) {
            // Energy is only increased by collecting special particles
            if (this.abilities.attractField.energy >= this.abilities.attractField.maxEnergy) {
                this.abilities.attractField.recharging = false;
                this.abilities.attractField.energy = this.abilities.attractField.maxEnergy;
            }
        }
    }

    /**
     * Add energy to an ability
     * @param {string} abilityName - Name of the ability to add energy to
     * @param {number} amount - Amount of energy to add
     */
    addAbilityEnergy(abilityName, amount) {
        if (this.abilities[abilityName]) {
            // Check if we're on a mobile device
            const isMobile = window.isMobileDevice || false;

            // Mobile gets less ability energy
            const adjustedAmount = isMobile ? amount * 0.5 : amount; // Half the ability energy on mobile

            this.abilities[abilityName].energy = Math.min(
                this.abilities[abilityName].maxEnergy,
                this.abilities[abilityName].energy + adjustedAmount
            );
        }
    }

    /**
     * Increase the player's gravitational field strength
     * @param {number} amount - Amount to increase the strength by
     */
    increaseGravitationalStrength(amount) {
        // Increase the gravitational field strength
        this.gravitationalField.strength = Math.min(
            this.gravitationalField.baseStrength * 3, // Cap at 3x the base strength
            this.gravitationalField.strength + amount
        );
    }

    /**
     * Activate speed boost ability
     * @param {number} energy - Current energy level
     * @returns {boolean} Whether the ability was activated
     */
    activateSpeedBoost(energy) {
        // Check if already active
        if (this.abilities.speedBoost.active) {
            return false;
        }

        // Check if we have enough energy
        if (energy < this.abilities.speedBoost.energyCost) {
            return false;
        }

        // Activate ability
        this.abilities.speedBoost.active = true;
        this.abilities.speedBoost.duration = this.abilities.speedBoost.maxDuration;
        this.maxSpeed = this.baseMaxSpeed * this.abilities.speedBoost.multiplier;

        // Create speed trail effect
        this.createSpeedTrail();

        return true;
    }

    /**
     * Activate boost launch ability (Hail Mary move)
     * @returns {boolean} Whether the ability was activated
     */
    activateBoostLaunch() {
        // Check if ability is on cooldown
        if (this.abilities.boostLaunch.cooldown > 0) {
            return false;
        }

        // Check if we have charges available
        if (this.abilities.boostLaunch.charges < this.abilities.boostLaunch.chargeCost) {
            return false;
        }

        // Determine if we're in a black hole and adjust boost parameters
        let boostForceMultiplier = 1.0;
        let chargeMultiplier = 1.0;

        if (this.blackHoleProximity.active) {
            // Calculate boost parameters based on black hole proximity
            if (this.blackHoleProximity.ratio <= 0.5) {
                // Deep inside black hole - extreme boost needed but costs more
                boostForceMultiplier = 2.5; // 2.5x stronger boost
                chargeMultiplier = 2.0;     // Costs 2x charges

                // Show message about emergency boost
                if (this.game) {
                    this.game.showMessage('EMERGENCY WARP SPEED HAIL MARY ACTIVATED!', '#f44336');
                }
            } else if (this.blackHoleProximity.ratio <= 1.0) {
                // Inside event horizon - stronger boost needed
                boostForceMultiplier = 2.0; // 2x stronger boost
                chargeMultiplier = 1.5;     // Costs 1.5x charges

                // Show message about enhanced boost
                if (this.game) {
                    this.game.showMessage('Enhanced Warp Speed Hail Mary activated to escape event horizon!', '#ff9800');
                }
            } else if (this.blackHoleProximity.ratio <= 2.0) {
                // Near event horizon - slightly stronger boost
                boostForceMultiplier = 1.5; // 1.5x stronger boost
                chargeMultiplier = 1.2;     // Costs 1.2x charges
            }
        }

        // Calculate actual charge cost (round up)
        const actualChargeCost = Math.ceil(this.abilities.boostLaunch.chargeCost * chargeMultiplier);

        // Check if we have enough charges for the enhanced boost
        if (this.abilities.boostLaunch.charges < actualChargeCost) {
            // Show message about insufficient charges
            if (this.game && this.blackHoleProximity.active && this.blackHoleProximity.ratio <= 1.0) {
                this.game.showMessage('WARNING: Insufficient Warp Speed Hail Mary charges to escape black hole!', '#f44336');
            }
            return false;
        }

        // Get canvas dimensions from the document
        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;

        // Calculate a significant distance to travel (200-400 pixels)
        let minDistance = 200;
        let maxDistance = 400;

        // Apply boost force multiplier for black hole escape
        if (this.blackHoleProximity.active) {
            minDistance *= boostForceMultiplier;
            maxDistance *= boostForceMultiplier;
        }

        const distance = minDistance + Math.random() * (maxDistance - minDistance);

        // Generate random angle for launch direction
        const angle = Math.random() * Math.PI * 2;

        // Calculate destination coordinates
        let destX = this.x + Math.cos(angle) * distance;
        let destY = this.y + Math.sin(angle) * distance;

        // Ensure destination is within bounds (with padding equal to player size)
        destX = Math.max(this.size, Math.min(canvasWidth - this.size, destX));
        destY = Math.max(this.size, Math.min(canvasHeight - this.size, destY));

        // Store current position for effect creation
        const startX = this.x;
        const startY = this.y;

        // Immediately teleport player to new position
        this.x = destX;
        this.y = destY;

        // Calculate actual travel direction (may be different from original if bounds were hit)
        const actualAngle = Math.atan2(destY - startY, destX - startX);

        // Add some velocity in the direction of travel for momentum effect
        const momentumForce = 10;
        this.vx = Math.cos(actualAngle) * momentumForce;
        this.vy = Math.sin(actualAngle) * momentumForce;

        // Set cooldown
        this.abilities.boostLaunch.cooldown = this.abilities.boostLaunch.maxCooldown;

        // Consume charges based on black hole proximity
        this.abilities.boostLaunch.charges -= actualChargeCost;

        // Log charge consumption
        if (this.blackHoleProximity.active && this.blackHoleProximity.ratio <= 1.0) {
            console.log(`Enhanced warpspeed used ${actualChargeCost} charges. Remaining: ${this.abilities.boostLaunch.charges}`);
        }

        // Set boost as active with duration
        this.abilities.boostLaunch.active = true;
        this.abilities.boostLaunch.duration = this.abilities.boostLaunch.maxDuration;

        // Make player invulnerable while boost is active
        this.invulnerable = true;
        this.invulnerableTime = this.abilities.boostLaunch.maxDuration;

        // Create boost launch effect at the starting position
        this.createBoostLaunchEffect(actualAngle, startX, startY);

        // Create arrival effect at destination
        this.createBoostArrivalEffect();

        // Log the launch for debugging
        console.log(`Warp Speed Hail Mary activated: Direction ${(actualAngle * 180 / Math.PI).toFixed(0)}°, Distance ${Math.sqrt((destX-startX)**2 + (destY-startY)**2).toFixed(0)}px, Charges left: ${this.abilities.boostLaunch.charges}`);

        return true;
    }

    /**
     * Create a muzzle flash effect
     * @param {number} dirX - X direction
     * @param {number} dirY - Y direction
     */
    createMuzzleFlash(dirX, dirY) {
        // Create a flash particle at the weapon muzzle
        const flash = new Particle(
            this.x + dirX * (this.size + 2),
            this.y + dirY * (this.size + 2),
            this.size * 0.8,
            '#ffeb3b' // Yellow flash
        );
        flash.lifetime = 5;
        flash.alpha = 0.9;

        // Add to the game's particle effects
        if (this.game) {
            this.game.particleEffects.push(flash);
        }
    }

    /**
     * Draw the player on the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        // Draw trail with dynamic length based on speed
        if (this.history.length > 1) {
            ctx.beginPath();

            // Start from most recent history point
            const startIndex = Math.max(0, this.history.length - (this.abilities.speedBoost.active ? 15 : 10));
            ctx.moveTo(this.history[startIndex].x, this.history[startIndex].y);

            for (let i = startIndex + 1; i < this.history.length; i++) {
                ctx.lineTo(this.history[i].x, this.history[i].y);
            }

            // Connect to current position
            ctx.lineTo(this.x, this.y);

            // Style based on state
            if (this.abilities.speedBoost.active) {
                // Speed boost trail
                // Check for valid values before creating gradient
                if (isFinite(this.x) && isFinite(this.y) &&
                    isFinite(this.history[startIndex].x) && isFinite(this.history[startIndex].y)) {
                    const gradient = ctx.createLinearGradient(
                        this.history[startIndex].x, this.history[startIndex].y,
                        this.x, this.y
                    );
                    gradient.addColorStop(0, 'rgba(79, 195, 247, 0)');
                    gradient.addColorStop(1, 'rgba(79, 195, 247, 0.8)');

                    ctx.strokeStyle = gradient;
                } else {
                    // Fallback for invalid values
                    ctx.strokeStyle = 'rgba(79, 195, 247, 0.5)';
                }
                ctx.lineWidth = this.size * 0.8;
            } else {
                // Normal trail
                ctx.strokeStyle = '#4fc3f7';
                ctx.lineWidth = this.size / 2;
            }

            ctx.globalAlpha = 0.6;
            ctx.stroke();
            ctx.lineWidth = 1;
            ctx.globalAlpha = 1;
        }

        // Draw shield pulse radius indicator when charging
        if (this.abilities.shieldPulse.cooldown > 0 &&
            this.abilities.shieldPulse.cooldown < this.abilities.shieldPulse.maxCooldown * 0.1) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.abilities.shieldPulse.radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(79, 195, 247, 0.3)';
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw player with appropriate effects
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

        if (this.invulnerable) {
            // Invulnerability effect
            const pulseRate = Math.sin(this.invulnerableTime * 0.2) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${pulseRate})`;

            // Shield effect
            ctx.strokeStyle = '#fff176'; // Yellow shield
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 3]);
            ctx.fill();
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.lineWidth = 1;
        } else if (this.abilities.speedBoost.active) {
            // Speed boost effect
            // Check for valid values before creating gradient
            if (isFinite(this.x) && isFinite(this.y) && isFinite(this.size)) {
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.size
                );
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(1, '#64b5f6'); // Blue for speed

                ctx.fillStyle = gradient;
                ctx.fill();
            } else {
                // Fallback for invalid values
                ctx.fillStyle = '#64b5f6';
                ctx.fill();
            }

            // Add a stronger glow
            ctx.shadowColor = '#64b5f6';
            ctx.shadowBlur = 15;
            ctx.strokeStyle = '#64b5f6';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.lineWidth = 1;
        } else {
            // Normal appearance
            // Check for valid values before creating gradient
            if (isFinite(this.x) && isFinite(this.y) && isFinite(this.size)) {
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, this.size
                );
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(1, '#e0e0e0');

                ctx.fillStyle = gradient;
                ctx.fill();
            } else {
                // Fallback for invalid values
                ctx.fillStyle = '#e0e0e0';
                ctx.fill();
            }

            // Add a glow effect
            ctx.shadowColor = '#4fc3f7';
            ctx.shadowBlur = 10;
            ctx.strokeStyle = '#4fc3f7';
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Draw direction indicator
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 0.1 && isFinite(this.x) && isFinite(this.y) && isFinite(speed)) {
            // Calculate direction indicator coordinates
            const dirX = this.x + (this.vx / speed) * this.size * 1.5;
            const dirY = this.y + (this.vy / speed) * this.size * 1.5;

            // Only draw if coordinates are valid
            if (isFinite(dirX) && isFinite(dirY)) {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(dirX, dirY);

                if (this.abilities.speedBoost.active) {
                    ctx.strokeStyle = '#64b5f6';
                    ctx.lineWidth = 2;
                } else {
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;
                }

                ctx.stroke();
            } // Close the isFinite(dirX) check
        } // Close the speed > 0.1 check

        // Reset line width
        ctx.lineWidth = 1;
    }
}
