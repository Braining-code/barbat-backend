import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export async function scrapeTMView(query) {

  const search = encodeURIComponent(query.trim());

  const url = `https://www.tmdn.org/tmview/#/tmview/results` +
              `?page=1&pageSize=30` +
              `&criteria=C` +
              `&territories=AR` +
              `&basicSearch=${search}`;

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
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    // Esperar a que aparezcan resultados
    await page.waitForSelector(".tm-card-content, .no-results", {
      timeout: 30000
    });

    const items = await page.evaluate(() => {
      const results = [];

      const cards = document.querySelectorAll(".tm-card-content");
      if (!cards.length) return results;

      cards.forEach(card => {
        results.push({
          name: card.querySelector(".tm-title")?.innerText || null,
          status: card.querySelector(".tm-status")?.innerText || null,
          classes: card.querySelector(".nice-classes")?.innerText || null,
          holder: card.querySelector(".tm-applicant")?.innerText || null,
          number: card.querySelector(".tm-number")?.innerText || null,
        });
      });

      return results;import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export async function scrapeTMView(query) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
      "--window-size=1300,800"
    ]
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
  );

  try {
    const url = `https://www.tmdn.org/tmview/#/tmview/results?page=1&pageSize=30&criteria=C&territories=AR&basicSearch=${encodeURIComponent(query)}`;

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    // Esperar lista de resultados
    await page.waitForSelector(".result-list", { timeout: 50000 });

    const data = await page.evaluate(() => {
      const rows = [...document.querySelectorAll(".result-item")];

      return rows.map(row => ({
        name: row.querySelector(".markName")?.innerText || null,
        number: row.querySelector(".appNumber")?.innerText || null,
        status: row.querySelector(".status")?.innerText || null,
        holder: row.querySelector(".holder")?.innerText || null,
        classes: row.querySelector(".niceClass")?.innerText || null,
        country: row.querySelector(".country")?.innerText || "AR"
      }));
    });

    return { ok: true, query, results: data };

  } catch (err) {
    console.error("TMView scraping error:", err);
    return { ok: false, error: err.message };
  } finally {
    await browser.close();
  }
}

