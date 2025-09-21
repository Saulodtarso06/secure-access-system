# 🛡️ SecureAccess - Sistema de Autenticação com Painel Administrativo

Sistema de autenticação com Node.js, Express, MongoDB, PostgreSQL (Prisma) e JWT.

## Estrutura básica das Pastas

```bash
/SECUREACCESS
│
├── /backend
│   ├── server.js
│   ├── /controllers
│   ├── /models
│   ├── /routes
│   ├── /middleware
│   └── /config
│
├── /frontend
│   ├── /src
│   ├── App.jsx
│   ├── /pages
│   ├── /components
│   └── /services
│
└── README.md│
└── .env
└── .gitignore
└── package-lock.json
└── package.json
└── server.js
```
---
## Pré-requisitos

- Node.js
- MongoDB rodando localmente ou Atlas
- PostgreSQL rodando localmente
- Prisma CLI (`npm install prisma --save-dev`)

## Instalação

1. Instale as dependências:
   ```
   npm install
   ```

2. Configure o arquivo `.env` na raiz do projeto:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/secureaccess
   JWT_SECRET=sua_chave_secreta
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/secureaccess?schema=public"
   ```

3. Execute as migrações do Prisma:
   ```
   npx prisma migrate dev --name init
   npx prisma generate
   ```

## Executando o Projeto

```
npm run dev
```

O servidor estará disponível em `http://localhost:5000`.

## Rotas principais

- `POST /api/auth/register` — Cadastro de usuário
- `POST /api/auth/login` — Login e geração de token JWT
- `GET /api/auth/me` — Dados do usuário autenticado (requer JWT)
- `GET /api/auth/admin-only` — Rota protegida para admin (requer JWT e role admin)

## Observações

- O projeto utiliza autenticação JWT.
- O Prisma gerencia o acesso ao PostgreSQL.
- O MongoDB é usado para persistência adicional (caso necessário).