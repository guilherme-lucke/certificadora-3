// backend/src/controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Inscription = require("../models/Inscription"); // <<< ADICIONAR IMPORT
const mongoose = require("mongoose");

// @desc    Obter perfil do usuário logado
// @route   GET /api/v1/users/me
// @access  Private
exports.getCurrentUserProfile = async (req, res) => {
  // O objeto req.user é anexado pelo middleware 'protect'
  try {
    // O req.user já contém os dados do usuário (sem a senha)
    // Se precisássemos buscar novamente (ex: para dados mais atualizados), faríamos:
    // const user = await User.findById(req.user.id).select('-passwordHash');
    // if (!user) {
    //     return res.status(404).json({ success: false, error: { message: 'Usuário não encontrado.' }});
    // }
    // Mas como o middleware 'protect' já busca e anexa, podemos usar req.user diretamente.

    if (!req.user) {
      // Checagem de segurança adicional, embora protect deva garantir
      return res.status(404).json({
        success: false,
        error: { message: "Usuário não encontrado ou token inválido." },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: req.user._id,
        nomeCompleto: req.user.nomeCompleto,
        email: req.user.email,
        telefone: req.user.telefone,
        dataNascimento: req.user.dataNascimento,
        escola: req.user.escola,
        serieAno: req.user.serieAno,
        interesses: req.user.interesses,
        role: req.user.role,
        // Não inclua passwordHash ou outros campos sensíveis que não sejam para o perfil
      },
    });
  } catch (error) {
    console.error("Erro ao obter perfil do usuário:", error);
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao obter perfil." },
    });
  }
};

// @desc    Atualizar perfil do usuário logado
// @route   PUT /api/v1/users/me
// @access  Private
exports.updateCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // req.user.id vem do middleware 'protect'

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "Usuário não encontrado." },
      });
    }

    // Campos que o usuário pode atualizar (evitar que atualizem 'role' ou 'email' diretamente aqui)
    const allowedUpdates = [
      "nomeCompleto",
      "telefone",
      "dataNascimento",
      "escola",
      "serieAno",
      "interesses",
    ];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      // Pega o primeiro campo inválido para a mensagem de erro
      const invalidField = updates.find(
        (update) => !allowedUpdates.includes(update)
      );
      return res.status(400).json({
        success: false,
        error: {
          message: `Atualização inválida! O campo '${invalidField}' não pode ser modificado ou não é permitido.`,
        },
      });
    }

    // Atualizar os campos permitidos
    updates.forEach((update) => {
      user[update] = req.body[update];
    });

    // (Opcional) Se o e-mail pudesse ser atualizado, seria necessário um processo de verificação de novo e-mail.
    // Não vamos permitir alteração de e-mail neste endpoint para simplificar.

    await user.save(); // Mongoose vai rodar validações do schema aqui

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        nomeCompleto: user.nomeCompleto,
        email: user.email, // Email não foi alterado
        telefone: user.telefone,
        dataNascimento: user.dataNascimento,
        escola: user.escola,
        serieAno: user.serieAno,
        interesses: user.interesses,
        role: user.role, // Role não foi alterado
      },
      message: "Perfil atualizado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: {
          message: "Erro de validação ao atualizar perfil.",
          details: messages,
        },
      });
    }
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao atualizar perfil." },
    });
  }
};

// @desc    Alterar senha do usuário logado
// @route   PUT /api/v1/users/me/password
// @access  Private
exports.changeCurrentUserPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // 1. Validar se currentPassword e newPassword foram fornecidos
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { message: "Por favor, forneça a senha atual e a nova senha." },
      });
    }

    // 2. Validar o comprimento da nova senha (exemplo)
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: { message: "A nova senha deve ter pelo menos 6 caracteres." },
      });
    }

    // 3. Buscar o usuário no banco de dados (o ID vem do req.user do middleware 'protect')
    // Precisamos selecionar o passwordHash para compará-lo
    const user = await User.findById(req.user.id).select("+passwordHash");

    if (!user) {
      // Esta situação não deveria ocorrer se o token for válido e o usuário existir,
      // mas é uma checagem de segurança.
      return res.status(404).json({
        success: false,
        error: { message: "Usuário não encontrado." },
      });
    }

    // 4. Comparar a currentPassword fornecida com a senha armazenada (hash)
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        // 401 Unauthorized ou 400 Bad Request podem ser apropriados
        success: false,
        error: { message: "A senha atual fornecida está incorreta." },
      });
    }

    // 5. Se a senha atual corresponder, definir a nova senha
    // O hook pre-save no Model User fará o hash da nova senha
    user.passwordHash = newPassword;
    await user.save(); // Isso irá disparar o hook pre-save para hashear a newPassword

    res.status(200).json({
      success: true,
      message: "Senha alterada com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    // Se houver validações de schema na nova senha (ex: minlength já tratada acima)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: {
          message: "Erro de validação ao alterar senha.",
          details: messages,
        },
      });
    }
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao alterar senha." },
    });
  }
};

// @desc    Estudante solicita a exclusão/anonimização de sua conta
// @route   DELETE /api/v1/users/me/account
// @access  Private (Estudante Only)
exports.deleteMyAccount = async (req, res) => {
  const userId = req.user.id; // ID do usuário logado
  const userRole = req.user.role; // Role do usuário (estudante, admin, superadmin)

  // Opcional: Iniciar uma sessão para garantir atomicidade se múltiplas coleções são alteradas.
  // Requer replica set no MongoDB para funcionar corretamente em produção.
  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    // 1. Buscar o usuário para garantir que existe e para ter o objeto a ser modificado
    const user = await User.findById(userId); //.session(session);

    if (!user) {
      // await session.abortTransaction(); session.endSession();
      // Esta situação é improvável se o token JWT for válido e o usuário não foi deletado por outro meio.
      return res.status(404).json({
        success: false,
        error: { message: "Usuário não encontrado." },
      });
    }

    // 2. Verificar se a conta já não está desativada/anonimizada
    if (!user.isActive || user.email.startsWith("deleted-")) {
      // await session.abortTransaction(); session.endSession();
      return res.status(400).json({
        success: false,
        error: { message: "Esta conta já foi desativada/anonimizada." },
      });
    }    // Verificar se é superadmin tentando se excluir
    if (userRole === "superadmin") {
      return res.status(403).json({
        success: false,
        error: { 
          message: "Superadministradores não podem excluir suas próprias contas por questões de segurança. Entre em contato com o suporte técnico." 
        }
      });
    }

    // 3. Anonimizar Dados Pessoais Identificáveis (PII) no documento User
    const updateData = {
      $set: {
        nomeCompleto: `Usuário Anônimo ${user._id.toString().slice(-6)}`,
        email: `deleted-${Date.now()}-${user._id.toString().slice(-4)}@anon.meninas.digitais`,
        isActive: false,
        aceitouPoliticaPrivacidade: false
      },
      $unset: {
        telefone: "",
        passwordHash: "",
        passwordResetToken: "",
        passwordResetExpires: ""
      }
    };

    // Adicionar campos específicos de estudante se for um estudante
    if (userRole === "estudante") {
      updateData.$set.interesses = [];
      updateData.$unset.dataNascimento = "";
      updateData.$unset.escola = "";
      updateData.$unset.serieAno = "";
      updateData.$unset.dataConsentimento = "";
    }

    await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
        runValidators: false
      }
    );    // 4. Lidar com registros relacionados ao usuário
    if (userRole === "estudante") {
      // Atualizar inscrições do estudante
      await Inscription.updateMany(
        { studentId: userId },
        {
          $set: {
            statusInscricao: "ContaEstudanteExcluida",
          },
        }
      );
    } else if (userRole === "admin") {
      // Se necessário, lidar com atividades criadas pelo admin
      // Por exemplo, você pode querer marcar as atividades como "Criador Removido" ou reassociá-las a outro admin
      // await Activity.updateMany(
      //   { criadoPor: userId },
      //   { $set: { status: "CriadorRemovido" } }
      // );
    }
    // NOTA: Se você desassociar studentId, precisará ajustar o índice unique em Inscription
    // para permitir studentId null, ou remover o índice se a unicidade não for mais garantida.
    // Mudar o status é mais seguro para manter a integridade dos dados de inscrição.

    // (Opcional) Lidar com outras coleções que possam referenciar o User (ex: posts, comentários - não aplicável aqui)

    // await session.commitTransaction();
    // session.endSession();

    res.status(200).json({
      success: true,
      message:
        "Sua conta e dados associados foram marcados para exclusão/anonimização. Você será desconectado.",
      // O frontend deve lidar com o logout do usuário após esta chamada.
    });
  } catch (error) {
    // await session.abortTransaction();
    // session.endSession();
    console.error("Erro ao excluir/anonimizar conta:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Erro no servidor ao processar a exclusão da sua conta.",
      },
    });
  }
};
