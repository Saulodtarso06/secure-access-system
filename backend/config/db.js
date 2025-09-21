const mongoose = require("mongoose");

async function connectDB(uri) {
    try {
        await mongoose.connect(uri, {
            autoIndex: true
        });
        console.log("✅ MongoDB conectado");
    } catch (err) {
        console.error("❌ Erro ao conectar no MongoDB:", err.message);
        process.exit(1);
    }
}

module.exports = { connectDB };
