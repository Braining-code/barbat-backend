import puppeteer from "puppeteer";

export async function scrapeTmview(brand) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
      "--disable-infobars",
      "--window-size=1366,768"
    ]
  });

  const page = await browser.newPage();

  // 🟦 User-Agent real (Chrome en Windows)
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  // 🟦 Anti headless detection
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });

  try {
    await page.goto("https://www.tmdn.org/tmview/#/tmview", {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    // Esperar cualquier input del formulario
    await page.waitForSelector('input[type="text"]', { timeout: 25000 });

    // Campo de búsqueda real
    const searchSelector = 'input[type="text"]';
    await page.type(searchSelector, brand);

    // Botón de búsqueda — selector amplio
    const buttonSel = 'button.p-button, button[type="button"]';
    await page.waitForSelector(buttonSel, { timeout: 20000 });
    await page.click(buttonSel);

    // Esperar resultados
    await page.waitForSelector(".tm-card-content", { timeout: 35000 });

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
