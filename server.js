import express from "express";
import cors from "cors";

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

import { scrapeTmview } from "./services/tmview.js";
import { scrapeTMView as scrapeTMViewStealth } from "./services/tmviewStealth.js";

const app = express();

// 🔵 FIX CORS — obligatorio para data:text/html, Divi y cualquier frontend
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

// 🟦 Ruta base
app.get("/", (req, res) => {
  res.json({ message: "Barbat backend online" });
});

// 🟦 Mock
app.get("/buscar", (req, res) => {
  res.json({
    status: "ok",
    marca: req.query.marca || null,
    mensaje: "Mock funcionando"
  });
});

// 🟩 Scraper normal (test)
app.post("/api/search", async (req, res) => {
  const { brand, classes } = req.body;

  if (!brand) {
    return res.status(400).json({ ok: false, message: "Falta brand" });
  }

  try {
    const results = await scrapeTmview(brand);
    res.json({ ok: true, brand, classes, sources: { tmview: results } });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al scrapear TMView",
      details: error.message
    });
  }
});

// 🟩 Scraper stealth real (Argentina)
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

// ⭐ Test puppeteer
app.get("/puppeteer-test", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-blink-features=AutomationControlled",
        "--disable-infobars",
        "--window-size=1280,800"
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
