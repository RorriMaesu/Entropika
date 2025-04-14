/**
 * Particle class representing a single particle in the system
 */
class Particle {
    /**
     * Create a new particle
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {number} size - Particle size
     * @param {string} color - Particle color
     */
    constructor(x, y, size = 2, color = '#ffffff') {
        // Position
        this.x = x;
        this.y = y;

        // Velocity
        this.vx = (Math.random() * 2 - 1) * 0.5;
        this.vy = (Math.random() * 2 - 1) * 0.5;

        // Acceleration
        this.ax = 0;
        this.ay = 0;

        // Physical properties
        this.size = size;
        this.color = color;
        this.mass = size;

        // Behavior properties
        this.maxSpeed = 2;
        this.maxForce = 0.03;

        // Gravity factor (random for each particle)
        this.gravityFactor = Math.random() * 2 - 0.5; // Range from -0.5 to 1.5

        // History for trails (if needed)
        this.history = [];
        this.maxHistoryLength = 5;
    }

    /**
     * Apply a force to the particle
     * @param {number} fx - Force in x direction
     * @param {number} fy - Force in y direction
     */
    applyForce(fx, fy) {
        // F = ma, so a = F/m
        this.ax += fx / this.mass;
        this.ay += fy / this.mass;

        // Ensure acceleration doesn't get too small to be effective
        if (Math.abs(this.ax) < 0.0001) this.ax = 0;
        if (Math.abs(this.ay) < 0.0001) this.ay = 0;
    }

    /**
     * Update particle position based on velocity and acceleration
     * @param {number} speedFactor - Multiplier for speed
     */
    update(speedFactor = 1) {
        // Update velocity based on acceleration
        this.vx += this.ax * speedFactor;
        this.vy += this.ay * speedFactor;

        // Limit speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed * speedFactor) {
            this.vx = (this.vx / speed) * this.maxSpeed * speedFactor;
            this.vy = (this.vy / speed) * this.maxSpeed * speedFactor;
        }

        // Update position based on velocity
        this.x += this.vx;
        this.y += this.vy;

        // Reset acceleration - this is critical for proper force accumulation
        this.ax = 0;
        this.ay = 0;

        // Store position in history for trails
        if (this.maxHistoryLength > 0) {
            this.history.push({ x: this.x, y: this.y });
            if (this.history.length > this.maxHistoryLength) {
                this.history.shift();
            }
        }
    }

    /**
     * Handle edge behavior (wrap around the canvas)
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    edges(width, height) {
        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        if (this.y < 0) this.y = height;
    }

    /**
     * Draw the particle on the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {boolean} showTrail - Whether to show particle trails
     */
    draw(ctx, showTrail = false) {
        // Draw trail if enabled
        if (showTrail && this.history.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.history[0].x, this.history[0].y);

            for (let i = 1; i < this.history.length; i++) {
                ctx.lineTo(this.history[i].x, this.history[i].y);
            }

            ctx.strokeStyle = this.color;
            ctx.globalAlpha = 0.3;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Draw the particle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    /**
     * Draw the particle with a scale factor
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} scale - Scale factor to apply
     * @param {boolean} showTrail - Whether to show particle trails
     */
    drawScaled(ctx, scale = 1.0, showTrail = false) {
        // Draw trail if enabled
        if (showTrail && this.history.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.history[0].x, this.history[0].y);

            for (let i = 1; i < this.history.length; i++) {
                ctx.lineTo(this.history[i].x, this.history[i].y);
            }

            ctx.strokeStyle = this.color;
            ctx.globalAlpha = 0.3;
            ctx.lineWidth = ctx.lineWidth * scale;
            ctx.stroke();
            ctx.lineWidth = ctx.lineWidth / scale; // Reset line width
            ctx.globalAlpha = 1;
        }

        // Draw the particle with scaled size
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    /**
     * Calculate distance to another particle
     * @param {Particle} other - Another particle
     * @returns {number} Distance between particles
     */
    distanceTo(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate distance to a point
     * @param {number} x - Point x coordinate
     * @param {number} y - Point y coordinate
     * @returns {number} Distance to point
     */
    distanceToPoint(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
