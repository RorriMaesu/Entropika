/**
 * Tutorial system for Entropika Game
 */

// Tutorial state
let currentTutorialStep = 1;
const totalTutorialSteps = 7;

// Initialize tutorial when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Tutorial system initialized');

    // Set up tutorial buttons (both desktop and mobile)
    const tutorialButtons = [
        document.getElementById('tutorialButton'),
        document.getElementById('tutorialButton-mobile')
    ];

    tutorialButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', function(e) {
                console.log('Tutorial button clicked: ' + button.id);
                showTutorial();
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
        }
    });

    // Add direct click handlers to all tutorial buttons
    addDirectButtonHandlers();

    // Add direct click handlers for specific buttons - Next buttons
    const nextButton1 = document.getElementById('tutorial-next-1');
    if (nextButton1) {
        console.log('Found next button 1:', nextButton1);
        nextButton1.addEventListener('click', function(e) {
            console.log('Next button in step 1 clicked directly');
            goToStep(2);
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    } else {
        console.error('Next button 1 not found');
    }

    const nextButton2 = document.getElementById('tutorial-next-2');
    if (nextButton2) {
        console.log('Found next button 2:', nextButton2);
        nextButton2.addEventListener('click', function(e) {
            console.log('Next button in step 2 clicked directly');
            goToStep(3);
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    } else {
        console.error('Next button 2 not found');
    }

    const nextButton3 = document.getElementById('tutorial-next-3');
    if (nextButton3) {
        console.log('Found next button 3:', nextButton3);
        nextButton3.addEventListener('click', function(e) {
            console.log('Next button in step 3 clicked directly');
            goToStep(4);
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    } else {
        console.error('Next button 3 not found');
    }

    const nextButton4 = document.getElementById('tutorial-next-4');
    if (nextButton4) {
        console.log('Found next button 4:', nextButton4);
        nextButton4.addEventListener('click', function(e) {
            console.log('Next button in step 4 clicked directly');
            goToStep(5);
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    } else {
        console.error('Next button 4 not found');
    }

    const nextButton5 = document.getElementById('tutorial-next-5');
    if (nextButton5) {
        console.log('Found next button 5:', nextButton5);
        nextButton5.addEventListener('click', function(e) {
            console.log('Next button in step 5 clicked directly');
            goToStep(6);
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    } else {
        console.error('Next button 5 not found');
    }

    const nextButton6 = document.getElementById('tutorial-next-6');
    if (nextButton6) {
        console.log('Found next button 6:', nextButton6);
        nextButton6.addEventListener('click', function(e) {
            console.log('Next button in step 6 clicked directly');
            goToStep(7);
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    } else {
        console.error('Next button 6 not found');
    }

    // Add direct click handlers for specific buttons - Previous buttons
    const prevButton2 = document.getElementById('tutorial-prev-2');
    if (prevButton2) {
        prevButton2.addEventListener('click', function(e) {
            console.log('Previous button in step 2 clicked directly');
            goToStep(1);
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    }

    const prevButton3 = document.getElementById('tutorial-prev-3');
    if (prevButton3) {
        prevButton3.addEventListener('click', function(e) {
            console.log('Previous button in step 3 clicked directly');
            goToStep(2);
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    }

    const prevButton4 = document.getElementById('tutorial-prev-4');
    if (prevButton4) {
        prevButton4.addEventListener('click', function(e) {
            console.log('Previous button in step 4 clicked directly');
            goToStep(3);
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    }

    const prevButton5 = document.getElementById('tutorial-prev-5');
    if (prevButton5) {
        prevButton5.addEventListener('click', function(e) {
            console.log('Previous button in step 5 clicked directly');
            goToStep(4);
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    }

    const prevButton6 = document.getElementById('tutorial-prev-6');
    if (prevButton6) {
        prevButton6.addEventListener('click', function(e) {
            console.log('Previous button in step 6 clicked directly');
            goToStep(5);
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    }

    const prevButton7 = document.getElementById('tutorial-prev-7');
    if (prevButton7) {
        prevButton7.addEventListener('click', function(e) {
            console.log('Previous button in step 7 clicked directly');
            goToStep(6);
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    }

    // Finish button
    const finishButton = document.getElementById('tutorial-finish');
    if (finishButton) {
        finishButton.addEventListener('click', function(e) {
            console.log('Finish button clicked directly');
            finishTutorial();
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    }
});

// Add direct click handlers to all tutorial buttons
function addDirectButtonHandlers() {
    // Previous buttons
    for (let i = 2; i <= totalTutorialSteps; i++) {
        const prevButton = document.getElementById(`tutorial-prev-${i}`);
        if (prevButton) {
            // Add both onclick and addEventListener for redundancy
            prevButton.onclick = function(e) {
                console.log(`Previous button clicked in step ${i}`);
                goToStep(i - 1);
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                return false;
            };

            // Also add a direct click handler
            prevButton.addEventListener('click', function(e) {
                console.log(`Previous button clicked in step ${i} via addEventListener`);
                goToStep(i - 1);
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
        } else {
            console.error(`Previous button for step ${i} not found`);
        }
    }

    // Next buttons
    for (let i = 1; i < totalTutorialSteps; i++) {
        const nextButton = document.getElementById(`tutorial-next-${i}`);
        if (nextButton) {
            // Add both onclick and addEventListener for redundancy
            nextButton.onclick = function(e) {
                console.log(`Next button clicked in step ${i}`);
                goToStep(i + 1);
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                return false;
            };

            // Also add a direct click handler
            nextButton.addEventListener('click', function(e) {
                console.log(`Next button clicked in step ${i} via addEventListener`);
                goToStep(i + 1);
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
        } else {
            console.error(`Next button for step ${i} not found`);
        }
    }

    // Finish button
    const finishButton = document.getElementById('tutorial-finish');
    if (finishButton) {
        // Add both onclick and addEventListener for redundancy
        finishButton.onclick = function(e) {
            console.log('Finish button clicked');
            finishTutorial();
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            return false;
        };

        // Also add a direct click handler
        finishButton.addEventListener('click', function(e) {
            console.log('Finish button clicked via addEventListener');
            finishTutorial();
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
    } else {
        console.error('Finish button not found');
    }

    console.log('All tutorial button handlers added');
}

// Show the tutorial overlay
function showTutorial() {
    console.log('showTutorial called');
    
    // Check if we're in mobile landscape mode - if so, don't show the tutorial
    const isMobileLandscape = document.body.classList.contains('mobile-device') && 
                             document.body.classList.contains('landscape-mode');
    
    if (isMobileLandscape) {
        console.log('Tutorial not shown in mobile landscape mode');
        return; // Exit the function early
    }

    // Set game state to tutorial - try direct access first
    if (typeof game !== 'undefined' && game) {
        game.state = 'tutorial';
        console.log('Set game state to tutorial');
    } else if (window.game) {
        window.game.state = 'tutorial';
        console.log('Set window.game state to tutorial');
    } else {
        console.warn('Game object not found when showing tutorial');
    }

    // Reset to first step
    currentTutorialStep = 1;

    // Hide ability buttons during tutorial
    const abilityButtons = document.getElementById('ability-buttons');
    if (abilityButtons) {
        abilityButtons.style.display = 'none';
    }

    // Show tutorial overlay
    const tutorialElement = document.getElementById('tutorial');
    if (!tutorialElement) {
        console.error('Tutorial element not found!');
        return;
    }

    tutorialElement.classList.add('active');
    tutorialElement.style.display = 'flex';
    console.log('Tutorial overlay displayed');

    // Ensure all buttons in the tutorial are clickable
    const allButtons = tutorialElement.querySelectorAll('button');
    allButtons.forEach(button => {
        button.style.pointerEvents = 'auto';
        button.style.zIndex = '100';
        console.log(`Enhanced button: ${button.id}`);
    });

    // Show first step
    goToStep(1);

    // Re-add button handlers to ensure they're working
    addDirectButtonHandlers();
}

// Go to a specific step
function goToStep(step) {
    console.log(`Going to step ${step}`);

    // Update current step
    currentTutorialStep = step;

    // Hide all steps
    for (let i = 1; i <= totalTutorialSteps; i++) {
        const stepElement = document.getElementById(`tutorialStep${i}`);
        if (stepElement) {
            stepElement.style.display = 'none';
            stepElement.classList.remove('active');
        }
    }

    // Show requested step
    const currentStep = document.getElementById(`tutorialStep${currentTutorialStep}`);
    if (currentStep) {
        // Check if we're in mobile landscape mode for special handling of display property
        const isMobileLandscape = document.body.classList.contains('mobile-device') && 
                                document.body.classList.contains('landscape-mode');
        
        if (isMobileLandscape && currentTutorialStep === 2) {
            // Let CSS handle the display style for tutorial step 2 in mobile landscape
            currentStep.style.removeProperty('display');
        } else {
            currentStep.style.display = 'block';
        }
        
        currentStep.classList.add('active');
        console.log(`Showing tutorial step ${currentTutorialStep}:`, currentStep);

        // Update progress indicator
        const progress = document.getElementById('tutorialProgress');
        if (progress) {
            progress.textContent = `Step ${currentTutorialStep} of ${totalTutorialSteps}`;
        }

        // Debug: Check if buttons in this step have click handlers
        const buttons = currentStep.querySelectorAll('button');
        buttons.forEach(button => {
            console.log(`Button in step ${currentTutorialStep}:`, button.id, 'has click handler:', !!button.onclick);

            // Ensure the button is clickable
            button.style.pointerEvents = 'auto';
            button.style.zIndex = '100';

            // Add a direct click handler if it doesn't have one
            if (!button.onclick) {
                console.log(`Adding missing click handler to button: ${button.id}`);
                if (button.id.includes('next')) {
                    button.onclick = function(e) {
                        console.log(`Auto-added handler for ${button.id}`);
                        goToStep(currentTutorialStep + 1);
                        if (e) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                        return false;
                    };
                } else if (button.id.includes('prev')) {
                    button.onclick = function(e) {
                        console.log(`Auto-added handler for ${button.id}`);
                        goToStep(currentTutorialStep - 1);
                        if (e) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                        return false;
                    };
                } else if (button.id.includes('finish')) {
                    button.onclick = function(e) {
                        console.log(`Auto-added handler for ${button.id}`);
                        finishTutorial();
                        if (e) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                        return false;
                    };
                }
            }
        });
    } else {
        console.error(`Tutorial step ${step} element not found`);
    }
}

// Finish the tutorial
function finishTutorial() {
    console.log('Finishing tutorial');

    // Hide tutorial overlay
    const tutorial = document.getElementById('tutorial');
    if (tutorial) {
        tutorial.style.display = 'none';
        tutorial.classList.remove('active');
    }

    // Hide all screens including start screen
    const screens = ['startScreen', 'levelCompleteScreen', 'gameOverScreen'];
    screens.forEach(screen => {
        const element = document.getElementById(screen);
        if (element) {
            element.classList.remove('active');
        }
    });

    // Access the game object directly from the global scope
    if (typeof game !== 'undefined' && game) {
        // Call startGame method which will initialize the game objects and set state to playing
        game.startGame();

        // Double-check that HUD and ability buttons are visible
        setTimeout(() => {
            const hud = document.getElementById('hud');
            if (hud) {
                hud.style.display = 'flex';
            }

            const abilityButtons = document.getElementById('ability-buttons');
            if (abilityButtons) {
                abilityButtons.style.display = 'flex';
            }

            console.log('Verified UI elements are visible after tutorial');
        }, 50);

        console.log('Game started after tutorial');
    } else {
        console.error('Game object not found - trying to find it in window scope');

        // Try to find the game object in the window scope as a fallback
        if (window.game) {
            window.game.startGame();
            console.log('Found game in window scope and started it');
        } else {
            console.error('Game object not found in any scope');
        }
    }
}

// Make these functions globally available
window.showTutorial = showTutorial;
window.goToStep = goToStep;
window.finishTutorial = finishTutorial;
window.nextTutorialStep = function() {
    if (currentTutorialStep < totalTutorialSteps) {
        goToStep(currentTutorialStep + 1);
    } else {
        finishTutorial();
    }
};
window.prevTutorialStep = function() {
    if (currentTutorialStep > 1) {
        goToStep(currentTutorialStep - 1);
    }
};

// Add a listener to ensure we can access the game object when it's created
if (typeof game === 'undefined' || !game) {
    console.log('Game object not available yet, adding listener for it');
    // Check periodically if the game object is available
    const gameCheckInterval = setInterval(() => {
        if (typeof game !== 'undefined' && game) {
            console.log('Game object is now available');
            clearInterval(gameCheckInterval);
        }
    }, 100);
} else {
    console.log('Game object already available');
}
