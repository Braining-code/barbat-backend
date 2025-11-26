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

      return results;
    });

    await browser.close();

    return {
      ok: true,
      query,
      count: items.length,
      results: items
    };

  } catch (err) {
    console.error("Error TMView:", err);
    await browser.close();
    return { ok: false, error: err.message };
  }
}
