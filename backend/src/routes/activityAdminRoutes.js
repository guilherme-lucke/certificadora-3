const express = require("express");
const router = express.Router();
const activityAdminController = require("../controllers/activityAdminController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { param, check } = require("express-validator"); // Adicionado check
const mongoose = require("mongoose"); // Para validar ObjectId

// @route   POST /api/v1/admin/activities
// @desc    Criar nova atividade
// @access  Private (Admin)
router.post(
  "/",
  protect, // Primeiro, garantir que o usuário está autenticado
  authorize("admin"), // Depois, garantir que o usuário tem o papel 'admin'
  [
    check("name", "Nome da atividade é obrigatório").not().isEmpty(),
    check("description", "Descrição é obrigatória").not().isEmpty(),
    check(
      "startDate",
      "Data de início é obrigatória e deve ser uma data válida"
    )
      .isISO8601()
      .toDate(),
    check("endDate", "Data de fim é obrigatória e deve ser uma data válida")
      .isISO8601()
      .toDate(),
    check("location", "Local é obrigatório").not().isEmpty(),
    check(
      "maxParticipants",
      "Número máximo de participantes deve ser um inteiro positivo"
    )
      .optional()
      .isInt({ gt: 0 }),
  ],
  activityAdminController.createActivity
);

// @route   GET /api/v1/admin/activities
// @desc    Listar todas as atividades para o Admin
// @access  Private (Admin Only)
router.get(
  "/",
  protect,
  authorize("admin"),
  activityAdminController.getAllActivitiesForAdmin
);

// @route   GET /api/v1/admin/activities/:activityId
// @desc    Obter detalhes de uma atividade específica para Admin
// @access  Private (Admin Only)
router.get(
  "/:activityId",
  protect,
  authorize("admin"),
  [
    param("activityId").custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("ID da atividade inválido ou mal formatado");
      }
      return true;
    }),
  ],
  activityAdminController.getActivityByIdForAdmin
);

// @route   PUT /api/v1/admin/activities/:activityId
// @desc    Atualizar uma atividade existente para Admin
// @access  Private (Admin Only)
router.put(
  "/:activityId",
  protect,
  authorize("admin"),
  [
    param("activityId").custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("ID da atividade inválido ou mal formatado");
      }
      return true;
    }),
    // Validações do corpo da requisição
    check("name", "Nome da atividade é obrigatório").optional().not().isEmpty(),
    check("description", "Descrição é obrigatória").optional().not().isEmpty(),
    check("startDate", "Data de início deve ser uma data válida")
      .optional()
      .isISO8601()
      .toDate(),
    check("endDate", "Data de fim deve ser uma data válida")
      .optional()
      .isISO8601()
      .toDate(),
    check("location", "Local é obrigatório").optional().not().isEmpty(),
    check(
      "maxParticipants",
      "Número máximo de participantes deve ser um inteiro positivo"
    )
      .optional()
      .isInt({ gt: 0 }),
  ],
  activityAdminController.updateActivity
);

// @route   DELETE /api/v1/admin/activities/:activityId
// @desc    Excluir uma atividade para Admin
// @access  Private (Admin Only)
router.delete(
  "/:activityId",
  protect,
  authorize("admin"),
  [
    param("activityId").custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("ID da atividade inválido ou mal formatado");
      }
      return true;
    }),
  ],
  activityAdminController.deleteActivity
);

// @route   GET /api/v1/admin/activities/:activityId/inscriptions
// @desc    Admin lista os estudantes inscritos em uma atividade específica
// @access  Private (Admin Only)
router.get(
  "/:activityId/inscriptions", // Rota aninhada
  protect,
  authorize("admin"),
  [
    param("activityId").custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("ID da atividade inválido ou mal formatado");
      }
      return true;
    }),
  ],
  activityAdminController.getActivityInscriptions
);

module.exports = router;
