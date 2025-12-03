const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { name, phone, email, area, summary } = req.body || {};

  // Validações iguais às do front
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

  // Configura SMTP usando as variáveis da Vercel
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

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

    return res
      .status(200)
      .json({ message: "Caso enviado com sucesso! Em breve um advogado entrará em contato." });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return res
      .status(500)
      .json({ error: "Ocorreu um erro ao enviar o caso. Verifique o SMTP." });
  }
};
