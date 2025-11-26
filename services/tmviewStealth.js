const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

async function scrapeTMView(query) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
      "--window-size=1280,800"
    ]
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
  );

  try {
    await page.goto("https://www.tmdn.org/tmview/#/tmview", {
      waitUntil: "networkidle2",
      timeout: 45000
    });

    await page.waitForSelector("input[placeholder='Search']", { timeout: 20000 });
    await page.type("input[placeholder='Search']", query);
    await page.keyboard.press("Enter");

    await page.waitForSelector(".result-list", { timeout: 35000 });
    await page.waitForTimeout(1500);

    const data = await page.evaluate(() => {
      const row = document.querySelector(".result-item");
      if (!row) return null;

      return {
        trademark: row.querySelector(".markName")?.innerText || null,
        number: row.querySelector(".appNumber")?.innerText || null,
        status: row.querySelector(".status")?.innerText || null,
        holder: row.querySelector(".holder")?.innerText || null,
        classes: row.querySelector(".niceClass")?.innerText || null,
        country: row.querySelector(".country")?.innerText || null
      };
    });

    return { ok: true, query, data };

  } catch (err) {
    console.error("TMView scraping error:", err);
    return { ok: false, error: err.message };
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeTMView };
