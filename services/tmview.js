import puppeteer from "puppeteer";

export async function scrapeTmview(brand) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  try {
    await page.goto("https://www.tmdn.org/tmview/#/tmview", {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    // Esperar el formulario completo
    await page.waitForSelector(".tmview-search-form", { timeout: 20000 });

    // Campo de búsqueda
    const searchInput = 'input[placeholder*="trade mark"]';
    await page.waitForSelector(searchInput, { timeout: 20000 });
    await page.type(searchInput, brand);

    // Detectar el botón de búsqueda por varios selectores
    const selectors = [
      'button[aria-label="Search"]',
      'button.p-button-icon-only',
      'button[type="button"]',
      '.p-button.p-component'
    ];

    let found = false;

    for (const sel of selectors) {
      const exists = await page.$(sel);
      if (exists) {
        await exists.click();
        found = true;
        break;
      }
    }

    if (!found) throw new Error("No se encontró ningún botón de búsqueda.");

    // Esperar resultados
    await page.waitForSelector(".tm-card-content", { timeout: 30000 });

    const items = await page.evaluate(() =>
      [...document.querySelectorAll(".tm-card-content")].map(card => ({
        name: card.querySelector(".tm-title")?.innerText || null,
        classes: (card.querySelector(".nice-classes")?.innerText || "")
          .replace(/Classes:|Clases:/, "")
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
