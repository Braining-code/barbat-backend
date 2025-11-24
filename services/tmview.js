import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export async function scrapeTmview(brand) {
  let browser = null;

  try {
    const executablePath = await chromium.executablePath;

    browser = await puppeteer.launch({
      executablePath,
      args: chromium.args,
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport
    });

    const page = await browser.newPage();
    await page.goto("https://www.tmdn.org/tmview/#/tmview", {
      waitUntil: "networkidle2"
    });

    await page.waitForSelector('input[placeholder="Nombre de la marca"]', { timeout: 8000 });
    await page.type('input[placeholder="Nombre de la marca"]', brand);

    await page.click('button[type="submit"]');
    await page.waitForSelector(".tm-card-content", { timeout: 12000 });

    const results = await page.evaluate(() => {
      const items = [];
      const cards = document.querySelectorAll(".tm-card-content");

      cards.forEach(card => {
        const name = card.querySelector(".tm-title")?.innerText || null;

        const classes = card
          .querySelector(".nice-classes")?.innerText.replace("Clases: ", "")
          .split(",")
          .map(n => Number(n.trim()));

        items.push({
          name,
          classes
        });
      });

      return items;
    });

    await browser.close();
    return results;

  } catch (err) {
    if (browser) await browser.close();
    return { ok: false, error: err.message };
  }
}
