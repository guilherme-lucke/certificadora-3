const User = require("../models/User");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

exports.listStudents = async (req, res) => {
  try {
    // Paginação (opcional para MVP, mas bom para o contrato)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Filtro de busca (opcional para MVP)
    const searchQuery = req.query.search
      ? {
          $or: [
            { nomeCompleto: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const queryConditions = { role: "estudante", ...searchQuery };

    const students = await User.find(queryConditions)
      .select("nomeCompleto email escola serieAno isActive createdAt") // Conforme contrato
      .sort({ createdAt: -1 }) // Mais recentes primeiro
      .skip(skip)
      .limit(limit);

    const totalStudents = await User.countDocuments(queryConditions);

    res.status(200).json({
      success: true,
      data: {
        total: totalStudents,
        page: page,
        limit: limit,
        students: students,
      },
    });
  } catch (error) {
    console.error("Erro ao listar estudantes (SuperAdmin):", error);
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao listar estudantes." },
    });
  }
};

exports.getStudentDetails = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    return res.status(400).json({
      success: false,
      error: {
        message: messages.join(", "),
      },
    });
  }

  try {
    const student = await User.findOne({
      _id: req.params.userId,
      role: "estudante",
    }).select("-passwordHash"); // Excluir hash da senha

    if (!student) {
      return res.status(404).json({
        success: false,
        error: { message: "Estudante não encontrado." },
      });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error("Erro ao obter detalhes do estudante (SuperAdmin):", error);
    if (error.name === "CastError" && error.kind === "ObjectId") {
      // Embora validateUserIdParam já pegue
      return res.status(400).json({
        success: false,
        error: { message: "ID do estudante com formato inválido." },
      });
    }
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao obter detalhes do estudante." },
    });
  }
};

exports.updateStudentDetails = async (req, res) => {
  const valErrors = validationResult(req); // Para o validateUserIdParam e validações do body
  if (!valErrors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: { message: "Erro de validação", details: valErrors.array() },
    });
  }

  try {
    const student = await User.findOne({
      _id: req.params.userId,
      role: "estudante",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: { message: "Estudante não encontrado." },
      });
    }

    // Campos permitidos para atualização pelo SuperAdmin
    const allowedUpdates = [
      "nomeCompleto",
      "telefone",
      "dataNascimento",
      "escola",
      "serieAno",
      "interesses",
      "isActive",
    ];
    const updatesFromBody = req.body;

    allowedUpdates.forEach((key) => {
      if (updatesFromBody[key] !== undefined) {
        student[key] = updatesFromBody[key];
      }
    });

    // Não permitir alteração de e-mail ou role por este endpoint específico
    // Se for necessário alterar e-mail, criar um fluxo dedicado com verificação.
    // Se for necessário alterar role, usar o endpoint opcional /:userId/role.

    const updatedStudent = await student.save();

    // Remover passwordHash da resposta
    const studentResponse = updatedStudent.toObject();
    delete studentResponse.passwordHash;

    res.status(200).json({
      success: true,
      data: studentResponse,
      message: "Dados do estudante atualizados com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao atualizar estudante (SuperAdmin):", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: {
          message: "Erro de validação ao atualizar estudante.",
          details: messages,
        },
      });
    }
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao atualizar estudante." },
    });
  }
};

exports.updateStudentStatus = async (req, res) => {
  const valErrors = validationResult(req);
  if (!valErrors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: { message: "Erro de validação", details: valErrors.array() },
    });
  }

  try {
    const student = await User.findOne({
      _id: req.params.userId,
      role: "estudante",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: { message: "Estudante não encontrado." },
      });
    }

    student.isActive = req.body.isActive; // 'isActive' já validado e convertido para boolean pela rota
    await student.save();

    const studentResponse = student.toObject();
    delete studentResponse.passwordHash;

    res.status(200).json({
      success: true,
      data: studentResponse,
      message: `Status da conta do estudante atualizado para ${
        student.isActive ? "ativo" : "inativo"
      }.`,
    });
  } catch (error) {
    console.error("Erro ao atualizar status do estudante (SuperAdmin):", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: {
          message: "Erro de validação ao atualizar status.",
          details: messages,
        },
      });
    }
    res.status(500).json({
      success: false,
      error: {
        message: "Erro no servidor ao atualizar status do estudante.",
      },
    });
  }
};

exports.deleteStudent = async (req, res) => {
  const valErrors = validationResult(req); // Para validateUserIdParam
  if (!valErrors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: "ID do estudante inválido.",
        details: valErrors.array(),
      },
    });
  }

  try {
    const studentUser = await User.findOne({
      _id: req.params.userId,
      role: "estudante",
    });

    if (!studentUser) {
      return res.status(404).json({
        success: false,
        error: { message: "Estudante não encontrado." },
      });
    }

    // Estratégia de exclusão: Hard delete.
    // Soft delete seria isActive = false, mas já temos um endpoint para isso.
    await User.deleteOne({ _id: req.params.userId, role: "estudante" });

    // Considerações futuras:
    // - O que acontece com as inscrições deste estudante? Devem ser removidas?
    // - Logs de auditoria desta ação.

    res.status(200).json({
      // Ou 204 se não houver corpo na resposta
      success: true,
      message: "Conta de estudante removida com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao remover estudante (SuperAdmin):", error);
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao remover estudante." },
    });
  }
};

exports.createAdmin = async (req, res) => {
  const valErrors = validationResult(req);
  if (!valErrors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: { message: "Erro de validação", details: valErrors.array() },
    });
  }

  const { nomeCompleto, email, password, telefone } = req.body;

  try {
    // Verificar se o e-mail já existe
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

    // O hash da senha será feito pelo pre-save hook no User model
    const newAdmin = new User({
      nomeCompleto,
      email: email.toLowerCase(),
      passwordHash: password, // O hook pre-save cuidará do hash
      telefone,
      role: "admin", // Definir o papel explicitamente
      aceitouPoliticaPrivacidade: true, // Admin implicitamente aceita ao ser criado pelo SuperAdmin
      dataConsentimento: new Date(), // Registrar consentimento
    });

    await newAdmin.save();

    // Remover passwordHash da resposta
    const adminResponse = newAdmin.toObject();
    delete adminResponse.passwordHash;

    res.status(201).json({
      success: true,
      data: adminResponse,
      message: "Novo administrador criado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao criar administrador (SuperAdmin):", error);
    if (error.code === 11000) {
      // Erro de chave duplicada (e-mail)
      return res.status(400).json({
        success: false,
        error: { message: "Este e-mail já está em uso (conflito no banco)." },
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: {
          message: "Erro de validação ao criar administrador.",
          details: messages,
        },
      });
    }
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao criar administrador." },
    });
  }
};

exports.getAdminDetails = async (req, res) => {
  const valErrors = validationResult(req);
  if (!valErrors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: "ID do administrador inválido.",
        details: valErrors.array(),
      },
    });
  }

  try {
    const admin = await User.findOne({
      _id: req.params.userId,
      role: "admin",
    }).select("-passwordHash"); // Excluir hash da senha

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: { message: "Administrador não encontrado." },
      });
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error(
      "Erro ao obter detalhes do administrador (SuperAdmin):",
      error
    );
    res.status(500).json({
      success: false,
      error: {
        message: "Erro no servidor ao obter detalhes do administrador.",
      },
    });
  }
};

exports.listAdmins = async (req, res) => {
  try {
    // Paginação e busca similar ao listStudents, mas filtrando por role: 'admin'
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const searchQuery = req.query.search
      ? {
          $or: [
            { nomeCompleto: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const queryConditions = { role: "admin", ...searchQuery };

    const admins = await User.find(queryConditions)
      .select("nomeCompleto email telefone isActive createdAt") // Campos relevantes para admin
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalAdmins = await User.countDocuments(queryConditions);

    res.status(200).json({
      success: true,
      data: {
        total: totalAdmins,
        page: page,
        limit: limit,
        admins: admins,
      },
    });
  } catch (error) {
    console.error("Erro ao listar administradores (SuperAdmin):", error);
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao listar administradores." },
    });
  }
};

exports.updateAdminDetails = async (req, res) => {
  const valErrors = validationResult(req);
  if (!valErrors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: { message: "Erro de validação", details: valErrors.array() },
    });
  }

  try {
    const adminUser = await User.findOne({
      _id: req.params.userId,
      role: "admin",
    });

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        error: { message: "Administrador não encontrado." },
      });
    }

    // Campos permitidos para atualização pelo SuperAdmin
    const allowedUpdates = ["nomeCompleto", "telefone", "isActive"];
    const updatesFromBody = req.body;

    allowedUpdates.forEach((key) => {
      if (updatesFromBody[key] !== undefined) {
        adminUser[key] = updatesFromBody[key];
      }
    });

    // Não permitir alteração de e-mail ou role por este endpoint.
    // SuperAdmin não pode alterar a senha de outro admin diretamente aqui (precisaria de fluxo de reset).

    const updatedAdmin = await adminUser.save();

    const adminResponse = updatedAdmin.toObject();
    delete adminResponse.passwordHash;

    res.status(200).json({
      success: true,
      data: adminResponse,
      message: "Dados do administrador atualizados com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao atualizar administrador (SuperAdmin):", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: {
          message: "Erro de validação ao atualizar administrador.",
          details: messages,
        },
      });
    }
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao atualizar administrador." },
    });
  }
};

exports.deleteAdmin = async (req, res) => {
  const valErrors = validationResult(req); // Para validateUserIdParam
  if (!valErrors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: "ID do administrador inválido.",
        details: valErrors.array(),
      },
    });
  }

  try {
    const adminUser = await User.findOne({
      _id: req.params.userId,
      role: "admin",
    });

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        error: { message: "Administrador não encontrado." },
      });
    }

    // Impedir que o SuperAdmin se auto-exclua por este endpoint
    if (adminUser._id.equals(req.user.id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Superadministrador não pode se auto-excluir por esta rota.",
        },
      });
    }

    // Estratégia de exclusão: Hard delete por enquanto. Soft delete seria isActive = false
    await User.deleteOne({ _id: req.params.userId, role: "admin" }); // Garante que só deleta admin

    // Considerações futuras:
    // - O que acontece com as atividades criadas por este admin? Reatribuir? Marcar como órfão?
    // - Logs de auditoria desta ação.

    res.status(200).json({
      success: true,
      message: "Conta de administrador removida com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao remover administrador (SuperAdmin):", error);
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao remover administrador." },
    });
  }
};
