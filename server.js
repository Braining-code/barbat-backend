import express from "express";
import cors from "cors";

// 👉 Importamos el scraper real con Puppeteer
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

// 🔥 RUTA REAL DEL MVP
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
        count: results.length,
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

// 🔵 Puerto dinámico (OBLIGATORIO en Render)
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Backend Barbat corriendo en puerto " + port);
});
