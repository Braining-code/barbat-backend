import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export async function scrapeTMView(query) {
  const search = encodeURIComponent(query.trim());

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
      "--window-size=1300,800"
    ]
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
  );

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // esperamos el contenedor de resultados o el "sin resultados"
    await page.waitForSelector(".result-list, .no-results", { timeout: 50000 });

    const results = await page.evaluate(() => {
      const rows = document.querySelectorAll(".result-item");
      const data = [];

      rows.forEach(row => {
        data.push({
          name: row.querySelector(".markName")?.innerText || null,
          number: row.querySelector(".appNumber")?.innerText || null,
          status: row.querySelector(".status")?.innerText || null,
          holder: row.querySelector(".holder")?.innerText || null,
          classes: row.querySelector(".niceClass")?.innerText || null,
          country: row.querySelector(".country")?.innerText || "AR"
        });
      });

      return data;
    });

    return { ok: true, query, results };

  } catch (error) {
    console.error("TMView scraping error:", error);
    return { ok: false, error: error.message };

  } finally {
    await browser.close();
  }
}
