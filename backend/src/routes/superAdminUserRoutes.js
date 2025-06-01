// backend/src/routes/superAdminUserRoutes.js
const express = require("express");
const router = express.Router();
const superAdminUserController = require("../controllers/superAdminUserController"); // Vamos criar/modificar
const { protect, authorize } = require("../middlewares/authMiddleware");
const { check, param } = require("express-validator"); // Para validação
const mongoose = require("mongoose"); // Para validar ObjectId

// Middleware para validar ObjectId no parâmetro :userId
const validateUserIdParam = [
  param("userId")
    .custom(value => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("ID do usuário inválido ou mal formatado");
      }
      return true;
    })
    .withMessage("ID do usuário inválido ou mal formatado"),
];

// --- ROTAS PARA GERENCIAMENTO DE ESTUDANTES ---
router.get("/students", protect, authorize("superadmin"), superAdminUserController.listStudents);

router.get(
  "/students/:userId",
  protect,
  authorize("superadmin"),
  validateUserIdParam,
  superAdminUserController.getStudentDetails
);

router.put(
  "/students/:userId",
  protect,
  authorize("superadmin"),
  validateUserIdParam,
  [
    // Validações do corpo da requisição (exemplos)
    check("nomeCompleto")
      .optional()
      .trim()
      .not()
      .isEmpty()
      .withMessage("Nome completo não pode ser vazio se fornecido."),
    check("escola").optional().trim(),
    check("serieAno").optional().trim(),
    check("telefone")
      .optional()
      .trim()
      .isMobilePhone("pt-BR")
      .withMessage("Telefone inválido (se fornecido)."),
    check("isActive").optional().isBoolean().withMessage("isActive deve ser um valor booleano."),
    // Adicionar outras validações conforme necessário (ex: dataNascimento, interesses)
  ],
  superAdminUserController.updateStudentDetails
);

router.put(
  "/students/:userId/status",
  protect,
  authorize("superadmin"),
  validateUserIdParam,
  [
    check(
      "isActive",
      "O campo isActive é obrigatório e deve ser um valor booleano (true ou false)."
    )
      .exists() // Garante que o campo existe
      .isBoolean() // Garante que é booleano
      .toBoolean(), // Converte para booleano para uso no controller
  ],
  superAdminUserController.updateStudentStatus
);

// Rota para deletar um estudante
router.delete(
  "/students/:userId",
  protect,
  authorize("superadmin"),
  validateUserIdParam,
  superAdminUserController.deleteStudent // Assumindo que esta função existe/será criada no controller
);

// --- ROTAS PARA GERENCIAMENTO DE ADMINS (VIRÃO NA T-BE5.3) ---

router.post(
  "/admins",
  protect,
  authorize("superadmin"),
  [
    // Validações do corpo da requisição
    check("nomeCompleto", "Nome completo é obrigatório.").not().isEmpty().trim(),
    check("email", "Por favor, inclua um email válido.").isEmail().normalizeEmail(),
    check("password", "A senha deve ter pelo menos 8 caracteres e conter letras e números.")
      .isLength({ min: 8 })
      .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage("Senha fraca. Use letras, números e opcionalmente @$!%*?&."),
    check("telefone")
      .optional({ checkFalsy: true })
      .trim()
      .isMobilePhone("pt-BR")
      .withMessage("Telefone inválido."),
  ],
  superAdminUserController.createAdmin
);

router.get("/admins", protect, authorize("superadmin"), superAdminUserController.listAdmins);

router.get(
  "/admins/:userId",
  protect,
  authorize("superadmin"),
  validateUserIdParam,
  superAdminUserController.getAdminDetails
);

router.put(
  "/admins/:userId",
  protect,
  authorize("superadmin"),
  validateUserIdParam, // Reutilizar o middleware de validação de ID
  [
    // Validações do corpo (exemplos)
    check("nomeCompleto")
      .optional()
      .trim()
      .not()
      .isEmpty()
      .withMessage("Nome completo não pode ser vazio se fornecido."),
    check("telefone")
      .optional({ checkFalsy: true })
      .trim()
      .isMobilePhone("pt-BR")
      .withMessage("Telefone inválido."),
    check("isActive").optional().isBoolean().withMessage("isActive deve ser um valor booleano."),
  ],
  superAdminUserController.updateAdminDetails
);

router.delete(
  "/admins/:userId",
  protect,
  authorize("superadmin"),
  validateUserIdParam,
  superAdminUserController.deleteAdmin
);

module.exports = router;
