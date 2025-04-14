/**
 * Tutorial debugging script
 * This script adds additional debugging and fixes for the tutorial system
 */

// Wait for the page to fully load
window.addEventListener('load', function() {
    console.log('Tutorial debug script loaded');

    // Add a global click handler to detect clicks on tutorial buttons
    document.addEventListener('click', function(e) {
        // Check if the click was on a button
        if (e.target.tagName === 'BUTTON') {
            console.log('Button clicked:', e.target.id);

            // Check if it's a tutorial button
            if (e.target.id.includes('tutorial-')) {
                console.log('Tutorial button clicked:', e.target.id);

                // Handle next buttons
                if (e.target.id.includes('next')) {
                    const stepNumber = parseInt(e.target.id.split('-')[2]);
                    console.log(`Next button for step ${stepNumber} clicked, going to step ${stepNumber + 1}`);
                    goToStep(stepNumber + 1);
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }

                // Handle previous buttons
                if (e.target.id.includes('prev')) {
                    const stepNumber = parseInt(e.target.id.split('-')[2]);
                    console.log(`Previous button for step ${stepNumber} clicked, going to step ${stepNumber - 1}`);
                    goToStep(stepNumber - 1);
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }

                // Handle finish button
                if (e.target.id === 'tutorial-finish') {
                    console.log('Finish button clicked');
                    finishTutorial();
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }
        }
    }, true); // Use capture phase to ensure this handler runs first

    // Add keyboard navigation for tutorial
    document.addEventListener('keydown', function(e) {
        // Only handle keys if tutorial is active
        const tutorial = document.getElementById('tutorial');
        if (tutorial && tutorial.style.display === 'flex') {
            if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') {
                // Next step
                if (currentTutorialStep < totalTutorialSteps) {
                    console.log('Next key pressed, going to next step');
                    goToStep(currentTutorialStep + 1);
                    e.preventDefault();
                    return false;
                }
            } else if (e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P') {
                // Previous step
                if (currentTutorialStep > 1) {
                    console.log('Previous key pressed, going to previous step');
                    goToStep(currentTutorialStep - 1);
                    e.preventDefault();
                    return false;
                }
            } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
                // Finish tutorial if on last step, otherwise go to next step
                if (currentTutorialStep === totalTutorialSteps) {
                    console.log('Enter/Space/Escape pressed on last step, finishing tutorial');
                    finishTutorial();
                } else {
                    console.log('Enter/Space pressed, going to next step');
                    goToStep(currentTutorialStep + 1);
                }
                e.preventDefault();
                return false;
            }
        }
    });

    // Fix for tutorial buttons - add this after a short delay to ensure the DOM is fully loaded
    setTimeout(function() {
        console.log('Applying tutorial button fixes');

        // Get all tutorial buttons
        const tutorialButtons = document.querySelectorAll('[id^="tutorial-"]');

        // Add enhanced click handlers to each button
        tutorialButtons.forEach(button => {
            console.log(`Enhancing button: ${button.id}`);

            // Set button styles to ensure they're clickable
            button.style.pointerEvents = 'auto';
            button.style.zIndex = '100';
            button.style.position = 'relative';

            // Add a click handler that uses both onclick and addEventListener
            if (button.id.includes('next')) {
                const stepNumber = parseInt(button.id.split('-')[2]);
                button.onclick = function(e) {
                    console.log(`Enhanced next button ${button.id} clicked`);
                    goToStep(stepNumber + 1);
                    if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    return false;
                };
            } else if (button.id.includes('prev')) {
                const stepNumber = parseInt(button.id.split('-')[2]);
                button.onclick = function(e) {
                    console.log(`Enhanced prev button ${button.id} clicked`);
                    goToStep(stepNumber - 1);
                    if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    return false;
                };
            } else if (button.id === 'tutorial-finish') {
                button.onclick = function(e) {
                    console.log('Enhanced finish button clicked');
                    finishTutorial();
                    if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    return false;
                };
            }
        });

        // Fix both tutorial buttons on the start screen
        const startScreenButtons = [
            document.getElementById('tutorialButton'),
            document.getElementById('tutorialButton-mobile')
        ];

        startScreenButtons.forEach(button => {
            if (button) {
                button.onclick = function(e) {
                    console.log('Enhanced tutorial button clicked');
                    showTutorial();
                    if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    return false;
                };
            }
        });
    }, 500);
});

// Add a function to manually navigate the tutorial
window.navigateTutorial = function(direction) {
    if (direction === 'next') {
        if (currentTutorialStep < totalTutorialSteps) {
            goToStep(currentTutorialStep + 1);
        } else {
            finishTutorial();
        }
    } else if (direction === 'prev') {
        if (currentTutorialStep > 1) {
            goToStep(currentTutorialStep - 1);
        }
    } else if (direction === 'finish') {
        finishTutorial();
    }
};

// Add a function to check the tutorial state
window.checkTutorialState = function() {
    console.log('Current tutorial step:', currentTutorialStep);
    console.log('Total tutorial steps:', totalTutorialSteps);

    // Check if tutorial is visible
    const tutorial = document.getElementById('tutorial');
    console.log('Tutorial element:', tutorial);
    console.log('Tutorial display:', tutorial.style.display);
    console.log('Tutorial classList:', tutorial.classList);

    // Check current step
    const currentStep = document.getElementById(`tutorialStep${currentTutorialStep}`);
    console.log('Current step element:', currentStep);
    console.log('Current step display:', currentStep.style.display);
    console.log('Current step classList:', currentStep.classList);

    // Check buttons in current step
    const buttons = currentStep.querySelectorAll('button');
    buttons.forEach(button => {
        console.log(`Button ${button.id}:`, button);
        console.log(`Button ${button.id} onclick:`, !!button.onclick);
        console.log(`Button ${button.id} style:`, button.style);
    });

    return 'Tutorial state checked - see console for details';
};
