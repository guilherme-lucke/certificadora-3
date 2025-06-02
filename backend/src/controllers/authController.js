const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); // Para gerar tokens de reset
const { validationResult } = require("express-validator"); // Para checar erros de validação
const sendEmail = require("../utils/emailService"); // Importar o serviço de e-mail

// Função para gerar token JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d", // Default para 1 dia se não definido
  });
};

// Controller para Signup
exports.signupUser = async (req, res) => {
  const {
    nomeCompleto,
    email,
    password, // Receberemos a senha em texto plano aqui
    telefone,
    dataNascimento,
    escola,
    serieAno,
    interesses,
    aceitouPoliticaPrivacidade,
  } = req.body;

  try {
    // 1. Verificar se todos os campos obrigatórios foram enviados (validação básica)
    if (!nomeCompleto || !email || !password || aceitouPoliticaPrivacidade === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          message:
            "Por favor, forneça nome completo, e-mail, senha e aceite a política de privacidade.",
        },
      });
    }

    if (aceitouPoliticaPrivacidade !== true) {
      return res.status(400).json({
        success: false,
        error: {
          message: "É necessário aceitar a política de privacidade para se cadastrar.",
        },
      });
    }

    // 2. Verificar se o e-mail já existe (Mongoose schema `unique:true` também fará isso, mas uma verificação antecipada é boa)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Este e-mail já está em uso.",
          details: { email: "Este e-mail já está em uso." },
        },
      });
    }

    // 3. Criar nova instância de Usuário
    // O password será "password" aqui. O hook pre-save no User model fará o hash.
    const newUser = new User({
      nomeCompleto,
      email: email.toLowerCase(),
      passwordHash: password, // Passamos a senha em texto plano para o campo passwordHash
      // O hook pre-save no model User.js irá interceptar e fazer o hash
      telefone,
      dataNascimento,
      escola,
      serieAno,
      interesses,
      aceitouPoliticaPrivacidade,
      dataConsentimento: aceitouPoliticaPrivacidade ? new Date() : null, // Grava data do consentimento
      // role já tem default 'estudante' no schema
    });

    // 4. Salvar o usuário no banco de dados (o hook pre-save fará o hash da senha)
    await newUser.save();

    // 5. Gerar token JWT
    const token = generateToken(newUser._id, newUser.role);

    // 6. Enviar Resposta de Sucesso
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser._id,
          nomeCompleto: newUser.nomeCompleto,
          email: newUser.email,
          role: newUser.role,
        },
        token: token,
      },
      message: "Usuário cadastrado com sucesso!",
    });
  } catch (error) {
    console.error("Erro no signupUser:", error);
    // Tratar erros de validação do Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: { message: "Erro de validação.", details: messages },
      });
    }
    // Tratar erro de chave duplicada do MongoDB (para e-mail, caso a verificação antecipada falhe por concorrência)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Este e-mail já está em uso (conflito no banco).",
          details: { email: "Este e-mail já está em uso." },
        },
      });
    }
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao tentar cadastrar." },
    });
  }
};

// Controller para Login
exports.loginUser = async (req, res) => {
  // <<< ADICIONAR ESTA FUNÇÃO
  const { email, password } = req.body;

  try {
    // 1. Validar se email e senha foram fornecidos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: "Por favor, forneça e-mail e senha." },
      });
    }

    // 2. Encontrar o usuário pelo e-mail
    // Precisamos selecionar explicitamente o passwordHash, pois definimos select: false no schema
    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        // 401 para não revelar se o e-mail existe ou não
        success: false,
        error: { message: "Credenciais inválidas." },
      });
    }

    // 3. Comparar a senha fornecida com a senha armazenada (hash)
    // O método user.matchPassword() foi definido no User model e usa bcrypt.compare
    // Ou podemos fazer diretamente aqui:
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { message: "Credenciais inválidas." },
      });
    }

    // 4. Verificar se a conta está ativa (se o campo isActive existe e é usado)
    if (!user.isActive) {
      return res.status(403).json({
        // 403 Forbidden
        success: false,
        error: { message: "Esta conta está desativada." },
      });
    }

    // 5. Gerar token JWT
    const token = generateToken(user._id, user.role);

    // 6. Enviar Resposta de Sucesso
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          nomeCompleto: user.nomeCompleto,
          email: user.email,
          role: user.role,
        },
        token: token,
      },
      message: "Login bem-sucedido!",
    });
  } catch (error) {
    console.error("Erro no loginUser:", error);
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao tentar fazer login." },
    });
  }
};

// @desc    Solicitar redefinição de senha
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: { message: "Erro de validação", details: errors.array() },
    });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Gerar token (não hasheado ainda)
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Hashear token e salvar no usuário
      user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      // Definir tempo de expiração (1 hora)
      user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hora em milissegundos

      await user.save();

      // Construir a URL de redefinição de senha
      // A URL do frontend para redefinir a senha deve ser algo como:
      // process.env.FRONTEND_URL/reset-password/:token
      // Por enquanto, vamos assumir que FRONTEND_URL está nas variáveis de ambiente
      // ou usar um placeholder.
      const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173"; // Ajuste conforme necessário
      const resetUrl = `${frontendBaseUrl}/reset-password/${resetToken}`;

      const textMessage = `
Redefinição de Senha

Você solicitou a redefinição de sua senha.
Clique no link abaixo para criar uma nova senha:
${resetUrl}

Este link é válido por 1 hora.
Se você não solicitou esta redefinição, por favor ignore este email.
      `;

      const htmlMessage = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
          <h1 style="font-size: 24px; color: #333;">Redefinição de Senha</h1>
          <p style="font-size: 16px; color: #555;">Você solicitou a redefinição de sua senha.</p>
          <p style="font-size: 16px; color: #555;">Clique no link abaixo para criar uma nova senha:</p>
          <p style="text-align: center; margin: 20px 0;">
            <a href="${resetUrl}" target="_blank" style="background-color: #6a0dad; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">Redefinir Senha</a>
          </p>
          <p style="font-size: 14px; color: #777;">Este link é válido por 1 hora.</p>
          <p style="font-size: 14px; color: #777;">Se você não solicitou esta redefinição, por favor ignore este email.</p>
        </div>
      `;

      try {
        await sendEmail({
          email: user.email,
          subject: "Solicitação de Redefinição de Senha - Certificadora Eventos",
          message: textMessage, // Usar a nova mensagem de texto
          htmlMessage,
        });
      } catch (emailError) {
        // Mesmo que o e-mail falhe, não devemos revelar isso ao usuário diretamente
        // para não informar se o e-mail existe ou não.
        // Logar o erro no servidor é importante.
        console.error("Falha ao enviar e-mail de redefinição:", emailError);
        // Poderíamos ter uma lógica para tentar reenviar ou notificar admins.
        // Por agora, a resposta ao usuário será a mesma.
      }
    }

    // Resposta genérica para não revelar se o e-mail existe ou não
    // e para cobrir o caso de falha no envio do e-mail sem expor o erro.
    res.status(200).json({
      success: true,
      message:
        "Se um usuário com este e-mail estiver registrado, um link para redefinição de senha será enviado.",
    });
  } catch (error) {
    console.error("Erro no forgotPassword:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Erro no servidor ao tentar processar a solicitação de redefinição de senha.",
      },
    });
  }
};

// @desc    Redefinir senha com token
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  // <<< ADICIONAR ESTA FUNÇÃO
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: { message: "Erro de validação", details: errors.array() },
    });
  }

  // 1. Obter o token hasheado para procurar no DB
  const resetTokenFromUrl = req.params.token;
  const hashedToken = crypto.createHash("sha256").update(resetTokenFromUrl).digest("hex");

  try {
    // 2. Encontrar usuário pelo token hasheado E verificar se não expirou
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // Maior que a data/hora atual
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Token de redefinição de senha inválido ou expirado.",
        },
      });
    }

    // 3. Se o token é válido, definir a nova senha
    // O hook pre-save no Model User fará o hash da nova senha
    user.passwordHash = req.body.newPassword;
    user.passwordResetToken = undefined; // Limpar o token de reset
    user.passwordResetExpires = undefined; // Limpar a expiração

    await user.save(); // Dispara o hook pre-save para hashear a nova senha

    // (Opcional) Logar o usuário automaticamente após o reset ou enviar um e-mail de confirmação.
    // Para este MVP, apenas confirmamos a redefinição.

    res.status(200).json({
      success: true,
      message: "Senha redefinida com sucesso!",
    });
  } catch (error) {
    console.error("Erro no resetPassword:", error);
    if (error.name === "ValidationError") {
      // Embora a validação da senha já esteja na rota
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: {
          message: "Erro de validação ao definir nova senha.",
          details: messages,
        },
      });
    }
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao redefinir senha." },
    });
  }
};
