import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export async function scrapeTMView(query) {
  const url = `https://www.tmdn.org/tmview/#/tmview/results?page=1&pageSize=30&criteria=C&territories=AR&basicSearch=${encodeURIComponent(query)}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
      "--disable-infobars",
      "--window-size=1280,800"
    ]
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
  );

  try {
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    await page.waitForSelector(".tm-card-content, .no-results", { timeout: 30000 });

    const data = await page.evaluate(() => {
      const rows = [...document.querySelectorAll(".tm-card-content")];

      return rows.map(card => ({
        name: card.querySelector(".tm-title")?.innerText || null,
        status: card.querySelector(".tm-status")?.innerText || null,
        classes: card.querySelector(".nice-classes")?.innerText || null,
        holder: card.querySelector(".tm-applicant")?.innerText || null,
        number: card.querySelector(".tm-number")?.innerText || null,
      }));
    });

    return { ok: true, query, results: data };

  } catch (err) {
    return { ok: false, error: err.message };
  } finally {
    await browser.close();
  }
}
