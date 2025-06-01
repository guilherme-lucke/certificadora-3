// backend/src/controllers/activityAdminController.js
const Activity = require("../models/Activity"); // Importar o Model Activity
const mongoose = require("mongoose"); // Importar o mongoose para validação de ObjectId
const Inscription = require("../models/Inscription"); // Importar o Model Inscription

// @desc    Criar nova atividade
// @route   POST /api/v1/admin/activities
// @access  Private (Admin Only)
exports.createActivity = async (req, res) => {
  const {
    nome,
    tipo,
    descricao,
    dataHoraInicio,
    dataHoraFim,
    local,
    linkOnline,
    vagasTotal,
    periodoInscricaoInicio,
    periodoInscricaoFim,
    dataLimiteCancelamento,
    status, // Opcional no request, pois tem default 'Rascunho' no schema
  } = req.body;

  try {
    // Validação básica (campos obrigatórios conforme schema)
    // O Mongoose fará validações mais detalhadas (tipo, enum, etc.)
    if (
      !nome ||
      !tipo ||
      !descricao ||
      !dataHoraInicio ||
      !local ||
      vagasTotal === undefined ||
      !periodoInscricaoInicio ||
      !periodoInscricaoFim
    ) {
      return res.status(400).json({
        success: false,
        error: {
          message:
            "Campos obrigatórios não fornecidos. Verifique nome, tipo, descrição, data de início, local, vagas e períodos de inscrição.",
        },
      });
    }

    // Validação adicional para tamanho da descrição
    if (descricao.length > 200) {
      return res.status(400).json({
        success: false,
        error: {
          message: "A descrição não pode exceder 200 caracteres.",
        },
      });
    }

    const newActivity = new Activity({
      nome,
      tipo,
      descricao,
      dataHoraInicio,
      dataHoraFim, // Pode ser null/undefined se não fornecido
      local,
      linkOnline, // Pode ser null/undefined se não fornecido
      vagasTotal: Number(vagasTotal), // Garantir que é número
      periodoInscricaoInicio,
      periodoInscricaoFim,
      dataLimiteCancelamento, // Pode ser null/undefined
      status: status || "Rascunho", // Usa o status do body ou o default do schema
      criadoPor: req.user.id, // ID do admin logado, fornecido pelo middleware 'protect'
      // inscricoesCount tem default 0 no schema
    });

    const savedActivity = await newActivity.save(); // Dispara validações do Mongoose e pre('validate') hooks

    res.status(201).json({
      success: true,
      data: savedActivity,
      message: "Atividade criada com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao criar atividade:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: {
          message: "Erro de validação ao criar atividade.",
          details: messages,
        },
      });
    }
    // Outros erros específicos podem ser tratados aqui (ex: erro de conversão de data)
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao criar atividade." },
    });
  }
};

// @desc    Listar todas as atividades para o Admin com paginação e busca
// @route   GET /api/v1/admin/activities
// @access  Private (Admin Only)
exports.getAllActivitiesForAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const searchTerm = req.query.search || "";

    const query = {};

    if (searchTerm) {
      query.nome = { $regex: searchTerm, $options: "i" }; // Busca case-insensitive no nome da atividade
    }

    const totalActivities = await Activity.countDocuments(query);
    const totalPages = Math.ceil(totalActivities / limit);

    const activities = await Activity.find(query)
      .populate("criadoPor", "nomeCompleto email") // Popula com nome e email do criador
      .sort({ createdAt: -1 }) // Ordena pelas mais recentes primeiro
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: activities.length, // Número de atividades nesta página
      total: totalActivities, // Número total de atividades que correspondem à busca
      currentPage: page,
      totalPages,
      limit,
      data: activities,
    });
  } catch (error) {
    console.error("Erro ao listar atividades para admin:", error);
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao listar atividades." },
    });
  }
};

// @desc    Obter detalhes de uma atividade específica para Admin
// @route   GET /api/v1/admin/activities/:activityId
// @access  Private (Admin Only)
exports.getActivityByIdForAdmin = async (req, res) => {
  try {
    const activityId = req.params.activityId;

    // 1. Validar se o activityId é um ObjectId válido do MongoDB (opcional, mas bom)
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return res.status(400).json({
        // 400 Bad Request para ID malformado
        success: false,
        error: { message: "ID da atividade inválido." },
      });
    }

    // 2. Buscar a atividade pelo ID
    //    Podemos popular 'criadoPor' se quisermos exibir esses detalhes na tela de edição
    const activity = await Activity.findById(activityId).populate(
      "criadoPor",
      "nomeCompleto email"
    );

    // 3. Verificar se a atividade foi encontrada
    if (!activity) {
      return res.status(404).json({
        // 404 Not Found
        success: false,
        error: { message: "Atividade não encontrada com o ID fornecido." },
      });
    }

    // 4. Enviar Resposta de Sucesso
    res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error("Erro ao obter detalhes da atividade para admin:", error);
    // Se o erro for devido a um ID malformado que passou pela validação inicial (raro com a checagem)
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: { message: "ID da atividade com formato inválido." },
      });
    }
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao obter detalhes da atividade." },
    });
  }
};

// @desc    Atualizar uma atividade existente para Admin
// @route   PUT /api/v1/admin/activities/:activityId
// @access  Private (Admin Only)
exports.updateActivity = async (req, res) => {
  try {
    const activityId = req.params.activityId;

    // 1. Validar se o activityId é um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return res.status(400).json({
        success: false,
        error: { message: "ID da atividade inválido." },
      });
    }

    // 2. Buscar a atividade pelo ID
    let activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: { message: "Atividade não encontrada com o ID fornecido." },
      });
    }

    // (Opcional) Verificar se o admin que está atualizando é o mesmo que criou,
    // ou se tem permissão para atualizar atividades de outros admins.
    // Por enquanto, qualquer admin pode atualizar qualquer atividade.
    // if (activity.criadoPor.toString() !== req.user.id) {
    //    return res.status(403).json({ success: false, error: { message: 'Usuário não autorizado a atualizar esta atividade.' }});
    // }

    // 3. Atualizar os campos da atividade com os dados do corpo da requisição
    //    O Mongoose permite atualizar diretamente com `findByIdAndUpdate`, mas atualizar
    //    o documento encontrado e depois chamar `save()` permite que os hooks
    //    (como `pre('validate')` ou `pre('save')`) sejam executados, o que é bom para consistência.
    //    Também permite uma lógica mais fina sobre quais campos podem ser atualizados.

    const allowedUpdates = [
      "nome",
      "tipo",
      "descricao",
      "dataHoraInicio",
      "dataHoraFim",
      "local",
      "linkOnline",
      "vagasTotal",
      "periodoInscricaoInicio",
      "periodoInscricaoFim",
      "dataLimiteCancelamento",
      "status",
    ];

    const updatesFromBody = Object.keys(req.body);
    const updatesToApply = {};
    let hasInvalidUpdate = false;

    updatesFromBody.forEach((key) => {
      // Validar tamanho da descrição se estiver sendo atualizada
      if (key === "descricao" && req.body[key] && req.body[key].length > 200) {
        hasInvalidUpdate = true;
        return;
      }

      if (allowedUpdates.includes(key)) {
        // Tratar o caso de vagasTotal para garantir que seja número
        if (key === "vagasTotal" && req.body[key] !== undefined) {
          updatesToApply[key] = Number(req.body[key]);
        } else if (req.body[key] !== undefined) {
          updatesToApply[key] = req.body[key];
        }
      } else {
        console.warn(`Campo não permitido na atualização da atividade: ${key}`);
      }
    });

    if (hasInvalidUpdate) {
      return res.status(400).json({
        success: false,
        error: { message: "A descrição não pode exceder 200 caracteres." },
      });
    }

    // Aplicar as atualizações ao documento encontrado
    Object.assign(activity, updatesToApply);

    const updatedActivity = await activity.save(); // Dispara validações e hooks pre-save/validate

    res.status(200).json({
      success: true,
      data: updatedActivity,
      message: "Atividade atualizada com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao atualizar atividade:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: {
          message: "Erro de validação ao atualizar atividade.",
          details: messages,
        },
      });
    }
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: { message: "ID da atividade com formato inválido." },
      });
    }
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao atualizar atividade." },
    });
  }
};

// @desc    Excluir uma atividade para Admin
// @route   DELETE /api/v1/admin/activities/:activityId
// @access  Private (Admin Only)
exports.deleteActivity = async (req, res) => {
  try {
    const activityId = req.params.activityId;

    // 1. Validar se o activityId é um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return res.status(400).json({
        success: false,
        error: { message: "ID da atividade inválido." },
      });
    }

    // 2. Buscar a atividade pelo ID para garantir que existe antes de tentar excluir
    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: { message: "Atividade não encontrada com o ID fornecido." },
      });
    }

    // (Opcional) Verificar se o admin que está excluindo é o mesmo que criou,
    // ou se tem permissão para excluir atividades de outros admins.
    // Por enquanto, qualquer admin pode excluir qualquer atividade.
    // if (activity.criadoPor.toString() !== req.user.id) {
    //    return res.status(403).json({ success: false, error: { message: 'Usuário não autorizado a excluir esta atividade.' }});
    // }

    // 3. Excluir a atividade
    // await activity.remove(); // Método .remove() em instâncias está depreciado em versões mais recentes do Mongoose
    await Activity.findByIdAndDelete(activityId);

    // **Consideração Importante para o Futuro (Pós-MVP):**
    // O que fazer com as inscrições associadas a esta atividade?
    // - Excluí-las também? (pode ser necessário se houver chaves estrangeiras ou para consistência)
    //   await Inscription.deleteMany({ activityId: activityId });
    // - Marcar as inscrições como 'CanceladaPeloAdmin'?
    // - Notificar os usuários inscritos?
    // Para o MVP atual, a simples exclusão da atividade pode ser suficiente, mas
    // esta é uma dependência a ser tratada em Sprints futuras quando o módulo de inscrições for implementado.

    res.status(200).json({
      // Ou 204 No Content se não retornar corpo
      success: true,
      message: "Atividade excluída com sucesso!",
      // data: {} // Pode retornar um objeto vazio ou nada
    });
  } catch (error) {
    console.error("Erro ao excluir atividade:", error);
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: { message: "ID da atividade com formato inválido." },
      });
    }
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao excluir atividade." },
    });
  }
};

// @desc    Listar atividades abertas para o público
// @route   GET /api/v1/public/activities
// @access  Public
exports.getPublicActivities = async (req, res) => {
  try {
    const { tipo } = req.query; // Captura o parâmetro 'tipo' da query string

    // 1. Definir o critério de busca: atividades com status apropriado
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Considerar o início do dia para dataHoraInicio

    const query = {
      status: {
        $in: [
          "Inscrições Abertas",
          "Publicada",
          "Vagas Esgotadas",
          "Inscrições Encerradas",
        ],
      }, // Adicionado "Inscrições Encerradas"
      dataHoraInicio: { $gte: hoje }, // Mostrar apenas atividades que ainda não começaram ou começam hoje
    };

    // Adicionar filtro por tipo se fornecido
    if (tipo) {
      query.tipo = tipo;
    }

    // 2. Selecionar apenas os campos necessários para os cards da home page
    const selectFields =
      "nome tipo descricao dataHoraInicio local vagasTotal inscricoesCount vagasDisponiveis status periodoInscricaoInicio periodoInscricaoFim";
    // Incluindo vagasTotal e inscricoesCount que são necessários para calcular vagasDisponiveis
    // Adicionado periodoInscricaoInicio e periodoInscricaoFim

    // 3. Buscar as atividades
    const activities = await Activity.find(query)
      .select(selectFields)
      .sort({ dataHoraInicio: 1 }); // Ordena pelas mais próximas de acontecer primeiro

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    console.error("Erro ao listar atividades públicas:", error);
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao listar atividades públicas." },
    });
  }
};

// @desc    Admin lista os estudantes inscritos em uma atividade específica
// @route   GET /api/v1/admin/activities/:activityId/inscriptions
// @access  Private (Admin Only)
exports.getActivityInscriptions = async (req, res) => {
  // <<< ADICIONAR ESTA FUNÇÃO
  try {
    const activityId = req.params.activityId;

    // 1. Validar se o activityId é um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return res.status(400).json({
        success: false,
        error: { message: "ID da atividade inválido." },
      });
    }

    // 2. (Opcional, mas bom) Verificar se a atividade existe
    const activityExists = await Activity.findById(activityId);
    if (!activityExists) {
      return res.status(404).json({
        success: false,
        error: { message: "Atividade não encontrada com o ID fornecido." },
      });
    }

    // 3. Buscar as inscrições para a atividade específica
    //    Filtrar por statusInscricao: 'Confirmada'
    //    Popular os dados do estudante referenciado.
    //    Ordenar, por exemplo, pela data de inscrição ou nome do estudante.
    const inscriptions = await Inscription.find({
      activityId: activityId,
      statusInscricao: "Confirmada", // Ou outros status que o admin precise ver
    })
      .populate({
        path: "studentId", // Nome do campo no InscriptionSchema que referencia User
        select: "nomeCompleto email escola serieAno", // Campos do estudante a serem retornados
        // model: 'User' // Opcional se já definido no schema
      })
      .sort({ dataInscricao: 1 }); // Ordenar pela data de inscrição (mais antigas primeiro)

    // 4. Formatar a resposta conforme o contrato da API
    //    O contrato especifica um objeto 'student' dentro de cada inscrição e um 'inscriptionId'.
    const formattedInscriptions = inscriptions.map((insc) => {
      if (!insc.studentId) {
        // Checagem para inscrição órfã de estudante
        return {
          inscriptionId: insc._id,
          student: null,
          dataInscricao: insc.dataInscricao,
          statusInscricao: insc.statusInscricao,
        };
      }
      return {
        inscriptionId: insc._id, // ID da Inscrição
        student: {
          // Conforme contrato da API
          id: insc.studentId._id,
          nomeCompleto: insc.studentId.nomeCompleto,
          email: insc.studentId.email,
          escola: insc.studentId.escola,
          serieAno: insc.studentId.serieAno,
        },
        dataInscricao: insc.dataInscricao,
        statusInscricao: insc.statusInscricao,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedInscriptions.length,
      data: formattedInscriptions,
    });
  } catch (error) {
    console.error("Erro ao listar inscritos na atividade:", error);
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        error: { message: "ID da atividade com formato inválido." },
      });
    }
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao listar inscritos." },
    });
  }
};
