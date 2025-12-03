// api/leads.js
// BACKEND – BRITO VILARINHO ADVOCACIA – VERCEL + RESEND

import { Resend } from "resend";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const body = req.body || {};

    const name    = (body.name    || "").trim();
    const phone   = (body.phone   || "").trim();
    const email   = (body.email   || "").trim();
    const area    = (body.area    || "").trim();
    const summary = (body.summary || "").trim();

    // Mesmas validações do front (index.html)
    if (!name || !phone || !area || !summary) {
      return res.status(400).json({
        error: "Nome, telefone, área e resumo são obrigatórios.",
      });
    }

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9) {
      return res.status(400).json({ error: "Telefone inválido." });
    }

    if (email && !email.includes("@")) {
      return res.status(400).json({ error: "E-mail inválido." });
    }

    if (summary.length > 1000) {
      return res.status(400).json({ error: "Resumo muito longo (máx. 1000 caracteres)." });
    }

    console.log("[LEAD RECEBIDO]", {
      name,
      phone,
      email: email || null,
      area,
      preview: summary.substring(0, 120) + (summary.length > 120 ? "..." : "")
    });

    const resend = new Resend(process.env.RESEND_API_KEY);

    // E-mail fixo de destino (como você pediu)
    const toEmail = "josevitorvilarinhobrito@gmail.com";

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        error: "Configuração de e-mail ausente (RESEND_API_KEY).",
      });
    }

    // LOGO do escritório (mesma do index.html)
    const logoUrl = "https://raw.githubusercontent.com/Olhaodesigner/jus-flow/8ea2321517be9f138f002dea1d23a5abc8db8c92/logo%20escritorio.png";

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;background:#0f172a;">
    <tr><td align="center">

      <table width="100%" cellpadding="0" cellspacing="0"
      style="max-width:600px;background:#020617;border-radius:24px;overflow:hidden;box-shadow:0 18px 45px rgba(0,0,0,.6);">

        <tr>
          <td style="background:linear-gradient(135deg,#1d4ed8,#6366f1,#22c55e);padding:24px 28px 22px;">
            <img src="${logoUrl}" style="max-height:48px;display:block;border-radius:10px;">
            <h1 style="color:#fff;margin:18px 0 4px;font-size:22px;">
              Novo lead para Brito Vilarinho Advocacia
            </h1>
            <p style="color:#e2e8f0;margin:0;opacity:.9;font-size:13px;">
              A IA organizou as informações principais do caso. Veja os dados abaixo.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 28px;color:#e5e7eb;">
            <h3 style="margin:0 0 8px;color:#9ca3af;">Dados do Cliente</h3>
            <p style="line-height:1.7;font-size:14px;">
              <strong>Nome:</strong> ${name}<br>
              <strong>Telefone:</strong> ${phone}<br>
              <strong>E-mail:</strong> ${email || "Não informado"}<br>
              <strong>Área:</strong> ${area}
            </p>

            <h3 style="margin:20px 0 8px;color:#9ca3af;">Resumo do Caso</h3>
            <p style="line-height:1.7;font-size:14px;">
              ${summary.replace(/\n/g, "<br>")}
            </p>

            <h3 style="margin:20px 0 8px;color:#9ca3af;">Próximos passos sugeridos</h3>
            <p style="line-height:1.6;font-size:13px;color:#9ca3af;">
              • Entrar em contato com o cliente.<br>
              • Solicitar documentos e provas principais.<br>
              • Avaliar prazos e riscos jurídicos.<br>
              • Registrar o lead no seu controle interno.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:16px 24px;background:#020617;border-top:1px solid #1e293b;color:#6b7280;font-size:12px;">
            Brito Vilarinho Advocacia – Atendimento jurídico inteligente.
          </td>
        </tr>

      </table>

    </td></tr>
  </table>
</body>
</html>
`;

    await resend.emails.send({
      from: "Brito Vilarinho Advocacia <onboarding@resend.dev>",
      to: toEmail,
      subject: `Novo lead - ${area || "Sem área informada"}`,
      html,
      text: `Novo lead:\nNome: ${name}\nTelefone: ${phone}\nE-mail: ${email || "Não informado"}\nÁrea: ${area}\n\nResumo:\n${summary}`,
    });

    return res.status(200).json({ message: "Lead enviado com sucesso!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno ao enviar e-mail." });
  }
}
