// backend/src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const authController = require("../controllers/authController");

// @route   POST /api/v1/auth/signup
// @desc    Cadastrar novo usuário (estudante)
// @access  Public
router.post(
  "/signup",
  [
    check("nomeCompleto", "Nome completo é obrigatório").not().isEmpty(),
    check("email", "Por favor, inclua um email válido").isEmail(),
    check("password", "A senha deve ter pelo menos 8 caracteres").isLength({
      min: 8,
    }),
    check("dataNascimento", "Data de nascimento é obrigatória")
      .not()
      .isEmpty()
      .isISO8601()
      .toDate(),
    check("escola", "Escola é obrigatória").not().isEmpty(),
    check("serieAno", "Série/Ano é obrigatório").not().isEmpty(),
  ],
  authController.signupUser
);

// @route   POST /api/v1/auth/login
// @desc    Autenticar usuário e obter token
// @access  Public
router.post(
  "/login",
  [
    check("email", "Por favor, inclua um email válido").isEmail(),
    check("password", "Senha é obrigatória").exists(),
  ],
  authController.loginUser
);

// @route   POST /api/v1/auth/forgot-password
// @desc    Solicitar redefinição de senha
// @access  Public
router.post(
  "/forgot-password",
  [check("email", "Por favor, inclua um email válido").isEmail()],
  authController.forgotPassword
);

// @route   POST /api/v1/auth/reset-password/:token
// @desc    Redefinir senha com token
// @access  Public
router.post(
  "/reset-password/:token",
  [
    check(
      "newPassword",
      "A nova senha deve ter pelo menos 8 caracteres e conter letras e números."
    )
      .isLength({ min: 8 })
      .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/), // Mesma validação de senha do signup de admin
  ],
  authController.resetPassword
);

module.exports = router;
