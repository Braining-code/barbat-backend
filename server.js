import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// HOME
app.get("/", (req, res) => {
  res.json({ message: "Barbat backend online" });
});

// MOCK DE BUSQUEDA EXISTENTE
app.get("/buscar", (req, res) => {
  res.json({
    status: "ok",
    marca: req.query.marca || null,
    mensaje: "Esto es solo un mock para probar Render"
  });
});

// NUEVO ENDPOINT REAL PARA EL MVP
app.post("/api/search", (req, res) => {
  const { brand, classes } = req.body;

  res.json({
    ok: true,
    brand,
    classes,
    message: "Ruta /api/search funcionando correctamente",
    note: "Esto todavía es mock; la matemática se agregará luego"
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Backend Barbat corriendo en puerto " + port);
});
