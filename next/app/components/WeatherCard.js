// components/WeatherCard.js
import { Calendar, Droplets, Sun, Thermometer } from 'lucide-react';

export default function WeatherCard({ reading }) {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWeatherStatus = () => {
    const { temperature, humidity, light_value } = reading;
    const isCloudy = light_value > 800;
    const isHumid = humidity > 50;
    const isCold = temperature < 31;
    
    if (isCloudy && isHumid && isCold) {
      return { status: 'Cuaca Buruk', color: 'text-red-600 bg-red-50', icon: '🌧️' };
    }
    return { status: 'Cuaca Cerah', color: 'text-green-600 bg-green-50', icon: '☀️' };
  };

  const weather = getWeatherStatus();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Data Terbaru</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${weather.color}`}>
          {weather.icon} {weather.status}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Thermometer className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Suhu</p>
            <p className="text-lg font-bold text-gray-800">{reading.temperature}°C</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Droplets className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Kelembapan</p>
            <p className="text-lg font-bold text-gray-800">{reading.humidity}%</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Sun className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Cahaya</p>
            <p className="text-lg font-bold text-gray-800">{reading.light_value}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center text-sm text-gray-500">
        <Calendar className="w-4 h-4 mr-2" />
        {formatDate(reading.timestamp)}
      </div>
    </div>
  );
}
