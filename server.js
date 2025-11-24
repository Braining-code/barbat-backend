import express from "express";
import cors from "cors";

// 👉 Importamos el servicio real de TMView
import { getTmviewResults } from "./services/tmview.js";

const app = express();

app.use(cors());
app.use(express.json());

// 🔵 Ruta base
app.get("/", (req, res) => {
  res.json({ message: "Barbat backend online" });
});

// 🔵 Ruta mock previa (puede quedar)
app.get("/buscar", (req, res) => {
  res.json({
    status: "ok",
    marca: req.query.marca || null,
    mensaje: "Esto es solo un mock para probar Render"
  });
});

// 🔥 RUTA REAL DEL MVP (DIVI → BACKEND → TMVIEW)
app.post("/api/search", async (req, res) => {
  const { brand, classes } = req.body;

  if (!brand) {
    return res.status(400).json({
      ok: false,
      message: "Falta brand"
    });
  }

  try {
    // 👉 Consultamos TMView con la marca ingresada
    const tmviewResults = await getTmviewResults(brand);

    // 👉 Respondemos al frontend
    res.json({
      ok: true,
      brand,
      classes,
      sources: {
        tmview: tmviewResults
      },
      meta: {
        provider: "TMView",
        count: tmviewResults.length,
        nextStep: "Agregar similitud y WIPO"
      }
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error interno al consultar TMView",
      details: error.message
    });
  }
});

// 🔵 Puerto dinámico (OBLIGATORIO para Render)
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Backend Barbat corriendo en puerto " + port);
});
