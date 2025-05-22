// Simple encryption function
const encrypt = (data) => {
    // Simple base64 encoding for demo 
    return btoa(encodeURIComponent(data));
};

// Decryption function
const decrypt = (data) => {
    try {
        return decodeURIComponent(atob(data));
    } catch (e) {
        console.error('Decryption failed:', e);
        return data; // Return original if decryption fails
    }
};

// Handle price field encryption
document.addEventListener('DOMContentLoaded', () => {
    const priceInput = document.getElementById('price');
    if (priceInput) {
        // When saving, we'll encrypt the price before storing
        // When loading, we'll decrypt it before displaying
    }
});