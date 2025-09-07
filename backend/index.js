// index.js

// 1. Importação de Módulos Essenciais
// ------------------------------------
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Para carregar variáveis de ambiente do arquivo .env

// 2. Importação das Configurações e Rotas
// ------------------------------------
const db = require('./database/db'); // Módulo de conexão com o banco de dados
const authRoutes = require('./routes/authRoutes'); // Rotas de autenticação (cadastro, login)
const userRoutes = require('./routes/userRoutes'); // Rotas para painel do usuário autenticado
const adminRoutes = require('./routes/adminRoutes'); // Rotas para a área de administração

// 3. Inicialização do Express
// ------------------------------------
const app = express();
const PORT = process.env.PORT || 5000;

// 4. Middlewares
// ------------------------------------
// Middleware para habilitar CORS (Cross-Origin Resource Sharing).
// Essencial para permitir que o frontend React (em um domínio diferente)
// faça requisições para o backend.
app.use(cors());

// Middleware para analisar o corpo das requisições JSON.
// Isso permite que o Express entenda os dados enviados pelo frontend no formato JSON.
app.use(bodyParser.json());

// 5. Conexão com o Banco de Dados
// ------------------------------------
// Sincroniza o modelo do banco de dados (por exemplo, criando a tabela de usuários
// caso ela ainda não exista).
db.sequelize.sync()
    .then(() => {
        console.log('Banco de dados sincronizado com sucesso.');
    })
    .catch(err => {
        console.error('Erro ao sincronizar o banco de dados:', err);
    });

// 6. Definição das Rotas
// ------------------------------------
// Agrupamos as rotas em seus respectivos arquivos para manter o código organizado.
// As rotas de autenticação, usuário e administração são "montadas" aqui.
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// 7. Servir o Frontend React (Produção)
// ------------------------------------
// Este trecho de código é importante para a versão de produção, onde o Node.js
// também serve os arquivos estáticos do frontend.
if (process.env.NODE_ENV === 'production') {
    // Serve os arquivos estáticos da pasta `build` do React
    app.use(express.static(path.join(__dirname, '../client/build')));

    // Em qualquer rota não tratada acima, serve o arquivo `index.html` do React
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
}

// 8. Inicialização do Servidor
// ------------------------------------
// O servidor Express começa a escutar as requisições na porta definida.
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});