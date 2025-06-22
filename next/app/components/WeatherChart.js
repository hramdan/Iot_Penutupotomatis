// components/WeatherChart.js
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function WeatherChart({ data }) {
  const chartData = data.slice(0, 50).reverse().map(reading => ({
    time: new Date(reading.timestamp).toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    suhu: reading.temperature,
    kelembapan: reading.humidity,
    cahaya: Math.round(reading.light_value / 10) // Scale down for better visualization
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Grafik Sensor (50 Data Terakhir)</h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'cahaya') return [value * 10, 'Cahaya'];
              if (name === 'suhu') return [value + '°C', 'Suhu'];
              if (name === 'kelembapan') return [value + '%', 'Kelembapan'];
              return [value, name];
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="suhu" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Suhu (°C)"
            dot={{ r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="kelembapan" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Kelembapan (%)"
            dot={{ r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="cahaya" 
            stroke="#f59e0b" 
            strokeWidth={2}
            name="Cahaya (/10)"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <p className="text-xs text-gray-500 mt-2">
        * Nilai cahaya dibagi 10 untuk visualisasi yang lebih baik
      </p>
    </div>
  );
}
