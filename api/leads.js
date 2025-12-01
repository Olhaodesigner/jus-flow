import { Resend } from "resend";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { name, contact, area, summary } = req.body;

    if (!name || !contact || !area || !summary) {
      return res.status(400).json({ error: "Preencha todos os campos." });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // como sua variável se chama TO_EMAIL, usamos TO_EMAIL
    const toEmail = process.env.TO_EMAIL;

    await resend.emails.send({
      from: "Easy Lawyer Bot <onboarding@resend.dev>",
      to: toEmail,
      subject: `Novo lead - Área ${area}`,
      text: `
Novo lead recebido!

Nome do cliente: ${name}
Contato: ${contact}
Área do problema: ${area}

Resumo:
${summary}

Entre em contato com o cliente o quanto antes.
      `.trim(),
    });

    return res
      .status(200)
      .json({ message: "Lead enviado com sucesso! Você receberá no e-mail." });

  } catch (err) {
    console.error("Erro ao enviar e-mail:", err);
    return res.status(500).json({ error: "Erro ao enviar e-mail." });
  }
}
