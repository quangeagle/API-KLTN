require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const cron = require('node-cron');

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Tạo schema lưu nhiệt độ
const weatherSchema = new mongoose.Schema({
  city: String,
  temperature: Number,
  timestamp: { type: Date, default: Date.now },
});
const Weather = mongoose.model('Weather', weatherSchema);

// Hàm lấy nhiệt độ
async function fetchWeather() {
  try {
    const { API_KEY, CITY } = process.env;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},vn&appid=${API_KEY}&units=metric`;
    const res = await axios.get(url);
    const temp = res.data.main.temp;

    const weather = new Weather({ city: CITY, temperature: temp });
    await weather.save();

    console.log(`[${new Date().toLocaleString()}] Nhiệt độ tại ${CITY}: ${temp}°C đã lưu vào DB.`);
  } catch (err) {
    console.error('Lỗi lấy dữ liệu thời tiết:', err.message);
  }
}

// Chạy mỗi tuần 1 lần (ví dụ: Chủ Nhật lúc 8:00 sáng)
cron.schedule('0 8 * * 0', () => {
  console.log('Đang lấy dữ liệu nhiệt độ...');
  fetchWeather();
});
