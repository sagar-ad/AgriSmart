module.exports = {
  openWeatherMap: {
    apiKey: process.env.OPENWEATHER_API_KEY || '',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    units: 'metric'
  },
  alertThresholds: {
    rain: {
      heavy: 50, // mm/h
      moderate: 10 // mm/h
    },
    heat: {
      high: 40, // °C
      extreme: 45 // °C
    }
  }
};