#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <ESP32Servo.h>

// Konfigurasi Sensor
#define DHTPIN 4
#define DHTTYPE DHT22
#define LDRPIN 33
#define SERVO_PIN1 12
#define SERVO_PIN2 27

// Konfigurasi WiFi
const char* ssid = "OPPO A78 5G";
const char* password = "1234567890";

// Konfigurasi API Node.js
const char* serverName = "http://192.168.103.249:3000/api/sensor/data"; // Sesuaikan dengan URL API Anda

// Objek Sensor & Servo
DHT dht(DHTPIN, DHTTYPE);
Servo servoJemuran1;
Servo servoJemuran2;

// Parameter
const int lightThreshold = 800;
const float humidityThreshold = 50;
const float tempThreshold = 31;
const unsigned long checkInterval = 5000; // 5 detik

struct WeatherData {
  float temperature;
  float humidity;
  int lightValue;
  bool isValid;
};

// Variabel Servo
int currentServoPosition1 = 93;
int currentServoPosition2 = 93;
bool weatherAlert = false;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=== Sistem Jemuran Otomatis ===");
  
  // Inisialisasi Sensor
  dht.begin();
  pinMode(LDRPIN, INPUT);
  
  // Inisialisasi Servo
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  servoJemuran1.setPeriodHertz(50);
  servoJemuran2.setPeriodHertz(50);
  servoJemuran1.attach(SERVO_PIN1, 500, 2400);
  servoJemuran2.attach(SERVO_PIN2, 500, 2400);
  servoJemuran1.write(93);
  servoJemuran2.write(93);
  
  // Koneksi WiFi
  connectToWiFi();
}

void loop() {
  static unsigned long lastCheck = 0;
  
  if (millis() - lastCheck >= checkInterval) {
    lastCheck = millis();
    
    // Baca data sensor
    WeatherData weather = readSensors();
    
    // Evaluasi kondisi cuaca
    bool badWeather = evaluateWeather(weather);
    
    // Kontrol servo
    controlServos(badWeather);
    
    // Kirim data ke server
    sendToAPI(weather);
    
    Serial.println("====================================");
  }
  
  // Handle WiFi jika terputus
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }
  
  delay(100);
}

void connectToWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  
  Serial.println("Menghubungkan ke WiFi...");
  WiFi.disconnect();
  WiFi.begin(ssid, password);
  
  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startTime < 10000) {
    delay(500);
    Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nTerhubung ke WiFi!");
    Serial.print("Alamat IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nGagal terhubung ke WiFi!");
  }
}

WeatherData readSensors() {
  WeatherData data;
  
  // Baca DHT22 dengan timeout
  unsigned long startTime = millis();
  do {
    data.humidity = dht.readHumidity();
    data.temperature = dht.readTemperature();
    if (!isnan(data.humidity) && !isnan(data.temperature)) break;
    delay(100);
  } while (millis() - startTime < 2000);
  
  data.isValid = (!isnan(data.humidity) && !isnan(data.temperature));
  
  if (!data.isValid) {
    Serial.println("Gagal membaca DHT22! Menggunakan nilai default...");
    data.temperature = 25.0;
    data.humidity = 60.0;
  }
  
  data.lightValue = analogRead(LDRPIN);
  
  Serial.println("\nData Sensor:");
  Serial.print("Suhu: "); Serial.print(data.temperature); Serial.println(" °C");
  Serial.print("Kelembapan: "); Serial.print(data.humidity); Serial.println(" %");
  Serial.print("Cahaya: "); Serial.println(data.lightValue);
  
  return data;
}

bool evaluateWeather(WeatherData data) {
  bool mendung = (data.lightValue > lightThreshold);
  bool lembap = (data.humidity > humidityThreshold);
  bool dingin = (data.temperature < tempThreshold);
  
  bool badWeather = (mendung && lembap && dingin);
  
  Serial.println("\nEvaluasi Cuaca:");
  Serial.print("Status: "); Serial.println(badWeather ? "BURUK (Tutup Jemuran)" : "BAIK (Buka Jemuran)");
  
  return badWeather;
}

void controlServos(bool badWeather) {
  int targetPos = badWeather ? 93 : 0; // 90° tutup, 0° buka
  
  Serial.print("\nKontrol Servo: ");
  Serial.println(badWeather ? "Menutup jemuran..." : "Membuka jemuran...");
  
  // Gerakan servo smooth
  int currentPos1 = servoJemuran1.read();
  int currentPos2 = servoJemuran2.read();
  
  while (currentPos1 != targetPos || currentPos2 != targetPos) {
    if (currentPos1 < targetPos) currentPos1++;
    else if (currentPos1 > targetPos) currentPos1--;
    
    if (currentPos2 < targetPos) currentPos2++;
    else if (currentPos2 > targetPos) currentPos2--;
    
    servoJemuran1.write(currentPos1);
    servoJemuran2.write(currentPos2);
    delay(15);
  }
}

void sendToAPI(WeatherData data) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Tidak bisa mengirim: WiFi terputus");
    return;
  }
  
  HTTPClient http;
  http.begin(serverName);
  http.addHeader("Content-Type", "application/json");
  
  // Buat dokumen JSON
  DynamicJsonDocument doc(256);
  doc["suhu"] = data.temperature;
  doc["kelembapan"] = data.humidity;
  doc["cahaya"] = data.lightValue;
  
  // Serialisasi JSON
  String jsonData;
  serializeJson(doc, jsonData);
  
  Serial.println("Mengirim data ke server...");
  Serial.println(jsonData);
  
  int httpCode = http.POST(jsonData);
  
  if (httpCode > 0) {
    String response = http.getString();
    Serial.print("Respon server ("); Serial.print(httpCode); Serial.println("):");
    Serial.println(response);
  } else {
    Serial.print("Error mengirim data: ");
    Serial.println(http.errorToString(httpCode));
  }
  
  http.end();
}