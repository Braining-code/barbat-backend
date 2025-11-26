import puppeteer from "puppeteer";

export async function scrapeTmview(brand) {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/usr/bin/google-chrome-stable",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--no-first-run",
      "--no-zygote"
    ]
  });

  const page = await browser.newPage();

  try {
    await page.goto("https://www.tmdn.org/tmview/#/tmview", {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    // 🟦 Nuevo selector 2025
    await page.waitForSelector('input[placeholder*="trade mark"]', {
      timeout: 15000
    });

    // 🟦 Completar marca
    await page.type('input[placeholder*="trade mark"]', brand, { delay: 80 });

    // 🟦 Botón buscar
    await page.click('button[data-testid="search-button"]');

    // 🟦 Esperar resultados
    await page.waitForSelector(".tm-card-content", {
      timeout: 15000
    });

    const results = await page.evaluate(() => {
      return [...document.querySelectorAll(".tm-card-content")].map(card => {
        const name = card.querySelector(".tm-title")?.innerText || null;
        const classesText =
          card.querySelector(".nice-classes")?.innerText
            ?.replace("Classes:", "")
            ?.trim() || "";

        const classes = classesText
          .split(",")
          .map(n => parseInt(n.trim()))
          .filter(Boolean);

        return { name, classes };
      });
    });

    await browser.close();
    return results;

  } catch (err) {
    await browser.close();
    return { ok: false, error: err.message };
  }
}
