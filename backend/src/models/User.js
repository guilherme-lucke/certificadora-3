// backend/src/models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Vamos precisar para o pre-save hook de senha

const UserSchema = new mongoose.Schema(
  {
    nomeCompleto: {
      type: String,
      required: [true, "O nome completo é obrigatório."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "O e-mail é obrigatório."],
      unique: true, // Garante que o e-mail seja único na coleção (US01.3)
      lowercase: true,
      trim: true,
      match: [
        // Validação básica de formato de e-mail
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Por favor, forneça um e-mail válido.",
      ],
    },
    passwordHash: {
      type: String,
      required: [true, "A senha é obrigatória."],
      minlength: [6, "A senha deve ter pelo menos 6 caracteres."], // Validação de tamanho mínimo
      select: false, // Não retorna o hash da senha por padrão nas consultas
    },
    telefone: {
      type: String,
      // required: [true, 'O telefone é obrigatório.'], // Tornar opcional ou validar formato se necessário
      trim: true,
    },
    dataNascimento: {
      type: Date,
      // required: [true, 'A data de nascimento é obrigatória.'],
    },
    escola: {
      type: String,
      // required: [true, 'A escola é obrigatória.'],
      trim: true,
    },
    serieAno: {
      type: String,
      // required: [true, 'A série/ano é obrigatório.'],
      trim: true,
    },
    interesses: {
      type: [String], // Array de strings
      default: [],
    },
    role: {
      type: String,
      enum: ["estudante", "admin", "superadmin"], // Tipos de usuário permitidos (US02.4)
      default: "estudante", // Novo usuário é estudante por padrão
    },
    aceitouPoliticaPrivacidade: {
      type: Boolean,
      required: [true, "O aceite da política de privacidade é obrigatório."],
      default: false,
    },
    dataConsentimento: {
      type: Date,
      // Será preenchido quando aceitouPoliticaPrivacidade for true
    },
    isActive: {
      // Para desativação de conta por SuperAdmin no futuro
      type: Boolean,
      default: true,
    },
    // Campos para reset de senha (a serem adicionados em Sprints futuras)
    // passwordResetToken: String,
    // passwordResetExpires: Date,
  },
  {
    timestamps: true, // Adiciona os campos createdAt e updatedAt automaticamente
  }
);

// Middleware (hook) do Mongoose: Criptografar senha ANTES de salvar o usuário
// Este hook será executado apenas se a senha foi modificada (ou é nova)
UserSchema.pre("save", async function (next) {
  // 'this' se refere ao documento atual que está sendo salvo
  if (!this.isModified("passwordHash")) {
    // Se a senha não foi modificada, pule
    return next();
  }

  // Gerar o salt e fazer o hash da senha
  try {
    const salt = await bcrypt.genSalt(10); // Custo do salt (10 é um bom valor)
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error); // Passa o erro para o próximo middleware/handler de erro
  }
});

// (Opcional) Método para comparar senhas (para login) - pode ser adicionado aqui ou no controller
UserSchema.methods.matchPassword = async function (enteredPassword) {
  // 'this' se refere ao documento do usuário
  // Precisamos selecionar 'passwordHash' explicitamente se ele estiver com select: false
  // No entanto, ao chamar este método em uma instância de usuário que já tem o passwordHash (ex: após um findOne().select('+passwordHash')),
  // o `this.passwordHash` estará disponível.
  // Se o passwordHash não estiver carregado, esta comparação falhará silenciosamente ou dará erro dependendo do contexto.
  // A forma mais segura é garantir que o passwordHash seja selecionado antes de chamar este método.
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Criar e exportar o Model 'User' baseado no UserSchema
const User = mongoose.model("User", UserSchema);

module.exports = User;
