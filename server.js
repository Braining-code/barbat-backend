import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Barbat backend online" });
});

// endpoint de prueba
app.get("/buscar", (req, res) => {
  res.json({
    status: "ok",
    marca: req.query.marca || null,
    mensaje: "Esto es solo un mock para probar Render"
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Backend Barbat corriendo en puerto " + port);
});
