import express from "express";
import {
  register,
  login,
  registerEmbedding,
  loginEmbedding,
} from "../controllers/authController.js";
import upload from "../config/multer.js";

const router = express.Router();

router.post("/register", upload.single("photo"), register);
router.post("/login", upload.single("photo"), login);

router.post("/register-embedding", registerEmbedding);
router.post("/login-embedding", loginEmbedding);

export default router;
