const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { User } = require('../models');

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// exemplo de criação
//const user = await prisma.user.create({ data: { name, email, password: hash, role: "user" } });

// exemplo de busca
//const user = await prisma.user.findUnique({ where: { email } });


function signToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES || "1h" }
    );
}

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Preencha nome, email e senha" });
        }

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ error: "Email já cadastrado" });

        const hash = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hash,
            role: role === "admin" ? "admin" : "user"
        });

        return res.status(201).json({
            message: "Usuário cadastrado com sucesso",
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        return res.status(500).json({ error: "Erro ao cadastrar usuário" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Informe email e senha" });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: "Credenciais inválidas" });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });

        const token = signToken(user);

        return res.status(200).json({
            message: "Login realizado com sucesso",
            token,
            user: { id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role }
        });
    } catch (err) {
        return res.status(500).json({ error: "Erro ao realizar login" });
    }
};

exports.me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
        return res.json({ user });
    } catch {
        return res.status(500).json({ error: "Erro ao buscar perfil" });
    }
};
