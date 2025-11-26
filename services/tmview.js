import puppeteer from "puppeteer";

export async function scrapeTmview(brand) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  });

  const page = await browser.newPage();

  try {
    await page.goto("https://www.tmdn.org/tmview/#/tmview", {
      waitUntil: "networkidle2",
      timeout: 45000
    });

    // Campo búsqueda
    await page.waitForSelector('input[placeholder*="trade mark"]', { timeout: 15000 });
    await page.type('input[placeholder*="trade mark"]', brand);

    // BOTÓN NUEVO (2025 estable con aria-label)
    await page.waitForSelector('button[aria-label="Search"]', { timeout: 15000 });
    await page.click('button[aria-label="Search"]');

    // Resultados
    await page.waitForSelector(".tm-card-content", { timeout: 20000 });

    const items = await page.evaluate(() =>
      [...document.querySelectorAll(".tm-card-content")].map(card => ({
        name: card.querySelector(".tm-title")?.innerText?.trim() || null,
        classes: (card.querySelector(".nice-classes")?.innerText || "")
          .replace("Classes:", "")
          .replace("Clases:", "")
          .split(",")
          .map(n => parseInt(n.trim()))
          .filter(Boolean)
      }))
    );

    await browser.close();
    return items;

  } catch (err) {
    await browser.close();
    return { ok: false, error: err.message };
  }
}

