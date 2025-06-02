const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Criar um transporter
  // Para um serviço real, use as credenciais do seu provedor de e-mail (e.g., SendGrid, Mailgun, Gmail com "less secure app access")
  // Essas credenciais devem vir de variáveis de ambiente
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.mailtrap.io", // Mailtrap para desenvolvimento/teste
    port: parseInt(process.env.EMAIL_PORT, 10) || 2525,
    auth: {
      user: process.env.EMAIL_USER, // Usuário do serviço de e-mail
      pass: process.env.EMAIL_PASS, // Senha do serviço de e-mail
    },
    // secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para outros portos
  });

  // 2. Definir as opções do e-mail
  const mailOptions = {
    from:
      process.env.EMAIL_FROM ||
      '"Certificadora Eventos" <noreply@certificadoraeventos.com>', // Endereço do remetente
    to: options.email, // Endereço do destinatário
    subject: options.subject, // Assunto do e-mail
    text: options.message, // Corpo do e-mail em texto plano
    html: options.htmlMessage, // Corpo do e-mail em HTML (opcional, pode ser o mesmo que 'message' ou mais elaborado)
  };

  // 3. Enviar o e-mail
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("E-mail enviado: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    throw new Error("Falha ao enviar e-mail de redefinição de senha.");
    // Em um ambiente de produção, você pode querer logar o erro de forma mais robusta
    // e talvez notificar os administradores.
  }
};

module.exports = sendEmail;
