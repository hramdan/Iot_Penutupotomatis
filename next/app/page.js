// pages/index.js
"use client"

import { Database, RefreshCw, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';
import StatsCard from './components/StatsCard';
import WeatherCard from './components/WeatherCard';
import WeatherChart from './components/WeatherChart';

export default function Home() {
  const [readings, setReadings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isOnline, setIsOnline] = useState(true);

  const fetchData = async () => {
    try {
      setIsOnline(true);
      const [readingsRes, statsRes] = await Promise.all([
        fetch('/api/sensor/data?limit=100'),
        fetch('/api/sensor/stats')
      ]);

      if (readingsRes.ok) {
        const readingsData = await readingsRes.json();
        setReadings(readingsData.data || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsOnline(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

  return (
    <>
      <header>
        <title>ESP32 Weather Monitor</title>
        <meta name="description" content="Real-time weather monitoring from ESP32 sensors" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </header>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Monitor Cuaca ESP32
              </h1>
              <p className="text-gray-600">
                Sistem pemantauan cuaca real-time untuk jemuran otomatis
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Wifi className={`w-4 h-4 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
              
              {lastUpdate && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Database className="w-4 h-4" />
                  <span>Update: {lastUpdate.toLocaleTimeString('id-ID')}</span>
                </div>
              )}
              
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && readings.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Latest Reading Card */}
              {readings.length > 0 && (
                <WeatherCard reading={readings[0]} />
              )}

              {/* Statistics Card */}
              <StatsCard stats={stats} />

              {/* Chart */}
              {readings.length > 0 && (
                <WeatherChart data={readings} />
              )}

              {/* Recent Readings Table */}
              {readings.length > 0 && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Data Terbaru ({readings.length} pembacaan)
                    </h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Waktu
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Suhu (°C)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kelembapan (%)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cahaya
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {readings.slice(0, 20).map((reading) => {
                          const isBadWeather = reading.light_value > 800 && reading.humidity > 50 && reading.temperature < 31;
                          return (
                            <tr key={reading.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(reading.timestamp).toLocaleString('id-ID')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {reading.temperature}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {reading.humidity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {reading.light_value}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                  isBadWeather 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {isBadWeather ? '🌧️ Buruk' : '☀️ Cerah'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* No Data State */}
              {readings.length === 0 && !loading && (
                <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
                  <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Belum Ada Data
                  </h3>
                  <p className="text-gray-600 mb-4">
                    ESP32 belum mengirim data ke server. Pastikan perangkat terhubung ke WiFi.
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}