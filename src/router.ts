import express from "express";
const router = express.Router();
import memberController from "./controllers/member.controller";

router.post("/signup", memberController.signup);
router.post("/login", memberController.login);
router.post("/logout", memberController.logout);

export default router;
