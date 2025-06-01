// backend/src/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController"); // Vamos criar este em breve
const { protect, authorize } = require("../middlewares/authMiddleware"); // Importar os middlewares de proteção e autorização
const { check } = require("express-validator"); // Importar check

// @route   GET /api/v1/users/me
// @desc    Obter perfil do usuário logado
// @access  Private (protegido)
router.get("/me", protect, userController.getCurrentUserProfile);

// @route   PUT /api/v1/users/me
// @desc    Atualizar perfil do usuário logado
// @access  Private (protegido)
router.put(
  "/me",
  protect,
  [
    check("nomeCompleto", "Nome completo não pode ser vazio")
      .optional()
      .not()
      .isEmpty(),
    check("email", "Email inválido").optional().isEmail(),
    check("dataNascimento", "Data de nascimento inválida")
      .optional()
      .isISO8601()
      .toDate(),
    check("escola", "Escola não pode ser vazia").optional().not().isEmpty(),
    check("serieAno", "Série/Ano não pode ser vazio")
      .optional()
      .not()
      .isEmpty(),
  ],
  userController.updateCurrentUserProfile
);

// @route   PUT /api/v1/users/me/password
// @desc    Alterar senha do usuário logado
// @access  Private (protegido)
router.put(
  "/me/password",
  protect,
  [
    check("currentPassword", "Senha atual é obrigatória").exists(),
    check(
      "newPassword",
      "Nova senha é obrigatória e deve ter pelo menos 8 caracteres"
    ).isLength({ min: 8 }),
  ],
  userController.changeCurrentUserPassword
);

// @route   DELETE /api/v1/users/me/account
// @desc    Estudante solicita a exclusão/anonimização de sua conta
// @access  Private (Estudante Only)
router.delete(
  "/me/account",
  protect, // Usuário precisa estar autenticado
  userController.deleteMyAccount // Remover restrição de role para permitir que admins também possam excluir suas contas
);

module.exports = router;
