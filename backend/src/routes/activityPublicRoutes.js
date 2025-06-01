// backend/src/routes/activityPublicRoutes.js
const express = require("express");
const router = express.Router();
// Decidir se usará o mesmo controller de admin ou um novo controller público
// Por simplicidade, vamos assumir que adicionaremos a função ao activityAdminController por enquanto,
// mas idealmente, para separação de responsabilidades, um activityPublicController.js seria melhor.
const activityController = require("../controllers/activityAdminController"); // Ou activityPublicController

// @route   GET /api/v1/public/activities
// @desc    Listar atividades abertas para o público (para a home page)
// @access  Public
router.get("/", activityController.getPublicActivities);

module.exports = router;
