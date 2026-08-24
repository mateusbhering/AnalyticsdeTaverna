const { chromium } = require("playwright-core");
(async () => {
  const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
  const p = await b.newPage();
  await p.goto("https://www.analyticsdetaverna.com.br/batalha", { waitUntil: "domcontentloaded" });

  // O fetch roda no contexto da página — mesma origem, mesmo TLS que o usuário.
  const r = await p.evaluate(async () => {
    try {
      const res = await fetch("https://avatar-api-qnot.onrender.com/batalha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jogador_a_id: 1, jogador_b_id: 2 }),
      });
      return { ok: true, status: res.status, corpo: (await res.text()).slice(0, 120) };
    } catch (e) {
      return { ok: false, erro: String(e) };
    }
  });
  console.log("fetch do navegador:", JSON.stringify(r, null, 1));

  // Qual API_BASE o bundle publicado está mesmo usando em runtime?
  console.log("mensagem antiga ainda no ar?",
    await p.evaluate(() => document.documentElement.innerHTML.includes("Verifique a conexão")));
  await b.close();
})();
