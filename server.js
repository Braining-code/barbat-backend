import express from "express";
import cors from "cors";

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

// 🔥 RUTA REAL DEL MVP (DIVI → BACKEND)
app.post("/api/search", (req, res) => {
  const { brand, classes } = req.body;

  if (!brand || !classes) {
    return res.status(400).json({
      ok: false,
      message: "Faltan parámetros: brand y classes son obligatorios"
    });
  }

  // Respuesta mínima para validar conexión del MVP
  res.json({
    ok: true,
    message: "Ruta /api/search funcionando correctamente",
    brand,
    classes,
    analysis: {
      similarity_score: 0,
      phonetic_score: 0,
      risk: "BAJO",
      provider: "mock",
      nextStep: "Conectar TMView real"
    }
  });
});

// 🔵 Puerto dinámico (OBLIGATORIO para Render)
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Backend Barbat corriendo en puerto " + port);
});
