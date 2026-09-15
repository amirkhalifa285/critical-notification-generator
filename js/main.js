/**
 * Main Application Entry Point
 * Initialize the application when DOM is ready
 */

/**
 * Initialize the application
 */
function initApp() {
    console.log('Critical Notification Email Generator - Initializing...');
    
    // Setup all event listeners
    setupEventListeners();
    
    // Initial preview update
    updatePreview();

    // Embed banner images for reliable rich-HTML copying into Outlook.
    preloadEmailImages()
        .then(updatePreview)
        .catch(error => console.warn('Email banners could not be embedded:', error));
    
    console.log('Application ready!');
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM is already loaded
    initApp();
}
