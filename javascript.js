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

document.getElementById("planBtn").addEventListener("click", async () => {
    const input = document.getElementById("travelInput").value;
    const loading = document.getElementById("loading");
    const itineraryEl = document.getElementById("itinerary");
    const mapSection = document.getElementById("mapSection");
    const imagesSection = document.getElementById("images");

    if (!input.trim()) return alert("Please enter your travel idea!");

    loading.style.display = "block";
    itineraryEl.innerHTML = "";
    mapSection.innerHTML = "";
    imagesSection.innerHTML = "";

    // Extract destination
    const destinationMatch = input.match(/(?:to|in|at|for)\s+([A-Z][a-zA-Z\s]+)/i);
    const destination = destinationMatch ? destinationMatch[1].trim() : input.trim();

    // Get currency info
    const countryKey = destination.toLowerCase();
    const currencyInfo = countryCurrencyMap[countryKey] || { symbol: 'EUR', name: 'Euro' };

    const prompt = `Plan a detailed travel itinerary based on: "${input}"
    
    Requirements:
    - Strictly follow the JSON format below
    - Use ${currencyInfo.name} (${currencyInfo.symbol}) as currency
    - Include 3-5 days
    - For each day include:
      * Title
      * Accommodation (name and price)
      * Activities (3-5)
      * Food recommendations (2-3)
      * Estimated daily budget
      * One useful tip
    
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
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + process.env.GOOGLE_GEMINI_API_KEY, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            }),
        });

        if (!response.ok) throw new Error(`Error: ${response.statusText}`);

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
            <div class="itinerary-header">
                <h2>${itinerary.destination} Itinerary</h2>
                <div class="currency-converter">
                    <h3>Currency Converter</h3>
                    <div class="converter-box">
                        <input type="number" id="sourceAmount" placeholder="Amount" value="100">
                        <select id="sourceCurrency">
                            ${Object.entries(countryCurrencyMap).map(([country, curr]) => 
                                `<option value="${curr.symbol}" ${curr.symbol === currencyInfo.symbol ? 'selected' : ''}>
                                    ${curr.symbol} (${curr.name})
                                </option>`
                            ).join('')}
                        </select>
                        <span>→</span>
                        <select id="targetCurrency">
                            ${Object.entries(countryCurrencyMap).map(([country, curr]) => 
                                `<option value="${curr.symbol}" ${curr.symbol === 'USD' ? 'selected' : ''}>
                                    ${curr.symbol} (${curr.name})
                                </option>`
                            ).join('')}
                        </select>
                        <div id="convertedAmount">Loading...</div>
                        <button id="convertBtn">Convert</button>
                    </div>
                    <div class="conversion-rate" id="conversionRate"></div>
                </div>
            </div>
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
                            <h4>💡 Tip</h4>
                            <p>${day.tip}</p>
                        </div>
                    </div>
                </div>
            `).join('')}
        `;

        // Initialize converter
        setupCurrencyConverter(currencyInfo.symbol);

        // Map and images
        mapSection.innerHTML = `
            <iframe
                src="https://www.google.com/maps?q=${encodeURIComponent(destination)}&output=embed"
                width="100%" height="300" style="border:0;" allowfullscreen loading="lazy">
            </iframe>`;

        const imageResponse = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(destination)}+travel`, {
            headers: {
                Authorization: process.env.PIXEL_API_KEY,
            },
        });

        const imgData = await imageResponse.json();
        
        // Clear and create images directly in the container
        imagesSection.innerHTML = '';
        
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

    } catch (err) {
        itineraryEl.innerHTML = `<p style="color:red;"><strong>Error:</strong> ${err.message}</p>`;
    } finally {
        loading.style.display = "none";
    }
});

async function setupCurrencyConverter(defaultCurrency) {
    const convertBtn = document.getElementById('convertBtn');
    if (!convertBtn) return;

    await updateConversion();
    convertBtn.addEventListener('click', updateConversion);

    async function updateConversion() {
        const sourceAmount = document.getElementById('sourceAmount').value;
        const sourceCurrency = document.getElementById('sourceCurrency').value;
        const targetCurrency = document.getElementById('targetCurrency').value;
        const resultElement = document.getElementById('convertedAmount');
        const rateElement = document.getElementById('conversionRate');

        if (!sourceAmount || isNaN(sourceAmount)) {
            resultElement.textContent = 'Enter valid amount';
            return;
        }

        try {
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${sourceCurrency}`);
            const data = await response.json();
            
            if (!data.rates) throw new Error("Invalid API response");

            const rate = data.rates[targetCurrency];
            const convertedAmount = (sourceAmount * rate).toFixed(2);
            
            resultElement.textContent = `${convertedAmount} ${targetCurrency}`;
            rateElement.textContent = `1 ${sourceCurrency} = ${rate.toFixed(4)} ${targetCurrency}`;
            
            if (sourceCurrency === defaultCurrency) {
                document.querySelectorAll('.budget p').forEach(el => {
                    const originalAmount = el.textContent.replace(/[^\d.]/g, '');
                    const converted = (originalAmount * rate).toFixed(2);
                    el.textContent = `${targetCurrency}${converted}`;
                });
            }
        } catch (error) {
            console.error('Conversion error:', error);
            resultElement.textContent = 'Conversion failed';
            rateElement.textContent = 'Rates unavailable';
        }
    }
}