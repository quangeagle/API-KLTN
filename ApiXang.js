const axios = require('axios');
const cheerio = require('cheerio');

async function fetchFuel(province = 'ho-chi-minh') {
  const url = `https://giaxanghomnay.com/tinh-tp/${province}`;
  try {
    console.log(`🌍 Đang lấy giá xăng từ: ${province}`);
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', // giả lập trình duyệt
      },
      timeout: 10000 // tránh bị timeout
    });

    const $ = cheerio.load(data);
    const usdRate = await fetchRateUSD();
    if (!usdRate) return console.warn("⚠️ Không thể lấy tỷ giá USD. Dừng lại.");

    $('table tbody tr').each((i, tr) => {
      const tds = $(tr).find('td');
      const type = $(tds[0]).text().trim();
      const priceVND = parseFloat($(tds[2]).text().replace(/[.,]/g, ''));
      const usdPerGallon = priceVND * usdRate * 3.78541;
      console.log({
        province,
        type,
        vndPerLiter: priceVND,
        usdPerGallon: usdPerGallon.toFixed(2),
      });
    });

  } catch (err) {
    console.error('❌ Lỗi lấy dữ liệu xăng:', err.message);
  }
}

async function fetchRateUSD() {
    console.log("⚠️ Sử dụng tỷ giá giả để test");
    return 0.000039; // ~1 VND = 0.000039 USD (tỷ giá tham khảo)
  }
// Test trực tiếp
fetchFuel();
