import puppeteer from "puppeteer";

export async function scrapeTmview(brand) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  const url = "https://www.tmdn.org/tmview/#/tmview";

  try {
    await page.goto(url, { waitUntil: "networkidle0" });

    // Escribir la marca en el buscador
    await page.type("input[placeholder='Nombre de la marca']", brand);
    await page.waitForTimeout(1200);

    // Click en BUSCAR
    await page.click("button[type='submit']");
    await page.waitForNavigation({ waitUntil: "networkidle0" });

    // Esperar resultados
    await page.waitForSelector(".tm-card-content", { timeout: 8000 });

    const results = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll(".tm-card-content").forEach((card) => {
        const name = card.querySelector(".tm-title")?.innerText || null;
        const classes = card
          .querySelector(".nice-classes")
          ?.innerText.replace("Clases: ", "")
          .split(",")
          .map((n) => Number(n.trim())) || [];

        items.push({ name, classes });
      });
      return items;
    });

    await browser.close();
    return results;

  } catch (err) {
    await browser.close();
    return { ok: false, error: err.message };
  }
}
