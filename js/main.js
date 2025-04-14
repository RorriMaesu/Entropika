/**
 * Main application script for the Entropika Game
 */

// Create a global game variable for button access
let game;

document.addEventListener('DOMContentLoaded', () => {
    // Get canvas element
    const canvas = document.getElementById('particleCanvas');

    // Create game instance and make it globally accessible
    game = new ParticleGame(canvas);

    // Initialize background particles for the start screen
    game.initialize();

    // Start animation loop
    game.animate();
});

// All game controls are now handled in the ParticleGame class
