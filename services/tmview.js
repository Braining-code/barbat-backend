import puppeteer from "puppeteer-core";

export async function scrapeTmview(brand) {
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/usr/bin/google-chrome-stable",   // 🔥 ruta correcta en Render
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-software-rasterizer",
      "--no-first-run",
      "--no-zygote"
    ]
  });

  const page = await browser.newPage();

  const url = "https://www.tmdn.org/tmview/#/tmview";

  try {
    await page.goto(url, { waitUntil: "networkidle0" });

    await page.type('input[placeholder="Nombre de la marca"]', brand);
    await page.waitForTimeout(1200);

    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: "networkidle0" });

    await page.waitForSelector(".tm-card-content", { timeout: 8000 });

    const items = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll(".tm-card-content").forEach((card) => {
        const name = card.querySelector(".tm-title")?.innerText || null;

        const classesText =
          card.querySelector(".nice-classes")?.innerText.replace("Clases:", "") ||
          "";

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
