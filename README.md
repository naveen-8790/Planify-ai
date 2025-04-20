# Planify-ai
 Discover the thrill of travel.

# AI Travel Planner ✈️

## Overview
The AI Travel Planner is a web application that helps users generate personalized travel itineraries based on their input. It uses AI to create detailed daily plans including accommodations, activities, food recommendations, and budgeting. The app also provides destination images, maps, and a currency converter.

## Features
- AI-Powered Itinerary Generation: Creates 3-5 day travel plans based on user input
- Destination Visualization: Displays Google Maps and high-quality images of the destination
- Currency Converter: Real-time conversion between world currencies
- Responsive Design: Works on desktop, tablet, and mobile devices
- Interactive Elements: 
  - Click-to-enlarge destination images
  - Hover animations for cards and buttons
  - Modal image viewer

## Technologies Used
- Frontend: HTML5, CSS3, JavaScript
- APIs:
  - Google Gemini AI for itinerary generation
  - Pexels API for destination images
  - Google Maps Embed API
  - ExchangeRate-API for currency conversion

## Installation
No installation required! Simply open `index.html` in any modern web browser.

## How to Use
1. Enter your travel idea in the text box (e.g., "3-day trip to Paris for a couple")
2. Click "Plan My Trip"
3. View your generated itinerary with:
   - Daily activities and recommendations
   - Accommodation details
   - Budget estimates
4. Explore destination images (click to enlarge)
5. Use the currency converter to estimate costs in your preferred currency

## File Structure
```
/
├── index.html          # Main HTML file
├── style.css           # CSS styles
├── javascript.js       # Main JavaScript functionality
└── airplane-journey.png # Application icon
```

## Customization
To customize the application:
1. API Keys: Replace the following in `javascript.js`:
   - Google Gemini API key
   - Pexels API key
2. Styling: Modify `style.css` to change colors, layouts, and animations
3. Currency Support: Add more currencies to the `countryCurrencyMap` object

## License
This project is open-source and available under the MIT License.

## Screenshots
![App Screenshot]("![airplane-journey](https://github.com/user-attachments/assets/bffdcf3c-f1dd-4789-9354-9b6e52d8975c)
") 

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## Known Issues
- API rate limits may affect performance
- Some destinations may not return images
- Currency conversion requires internet connection

## Future Enhancements
- Save itineraries to PDF
- Hotel booking links
- Weather integration
- Multi-language support
