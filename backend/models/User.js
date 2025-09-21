// models/User.js
const mongoose = require("mongoose");
const authController = require('../controllers/authController');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["user", "admin"], default: "user" }
    },
    { timestamps: true }
);

const users = []; // armazenando usuários em memória (substituir por banco depois)

module.exports = mongoose.model("User", userSchema);


