import express from "express";
import { create, getAll, getById, remove, update } from "../controllers/userController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/user", verifyToken, create);
router.get("/user", verifyToken, getAll);
router.get("/user/:id", verifyToken, getById);
router.put("/user/:id", verifyToken, update);
router.delete("/user/:id", verifyToken, remove);

export default router;
