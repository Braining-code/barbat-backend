import puppeteer from "puppeteer";

export async function getTmviewResults(brand) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage"
    ]
  });

  const page = await browser.newPage();

  const url = "https://www.tmdn.org/tmview/#/tmview";

  try {
    // Abrir página
    await page.goto(url, { waitUntil: "networkidle0" });

    // Completar input
    await page.type('input[placeholder="Nombre de la marca"]', brand);
    await page.waitForTimeout(1200);

    // Click en Buscar
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: "networkidle0" });

    // Esperar cards
    await page.waitForSelector(".tm-card-content", { timeout: 8000 });

    const items = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll(".tm-card-content").forEach((card) => {
        const name = card.querySelector(".tm-title")?.innerText || null;

        const classesText =
          card
            .querySelector(".nice-classes")
            ?.innerText.replace("Clases: ", "") || "";

        const classes = classesText
          .split(",")
          .map((c) => Number(c.trim()))
          .filter(Boolean);

        results.push({ name, classes });
      });

      return results;
    });

    await browser.close();
    return items;

  } catch (err) {
    await browser.close();
    return { ok: false, error: err.message };
  }
}
