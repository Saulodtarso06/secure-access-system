require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./backend/config/db");
const { sequelize } = require("./backend/models/User");
const authRoutes = require('./routes/authRoutes');

sequelize.authenticate()
    .then(() => console.log('✅ Conectado ao PostgreSQL!'))
    .catch(err => console.error('❌ Erro ao conectar ao PostgreSQL:', err));

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI).then(() => {
    app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
});


