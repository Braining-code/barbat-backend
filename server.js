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
    }

    const data = await response.json();

    return res.json({
      ok: true,
      provider: "tmview",
      query: term,
      count: data?.results?.length || 0,
      results: data?.results || []
    });

  } catch (error) {
    console.error("Error TMView:", error);
    return res.status(500).json({
      ok: false,
      error: "Internal server error",
      details: error.message
    });
  }
});

// puerto dinámico para Render
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Backend Barbat corriendo en puerto " + port);
});

