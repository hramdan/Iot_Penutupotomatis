// components/StatsCard.js
export default function StatsCard({ stats }) {
  if (!stats || stats.total_readings === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistik 24 Jam</h3>
        <p className="text-gray-500">Belum ada data tersedia</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistik 24 Jam Terakhir</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{stats.total_readings}</p>
          <p className="text-sm text-gray-600">Total Pembacaan</p>
        </div>

        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-lg font-semibold text-red-600">
            {stats.min_temp}° - {stats.max_temp}°
          </p>
          <p className="text-sm text-gray-600">Rentang Suhu</p>
          <p className="text-xs text-gray-500">Rata-rata: {stats.avg_temp}°C</p>
        </div>

        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-lg font-semibold text-blue-600">
            {stats.min_humidity}% - {stats.max_humidity}%
          </p>
          <p className="text-sm text-gray-600">Rentang Kelembapan</p>
          <p className="text-xs text-gray-500">Rata-rata: {stats.avg_humidity}%</p>
        </div>

        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <p className="text-lg font-semibold text-yellow-600">
            {stats.min_light} - {stats.max_light}
          </p>
          <p className="text-sm text-gray-600">Rentang Cahaya</p>
          <p className="text-xs text-gray-500">Rata-rata: {stats.avg_light}</p>
        </div>
      </div>
    </div>
  );
}