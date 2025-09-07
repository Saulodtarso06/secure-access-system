const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, users } = require("../models/User");

let userIdCounter = 1;

// Cadastro
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Preencha todos os campos" });
        }

        const userExists = users.find((u) => u.email === email);
        if (userExists) {
            return res.status(400).json({ error: "Email já cadastrado" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User(userIdCounter++, name, email, hashedPassword);
        users.push(newUser);

        res.status(201).json({
            message: "Usuário cadastrado com sucesso",
            user: { id: newUser.id, name, email }
        });
    } catch (err) {
        res.status(500).json({ error: "Erro no servidor" });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // validações
        if (!email || !password) {
            return res.status(400).json({ error: "Preencha todos os campos" });
        }

        const user = users.find((u) => u.email === email);
        if (!user) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        // compara a senha
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        // gera token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            "chave_secreta_jwt", // depois substituímos por variáveis de ambiente
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login realizado com sucesso",
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ error: "Erro no servidor" });
    }
};

