export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const city = searchParams.get('city');

    // For demo purposes, we'll return simulated weather data
    // In production, you would integrate with a real weather API like:
    // - OpenWeatherMap
    // - WeatherAPI
    // - AccuWeather
    
    // Simulate realistic weather conditions based on location or time
    const conditions = ['sunny', 'partly-cloudy', 'cloudy', 'light-rain', 'clear'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    // Temperature ranges based on common weather patterns
    const tempRanges = {
      'sunny': [22, 32],
      'clear': [20, 30],
      'partly-cloudy': [18, 28],
      'cloudy': [15, 25],
      'light-rain': [12, 22],
      'rainy': [10, 20],
      'thunderstorm': [15, 25]
    };
    
    const [minTemp, maxTemp] = tempRanges[randomCondition] || [20, 30];
    const temperature = Math.floor(Math.random() * (maxTemp - minTemp + 1)) + minTemp;
    
    const weatherData = {
      condition: randomCondition,
      temperature: temperature,
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 km/h
      pressure: Math.floor(Math.random() * 50) + 1000, // 1000-1050 hPa
      visibility: Math.floor(Math.random() * 10) + 5, // 5-15 km
      uvIndex: Math.floor(Math.random() * 8) + 1, // 1-8
      location: {
        lat: lat ? parseFloat(lat) : null,
        lon: lon ? parseFloat(lon) : null,
        city: city || 'Unknown'
      },
      lastUpdated: new Date().toISOString()
    };

    // Add some location-specific adjustments for realism
    if (lat && lon) {
      const latitude = parseFloat(lat);
      
      // Adjust temperature based on latitude (closer to equator = warmer)
      if (Math.abs(latitude) < 10) {
        weatherData.temperature += 5; // Tropical regions
      } else if (Math.abs(latitude) > 50) {
        weatherData.temperature -= 8; // Polar regions
      }
      
      // Ensure temperature stays within reasonable bounds
      weatherData.temperature = Math.max(-10, Math.min(45, weatherData.temperature));
    }

    return Response.json({
      success: true,
      data: weatherData,
      ...weatherData // Also spread the data at root level for easier access
    });

  } catch (error) {
    console.error('Weather API error:', error);
    
    // Return fallback weather data
    return Response.json({
      success: true,
      data: {
        condition: 'sunny',
        temperature: 24,
        humidity: 65,
        windSpeed: 8,
        pressure: 1013,
        visibility: 10,
        uvIndex: 5,
        location: {
          lat: null,
          lon: null,
          city: 'Default'
        },
        lastUpdated: new Date().toISOString()
      }
    });
  }
}

// Optional: POST endpoint for weather preferences or reporting
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, weatherPreferences } = body;

    // Here you could save user weather preferences to database
    // For now, just return success
    
    return Response.json({
      success: true,
      message: 'Weather preferences updated',
      preferences: weatherPreferences
    });

  } catch (error) {
    console.error('Weather preferences error:', error);
    return Response.json({
      success: false,
      error: 'Failed to update weather preferences'
    }, { status: 500 });
  }
}