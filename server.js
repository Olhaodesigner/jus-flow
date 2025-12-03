require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // permite que o front rode em outro domínio se precisar
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Transport de e-mail (SMTP) configurado pelas variáveis de ambiente
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true", // true para 465, false para 587/25
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Rota de saúde (debug)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Rota da API para receber o formulário
app.post("/api/leads", async (req, res) => {
  // NOVO PADRÃO: mesmos campos do index.html
  const { name, phone, email, area, summary } = req.body;

  console.log("[NOVO LEAD]", { name, phone, email, area });

  // Validações alinhadas com o front
  if (!name || !phone || !area || !summary) {
    return res
      .status(400)
      .json({ error: "Nome, telefone, área e resumo são obrigatórios." });
  }

  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 9) {
    return res.status(400).json({ error: "Telefone inválido." });
  }

  if (email && !String(email).includes("@")) {
    return res.status(400).json({ error: "E-mail inválido." });
  }

  if (summary.length > 1000) {
    return res
      .status(400)
      .json({ error: "Resumo muito longo (máx. 1000 caracteres)." });
  }

  // Para onde o e-mail vai
  const toEmail =
    process.env.TO_EMAIL || "josevitorvilarinhobrito@gmail.com";

  const mailOptions = {
    from: `"Brito Vilarinho Advocacia" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Novo lead - Área: ${area || "não informada"}`,
    text: `
Você recebeu um novo potencial cliente pelo app Brito Vilarinho Advocacia:

Nome: ${name}
Telefone (WhatsApp): ${phone}
E-mail: ${email || "Não informado"}
Área aproximada: ${area}

Resumo da situação:
${summary}

Sugestão: entrar em contato com o cliente pelo telefone/e-mail informado.
    `.trim(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("E-mail enviado:", info.messageId);

    return res.json({
      message:
        "Caso enviado com sucesso! Em breve um advogado entrará em contato.",
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return res.status(500).json({
      error:
        "Ocorreu um erro ao enviar o caso. Verifique o SMTP ou tente novamente mais tarde.",
    });
  }
});

// Qualquer outra rota GET devolve o index.html (SPA simples)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
