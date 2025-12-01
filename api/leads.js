// api/leads.js
// Backend oficial do Easy Lawyer na Vercel
// - Recebe POST /api/leads com { name, phone, email?, area, summary }
// - Valida campos
// - Envia e-mail via Resend para o escritório
// - Loga o lead no console para debug/observação

import { Resend } from "resend";

export default async function handler(req, res) {
  // Aceita apenas POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // Garante que sempre teremos um objeto
    const body = req.body || {};

    // trim() em tudo para evitar espaço sobrando
    const name    = (body.name    || "").trim();
    const phone   = (body.phone   || "").trim();
    const email   = (body.email   || "").trim();
    const area    = (body.area    || "").trim();
    const summary = (body.summary || "").trim();

    // ===== Validações básicas no backend =====

    if (!name || !phone || !area || !summary) {
      return res.status(400).json({
        error: "Nome, telefone, área e resumo são obrigatórios.",
      });
    }

    // telefone precisa ter pelo menos 9 dígitos
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9) {
      return res.status(400).json({ error: "Telefone inválido." });
    }

    // e-mail continua opcional, mas se veio, testa formato mínimo
    if (email && !email.includes("@")) {
      return res.status(400).json({ error: "E-mail inválido." });
    }

    // resumo não pode ser vazio
    if (!summary) {
      return res.status(400).json({ error: "Resumo não pode ser vazio." });
    }

    // ===== Log amigável do lead no console =====
    console.log("[LEAD RECEBIDO]", {
      name,
      phone,
      email: email || null,
      area,
      // preview de até 120 caracteres do resumo
      summaryPreview:
        summary.length > 120 ? summary.slice(0, 120) + "..." : summary,
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const toEmail = process.env.TO_EMAIL;

    if (!process.env.RESEND_API_KEY || !toEmail) {
      console.error(
        "Configuração ausente: RESEND_API_KEY ou TO_EMAIL não definido no ambiente."
      );
      return res.status(500).json({
        error: "Configuração de e-mail ausente no servidor.",
      });
    }

    // Corpo do e-mail
    const textLines = [
      "Novo lead recebido 🚀",
      "",
      `Nome do cliente: ${name}`,
      `Telefone: ${phone}`,
      email ? `E-mail: ${email}` : "E-mail: não informado",
      `Área do problema: ${area}`,
      "",
      "Resumo do caso:",
      summary,
      "",
      "Entre em contato com o cliente o quanto antes.",
    ];

    const text = textLines.join("\n");

    // Enviar e-mail via Resend
    await resend.emails.send({
      from: "Easy Lawyer Bot <onboarding@resend.dev>",
      to: toEmail,
      subject: `Novo lead - Área ${area}`,
      text,
    });

    return res.status(200).json({
      message: "Lead enviado com sucesso! Você receberá no e-mail.",
    });
  } catch (err) {
    console.error("Erro ao enviar e-mail:", err);
    return res.status(500).json({
      error: "Erro interno ao enviar e-mail.",
    });
  }
}
