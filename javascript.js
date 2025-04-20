import config from './config.js';

const countryCurrencyMap = {
    'usa': { symbol: 'USD', name: 'US Dollar' },
    'united states': { symbol: 'USD', name: 'US Dollar' },
    'uk': { symbol: 'GBP', name: 'British Pound' },
    'united kingdom': { symbol: 'GBP', name: 'British Pound' },
    'japan': { symbol: 'JPY', name: 'Japanese Yen' },
    'india': { symbol: 'INR', name: 'Indian Rupee' },
    'europe': { symbol: 'EUR', name: 'Euro' },
    'france': { symbol: 'EUR', name: 'Euro' },
    'germany': { symbol: 'EUR', name: 'Euro' },
    'italy': { symbol: 'EUR', name: 'Euro' },
    'spain': { symbol: 'EUR', name: 'Euro' },
    'australia': { symbol: 'AUD', name: 'Australian Dollar' },
    'canada': { symbol: 'CAD', name: 'Canadian Dollar' },
    'china': { symbol: 'CNY', name: 'Chinese Yuan' },
    'mexico': { symbol: 'MXN', name: 'Mexican Peso' },
    'brazil': { symbol: 'BRL', name: 'Brazilian Real' }
};

// DOM elements
const navLinks = document.querySelectorAll('.nav-links a');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const resultsSection = document.getElementById('results');
const planBtn = document.getElementById("planBtn");
const printBtn = document.getElementById("printBtn");
const shareBtn = document.getElementById("shareBtn");
const saveBtn = document.getElementById("saveBtn");
const testimonialDots = document.querySelectorAll('.dot');

// Mobile menu toggle
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        const navLinksEl = document.querySelector('.nav-links');
        navLinksEl.classList.toggle('show-mobile');
        
        // Toggle between hamburger and X icon
        const icon = mobileMenuBtn.querySelector('i');
        if (icon.classList.contains('fa-bars')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// Smooth scrolling for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        
        // Remove active class from all links and add to clicked link
        navLinks.forEach(link => link.classList.remove('active'));
        link.classList.add('active');
        
        // Close mobile menu if open
        const navLinksEl = document.querySelector('.nav-links');
        if (navLinksEl.classList.contains('show-mobile')) {
            navLinksEl.classList.remove('show-mobile');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
        
        // Smooth scroll to target section
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            window.scrollTo({
                top: targetSection.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Testimonial slider functionality
if (testimonialDots.length > 0) {
    testimonialDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            // Update active dot
            testimonialDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            
            // Slide testimonials
            const slider = document.querySelector('.testimonials-slider');
            slider.style.transform = `translateX(-${index * 100}%)`;
        });
    });
}

// Generate travel itinerary
if (planBtn) {
    planBtn.addEventListener("click", async () => {
        const input = document.getElementById("travelInput").value;
        const loading = document.getElementById("loading");
        const itineraryEl = document.getElementById("itinerary");
        const mapSection = document.getElementById("mapSection");
        const imagesSection = document.getElementById("images");
        
        if (!input.trim()) {
            showNotification('Please describe your trip requirements first!', 'error');
            return;
        }
        
        // Check if API keys are valid
        if (!config.isGeminiKeyValid()) {
            showNotification('Missing or invalid Gemini API key. Please check your environment variables.', 'error');
            return;
        }
        
        loading.style.display = "flex";
        itineraryEl.innerHTML = "";
        mapSection.innerHTML = "";
        imagesSection.innerHTML = "";
        
        // Scroll to loading indicator
        window.scrollTo({
            top: loading.offsetTop - 100,
            behavior: 'smooth'
        });
        
        // Extract destination
        const destinationMatch = input.match(/(?:to|in|at|for)\s+([A-Z][a-zA-Z\s]+)/i);
        const destination = destinationMatch ? destinationMatch[1].trim() : input.trim();
        
        // Get currency info
        const lowerDestination = destination.toLowerCase();
        let currencyInfo = { symbol: 'USD', name: 'US Dollar' };
        
        // Try to find the currency by checking if any country name is included in the destination
        for (const [country, currency] of Object.entries(countryCurrencyMap)) {
            if (lowerDestination.includes(country)) {
                currencyInfo = currency;
                break;
            }
        }
        
        const prompt = `Plan a detailed business travel itinerary based on: "${input}"
        
        Requirements:
        - Strictly follow the JSON format below
        - Use ${currencyInfo.name} (${currencyInfo.symbol}) as currency
        - Focus on business-appropriate accommodations, activities, and dining
        - Include 3-5 days
        - For each day include:
          * Title
          * Accommodation (name and price)
          * Activities (3-5)
          * Food recommendations (2-3)
          * Estimated daily budget
          * One useful business traveler tip
        
        Return ONLY valid JSON in this exact format:
        {
          "destination": "Destination Name",
          "currency": "${currencyInfo.symbol}",
          "days": [
            {
              "day": 1,
              "title": "Day Title",
              "accommodation": {
                "name": "Hotel Name",
                "price": 100
              },
              "activities": ["Activity 1", "Activity 2"],
              "food": ["Restaurant 1", "Restaurant 2"],
              "budget": 150,
              "tip": "Helpful tip"
            }
          ]
        }`;
        
        try {
            const response = await fetch(`${config.geminiEndpoint}?key=${config.geminiApiKey}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                }),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error response:', errorText);
                throw new Error(`Error: ${response.statusText} (${response.status})`);
            }
            
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No itinerary found.";
            
            // Parse JSON response
            let itinerary;
            try {
                const jsonStart = text.indexOf('{');
                const jsonEnd = text.lastIndexOf('}') + 1;
                const jsonString = text.slice(jsonStart, jsonEnd);
                itinerary = JSON.parse(jsonString);
            } catch (e) {
                throw new Error("Couldn't parse itinerary data");
            }
            
            // Display itinerary
            itineraryEl.innerHTML = `
                ${itinerary.days.map(day => `
                    <div class="day-card">
                        <div class="day-header">
                            <h3>Day ${day.day}: ${day.title}</h3>
                        </div>
                        <div class="day-content">
                            <div class="day-section">
                                <h4>🏨 Accommodation</h4>
                                <p>${day.accommodation.name} (${currencyInfo.symbol}${day.accommodation.price}/night)</p>
                            </div>
                            <div class="day-section">
                                <h4>🎯 Activities</h4>
                                <ul>${day.activities.map(activity => `<li>${activity}</li>`).join('')}</ul>
                            </div>
                            <div class="day-section">
                                <h4>🍽️ Food Recommendations</h4>
                                <ul>${day.food.map(restaurant => `<li>${restaurant}</li>`).join('')}</ul>
                            </div>
                            <div class="day-section budget">
                                <h4>💰 Estimated Daily Budget</h4>
                                <p>${currencyInfo.symbol}${day.budget}</p>
                            </div>
                            <div class="day-section tip">
                                <h4>💡 Business Traveler Tip</h4>
                                <p>${day.tip}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            `;
            
            // Show results section
            resultsSection.classList.remove('hide');
            
            // Scroll to results
            window.scrollTo({
                top: resultsSection.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Initialize currency converter
            setupCurrencyConverter(currencyInfo.symbol);
            
            // Map and images
            mapSection.innerHTML = `
                <iframe
                    src="https://www.google.com/maps?q=${encodeURIComponent(destination)}&output=embed"
                    width="100%" height="250" style="border:0;" allowfullscreen loading="lazy">
                </iframe>`;
            
            if (!config.isPexelsKeyValid()) {
                imagesSection.innerHTML = '<p>Image loading unavailable. Please check your Pexels API key.</p>';
            } else {
                const imageResponse = await fetch(`${config.pexelsEndpoint}?query=${encodeURIComponent(destination)}+business+travel&per_page=6`, {
                    headers: {
                        Authorization: config.pixelApiKey,
                    },
                });
                
                if (!imageResponse.ok) {
                    throw new Error(`Image API error: ${imageResponse.statusText}`);
                }
                
                const imgData = await imageResponse.json();
                
                // Clear and create images directly in the container
                imagesSection.innerHTML = '';
                
                if (imgData.photos && imgData.photos.length > 0) {
                    imgData.photos.slice(0, 6).forEach(photo => {
                        const img = document.createElement("img");
                        img.src = photo.src.medium;
                        img.alt = `${photo.photographer}'s photo of ${destination}`;
                        
                        // Click handler for modal
                        img.addEventListener('click', () => {
                            const modal = document.createElement("div");
                            modal.className = "image-modal";
                            modal.innerHTML = `
                                <span class="close-modal">&times;</span>
                                <img class="modal-content" src="${photo.src.large}" alt="${img.alt}">
                                <p class="photo-credit">Photo by ${photo.photographer}</p>
                            `;
                            document.body.appendChild(modal);
                            
                            // Close handlers
                            modal.querySelector('.close-modal').addEventListener('click', () => {
                                modal.style.opacity = '0';
                                setTimeout(() => modal.remove(), 300);
                            });
                            
                            modal.addEventListener('click', (e) => {
                                if (e.target === modal) {
                                    modal.style.opacity = '0';
                                    setTimeout(() => modal.remove(), 300);
                                }
                            });
                            
                            setTimeout(() => { modal.style.opacity = '1'; }, 10);
                        });
                        
                        imagesSection.appendChild(img);
                    });
                } else {
                    imagesSection.innerHTML = '<p>No images found for this destination.</p>';
                }
            }
            
            // Setup action buttons
            setupActionButtons(itinerary);
            
        } catch (err) {
            showNotification(err.message, 'error');
            itineraryEl.innerHTML = `<p class="error-message">Error: ${err.message}</p>`;
            console.error('API Error:', err);
        } finally {
            loading.style.display = "none";
        }
    });
}

// Setup currency converter
async function setupCurrencyConverter(defaultCurrency) {
    const sourceCurrencySelect = document.getElementById('sourceCurrency');
    const targetCurrencySelect = document.getElementById('targetCurrency');
    const convertBtn = document.getElementById('convertBtn');
    
    if (!sourceCurrencySelect || !targetCurrencySelect) return;
    
    // Populate currency dropdowns
    sourceCurrencySelect.innerHTML = '';
    targetCurrencySelect.innerHTML = '';
    
    Object.entries(countryCurrencyMap).forEach(([country, curr], index) => {
        // Only add each currency once (avoid duplicates)
        if (index === Object.values(countryCurrencyMap).findIndex(c => c.symbol === curr.symbol)) {
            const sourceOption = document.createElement('option');
            sourceOption.value = curr.symbol;
            sourceOption.textContent = `${curr.symbol} (${curr.name})`;
            if (curr.symbol === defaultCurrency) {
                sourceOption.selected = true;
            }
            sourceCurrencySelect.appendChild(sourceOption);
            
            const targetOption = document.createElement('option');
            targetOption.value = curr.symbol;
            targetOption.textContent = `${curr.symbol} (${curr.name})`;
            if (curr.symbol === 'USD') {
                targetOption.selected = true;
            }
            targetCurrencySelect.appendChild(targetOption);
        }
    });
    
    await updateConversion();
    convertBtn.addEventListener('click', updateConversion);
}

// Update currency conversion
async function updateConversion() {
    const sourceAmount = document.getElementById('sourceAmount').value;
    const sourceCurrency = document.getElementById('sourceCurrency').value;
    const targetCurrency = document.getElementById('targetCurrency').value;
    const resultElement = document.getElementById('convertedAmount');
    const rateElement = document.getElementById('conversionRate');
    
    if (!sourceAmount || isNaN(sourceAmount) || !resultElement) {
        if (resultElement) resultElement.textContent = 'Enter valid amount';
        return;
    }
    
    try {
        resultElement.textContent = 'Converting...';
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${sourceCurrency}`);
        const data = await response.json();
        
        if (!data.rates) throw new Error("Invalid API response");
        
        const rate = data.rates[targetCurrency];
        const converted = (parseFloat(sourceAmount) * rate).toFixed(2);
        
        resultElement.textContent = `${targetCurrency} ${converted}`;
        if (rateElement) {
            rateElement.textContent = `1 ${sourceCurrency} = ${rate.toFixed(4)} ${targetCurrency}`;
        }
    } catch (error) {
        resultElement.textContent = 'Conversion failed';
        console.error("Currency conversion error:", error);
    }
}

// Setup action buttons (print, share, save)
function setupActionButtons(itinerary) {
    // Print functionality
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }
    
    // Share functionality
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: `TravelAI Pro - ${itinerary.destination} Itinerary`,
                    text: `Check out my business trip itinerary to ${itinerary.destination}!`,
                    url: window.location.href
                })
                .then(() => showNotification('Shared successfully!', 'success'))
                .catch(err => {
                    console.error('Share failed:', err);
                    showNotification('Could not share itinerary', 'error');
                });
            } else {
                // Fallback for browsers that don't support Web Share API
                const dummy = document.createElement('textarea');
                dummy.value = window.location.href;
                document.body.appendChild(dummy);
                dummy.select();
                document.execCommand('copy');
                document.body.removeChild(dummy);
                showNotification('URL copied to clipboard!', 'success');
            }
        });
    }
    
    // Save functionality (using localStorage)
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            try {
                const savedItineraries = JSON.parse(localStorage.getItem('savedItineraries')) || [];
                
                // Add timestamp for reference
                const itineraryWithTimestamp = {
                    ...itinerary,
                    savedAt: new Date().toISOString()
                };
                
                savedItineraries.push(itineraryWithTimestamp);
                localStorage.setItem('savedItineraries', JSON.stringify(savedItineraries));
                
                showNotification('Itinerary saved successfully!', 'success');
            } catch (err) {
                console.error('Error saving itinerary:', err);
                showNotification('Could not save itinerary', 'error');
            }
        });
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <span class="notification-close">&times;</span>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Add close handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.add('notification-hidden');
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.add('notification-hidden');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    // Animate in
    setTimeout(() => notification.classList.add('notification-visible'), 10);
}

// Add notification styles to CSS dynamically
function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 6px;
            padding: 15px 20px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            max-width: 400px;
            z-index: 9999;
            transform: translateX(120%);
            transition: transform 0.3s ease;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .notification i {
            font-size: 20px;
        }
        
        .notification.success i {
            color: #10b981;
        }
        
        .notification.error i {
            color: #ef4444;
        }
        
        .notification.info i {
            color: #3b82f6;
        }
        
        .notification-close {
            cursor: pointer;
            font-size: 20px;
            color: #64748b;
        }
        
        .notification-visible {
            transform: translateX(0);
        }
        
        .notification-hidden {
            transform: translateX(120%);
        }
        
        @media (max-width: 480px) {
            .notification {
                top: auto;
                bottom: 20px;
                left: 20px;
                right: 20px;
                min-width: auto;
                max-width: none;
            }
        }
    `;
    document.head.appendChild(style);
}

// Add scroll animations
function initScrollAnimations() {
    const animateElements = document.querySelectorAll('.feature-card, .step, .testimonial');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    animateElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
    
    // Add animation styles
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        .animate-on-scroll.animate {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(animationStyle);
}

// Check API configuration and show warning if needed
function checkApiConfiguration() {
    const configErrors = config.getConfigErrors();
    
    if (configErrors.length > 0) {
        // Add a warning banner to the planner section
        const plannerSection = document.getElementById('planner');
        if (plannerSection) {
            const warningBanner = document.createElement('div');
            warningBanner.className = 'api-warning-banner';
            warningBanner.innerHTML = `
                <div class="warning-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="warning-content">
                    <h3>Configuration Issues Detected</h3>
                    <ul>
                        ${configErrors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                    <p>The application may not work correctly until these issues are resolved.</p>
                    <a class="config-link" id="showConfigGuide">
                        <i class="fas fa-cog"></i> 
                        Show Configuration Guide
                    </a>
                </div>
            `;
            
            plannerSection.querySelector('.section-header').after(warningBanner);
            
            // Set up event listener for the configuration guide link
            document.getElementById('showConfigGuide').addEventListener('click', showApiConfigModal);
        }
        
        // Also log to console
        console.warn('API Configuration Issues:', configErrors);
    }
}

// Show API configuration modal
function showApiConfigModal() {
    const modal = document.getElementById('apiConfigModal');
    if (modal) {
        modal.style.display = 'block';
        
        // Add close handlers
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('closeApiModal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

// Document ready
document.addEventListener('DOMContentLoaded', () => {
    addNotificationStyles();
    
    // Only init animations if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        initScrollAnimations();
    }
    
    // Check API configuration
    checkApiConfiguration();
    
    // Highlight active nav item based on scroll position
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
});