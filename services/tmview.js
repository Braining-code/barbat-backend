import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export async function getTmviewResults(brand) {
  let browser = null;

  try {
    // Lanzar Chromium según entorno (Render / local)
    const executablePath = await chromium.executablePath;

    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: chromium.args,
      defaultViewport: chromium.defaultViewport
    });

    const page = await browser.newPage();

    const url = "https://www.tmdn.org/tmview/#/tmview";

    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

    // Escribir marca
    await page.type("input[placeholder='Nombre de la marca']", brand);
    await page.waitForTimeout(1500);

    // Click en BUSCAR
    await page.click("button[type='submit']");
    await page.waitForNavigation({ waitUntil: "networkidle0" });

    // Esperar resultados
    await page.waitForSelector(".tm-card-content", { timeout: 15000 });

    const items = await page.evaluate(() => {
      const results = [];

      document.querySelectorAll(".tm-card-content").forEach((card) => {
        const name =
          card.querySelector(".tm-title")?.innerText?.trim() || null;

        const classes =
          card
            .querySelector(".nice-classes")
            ?.innerText.replace("Clases: ", "")
            ?.split(",")
            .map((n) => Number(n.trim())) || [];

        results.push({ name, classes });
      });

      return results;
    });

    await browser.close();

    return items;
  } catch (err) {
    if (browser) await browser.close();

    return {
      ok: false,
      error: err.message || "Unknown error"
    };
  }
}
