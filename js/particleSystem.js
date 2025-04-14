/**
 * ParticleSystem class to manage all particles and their interactions
 */
class ParticleSystem {
    /**
     * Create a new particle system
     * @param {HTMLCanvasElement} canvas - Canvas element
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Resize canvas to fill window
        this.resizeCanvas();
        
        // Particles array
        this.particles = [];
        
        // System settings
        this.particleCount = 1000;
        this.speedFactor = 1;
        this.interactionRadius = 50;
        this.behavior = 'flock';
        this.mouseInteraction = 'attract';
        this.colorScheme = 'rainbow';
        this.showTrails = false;
        
        // Mouse position
        this.mouseX = null;
        this.mouseY = null;
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    /**
     * Initialize event listeners for canvas and window
     */
    initEventListeners() {
        // Track mouse position
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        
        // Clear mouse position when mouse leaves canvas
        this.canvas.addEventListener('mouseleave', () => {
            this.mouseX = null;
            this.mouseY = null;
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
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
     * Initialize the particle system with new particles
     */
    initialize() {
        this.particles = [];
        
        for (let i = 0; i < this.particleCount; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = Math.random() * 1.5 + 1; // Random size between 1 and 2.5
            
            // Determine color based on color scheme
            let color;
            switch (this.colorScheme) {
                case 'rainbow':
                    const hue = (i / this.particleCount) * 360;
                    color = `hsl(${hue}, 80%, 60%)`;
                    break;
                case 'monochrome':
                    const brightness = 50 + Math.random() * 50;
                    color = `hsl(210, 70%, ${brightness}%)`;
                    break;
                case 'gradient':
                    const gradientPosition = y / this.canvas.height;
                    const startHue = 240; // Blue
                    const endHue = 360; // Red
                    const hueValue = startHue + gradientPosition * (endHue - startHue);
                    color = `hsl(${hueValue}, 80%, 60%)`;
                    break;
                case 'velocity':
                    // Will be updated during simulation
                    color = '#ffffff';
                    break;
                default:
                    color = '#ffffff';
            }
            
            this.particles.push(new Particle(x, y, size, color));
        }
    }
    
    /**
     * Update all particles in the system
     */
    update() {
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
            
            // Apply mouse interaction if mouse is on canvas
            if (this.mouseX !== null && this.mouseY !== null) {
                ParticleBehaviors.mouseInteraction(
                    particle,
                    this.mouseX,
                    this.mouseY,
                    this.mouseInteraction,
                    this.interactionRadius * 2,
                    0.1
                );
            }
            
            // Update particle position
            particle.update(this.speedFactor);
            
            // Handle edge behavior
            particle.edges(this.canvas.width, this.canvas.height);
            
            // Update color if using velocity-based coloring
            if (this.colorScheme === 'velocity') {
                const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                const normalizedSpeed = Math.min(speed / (particle.maxSpeed * this.speedFactor), 1);
                
                // Blue (slow) to Red (fast)
                const hue = 240 - normalizedSpeed * 240;
                particle.color = `hsl(${hue}, 80%, 60%)`;
            }
        }
    }
    
    /**
     * Draw all particles on the canvas
     */
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw each particle
        for (const particle of this.particles) {
            particle.draw(this.ctx, this.showTrails);
        }
    }
    
    /**
     * Main animation loop
     */
    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
    
    /**
     * Start the particle system
     */
    start() {
        this.initialize();
        this.animate();
    }
    
    /**
     * Update system settings
     * @param {Object} settings - New settings
     */
    updateSettings(settings) {
        // Update settings
        if (settings.particleCount !== undefined && settings.particleCount !== this.particleCount) {
            this.particleCount = settings.particleCount;
            this.initialize(); // Reinitialize with new count
        }
        
        if (settings.speedFactor !== undefined) {
            this.speedFactor = settings.speedFactor;
        }
        
        if (settings.interactionRadius !== undefined) {
            this.interactionRadius = settings.interactionRadius;
        }
        
        if (settings.behavior !== undefined) {
            this.behavior = settings.behavior;
        }
        
        if (settings.mouseInteraction !== undefined) {
            this.mouseInteraction = settings.mouseInteraction;
        }
        
        if (settings.colorScheme !== undefined && settings.colorScheme !== this.colorScheme) {
            this.colorScheme = settings.colorScheme;
            
            // Update particle colors if scheme changed
            if (this.colorScheme !== 'velocity') {
                for (let i = 0; i < this.particles.length; i++) {
                    switch (this.colorScheme) {
                        case 'rainbow':
                            const hue = (i / this.particles.length) * 360;
                            this.particles[i].color = `hsl(${hue}, 80%, 60%)`;
                            break;
                        case 'monochrome':
                            const brightness = 50 + Math.random() * 50;
                            this.particles[i].color = `hsl(210, 70%, ${brightness}%)`;
                            break;
                        case 'gradient':
                            const gradientPosition = this.particles[i].y / this.canvas.height;
                            const startHue = 240; // Blue
                            const endHue = 360; // Red
                            const hueValue = startHue + gradientPosition * (endHue - startHue);
                            this.particles[i].color = `hsl(${hueValue}, 80%, 60%)`;
                            break;
                    }
                }
            }
        }
        
        if (settings.showTrails !== undefined) {
            this.showTrails = settings.showTrails;
        }
    }
}
