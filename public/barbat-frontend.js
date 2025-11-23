document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("barbat-search-app");

  root.innerHTML = `
    <div style="background:#111827;padding:30px;border-radius:20px;color:white;max-width:700px;margin:0 auto;">
      <h2 style="font-size:28px;font-weight:700;margin-bottom:10px;text-align:center;">
        Buscador de Disponibilidad de Marca
      </h2>

      <label style="font-size:16px;font-weight:600;">Nombre de la marca:</label>
      <input id="brandInput" type="text" placeholder="Ej: MiMarca"
        style="width:100%;padding:14px;border-radius:12px;margin:10px 0 20px 0;border:1px solid #374151;background:#1f2937;color:white;">
      
      <label style="font-size:16px;font-weight:600;">Clase de Niza:</label>
      <input id="classInput" type="number" min="1" max="45" placeholder="Ej: 35"
        style="width:100%;padding:14px;border-radius:12px;margin:10px 0 20px 0;border:1px solid #374151;background:#1f2937;color:white;">
      
      <button id="searchBtn"
        style="width:100%;padding:16px;background:#2563eb;color:white;border:none;border-radius:12px;font-size:18px;font-weight:600;cursor:pointer;">
        Verificar Disponibilidad
      </button>

      <div id="barbatResult" style="margin-top:25px;"></div>
    </div>
  `;

  document.getElementById("searchBtn").addEventListener("click", async () => {
    const brand = document.getElementById("brandInput").value.trim();
    const cls = document.getElementById("classInput").value.trim();

    if (!brand || !cls) return;

    const resultBox = document.getElementById("barbatResult");
    resultBox.innerHTML = `<p style="color:#9ca3af;">Consultando…</p>`;

    try {
      const res = await fetch(`https://barbat-backend.onrender.com/analizar?marca=${brand}&clase=${cls}`);
      const data = await res.json();

      resultBox.innerHTML = `
        <div style="background:#1f2937;padding:20px;border-radius:12px;">
          <h3 style="font-size:22px;font-weight:700;">Resultado</h3>
          <p><strong>Marca:</strong> ${brand}</p>
          <p><strong>Clase:</strong> ${cls}</p>
          <p><strong>Estado:</strong> ${data.status || "Desconocido"}</p>
          ${data.message ? `<p><strong>Mensaje:</strong> ${data.message}</p>` : ""}
        </div>
      `;
    } catch {
      resultBox.innerHTML = `
        <div style="background:#7f1d1d;padding:20px;border-radius:12px;color:white;">Error consultando la marca.</div>
      `;
    }
  });
});
