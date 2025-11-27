import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export async function scrapeTMView(query) {
  const encoded = encodeURIComponent(query.trim());

  const url = `https://www.tmdn.org/tmview/#/tmview/results?page=1&pageSize=30&criteria=C&territories=AR&basicSearch=${encoded}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-blink-features=AutomationControlled",
      "--window-size=1366,768"
    ]
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
  );

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // 🔥 NUEVO selector correcto
    await page.waitForSelector("div.results-container, div.no-results", {
      timeout: 60000
    });

    const results = await page.evaluate(() => {
      const items = [];

      const cards = document.querySelectorAll("div.result-card");

      cards.forEach(card => {
        items.push({
          name: card.querySelector(".result-title")?.innerText || null,
          number: card.querySelector(".result-number")?.innerText || null,
          status: card.querySelector(".result-status")?.innerText || null,
          classes: card.querySelector(".result-classes")?.innerText || null,
          holder: card.querySelector(".result-applicant")?.innerText || null,
          country: card.querySelector(".result-country")?.innerText || "AR"
        });
      });

      return items;
    });

    return { ok: true, query, results };

  } catch (err) {
    return { ok: false, error: err.message };
  } finally {
    await browser.close();
  }
}
