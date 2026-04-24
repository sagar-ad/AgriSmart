const config = require('../config/weather');
const WeatherAlert = require('../models/WeatherAlert');
const User = require('../models/User');

/**
 * Weather Service
 * Integrates with OpenWeather API and generates alerts
 */
class WeatherService {
  /**
   * Get current weather for a location
   * @param {string} location - Location (city name or coordinates)
   * @returns {Promise<Object>} - Weather data
   */
  static async getCurrentWeather(location) {
    if (!config.openWeatherMap.apiKey) {
      console.warn('OpenWeatherMap API key not configured');
      return null;
    }

    try {
      const url = `${config.openWeatherMap.baseUrl}/weather?q=${encodeURIComponent(location)}&appid=${config.openWeatherMap.apiKey}&units=${config.openWeatherMap.units}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        windSpeed: data.wind.speed,
        rain: data.rain ? data.rain['1h'] || data.rain['3h'] || 0 : 0,
        location: data.name,
        country: data.sys.country
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  }

  /**
   * Get forecast for a location
   * @param {string} location - Location
   * @param {number} days - Number of days (1-5)
   * @returns {Promise<Array>} - Forecast data
   */
  static async getForecast(location, days = 3) {
    if (!config.openWeatherMap.apiKey) {
      console.warn('OpenWeatherMap API key not configured');
      return [];
    }

    try {
      const url = `${config.openWeatherMap.baseUrl}/forecast?q=${encodeURIComponent(location)}&appid=${config.openWeatherMap.apiKey}&units=${config.openWeatherMap.units}&cnt=${days * 8}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process forecast data
      const forecasts = [];
      const dailyData = {};
      
      data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            temps: [],
            rain: [],
            humidity: [],
            descriptions: []
          };
        }
        dailyData[date].temps.push(item.main.temp);
        dailyData[date].rain.push(item.rain ? item.rain['3h'] || 0 : 0);
        dailyData[date].humidity.push(item.main.humidity);
        dailyData[date].descriptions.push(item.weather[0].description);
      });
      
      Object.values(dailyData).forEach(day => {
        forecasts.push({
          date: day.date,
          avgTemp: Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length),
          maxTemp: Math.round(Math.max(...day.temps)),
          minTemp: Math.round(Math.min(...day.temps)),
          totalRain: day.rain.reduce((a, b) => a + b, 0),
          avgHumidity: Math.round(day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length),
          description: day.descriptions[Math.floor(day.descriptions.length / 2)]
        });
      });
      
      return forecasts;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      return [];
    }
  }

  /**
   * Check weather and generate alerts for a farmer
   * @param {number} farmerId - Farmer user ID
   * @returns {Promise<Array>} - Generated alerts
   */
  static async checkAndGenerateAlerts(farmerId) {
    const farmer = await User.findById(farmerId);
    
    if (!farmer || !farmer.location) {
      console.log(`Farmer ${farmerId} has no location set`);
      return [];
    }

    const alerts = [];
    
    // Get forecast for next 3 days
    const forecast = await WeatherService.getForecast(farmer.location, 3);
    
    forecast.forEach(day => {
      // Check for heavy rain
      if (day.totalRain >= config.alertThresholds.rain.heavy) {
        alerts.push({
          farmer_id: farmerId,
          alert_type: 'rain',
          message: `Heavy rainfall (${day.totalRain.toFixed(1)}mm) expected on ${day.date}. Avoid irrigation and protect crops from waterlogging.`,
          severity: 'high'
        });
      } else if (day.totalRain >= config.alertThresholds.rain.moderate) {
        alerts.push({
          farmer_id: farmerId,
          alert_type: 'rain',
          message: `Moderate rainfall (${day.totalRain.toFixed(1)}mm) expected on ${day.date}. Good conditions for planting.`,
          severity: 'low'
        });
      }
      
      // Check for high heat
      if (day.maxTemp >= config.alertThresholds.heat.extreme) {
        alerts.push({
          farmer_id: farmerId,
          alert_type: 'heat',
          message: `Extreme heat wave warning! Temperature may reach ${day.maxTemp}°C on ${day.date}. Apply mulching and ensure adequate irrigation.`,
          severity: 'high'
        });
      } else if (day.maxTemp >= config.alertThresholds.heat.high) {
        alerts.push({
          farmer_id: farmerId,
          alert_type: 'heat',
          message: `High temperature (${day.maxTemp}°C) expected on ${day.date}. Ensure crops have sufficient water.`,
          severity: 'medium'
        });
      }
    });

    // Save alerts to database
    for (const alert of alerts) {
      await WeatherAlert.create(alert);
    }

    return alerts;
  }

  /**
   * Generate alerts for all farmers (for scheduled job)
   * @returns {Promise<number>} - Number of alerts generated
   */
  static async generateAlertsForAllFarmers() {
    const farmers = await User.findByRole('farmer');
    let totalAlerts = 0;
    
    for (const farmer of farmers) {
      const alerts = await WeatherService.checkAndGenerateAlerts(farmer.id);
      totalAlerts += alerts.length;
    }
    
    return totalAlerts;
  }
}

module.exports = WeatherService;