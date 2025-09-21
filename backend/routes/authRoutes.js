const express = require("express");
const { auth } = require("../middlewares/auth");

function register(req, res) {
  // lógica de registro
}

function login(req, res) {
  // lógica de login
}

function me(req, res) {
  // lógica para obter informações do usuário
}

const router = express.Router();

// Rotas públicas
router.post("/register", register);
router.post("/login", login);

// Rota protegida (usuário autenticado)
router.get("/me", auth(), me);

// Rota só para admin
router.get("/admin-only", auth("admin"), (req, res) => res.json({ ok: true }));

module.exports = { register, login, me };

const authRoutes = require("./backend/routes/authRoutes");
app.use("/api/auth", authRoutes);


