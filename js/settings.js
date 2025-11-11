import { navigateBackFromSettings } from './ui.js';

export function initializeSettings() {
    setupBackButton();
}

function setupBackButton() {
    const backButton = document.getElementById('back-from-settings-btn');
    if (backButton) {
        backButton.addEventListener('click', function() {
            navigateBackFromSettings();
        });
    }
}