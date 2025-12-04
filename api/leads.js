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

  // Validações iguais ao front
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

  const toEmail =
    process.env.TO_EMAIL || "josevitorvilarinhobrito@gmail.com";

  const logoUrl =
    "https://raw.githubusercontent.com/Olhaodesigner/jus-flow/8ea2321517be9f138f002dea1d23a5abc8db8c92/logo%20escritorio.png";

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#020617;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;background:#020617;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="max-width:640px;background:#050816;border-radius:24px;overflow:hidden;border:1px solid #1f2937;">
            <!-- Cabeçalho com logo -->
            <tr>
              <td style="padding:24px 28px 18px 28px;background:#020617;text-align:center;">
                <img src="${logoUrl}" alt="Brito Vilarinho Advocacia"
                     style="max-width:190px;height:auto;display:block;margin:0 auto 10px auto;" />
                <div style="color:#e5e7eb;font-size:20px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">
                  Brito Vilarinho
                </div>
                <div style="color:#9ca3af;font-size:13px;margin-top:2px;">
                  Advocacia
                </div>
              </td>
            </tr>

            <!-- Informações principais -->
            <tr>
              <td style="padding:20px 26px 6px 26px;">
                <div style="color:#e5e7eb;font-size:18px;font-weight:600;margin-bottom:4px;">
                  Novo lead para atendimento jurídico
                </div>
                <div style="color:#9ca3af;font-size:13px;">
                  Esses dados foram enviados pelo formulário do aplicativo.
                </div>
              </td>
            </tr>

            <!-- Bloco de dados -->
            <tr>
              <td style="padding:14px 26px 24px 26px;">
                <table width="100%" cellpadding="0" cellspacing="0"
                       style="background:#020617;border-radius:16px;border:1px solid #1f2937;padding:16px 18px;">
                  <tr>
                    <td style="color:#9ca3af;font-size:12px;padding-bottom:4px;">Nome</td>
                  </tr>
                  <tr>
                    <td style="color:#e5e7eb;font-size:14px;font-weight:500;padding-bottom:10px;">
                      ${name}
                    </td>
                  </tr>

                  <tr>
                    <td style="color:#9ca3af;font-size:12px;padding-bottom:4px;">Telefone (WhatsApp)</td>
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
                    <td style="color:#9ca3af;font-size:12px;padding-bottom:4px;">Área aproximada</td>
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
              <td style="padding:16px 24px 22px 24px;text-align:center;background:#050816;border-top:1px solid #1f2937;">
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

  try {
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

    return res
      .status(200)
      .json({ message: "Caso enviado com sucesso! Em breve um advogado entrará em contato." });
  } catch (error) {
    console.error("Erro ao enviar e-mail via Resend:", error);
    return res
      .status(500)
      .json({ error: "Ocorreu um erro ao enviar o caso. Verifique a chave RESEND_API_KEY." });
  }
};
