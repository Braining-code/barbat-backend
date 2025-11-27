import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/scrape", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ ok: false, error: "Missing query" });

  try {
    const search = encodeURIComponent(query.trim());

    const url = `https://www.tmdn.org/tmview/api/v1/search/basic?criteria=C&offices=AR&query=${search}&page=1&size=30`;

    const r = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0"
      }
    });

    const json = await r.json(); // TMView responde JSON en backend
    res.json({ ok: true, query, results: json });

  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("API running on port " + port));
