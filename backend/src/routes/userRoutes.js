import express from "express";
import { create, getAll, getById, remove, update } from "../controllers/userController.js";

const router = express.Router();

router.post("/user", create);
router.get("/user", getAll);
router.get("/user/:id", getById);
router.put("/user/:id", update);
router.delete("/user/:id", remove);

export default router;
