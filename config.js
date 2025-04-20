// Environment configuration
const config = {
    // API Keys
    geminiApiKey: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY || '',
    pixelApiKey: import.meta.env.VITE_PIXEL_API_KEY || '',
    
    // API Endpoints
    geminiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    pexelsEndpoint: 'https://api.pexels.com/v1/search',
    
    // Check if API keys are valid
    isGeminiKeyValid() {
        return this.geminiApiKey && this.geminiApiKey !== 'undefined' && this.geminiApiKey.length > 10;
    },
    
    isPexelsKeyValid() {
        return this.pixelApiKey && this.pixelApiKey !== 'undefined' && this.pixelApiKey.length > 10;
    },
    
    // Get configuration errors
    getConfigErrors() {
        const errors = [];
        
        if (!this.isGeminiKeyValid()) {
            errors.push("Gemini API key is missing or invalid. Please check your .env file.");
        }
        
        if (!this.isPexelsKeyValid()) {
            errors.push("Pexels API key is missing or invalid. Please check your .env file.");
        }
        
        return errors;
    }
};

export default config; 