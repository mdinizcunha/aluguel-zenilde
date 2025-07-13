import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const body = req.body;

  const {
    nome,
    cpf,
    endereco,
    valor,
    inicio,
    finalidade,
    prazo,
    percentual
  } = body;

  const html = `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
          h2 { text-align: center; }
          p { text-align: justify; margin-bottom: 10px; }
          strong { font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>CONTRATO DE LOCAÇÃO RESIDENCIAL</h2>
        <p><strong>IDENTIFICAÇÃO DAS PARTES CONTRATANTES</strong><br>
        LOCADOR: Zenilde Oliveira Santos, brasileira, pedagoga, casada, CPF nº 591.547.215-04.<br>
        LOCATÁRIO: ${nome}, CPF nº ${cpf}, residente no endereço ${endereco}.</p>
        <p><strong>DO OBJETO DO CONTRATO</strong><br>
        O imóvel situado em ${endereco}, destinado a fins ${finalidade}, pelo prazo de ${prazo} meses, com início em ${inicio}.</p>
        <p><strong>DO VALOR DO ALUGUEL</strong><br>
        O aluguel mensal é de R$ ${valor}, reajustado anualmente em ${percentual}%.</p>
        <p>Por estarem assim justos e contratados, firmam o presente instrumento em duas vias de igual teor.</p>
      </body>
    </html>
  `;

  try {
    const executablePath =
      (await chromium.executablePath) ||
      "/usr/bin/chromium-browser";

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4" });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
