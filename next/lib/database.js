// lib/database.js
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'esp32_weather',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+07:00' // Jakarta timezone
};

class Database {
  constructor() {
    this.pool = null;
  }

  async init() {
    try {
      // Create connection pool
      this.pool = mysql.createPool(dbConfig);
      
      // Test connection
      const connection = await this.pool.getConnection();
      console.log('✅ Connected to MySQL database');
      connection.release();
      
      // Create database if not exists
      await this.createDatabase();
      
      // Create tables
      await this.createTables();
      
      return true;
    } catch (error) {
      console.error('❌ Database connection error:', error.message);
      throw error;
    }
  }

  async createDatabase() {
    try {
      const tempPool = mysql.createPool({
        ...dbConfig,
        database: undefined // Don't specify database for creation
      });
      
      await tempPool.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
      console.log(`✅ Database '${dbConfig.database}' created/verified`);
      
      await tempPool.end();
    } catch (error) {
      console.error('Error creating database:', error.message);
      // Continue if database already exists
    }
  }

  async createTables() {
    try {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS weather_readings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          temperature DECIMAL(5,2) NOT NULL,
          humidity DECIMAL(5,2) NOT NULL,
          light_value INT NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_timestamp (timestamp),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;

      await this.pool.execute(createTableSQL);
      console.log('✅ Weather readings table created/verified');
    } catch (error) {
      console.error('Error creating tables:', error.message);
      throw error;
    }
  }

  async insertReading(temperature, humidity, lightValue) {
    try {
      const sql = `
        INSERT INTO weather_readings (temperature, humidity, light_value)
        VALUES (?, ?, ?)
      `;
      
      const [result] = await this.pool.execute(sql, [temperature, humidity, lightValue]);
      return { id: result.insertId };
    } catch (error) {
      console.error('Error inserting reading:', error.message);
      throw error;
    }
  }

  async getLatestReadings(limit = 100) {
    try {
      const sql = `
        SELECT * FROM weather_readings 
        ORDER BY timestamp DESC 
        LIMIT ?
      `;
      
      const [rows] = await this.pool.execute(sql, [limit]);
      return rows;
    } catch (error) {
      console.error('Error getting latest readings:', error.message);
      throw error;
    }
  }

  async getReadingsByTimeRange(hours = 24) {
    try {
      const sql = `
        SELECT * FROM weather_readings 
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        ORDER BY timestamp DESC
      `;
      
      const [rows] = await this.pool.execute(sql, [hours]);
      return rows;
    } catch (error) {
      console.error('Error getting readings by time range:', error.message);
      throw error;
    }
  }

  async getStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_readings,
          ROUND(AVG(temperature), 1) as avg_temp,
          ROUND(MIN(temperature), 1) as min_temp,
          ROUND(MAX(temperature), 1) as max_temp,
          ROUND(AVG(humidity), 1) as avg_humidity,
          ROUND(MIN(humidity), 1) as min_humidity,
          ROUND(MAX(humidity), 1) as max_humidity,
          ROUND(AVG(light_value)) as avg_light,
          MIN(light_value) as min_light,
          MAX(light_value) as max_light,
          MIN(timestamp) as first_reading,
          MAX(timestamp) as last_reading
        FROM weather_readings
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `;
      
      const [rows] = await this.pool.execute(sql);
      return rows[0];
    } catch (error) {
      console.error('Error getting stats:', error.message);
      throw error;
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ MySQL connection pool closed');
    }
  }
}

// Singleton instance
let database = null;

export async function getDatabase() {
  if (!database) {
    database = new Database();
    await database.init();
  }
  return database;
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (database) {
    await database.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (database) {
    await database.close();
  }
  process.exit(0);
});
