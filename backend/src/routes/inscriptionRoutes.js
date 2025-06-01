// backend/src/routes/inscriptionRoutes.js
const express = require("express");
const router = express.Router();
const inscriptionController = require("../controllers/inscriptionController"); // Vamos criar/modificar
const { protect, authorize } = require("../middlewares/authMiddleware");
const mongoose = require("mongoose"); // Importar para validar ObjectId no parâmetro da rota
const { check } = require("express-validator"); // Importar check

// @route   POST /api/v1/inscriptions
// @desc    Estudante se inscreve em uma atividade
// @access  Private (Estudante Only)
router.post(
  "/",
  protect, // Garante que o usuário está autenticado
  authorize("estudante"), // Garante que o usuário autenticado tem o papel 'estudante'
  [
    check(
      "activityId",
      "ID da atividade é obrigatório e deve ser um ID válido."
    )
      .not()
      .isEmpty()
      .custom((value) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("ID da atividade inválido ou mal formatado.");
        }
        return true;
      }),
  ],
  inscriptionController.createInscription
);

// @route   GET /api/v1/inscriptions/my
// @desc    Estudante lista suas inscrições atuais
// @access  Private (Estudante Only)
router.get(
  "/my",
  protect,
  authorize("estudante"),
  inscriptionController.getMyInscriptions
);

// @route   DELETE /api/v1/inscriptions/my/:inscriptionId
// @desc    Estudante cancela sua inscrição em uma atividade
// @access  Private (Estudante Only)
router.delete(
  "/my/:inscriptionId",
  protect,
  authorize("estudante"),
  // Validação do parâmetro da rota (opcional, mas bom)
  (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.inscriptionId)) {
      return res.status(400).json({
        success: false,
        error: { message: "ID da inscrição inválido." },
      });
    }
    next();
  },
  inscriptionController.cancelMyInscription
);

// @route   GET /api/v1/inscriptions/my/history
// @desc    Estudante lista seu histórico de atividades (passadas/participadas)
// @access  Private (Estudante Only)
router.get(
  "/my/history",
  protect,
  authorize("estudante"),
  inscriptionController.getMyInscriptionHistory // <<< ADICIONAR ESTA ROTA E HANDLER
);

module.exports = router;
