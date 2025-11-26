import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export async function scrapeTmview(brand) {
  const search = encodeURIComponent(brand.trim());

  const url = `https://www.tmdn.org/tmview/#/tmview/results?page=1&pageSize=30&criteria=C&territories=AR&basicSearch=${search}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-blink-features=AutomationControlled",
      "--disable-infobars",
      "--window-size=1366,768"
    ]
  });

  const page = await browser.newPage();

  // User-Agent real
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
  );

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Esperar lista de resultados o no-results
    await page.waitForSelector(".result-list, .no-results", { timeout: 50000 });

    const items = await page.evaluate(() => {
      const rows = document.querySelectorAll(".result-item");
      const results = [];

      rows.forEach(row => {
        results.push({
          name: row.querySelector(".markName")?.innerText || null,
          number: row.querySelector(".appNumber")?.innerText || null,
          status: row.querySelector(".status")?.innerText || null,
          holder: row.querySelector(".holder")?.innerText || null,
          classes: row.querySelector(".niceClass")?.innerText || null,
          country: row.querySelector(".country")?.innerText || "AR"
        });
      });

      return results;
    });

    await browser.close();

    return {
      ok: true,
      brand,
      total: items.length,
      results: items
    };

  } catch (err) {
    await browser.close();
    return { ok: false, error: err.message };
  }
}
