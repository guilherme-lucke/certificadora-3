const Inscription = require("../models/Inscription"); // Importar o Model Inscription
const Activity = require("../models/Activity"); // Importar o Model Activity
const mongoose = require("mongoose");

// @desc    Estudante se inscreve em uma atividade
// @route   POST /api/v1/inscriptions
// @access  Private (Estudante Only)
exports.createInscription = async (req, res) => {
  // Se usar express-validator, descomente:
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //     return res.status(400).json({ success: false, error: { message: "Erro de validação", details: errors.array() } });
  // }

  const { activityId } = req.body;
  const studentId = req.user.id; // ID do estudante logado, fornecido pelo middleware 'protect'

  // 1. Validar se activityId foi fornecido e é um ObjectId válido
  if (!activityId) {
    return res.status(400).json({
      success: false,
      error: { message: "ID da atividade é obrigatório." },
    });
  }
  if (!mongoose.Types.ObjectId.isValid(activityId)) {
    return res.status(400).json({
      success: false,
      error: { message: "ID da atividade inválido." },
    });
  }

  // Iniciar uma sessão para transação, se possível (requer replica set no MongoDB)
  // Para MVP, podemos omitir a transação explícita, mas é bom ter em mente.
  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    // 2. Buscar a atividade
    const activity = await Activity.findById(activityId); //.session(session) se usar transação

    if (!activity) {
      // await session.abortTransaction(); session.endSession();
      return res.status(404).json({
        success: false,
        error: { message: "Atividade não encontrada." },
      });
    }

    // 3. Verificar se a atividade está aberta para inscrições
    const currentDate = new Date();
    if (
      activity.status !== "Inscrições Abertas" ||
      currentDate < activity.periodoInscricaoInicio ||
      currentDate > activity.periodoInscricaoFim
    ) {
      // await session.abortTransaction(); session.endSession();
      return res.status(400).json({
        success: false,
        error: {
          message: "Esta atividade não está aberta para inscrições no momento.",
        },
      });
    }

    // 4. Verificar se há vagas disponíveis (US04.2)
    if (activity.inscricoesCount >= activity.vagasTotal) {
      // await session.abortTransaction(); session.endSession();
      return res.status(400).json({
        success: false,
        error: { message: "Vagas esgotadas para esta atividade." },
      });
    }

    // 5. Criar a inscrição (US04.1)
    // A verificação de dupla inscrição (US04.3) será feita pelo índice único no MongoDB
    const newInscription = new Inscription({
      activityId: activity._id,
      studentId: studentId,
      // statusInscricao tem default 'Confirmada'
    });

    // Tentar salvar a inscrição
    const savedInscription = await newInscription.save(/*{ session }*/); // Passar session se usar transação    // Depois de salvar a inscrição, o hook post('save') do modelo Inscription
    // atualizará automaticamente o inscricoesCount da atividade

    // Verificar se as vagas se esgotaram e atualizar o status da atividade
    const updatedActivity = await Activity.findById(activityId);
    if (updatedActivity.inscricoesCount >= updatedActivity.vagasTotal) {
      updatedActivity.status = "Vagas Esgotadas";
      await updatedActivity.save();
    }

    // Se chegou aqui, tudo deu certo. Commitar a transação.
    // await session.commitTransaction();
    // session.endSession();

    res.status(201).json({
      success: true,
      data: {
        // Conforme contrato da API
        id: savedInscription._id,
        activityId: savedInscription.activityId,
        studentId: savedInscription.studentId,
        dataInscricao: savedInscription.dataInscricao,
        statusInscricao: savedInscription.statusInscricao,
      },
      message: "Inscrição realizada com sucesso!", // US04.4
    });
  } catch (error) {
    // Se estiver usando transação, abortar em caso de erro
    // await session.abortTransaction();
    // session.endSession();

    console.error("Erro ao criar inscrição:", error);
    // Tratar erro de chave duplicada (dupla inscrição - US04.3)
    if (
      error.code === 11000 &&
      error.keyPattern &&
      error.keyPattern.activityId &&
      error.keyPattern.studentId
    ) {
      return res.status(400).json({
        success: false,
        error: { message: "Você já está inscrito nesta atividade." },
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: {
          message: "Erro de validação ao criar inscrição.",
          details: messages,
        },
      });
    }
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao realizar inscrição." },
    });
  }
};

// @desc    Estudante lista suas inscrições atuais
// @route   GET /api/v1/inscriptions/my
// @access  Private (Estudante Only)
exports.getMyInscriptions = async (req, res) => {
  try {
    const studentId = req.user.id;
    const currentDate = new Date();

    // 1. Buscar as inscrições do estudante
    const inscriptions = await Inscription.find({
      studentId: studentId,
      statusInscricao: "Confirmada",
    })
      .populate({
        path: "activityId",
        select: "nome dataHoraInicio local tipo dataLimiteCancelamento status",
      })
      .sort({ "activityId.dataHoraInicio": 1 });

    // Filtrar apenas atividades futuras e que não estão concluídas/canceladas
    const activeInscriptions = inscriptions.filter((insc) => {
      if (!insc.activityId) return false;
      const activityDate = new Date(insc.activityId.dataHoraInicio);
      const activityHasPassed = activityDate < currentDate;
      const activityIsFinished = ["Realizada", "Cancelada"].includes(
        insc.activityId.status
      );
      return !activityHasPassed && !activityIsFinished;
    });

    // 2. Formatar a resposta conforme o contrato da API
    //    O contrato especifica um objeto 'activity' dentro de cada inscrição.
    //    O populate já faz algo similar, mas podemos refinar se necessário.
    const formattedInscriptions = activeInscriptions.map((insc) => {
      // Se activityId for null (inscrição órfã, o que não deveria acontecer com dados consistentes),
      // o populate não trará nada. É bom tratar isso.
      if (!insc.activityId) {
        return {
          // Ou filtrar este resultado
          id: insc._id,
          activity: null, // Indicar que a atividade não foi encontrada
          dataInscricao: insc.dataInscricao,
          statusInscricao: insc.statusInscricao,
        };
      }
      return {
        id: insc._id, // ID da Inscrição
        activity: {
          // Conforme contrato da API          id: insc.activityId._id,
          nome: insc.activityId.nome,
          dataHoraInicio: insc.activityId.dataHoraInicio,
          local: insc.activityId.local,
          dataLimiteCancelamento: insc.activityId.dataLimiteCancelamento,
          status: insc.activityId.status,
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
    console.error("Erro ao listar minhas inscrições:", error);
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao listar suas inscrições." },
    });
  }
};

// @desc    Estudante cancela sua inscrição em uma atividade
// @route   DELETE /api/v1/inscriptions/my/:inscriptionId
// @access  Private (Estudante Only)
exports.cancelMyInscription = async (req, res) => {
  // <<< ADICIONAR ESTA FUNÇÃO
  try {
    const inscriptionId = req.params.inscriptionId;
    const studentId = req.user.id; // ID do estudante logado

    // 1. Buscar a inscrição, garantindo que pertence ao estudante logado e populando a atividade
    const inscription = await Inscription.findOne({
      _id: inscriptionId,
      studentId: studentId,
    }).populate("activityId", "dataLimiteCancelamento status"); // Precisamos da data limite e status da atividade

    if (!inscription) {
      return res.status(404).json({
        success: false,
        error: { message: "Inscrição não encontrada ou não pertence a você." },
      });
    }

    // 2. Verificar se a inscrição já está cancelada
    if (inscription.statusInscricao.startsWith("Cancelada")) {
      return res.status(400).json({
        success: false,
        error: { message: "Esta inscrição já foi cancelada." },
      });
    }

    // 3. Verificar se a atividade associada ainda existe (integridade)
    if (!inscription.activityId) {
      // Este caso indica uma inscrição órfã, o que é um problema de dados.
      // Poderia-se apenas marcar como cancelada, mas é bom logar ou tratar.
      console.warn(
        `Tentativa de cancelar inscrição ${inscriptionId} para atividade não encontrada.`
      );
      inscription.statusInscricao = "CanceladaPeloEstudante"; // Ou um status de erro
      await inscription.save();
      return res.status(400).json({
        success: false,
        error: {
          message:
            "A atividade associada a esta inscrição não foi encontrada. Inscrição marcada como cancelada.",
        },
      });
    }

    // 4. Verificar o prazo para cancelamento (dataLimiteCancelamento da atividade)
    const currentDate = new Date();
    if (
      inscription.activityId.dataLimiteCancelamento &&
      currentDate > inscription.activityId.dataLimiteCancelamento
    ) {
      return res.status(400).json({
        success: false,
        error: { message: "O prazo para cancelar esta inscrição expirou." },
      });
    }

    // 5. Remover a inscrição
    // O hook post('findOneAndDelete') no modelo Inscription cuidará de atualizar
    // o inscricoesCount da atividade e, se necessário, o status da atividade.
    // Usar findByIdAndDelete pois inscription.remove() foi depreciado/removido.
    const deletedInscription = await Inscription.findByIdAndDelete(
      inscriptionId
    );

    if (!deletedInscription) {
      // Embora a busca inicial já devesse ter pego isso, é uma segurança adicional.
      return res.status(404).json({
        success: false,
        error: { message: "Inscrição não encontrada para exclusão." },
      });
    }

    // A lógica para verificar se a atividade deve voltar para 'Inscrições Abertas'
    // foi movida para o hook post('remove') do modelo Inscription para centralização,
    // mas precisaremos garantir que o status da atividade seja verificado e atualizado lá.
    // Por enquanto, vamos assumir que o hook está fazendo sua parte.
    // Se precisarmos de uma atualização de status mais imediata ou específica aqui,
    // poderíamos buscar a atividade novamente após a remoção da inscrição.

    // No entanto, para manter a lógica de reabertura de vagas aqui,
    // precisaríamos buscar a atividade *após* a remoção da inscrição
    // e então verificar seu estado. O hook é mais limpo.

    // Vamos verificar o status da atividade após a remoção, caso o hook não
    // cubra todos os cenários de reabertura de vagas (ex: período de inscrição).
    // Esta parte é uma redundância se o hook for completo, mas pode ser uma segurança.
    const activityAfterCancel = await Activity.findById(
      inscription.activityId._id
    );
    if (
      activityAfterCancel &&
      activityAfterCancel.status === "Vagas Esgotadas" && // Se estava esgotada
      activityAfterCancel.inscricoesCount < activityAfterCancel.vagasTotal && // E agora tem vaga
      currentDate >= activityAfterCancel.periodoInscricaoInicio && // E ainda está no período de inscrição
      currentDate <= activityAfterCancel.periodoInscricaoFim
    ) {
      activityAfterCancel.status = "Inscrições Abertas";
      await activityAfterCancel.save();
    }

    res.status(200).json({
      success: true,
      message: "Inscrição cancelada com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao cancelar inscrição:", error);
    if (error.name === "CastError" && error.kind === "ObjectId") {
      // Embora a validação na rota já pegue isso
      return res.status(400).json({
        success: false,
        error: { message: "ID da inscrição com formato inválido." },
      });
    }
    res.status(500).json({
      success: false,
      error: { message: "Erro no servidor ao cancelar inscrição." },
    });
  }
};

// @desc    Estudante lista seu histórico de atividades (passadas/participadas)
// @route   GET /api/v1/inscriptions/my/history
// @access  Private (Estudante Only)
exports.getMyInscriptionHistory = async (req, res) => {
  // <<< ADICIONAR ESTA FUNÇÃO
  try {
    const studentId = req.user.id; // ID do estudante logado
    const currentDate = new Date();

    // 1. Buscar todas as inscrições do estudante, independente do status da inscrição,
    //    mas vamos precisar dos dados da atividade para filtrar.
    const inscriptions = await Inscription.find({ studentId: studentId })
      .populate({
        path: "activityId",
        select: "nome dataHoraInicio local tipo status", // Incluir status da atividade
      })
      .sort({ "activityId.dataHoraInicio": -1 }); // Ordenar pelas mais recentes primeiro (histórico)

    // 2. Filtrar para "histórico":
    //    - Atividades que já ocorreram (dataHoraInicio < currentDate)
    //    - OU atividades cujo status é 'Realizada' ou 'Cancelada' (pela organização)
    //    - E o estudante estava inscrito (independente do status da inscrição, mas podemos refinar)
    const historyInscriptions = inscriptions.filter((insc) => {
      if (!insc.activityId) return false; // Ignorar inscrições órfãs

      const activity = insc.activityId;
      const activityHasPassed = activity.dataHoraInicio < currentDate;
      const activityIsConcludedOrCancelled = [
        "Realizada",
        "Cancelada",
      ].includes(activity.status);

      // Critério para histórico:
      // A. A atividade já passou E o estudante não cancelou sua própria inscrição antes.
      // B. OU a atividade foi marcada como 'Realizada' ou 'Cancelada' (pela organização)
      //    e o estudante estava inscrito.

      // Para o MVP, vamos focar em atividades que já passaram ou cujo status é finalizado.
      // Poderíamos também filtrar pelo status da inscrição aqui se quiséssemos,
      // por exemplo, mostrar apenas 'Confirmada' ou 'Participou'.
      // Por agora, mostramos todas as inscrições em atividades passadas/concluídas.

      return activityHasPassed || activityIsConcludedOrCancelled;
    });

    // 3. Formatar a resposta (similar a getMyInscriptions)
    const formattedHistory = historyInscriptions.map((insc) => {
      if (!insc.activityId) {
        return {
          id: insc._id,
          activity: null,
          dataInscricao: insc.dataInscricao,
          statusInscricao: insc.statusInscricao,
        };
      }
      return {
        id: insc._id,
        activity: {
          id: insc.activityId._id,
          nome: insc.activityId.nome,
          dataHoraInicio: insc.activityId.dataHoraInicio,
          local: insc.activityId.local,
          tipo: insc.activityId.tipo, // Adicionado para mais contexto no histórico
          status: insc.activityId.status, // Status da atividade
        },
        dataInscricao: insc.dataInscricao,
        statusInscricao: insc.statusInscricao, // Status da inscrição do estudante
      };
    });

    res.status(200).json({
      success: true,
      count: formattedHistory.length,
      data: formattedHistory,
    });
  } catch (error) {
    console.error("Erro ao listar histórico de inscrições:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Erro no servidor ao listar seu histórico de inscrições.",
      },
    });
  }
};
