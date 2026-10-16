/**
 * Main Application Entry Point
 * Initialize the application when DOM is ready
 */

/**
 * Load the editable contact data. no-cache revalidates with the server so an
 * admin change is visible as soon as GitHub Pages redeploys.
 */
async function loadAppData() {
    const fetchJSON = async path => {
        const response = await fetch(path, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
        return response.json();
    };
    const [recipients, vendors] = await Promise.all([
        fetchJSON('data/recipients.json'),
        fetchJSON('data/vendors.json')
    ]);
    setRecipientData(recipients);
    setVendorData(vendors);
}

function showDataLoadError(error) {
    console.error('Contact data could not be loaded:', error);
    const message = document.createElement('div');
    message.className = 'data-load-error';
    message.textContent = 'Contact lists could not be loaded. Reload the page; '
        + 'if you opened index.html directly, serve it over HTTP instead.';
    document.body.prepend(message);
}

/**
 * Initialize the application
 */
async function initApp() {
    console.log('Critical Notification Email Generator - Initializing...');

    try {
        await loadAppData();
    } catch (error) {
        showDataLoadError(error);
        return;
    }
    
    // Setup all event listeners
    setupEventListeners();
    setupAdmin();
    
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
