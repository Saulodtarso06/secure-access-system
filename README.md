# 🛡️ SecureAccess - Sistema de Autenticação com Painel Administrativo

Sistema completo de autenticação de usuários com painel administrativo, desenvolvido com Node.js, Express, React e MySQL (ou SQLite). Permite cadastro, login seguro, autenticação com JWT, painel de usuário autenticado e área de administração com controle de usuários.

---

## Tecnologias utilizadas

### Backend (API REST):
- Node.js
- Express
- JWT (jsonwebtoken)
- bcryptjs
- MySQL (também compativel com MariaDB)
- dotenv
- express-validator
- cors

### Frontend:
- React
- React Router DOM
- Axios
- Bootstrap (ou Tailwind)
- Context API (para auth)

---

## Funcionalidades do Sistema

- Cadastro de usuários ✅

- Login com autenticação segura (JWT) ✅

- Validação de entrada (email, senha)

- Proteção de rotas privadas

- Painel de usuário autenticado

- Painel administrativo com lista de usuários

- Permissão de acesso por nível (user/admin)

- Logout seguro

- Sistema Responsivo

---
### 📌 Melhorias a serem implementadas:
- Recuperação de senha por e-mail

- Logs de atividade

- Sistema de auditoria

- Deploy com Docker
---
### Estrutura Principal do Sistema:
```
secureaccess/
├── backend/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── index.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── App.js
└── README.md
```
---
## Como executar o projeto na sua máquina:

1. Clone o repositório:
```bash
git clone https://github.com/Saulodtarso06/secure-access-system.git

cd secureaccess/backend
```
---
### Instale as dependências Node:
```
npm install
```
---
### Inicie o servidor:
```
npm run dev
```
---
## Autor

* Desenvolvido por Saulo de Tarso - fullstack developer.

* E-mail: saulo.detarso06@yahoo.com.br

* Linkedin: https://br.linkedin.com/in/saulo-de-tarso-8a2b00133