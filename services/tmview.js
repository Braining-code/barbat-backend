import puppeteer from "puppeteer";

export async function scrapeTmview(brand) {
  // Lanzar Chromium embebido (rápido + compatible Railway)
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-software-rasterizer",
      "--no-first-run",
      "--no-zygote",
      "--single-process"
    ]
  });

  const page = await browser.newPage();
  const url = "https://www.tmdn.org/tmview/#/tmview";

  try {
    // Cargar TMView (SPA pesada)
    await page.goto(url, { waitUntil: "networkidle2", timeout: 35000 });

    // Esperar input correcto (ya no existe "Nombre de la marca")
    await page.waitForSelector('input[name="basicSearchText"]', {
      timeout: 15000
    });

    // Escribir la marca
    await page.type('input[name="basicSearchText"]', brand);

    // Ejecutar búsqueda — ENTER es más estable que el botón
    await page.keyboard.press("Enter");

    // Esperar resultados (tarjetas)
    await page.waitForSelector(".tm-card-content", {
      timeout: 20000
    });

    // Extraer datos
    const items = await page.evaluate(() => {
      const results = [];

      document.querySelectorAll(".tm-card-content").forEach((card) => {
        const name =
          card.querySelector(".tm-title")?.innerText?.trim() || null;

        const classesText =
          card.querySelector(".nice-classes")?.innerText
            ?.replace("Classes:", "")
            ?.replace("Clases:", "") || "";

        const classes = classesText
          .split(",")
          .map((c) => Number(c.trim()))
          .filter(Boolean);

        results.push({ name, classes });
      });

      return results;
    });

    await browser.close();

    return {
      ok: true,
      brand,
      count: items.length,
      items
    };

  } catch (err) {
    await browser.close();
    return {
      ok: false,
      error: err.message
    };
  }
}
