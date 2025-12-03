// pages/api/leads.js
// BACKEND – BRITO VILARINHO ADVOCACIA – VERCEL + RESEND

import { Resend } from "resend";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const body = req.body || {};

    const name = (body.name || "").trim();
    const phone = (body.phone || "").trim();
    const email = (body.email || "").trim();
    const area = (body.area || "").trim();
    const summary = (body.summary || "").trim();

    // Mesmas validações do front (index.html)
    if (!name || !phone || !area || !summary) {
      return res
        .status(400)
        .json({ error: "Nome, telefone, área e resumo são obrigatórios." });
    }

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9) {
      return res.status(400).json({ error: "Telefone inválido." });
    }

    if (email && !email.includes("@")) {
      return res.status(400).json({ error: "E-mail inválido." });
    }

    if (summary.length > 1000) {
      return res
        .status(400)
        .json({ error: "Resumo muito longo (máx. 1000 caracteres)." });
    }

    console.log("[LEAD RECEBIDO]", {
      name,
      phone,
      email: email || null,
      area,
      preview:
        summary.substring(0, 120) +
        (summary.length > 120 ? "..." : ""),
    });

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        error: "Configuração de e-mail ausente (RESEND_API_KEY).",
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // E-mail fixo de destino (como você pediu)
    const toEmail = "josevitorvilarinhobrito@gmail.com";

    // LOGO do escritório (mesma do index.html)
    const logoUrl =
      "https://raw.githubusercontent.com/Olhaodesigner/jus-flow/8ea2321517be9f138f002dea1d23a5abc8db8c92/logo%20escritorio.png";

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charSet="UTF-8" />
    <title>Novo lead - Brito Vilarinho Advocacia</title>
  </head>
  <body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;background:#0f172a;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="max-width:600px;background:#020617;border-radius:18px;overflow:hidden;border:1px solid #1f2937;">
            <!-- Cabeçalho com logo -->
            <tr>
              <td style="padding:24px 24px 12px 24px;text-align:center;background:#020617;">
                <img src="${logoUrl}" alt="Brito Vilarinho Advocacia"
                     style="max-width:160px;height:auto;display:block;margin:0 auto 8px auto;" />
                <div style="color:#e5e7eb;font-size:20px;font-weight:600;letter-spacing:0.03em;">
                  Brito Vilarinho
                </div>
                <div style="color:#9ca3af;font-size:13px;margin-top:2px;">
                  Advocacia
                </div>
              </td>
            </tr>

            <!-- Título interno -->
            <tr>
              <td style="padding:8px 24px 4px 24px;text-align:left;">
                <div style="color:#e5e7eb;font-size:18px;font-weight:600;margin-bottom:4px;">
                  Novo lead para atendimento jurídico
                </div>
                <div style="color:#9ca3af;font-size:13px;">
                  Dados enviados pelo formulário do aplicativo.
                </div>
              </td>
            </tr>

            <!-- Bloco de informações -->
            <tr>
              <td style="padding:16px 24px 8px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0"
                       style="background:#020617;border-radius:12px;border:1px solid #1f2937;padding:16px;">
                  <tr>
                    <td style="color:#9ca3af;font-size:12px;padding-bottom:4px;">Nome</td>
                  </tr>
                  <tr>
                    <td style="color:#e5e7eb;font-size:14px;font-weight:500;padding-bottom:10px;">
                      ${name}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#9ca3af;font-size:12px;padding-bottom:4px;">Telefone</td>
                  </tr>
                  <tr>
                    <td style="color:#e5e7eb;font-size:14px;font-weight:500;padding-bottom:10px;">
                      ${phone}
                    </td>
                  </tr>

                  ${
                    email
                      ? `
                  <tr>
                    <td style="color:#9ca3af;font-size:12px;padding-bottom:4px;">E-mail</td>
                  </tr>
                  <tr>
                    <td style="color:#e5e7eb;font-size:14px;font-weight:500;padding-bottom:10px;">
                      ${email}
                    </td>
                  </tr>
                  `
                      : ""
                  }

                  <tr>
                    <td style="color:#9ca3af;font-size:12px;padding-bottom:4px;">Área desejada</td>
                  </tr>
                  <tr>
                    <td style="color:#e5e7eb;font-size:14px;font-weight:500;padding-bottom:10px;">
                      ${area}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#9ca3af;font-size:12px;padding-bottom:4px;">Resumo do caso</td>
                  </tr>
                  <tr>
                    <td style="color:#e5e7eb;font-size:14px;line-height:1.5;white-space:pre-line;">
                      ${summary}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Rodapé -->
            <tr>
              <td style="padding:16px 24px 24px 24px;text-align:center;">
                <div style="color:#6b7280;font-size:11px;line-height:1.4;">
                  Brito Vilarinho Advocacia – Atendimento jurídico inteligente.
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;

    await resend.emails.send({
      from: "Brito Vilarinho Advocacia <onboarding@resend.dev>",
      to: toEmail,
      subject: `Novo lead - ${area || "Sem área informada"}`,
      html,
      text:
        `Novo lead:\n` +
        `Nome: ${name}\n` +
        `Telefone: ${phone}\n` +
        `E-mail: ${email || "Não informado"}\n` +
        `Área: ${area}\n\n` +
        `Resumo:\n${summary}`,
    });

    return res.status(200).json({ message: "Lead enviado com sucesso!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno ao enviar e-mail." });
  }
}
