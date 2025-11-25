import puppeteer from "puppeteer";

export async function scrapeTmview(brand) {
  let browser = null;

  try {
    // Lanzamos un navegador real en Render
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ]
    });

    const page = await browser.newPage();

    // URL base de TMView
    const encoded = encodeURIComponent(brand);
    const url = `https://www.tmdn.org/tmview/#/tmview/results?page=1&pageSize=30&criteria=C&offices=AR,WO&territories=AR&basicSearch=${encoded}`;

    // Navegar a la página con la marca buscada
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    // Esperar que TMView cargue resultados
    await page.waitForSelector(".tm-table-row", { timeout: 20000 });

    // Extraer datos desde el frontend de TMView
    const results = await page.evaluate(() => {
      const rows = document.querySelectorAll(".tm-table-row");

      return Array.from(rows).map((row) => {
        const name =
          row.querySelector(".tm-trademark-name")?.innerText?.trim() || null;

        const classes = row
          .querySelector(".tm-nice-code")
          ?.innerText?.replace("Clases: ", "")
          .split(",")
          .map((c) => Number(c.trim())) || [];

        const status =
          row.querySelector(".tm-status")?.innerText?.trim() || null;

        const applicant =
          row.querySelector(".tm-applicant-name")?.innerText?.trim() || null;

        return { name, classes, status, applicant };
      });
    });

    await browser.close();
    return results;

  } catch (err) {
    if (browser) await browser.close();

    return {
      ok: false,
      error: err.message
    };
  }
}
