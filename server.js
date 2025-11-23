import express from "express";
import cors from "cors";

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

// NUEVA RUTA NECESARIA PARA EL MVP
app.post("/api/search", (req, res) => {
  const { brand, classes } = req.body;

  // validación básica
  if (!brand || !classes) {
    return res.status(400).json({
      ok: false,
      message: "Faltan parámetros: brand y classes son obligatorios"
    });
  }

  // respuesta temporal del MVP
  res.json({
    ok: true,
    message: "Ruta /api/search funcionando correctamente",
    brand: brand,
    classes: classes,
    analysis: {
      ready: true,
      provider: "mock", // luego será TMview/WIPO/INPI
      nextStep: "Conectar providers reales"
    }
  });
});

// puerto dinámico para Render
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Backend Barbat corriendo en puerto " + port);
});
