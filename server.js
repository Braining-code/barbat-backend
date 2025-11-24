import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

// configuración base
app.use(cors());
app.use(express.json());

// ruta principal
app.get("/", (req, res) => {
  res.json({ message: "Barbat backend online" });
});

// ruta de prueba existente
app.get("/buscar", (req, res) => {
  res.json({
    status: "ok",
    marca: req.query.marca || null,
    mensaje: "Esto es solo un mock para probar Render"
  });
});

// 🔥 RUTA REAL MVP: BUSQUEDA EN TMVIEW (ARGENTINA)
app.get("/api/search", async (req, res) => {
  const term = req.query.term;

  if (!term) {
    return res.status(400).json({ error: "Missing search term ?term=" });
  }

  try {
    // URL de TMView con AR y WO para más resultados
    const url = `https://www.tmdn.org/tmview/api/basicSearch?text=${encodeURIComponent(
      term
    )}&offices=AR&territories=AR`;

    // Headers que permiten que TMView acepte la request
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      Accept: "application/json",
      Referer: "https://www.tmdn.org/tmview/",
      Origin: "https://www.tmdn.org"
    };

    const response = await fetch(url, { headers });

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: "TMView rejected the request",
        status: response.status
      });
    }import express from "express";
import cors from "cors";

const app = express();

// Configuración global
app.use(cors());
app.use(express.json());

// Ruta base
app.get("/", (req, res) => {
  res.json({ message: "Barbat backend online" });
});

// Ruta mock previa
app.get("/buscar", (req, res) => {
  res.json({
    status: "ok",
    marca: req.query.marca || null,
    mensaje: "Esto es solo un mock para probar Render"
  });
});

// 🔥 Ruta importante para el MVP
app.post("/api/search", (req, res) => {
  const { brand, classes } = req.body;

  if (!brand || !classes) {
    return res.status(400).json({
      ok: false,
      message: "Faltan parámetros: brand y classes son obligatorios"
    });
  }

  res.json({
    ok: true,
    message: "Ruta /api/search funcionando correctamente",
    brand,
    classes,
    analysis: {
      ready: true,
      provider: "mock",
      nextStep: "Conectar providers reales (TMview / INPI)",
    },
  });
});

// Puerto dinámico para Render
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Backend Barbat corriendo en puerto " + port);
});

