import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { name, contact, area, summary } = req.body;

    if (!name || !contact || !area || !summary) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

    // Inicializa o resend com sua API KEY (sem senha)
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Envia o e-mail
    await resend.emails.send({
      from: "Easy Lawyer Bot <onboarding@resend.dev>",
      to: process.env.TO_EMAIL,
      subject: `Novo lead - Área ${area}`,
      text: `
Nome: ${name}
Contato: ${contact}
Área: ${area}

Resumo:
${summary}
      `.trim()
    });

    return res.status(200).json({ message: 'Lead enviado com sucesso!' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao enviar e-mail.' });
  }
}
