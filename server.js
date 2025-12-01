require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares para tratar JSON e formulário
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do transporte de e-mail (SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true', // true para 465, false para 587/25
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Rota da API para receber o formulário
app.post('/api/leads', async (req, res) => {
  const { name, contact, area, summary } = req.body;

  if (!name || !contact || !area || !summary) {
    return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
  }

  const mailOptions = {
    from: `"Easy Lawyer Bot" <${process.env.SMTP_USER}>`,
    to: process.env.TO_EMAIL,
    subject: `Novo potencial caso - Área: ${area}`,
    text: `
Você recebeu um novo potencial cliente pelo app Easy Lawyer:

Nome: ${name}
Contato (telefone ou e-mail): ${contact}
Área de atuação desejada: ${area}

Resumo da situação:
${summary}

Sugestão: entre em contato diretamente com o cliente pelo contato informado.
    `.trim()
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.json({
      message: 'Caso enviado com sucesso! Em breve um advogado entrará em contato.'
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return res.status(500).json({
      error: 'Ocorreu um erro ao enviar o caso. Tente novamente mais tarde.'
    });
  }
});

// Qualquer rota GET devolve o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
