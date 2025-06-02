const mongoose = require("mongoose");

const InscriptionSchema = new mongoose.Schema(
  {
    activityId: {
      type: mongoose.Schema.ObjectId,
      ref: "Activity", // Referencia o Model 'Activity'
      required: [true, "O ID da atividade é obrigatório para a inscrição."],
    },
    studentId: {
      type: mongoose.Schema.ObjectId,
      ref: "User", // Referencia o Model 'User' (especificamente, um usuário com role 'estudante')
      required: [true, "O ID do estudante é obrigatório para la inscrição."],
    },
    dataInscricao: {
      type: Date,
      default: Date.now, // Data e hora em que a inscrição foi criada
    },
    statusInscricao: {
      type: String,
      enum: [
        "Confirmada", // Inscrição ativa e vaga garantida
        "CanceladaPeloEstudante", // Estudante cancelou
        "CanceladaPeloAdmin", // Admin removeu a inscrição (ex: por não conformidade)
        "ListaDeEspera", // Se houver lista de espera no futuro
        "Participou", // Marcado após a atividade, se o estudante compareceu (futuro)
        "Ausente", // Marcado após a atividade, se o estudante não compareceu (futuro)
      ],
      default: "Confirmada", // Nova inscrição é confirmada por padrão
      required: true,
    },
    // Campos adicionais que podem ser úteis no futuro:
    // dataCancelamento: Date,
    // motivoCancelamento: String,
    // feedbackParticipacao: String, // Feedback após a atividade
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt
  }
);

// Índice composto para garantir que um estudante não possa se inscrever mais de uma vez na mesma atividade.
// Isso criará um índice único no MongoDB para a combinação de activityId e studentId.
InscriptionSchema.index({ activityId: 1, studentId: 1 }, { unique: true });

// Middleware para atualizar o contador de inscrições na atividade
InscriptionSchema.post("save", async function () {
  const Activity = mongoose.model("Activity");
  const inscricoesConfirmadas = await mongoose
    .model("Inscription")
    .countDocuments({
      activityId: this.activityId,
      statusInscricao: "Confirmada",
    });

  await Activity.findByIdAndUpdate(this.activityId, {
    inscricoesCount: inscricoesConfirmadas,
  });
});

// Função auxiliar para atualizar o contador de inscrições na atividade
async function updateActivityInscricoesCount(inscriptionDoc) {
  // inscriptionDoc é o documento Inscription que foi salvo, atualizado ou está sendo removido.
  // Para 'remove', inscriptionDoc contém os dados do documento ANTES da remoção efetiva no DB,
  // mas o hook post-remove é chamado DEPOIS da remoção.
  if (!inscriptionDoc || !inscriptionDoc.activityId) {
    console.warn(
      "updateActivityInscricoesCount chamado sem inscriptionDoc ou activityId válido."
    );
    return;
  }

  const Activity = mongoose.model("Activity");
  try {
    // Recalcula o total de inscrições 'Confirmada' para a atividade.
    // Se uma inscrição 'Confirmada' foi removida, o countDocuments não a incluirá mais.
    const inscricoesConfirmadas = await mongoose
      .model("Inscription")
      .countDocuments({
        activityId: inscriptionDoc.activityId,
        statusInscricao: "Confirmada",
      });

    await Activity.findByIdAndUpdate(inscriptionDoc.activityId, {
      inscricoesCount: inscricoesConfirmadas,
    });
  } catch (error) {
    console.error(
      `Erro ao atualizar inscricoesCount para activityId ${inscriptionDoc.activityId}:`,
      error
    );
    // Considerar como lidar com o erro, talvez relançar ou logar criticamente.
  }
}

// Hook para após salvar uma nova inscrição ou atualizar uma existente via save()
InscriptionSchema.post("save", async function () {
  // 'this' é o documento salvo
  await updateActivityInscricoesCount(this);
});

// Hook para após uma inscrição ser atualizada via findOneAndUpdate
InscriptionSchema.post("findOneAndUpdate", async function (result) {
  // 'result' é o documento como ele está no banco APÓS a atualização.
  // Se a operação não encontrou ou não modificou um documento, 'result' pode ser null.
  if (result) {
    await updateActivityInscricoesCount(result);
  }
});

// Hook para após uma inscrição ser removida via findOneAndDelete (acionado por findByIdAndDelete)
InscriptionSchema.post("findOneAndDelete", async function (doc) {
  // 'doc' é o documento que foi removido.
  // Este hook é chamado DEPOIS que o documento é removido do banco.
  if (doc) {
    await updateActivityInscricoesCount(doc);
  }
});

// (Opcional) Middleware pre-save ou pre-validate se houver lógicas complexas
// Por exemplo, verificar se o studentId realmente pertence a um usuário com role 'estudante'
// antes de salvar, embora isso possa ser melhor tratado na lógica do controller.
/*
InscriptionSchema.pre('save', async function(next) {
    if (this.isNew) { // Apenas para novas inscrições
        const User = mongoose.model('User'); // Evitar dependência circular no topo do arquivo
        const student = await User.findById(this.studentId);
        if (!student || student.role !== 'estudante') {
            const err = new Error('ID do estudante inválido ou não é um estudante.');
            err.name = 'ValidationError'; // Para ser tratado como erro de validação
            return next(err);
        }
    }
    next();
});
*/

const Inscription = mongoose.model("Inscription", InscriptionSchema);

module.exports = Inscription;
