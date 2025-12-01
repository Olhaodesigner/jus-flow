const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Só aceitamos POST
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Método não permitido' }));
  }

  // Ler o body (JSON) manualmente
  let body = '';
  try {
    body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => {
        data += chunk.toString();
      });
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
  } catch (err) {
    console.error('Erro ao ler body:', err);
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Não foi possível ler o corpo da requisição.' }));
  }

  let parsed;
  try {
    parsed = JSON.parse(body || '{}');
  } catch (err) {
    console.error('JSON inválido:', err);
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'JSON inválido.' }));
  }

  const { name, contact, area, summary } = parsed || {};

  if (!name || !contact || !area || !summary) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Por favor, preencha todos os campos.' }));
  }

  // Config SMTP via variáveis de ambiente do Vercel
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: `"Easy Lawyer Bot" <${process.env.SMTP_USER}>`,
    to: process.env.TO_EMAIL,
    subject: `Novo potencial caso - Área: ${area}`,
    text: `
Você recebeu um novo potencial cliente:

Nome: ${name}
Contato: ${contact}
Área: ${area}

Resumo da situação:
${summary}

Sugestão: entre em contato diretamente com o cliente pelo contato informado.
    `.trim()
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado:', info.messageId);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      message: 'Caso enviado com sucesso! Em breve um advogado entrará em contato.'
    }));
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      error: 'Erro ao enviar o caso por e-mail. Verifique as credenciais SMTP.'
    }));
  }
};
