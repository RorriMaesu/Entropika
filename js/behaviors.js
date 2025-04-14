/**
 * Collection of particle behaviors that can be applied to the particle system
 */
class ParticleBehaviors {
    /**
     * Apply flocking behavior (based on Boids algorithm)
     * @param {Particle} particle - Current particle
     * @param {Particle[]} particles - All particles in the system
     * @param {number} radius - Interaction radius
     */
    static flock(particle, particles, radius) {
        let separationForce = { x: 0, y: 0 };
        let alignmentForce = { x: 0, y: 0 };
        let cohesionForce = { x: 0, y: 0 };
        
        let separationCount = 0;
        let alignmentCount = 0;
        let cohesionCount = 0;
        
        const separationRadius = radius * 0.5;
        const alignmentRadius = radius;
        const cohesionRadius = radius * 1.5;
        
        // Sum up forces from all nearby particles
        for (const other of particles) {
            if (other === particle) continue;
            
            const distance = particle.distanceTo(other);
            
            // Separation - avoid crowding neighbors
            if (distance < separationRadius) {
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                
                // Weight by distance (closer particles have more influence)
                const factor = 1 - distance / separationRadius;
                
                separationForce.x += dx * factor;
                separationForce.y += dy * factor;
                separationCount++;
            }
            
            // Alignment - steer towards average heading of neighbors
            if (distance < alignmentRadius) {
                alignmentForce.x += other.vx;
                alignmentForce.y += other.vy;
                alignmentCount++;
            }
            
            // Cohesion - steer towards center of mass of neighbors
            if (distance < cohesionRadius) {
                cohesionForce.x += other.x;
                cohesionForce.y += other.y;
                cohesionCount++;
            }
        }
        
        // Calculate final forces
        if (separationCount > 0) {
            separationForce.x /= separationCount;
            separationForce.y /= separationCount;
            
            // Normalize and scale
            const magnitude = Math.sqrt(separationForce.x * separationForce.x + separationForce.y * separationForce.y);
            if (magnitude > 0) {
                separationForce.x = (separationForce.x / magnitude) * particle.maxForce * 1.5;
                separationForce.y = (separationForce.y / magnitude) * particle.maxForce * 1.5;
            }
        }
        
        if (alignmentCount > 0) {
            alignmentForce.x /= alignmentCount;
            alignmentForce.y /= alignmentCount;
            
            // Normalize and scale
            const magnitude = Math.sqrt(alignmentForce.x * alignmentForce.x + alignmentForce.y * alignmentForce.y);
            if (magnitude > 0) {
                alignmentForce.x = (alignmentForce.x / magnitude) * particle.maxForce;
                alignmentForce.y = (alignmentForce.y / magnitude) * particle.maxForce;
            }
        }
        
        if (cohesionCount > 0) {
            cohesionForce.x /= cohesionCount;
            cohesionForce.y /= cohesionCount;
            
            // Steer towards center of mass
            cohesionForce.x -= particle.x;
            cohesionForce.y -= particle.y;
            
            // Normalize and scale
            const magnitude = Math.sqrt(cohesionForce.x * cohesionForce.x + cohesionForce.y * cohesionForce.y);
            if (magnitude > 0) {
                cohesionForce.x = (cohesionForce.x / magnitude) * particle.maxForce * 0.8;
                cohesionForce.y = (cohesionForce.y / magnitude) * particle.maxForce * 0.8;
            }
        }
        
        // Apply combined forces
        particle.applyForce(separationForce.x, separationForce.y);
        particle.applyForce(alignmentForce.x, alignmentForce.y);
        particle.applyForce(cohesionForce.x, cohesionForce.y);
    }
    
    /**
     * Apply gravity behavior (particles attract each other)
     * @param {Particle} particle - Current particle
     * @param {Particle[]} particles - All particles in the system
     * @param {number} radius - Interaction radius
     */
    static gravity(particle, particles, radius) {
        const G = 0.01; // Gravitational constant
        
        for (const other of particles) {
            if (other === particle) continue;
            
            const distance = particle.distanceTo(other);
            
            if (distance > 0 && distance < radius) {
                // Calculate gravitational force
                const force = (G * particle.mass * other.mass) / (distance * distance);
                
                // Direction of force
                const dx = other.x - particle.x;
                const dy = other.y - particle.y;
                
                // Normalize and apply force
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;
                
                particle.applyForce(fx, fy);
            }
        }
    }
    
    /**
     * Apply swirling behavior (particles move in circular patterns)
     * @param {Particle} particle - Current particle
     * @param {number} centerX - Center X of swirl
     * @param {number} centerY - Center Y of swirl
     * @param {number} strength - Strength of swirl
     */
    static swirl(particle, centerX, centerY, strength = 0.01) {
        // Vector from center to particle
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        
        // Distance from center
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Calculate perpendicular force (for circular motion)
            const fx = -dy * strength;
            const fy = dx * strength;
            
            // Apply force
            particle.applyForce(fx, fy);
            
            // Add slight attraction to center to keep particles from flying away
            particle.applyForce(-dx * 0.0001, -dy * 0.0001);
        }
    }
    
    /**
     * Apply random movement behavior
     * @param {Particle} particle - Current particle
     * @param {number} strength - Strength of random movement
     */
    static random(particle, strength = 0.1) {
        const angle = Math.random() * Math.PI * 2;
        const force = Math.random() * strength;
        
        const fx = Math.cos(angle) * force;
        const fy = Math.sin(angle) * force;
        
        particle.applyForce(fx, fy);
    }
    
    /**
     * Apply mouse interaction (attract, repel, or create force)
     * @param {Particle} particle - Current particle
     * @param {number} mouseX - Mouse X position
     * @param {number} mouseY - Mouse Y position
     * @param {string} interactionType - Type of interaction ('attract', 'repel', 'force', 'none')
     * @param {number} radius - Interaction radius
     * @param {number} strength - Interaction strength
     */
    static mouseInteraction(particle, mouseX, mouseY, interactionType, radius, strength = 0.1) {
        if (interactionType === 'none' || mouseX === null || mouseY === null) {
            return;
        }
        
        const distance = particle.distanceToPoint(mouseX, mouseY);
        
        if (distance < radius) {
            // Direction from mouse to particle
            const dx = particle.x - mouseX;
            const dy = particle.y - mouseY;
            
            // Normalize direction
            const magnitude = Math.sqrt(dx * dx + dy * dy);
            
            if (magnitude > 0) {
                const normalizedDx = dx / magnitude;
                const normalizedDy = dy / magnitude;
                
                // Calculate force based on distance (closer = stronger)
                const forceFactor = (1 - distance / radius) * strength;
                
                if (interactionType === 'attract') {
                    // Attract - force towards mouse
                    particle.applyForce(-normalizedDx * forceFactor, -normalizedDy * forceFactor);
                } else if (interactionType === 'repel') {
                    // Repel - force away from mouse
                    particle.applyForce(normalizedDx * forceFactor, normalizedDy * forceFactor);
                } else if (interactionType === 'force') {
                    // Create force field - perpendicular force for swirling effect
                    particle.applyForce(-normalizedDy * forceFactor, normalizedDx * forceFactor);
                }
            }
        }
    }
}
