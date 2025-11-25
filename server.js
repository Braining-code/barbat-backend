import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";  // ⬅️ necesario para /puppeteer-test
import { scrapeTmview } from "./services/tmview.js";

const app = express();

app.use(cors());
app.use(express.json());

// 🔵 Ruta base
app.get("/", (req, res) => {
  res.json({ message: "Barbat backend online" });
});

// 🔵 Ruta mock (puede quedar)
app.get("/buscar", (req, res) => {
  res.json({
    status: "ok",
    marca: req.query.marca || null,
    mensaje: "Esto es solo un mock para probar Render"
  });
});

// 🔥 RUTA REAL DEL MVP (scraping TMView)
app.post("/api/search", async (req, res) => {
  const { brand, classes } = req.body;

  if (!brand) {
    return res.status(400).json({
      ok: false,
      message: "Falta brand"
    });
  }

  try {
    // 👉 Scrapear TMView con Puppeteer
    const results = await scrapeTmview(brand);

    return res.json({
      ok: true,
      brand,
      classes,
      sources: {
        tmview: results
      },
      meta: {
        provider: "TMView (scraper)",
        count: Array.isArray(results) ? results.length : 0,
        nextStep: "Agregar similitud / WIPO"
      }
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error interno al scrapear TMView",
      details: error.message
    });
  }
});

// ⭐ RUTA PARA PROBAR CHROME + PUPPETEER
app.get("/puppeteer-test", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ]
    });

    const page = await browser.newPage();
    await page.goto("https://example.com", { waitUntil: "networkidle0" });

    const title = await page.title();

    await browser.close();

    res.json({
      ok: true,
      message: "Chrome se ejecutó correctamente con Puppeteer.",
      title
    });

  } catch (error) {
    res.json({
      ok: false,
      error: error.message
    });
  }
});

// 🔵 Puerto dinámico (OBLIGATORIO en Render)
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Backend Barbat corriendo en puerto " + port);
});
