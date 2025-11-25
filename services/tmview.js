import puppeteer from "puppeteer";

export async function getTmviewResults(brand) {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // URL principal
    const url = "https://www.tmdn.org/tmview/#/tmview";

    // Ir a TMView
    await page.goto(url, { waitUntil: "networkidle2" });

    // Buscar input por placeholder
    await page.type('input[placeholder="Nombre de marca"]', brand);
    await page.waitForTimeout(1500);

    // Click en Buscar
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    // Esperar resultados
    await page.waitForSelector(".tm-card-content", { timeout: 8000 });

    // Extraer contenido
    const results = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll(".tm-card-content").forEach(card => {
        const name =
          card.querySelector(".tm-title")?.innerText?.trim() || null;

        const classes =
          card
            .querySelector(".nice-classes")
            ?.innerText.replace("Clases: ", "")
            ?.split(",")
            ?.map(n => Number(n.trim())) || [];

        items.push({ name, classes });
      });
      return items;
    });

    await browser.close();
    return results;
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
