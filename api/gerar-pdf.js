const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

exports.handler = async function(event, context) {
  const body = JSON.parse(event.body);

  const { nome, cpf, endereco, valor, inicio, finalidade, prazo, percentual } = body;

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
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4" });

    await browser.close();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: pdfBuffer.toString("base64"),
        isBase64Encoded: true,
      }),
    };

  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
