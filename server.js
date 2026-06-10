const nodeMajor = Number(process.version.slice(1).split('.')[0]);
if (nodeMajor < 18) {
  console.error(`Node.js ${process.version} is too old. This project requires Node.js 18 or newer.`);
  console.error('Run: nvm use 22   (or install Node 18+ from https://nodejs.org)');
  process.exit(1);
}

const express = require('express');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

app.use(express.json());
app.use(express.static(path.join(__dirname)));

function getImageSrc($, selector) {
  const img = $(selector).first();
  if (!img.length) return null;
  return img.attr('src') || img.attr('data-src') || img.attr('data-lazy-src') || null;
}

function validateProductUrl(urlString) {
  let url;
  try {
    url = new URL(urlString.trim());
  } catch {
    return { valid: false, error: 'URL ไม่ถูกต้อง' };
  }

  if (url.protocol !== 'https:') {
    return { valid: false, error: 'URL ต้องขึ้นต้นด้วย https://' };
  }

  if (url.hostname !== 'www.owndays.com') {
    return { valid: false, error: 'รองรับเฉพาะ www.owndays.com' };
  }

  if (!/^\/[a-z]{2}\/[a-z]{2}\/products\/[A-Za-z0-9_-]+\/?$/i.test(url.pathname)) {
    return { valid: false, error: 'URL ต้องอยู่ในรูปแบบ /{country}/{lang}/products/{product-code}' };
  }

  const sku = url.searchParams.get('sku');
  if (!sku || !sku.trim()) {
    return { valid: false, error: 'URL ต้องมีพารามิเตอร์ ?sku=' };
  }

  return { valid: true };
}

app.post('/api/fetch-image', async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  const validation = validateProductUrl(url);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url.trim());
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const response = await fetch(parsedUrl.href, {
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8,th;q=0.7',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to fetch page (${response.status})`,
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const selectors = [
      '#productImageSwiper .swiper-slide-active img',
      '#productImageSwiper .swiper-slide:first-child img',
      '#productImageSwiper img',
    ];

    let imageSrc;
    for (const selector of selectors) {
      imageSrc = getImageSrc($, selector);
      if (imageSrc) break;
    }

    if (!imageSrc) {
      return res.status(404).json({
        error: 'Image not found (#productImageSwiper img)',
      });
    }

    const absoluteSrc = new URL(imageSrc, parsedUrl.href).href;
    res.json({ imageUrl: absoluteSrc });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch page' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    console.error(`Stop the other process: lsof -ti:${PORT} | xargs kill`);
    console.error(`Or use another port: PORT=3001 npm start`);
  } else {
    console.error(err.message);
  }
  process.exit(1);
});
