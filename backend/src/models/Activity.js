// backend/src/models/Activity.js

const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome da atividade é obrigatório."],
      trim: true,
      maxlength: [150, "O nome da atividade não pode exceder 150 caracteres."],
    },
    tipo: {
      type: String,
      required: [true, "O tipo da atividade é obrigatório."],
      enum: [
        // Tipos pré-definidos de atividades
        "Oficina",
        "Roda de Conversa",
        "Minicurso",
        "Mentoria Technovation",
        "Palestra", // Adicionando um tipo comum
        "Outro",
      ],
    },
    descricao: {
      // Descrição completa
      type: String,
      required: [true, "A descrição da atividade é obrigatória."],
      maxlength: [200, "A descrição não pode exceder 200 caracteres."],
      trim: true,
    },
    dataHoraInicio: {
      type: Date,
      required: [true, "A data e hora de início são obrigatórias."],
    },
    dataHoraFim: {
      // Opcional, pode ser definido com base na duração
      type: Date,
    },
    local: {
      // Pode ser um endereço físico ou "Online"
      type: String,
      required: [true, "O local da atividade é obrigatório."],
      trim: true,
    },
    linkOnline: {
      // Se local for "Online"
      type: String,
      trim: true,
      // Validação de URL pode ser adicionada aqui se necessário
    },
    vagasTotal: {
      type: Number,
      required: [true, "O número total de vagas é obrigatório."],
      min: [0, "O número de vagas não pode ser negativo."],
      default: 0,
    },
    periodoInscricaoInicio: {
      type: Date,
      required: [true, "A data de início das inscrições é obrigatória."],
    },
    periodoInscricaoFim: {
      type: Date,
      required: [true, "A data de fim das inscrições é obrigatória."],
    },
    dataLimiteCancelamento: {
      // Data até quando uma estudante pode cancelar a inscrição
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "Rascunho", // Sendo criada, não visível publicamente
        "Publicada", // Visível, mas inscrições ainda não abertas (ex: "Em Breve")
        "Inscrições Abertas", // Visível e aceitando inscrições
        "Vagas Esgotadas", // Visível, mas sem vagas
        "Inscrições Encerradas", // Visível, período de inscrição passou, mas ainda não ocorreu
        "Realizada", // Atividade concluída
        "Cancelada", // Atividade foi cancelada
      ],
      default: "Rascunho",
    },
    criadoPor: {
      // Referência ao usuário Admin/SuperAdmin que criou a atividade
      type: mongoose.Schema.ObjectId,
      ref: "User", // Referencia o Model 'User'
      required: true,
    },
    inscricoesCount: {
      // Contador de quantas inscrições confirmadas existem
      type: Number,
      default: 0,
      min: [0, "O contador de inscrições não pode ser negativo."],
    },
    // Outros campos que podem ser úteis no futuro:
    // publicoAlvo: String, (ex: "Meninas do 6º ao 9º ano")
    // preRequisitos: [String],
    // materialNecessario: [String],
    // imagemCapaUrl: String,
  },
  {
    timestamps: true, // Adiciona createdAt e updatedAt
    toJSON: { virtuals: true }, // Para incluir campos virtuais ao converter para JSON
    toObject: { virtuals: true }, // Para incluir campos virtuais ao converter para objeto
  }
);

// Virtual para vagas disponíveis (não armazenado no DB, mas calculado)
ActivitySchema.virtual("vagasDisponiveis").get(function () {
  if (this.vagasTotal >= 0 && this.inscricoesCount >= 0) {
    return this.vagasTotal - this.inscricoesCount;
  }
  return 0; // Ou null, ou lançar erro se os valores forem inválidos
});

// (Opcional) Validação para garantir que periodoInscricaoFim seja após periodoInscricaoInicio
ActivitySchema.pre("validate", function (next) {
  if (
    this.periodoInscricaoFim &&
    this.periodoInscricaoInicio &&
    this.periodoInscricaoFim < this.periodoInscricaoInicio
  ) {
    this.invalidate(
      "periodoInscricaoFim",
      "A data de fim das inscrições deve ser após a data de início.",
      this.periodoInscricaoFim
    );
  }
  if (
    this.dataHoraFim &&
    this.dataHoraInicio &&
    this.dataHoraFim < this.dataHoraInicio
  ) {
    this.invalidate(
      "dataHoraFim",
      "A data de fim da atividade deve ser após a data de início.",
      this.dataHoraFim
    );
  }
  if (
    this.dataLimiteCancelamento &&
    this.periodoInscricaoFim &&
    this.dataLimiteCancelamento > this.periodoInscricaoFim
  ) {
    this.invalidate(
      "dataLimiteCancelamento",
      "A data limite para cancelamento não pode ser após o fim das inscrições.",
      this.dataLimiteCancelamento
    );
  }
  next();
});

const Activity = mongoose.model("Activity", ActivitySchema);

module.exports = Activity;
