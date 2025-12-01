// api/leads.js
// BACKEND OFICIAL EASY LAWYER – VERCEL + RESEND

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

    console.log("[LEAD RECEBIDO]", {
      name,
      phone,
      email: email || null,
      area,
      preview: summary.substring(0, 120) + (summary.length > 120 ? "..." : "")
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const toEmail = process.env.TO_EMAIL;

    if (!process.env.RESEND_API_KEY || !toEmail) {
      return res.status(500).json({
        error: "Configuração de e-mail ausente.",
      });
    }

    // 👉 LOGO FINAL (RAW DO GITHUB)
    const logoUrl = "https://raw.githubusercontent.com/Olhaodesigner/jus-flow/4706dd4633e8787e82e2e70e88c4f47c2f12effd/1172e71a-602a-4cd9-8db0-866d63055297.png";

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;background:#0f172a;">
    <tr><td align="center">

      <table width="100%" cellpadding="0" cellspacing="0"
      style="max-width:600px;background:#020617;border-radius:24px;overflow:hidden;box-shadow:0 18px 45px rgba(0,0,0,.6);">

        <tr>
          <td style="background:linear-gradient(135deg,#1d4ed8,#6366f1,#22c55e);padding:28px;">
            <img src="${logoUrl}" style="max-height:42px;display:block;border-radius:8px;">
            <h1 style="color:#fff;margin:18px 0 4px;font-size:22px;">Novo lead recebido 🚀</h1>
            <p style="color:#e2e8f0;margin:0;opacity:.9;">
              A IA já organizou tudo. Confira abaixo as informações essenciais.
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

            <h3 style="margin:20px 0 8px;color:#9ca3af;">Próximos Passos</h3>
            <p style="line-height:1.6;font-size:13px;color:#9ca3af;">
              • Contate o cliente em até <strong>2h úteis</strong>.<br>
              • Valide documentos, prazos e valores.<br>
              • Registre o lead no seu CRM.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:18px;background:#020617;border-top:1px solid #1e293b;color:#6b7280;font-size:12px;">
            Easy Lawyer – Atendimento inteligente automatizado.
          </td>
        </tr>

      </table>

    </td></tr>
  </table>
</body>
</html>
`;

    await resend.emails.send({
      from: "Easy Lawyer Bot <onboarding@resend.dev>",
      to: toEmail,
      subject: `Novo lead - ${area}`,
      html,
      text: `Novo lead: ${name} - ${phone}`
    });

    return res.status(200).json({ message: "Lead enviado com sucesso!" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno ao enviar e-mail." });
  }
}
