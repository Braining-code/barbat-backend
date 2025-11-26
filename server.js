import express from "express";
import cors from "cors";

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// activar Stealth mode
puppeteer.use(StealthPlugin());

import { scrapeTmview } from "./services/tmview.js";
import { scrapeTMView as scrapeTMViewStealth } from "./services/tmviewStealth.js";

const app = express();

app.use(cors());
app.use(express.json());

// 🟦 Ruta base
app.get("/", (req, res) => {
  res.json({ message: "Barbat backend online" });
});

// 🟦 Ruta mock
app.get("/buscar", (req, res) => {
  res.json({
    status: "ok",
    marca: req.query.marca || null,
    mensaje: "Mock funcionando"
  });
});

// 🟩 RUTA REAL DEL MVP (Scraping TMView normal)
app.post("/api/search", async (req, res) => {
  const { brand, classes } = req.body;

  if (!brand) {
    return res.status(400).json({
      ok: false,
      message: "Falta brand"
    });
  }

  try {
    const results = await scrapeTmview(brand);

    return res.json({
      ok: true,
      brand,
      classes,
      sources: {
        tmview: results
      }
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error al scrapear TMView",
      details: error.message
    });
  }
});

// 🟩 NUEVA RUTA — SCRAPER STEALTH (Playwright stealth)
app.post("/api/scrape", async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ ok: false, error: "Missing query" });
  }

  try {
    const result = await scrapeTMViewStealth(query);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error interno al scrapear (Stealth)",
      details: error.message
    });
  }
});

// ⭐ RUTA TEST CHROME
app.get("/puppeteer-test", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-blink-features=AutomationControlled"
      ]
    });

    const page = await browser.newPage();
    await page.goto("https://example.com", { waitUntil: "networkidle0" });

    const title = await page.title();

    await browser.close();

    res.json({
      ok: true,
      message: "Puppeteer EXTRA + Stealth funciona",
      title
    });

  } catch (error) {
    res.json({
      ok: false,
      error: error.message
    });
  }
});

// 🟦 Puerto dinámico
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Backend Barbat corriendo en puerto " + port);
});
