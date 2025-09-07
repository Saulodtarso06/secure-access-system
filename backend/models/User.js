// models/User.js
class User {
    constructor(id, name, email, password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password; // senha criptografada
    }
}

const users = []; // armazenando usuários em memória (substituir por banco depois)

module.exports = { User, users };
