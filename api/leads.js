// api/leads.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const body = req.body || {};
  const name    = (body.name    || "").trim();
  const phone   = (body.phone   || "").trim();
  const email   = (body.email   || "").trim();
  const area    = (body.area    || "").trim();
  const summary = (body.summary || "").trim();

  // validações
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

  // envia sempre para o seu e-mail da conta Resend
  const toEmail = "josevitorvilarinhobrito@gmail.com";

  const logoUrl =
    "https://raw.githubusercontent.com/Olhaodesigner/jus-flow/8ea2321517be9f138f002dea1d23a5abc8db8c92/logo%20escritorio.png";

  // ===== EMAIL COM FUNDO BRANCO =====
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charSet="UTF-8" />
    <title>Novo lead - Brito Vilarinho Advocacia</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="max-width:640px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;">
            
            <!-- Cabeçalho -->
            <tr>
              <td style="padding:24px 28px 18px 28px;background:#ffffff;text-align:center;border-bottom:1px solid #e5e7eb;">
                <img src="${logoUrl}" alt="Brito Vilarinho Advocacia"
                     style="max-width:160px;height:auto;display:block;margin:0 auto 10px auto;" />
                <div style="color:#111827;font-size:20px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
                  BRITO VILARINHO
                </div>
                <div style="color:#6b7280;font-size:13px;margin-top:2px;">
                  Advocacia
                </div>
              </td>
            </tr>

            <!-- Título -->
            <tr>
              <td style="padding:20px 28px 8px 28px;">
                <div style="color:#111827;font-size:18px;font-weight:600;margin-bottom:4px;">
                  Novo lead para atendimento jurídico
                </div>
                <div style="color:#6b7280;font-size:13px;">
                  Esses dados foram enviados pelo formulário do aplicativo.
                </div>
              </td>
            </tr>

            <!-- Bloco de dados -->
            <tr>
              <td style="padding:10px 28px 24px 28px;">
                <table width="100%" cellpadding="0" cellspacing="0"
                       style="background:#f9fafb;border-radius:16px;border:1px solid #e5e7eb;padding:16px 18px;">
                  <tr>
                    <td style="color:#6b7280;font-size:12px;padding-bottom:3px;">Nome</td>
                  </tr>
                  <tr>
                    <td style="color:#111827;font-size:14px;font-weight:600;padding-bottom:10px;">
                      ${name}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#6b7280;font-size:12px;padding-bottom:3px;">Telefone (WhatsApp)</td>
                  </tr>
                  <tr>
                    <td style="color:#111827;font-size:14px;font-weight:500;padding-bottom:10px;">
                      ${phone}
                    </td>
                  </tr>

                  ${
                    email
                      ? `
                  <tr>
                    <td style="color:#6b7280;font-size:12px;padding-bottom:3px;">E-mail</td>
                  </tr>
                  <tr>
                    <td style="color:#111827;font-size:14px;font-weight:500;padding-bottom:10px;">
                      ${email}
                    </td>
                  </tr>
                  `
                      : ""
                  }

                  <tr>
                    <td style="color:#6b7280;font-size:12px;padding-bottom:3px;">Área aproximada</td>
                  </tr>
                  <tr>
                    <td style="color:#111827;font-size:14px;font-weight:500;padding-bottom:10px;">
                      ${area}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#6b7280;font-size:12px;padding-bottom:3px;">Resumo do caso</td>
                  </tr>
                  <tr>
                    <td style="color:#111827;font-size:14px;line-height:1.5;white-space:pre-line;">
                      ${summary}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Rodapé -->
            <tr>
              <td style="padding:14px 24px 18px 24px;text-align:center;border-top:1px solid #e5e7eb;background:#ffffff;">
                <div style="color:#9ca3af;font-size:11px;line-height:1.4;">
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

  try {
    const result = await resend.emails.send({
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

    console.log("Resend OK:", result);

    return res
      .status(200)
      .json({ message: "Caso enviado com sucesso! Em breve um advogado entrará em contato." });
  } catch (error) {
    console.error("Erro ao enviar e-mail via Resend:", error);

    const msg =
      error?.message ||
      error?.response?.body?.error?.message ||
      "Ocorreu um erro ao enviar o caso. Verifique a chave RESEND_API_KEY.";

    return res.status(500).json({ error: msg });
  }
};
