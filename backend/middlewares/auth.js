const jwt = require("jsonwebtoken");

function auth(requiredRole) {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization || "";
            const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
            if (!token) return res.status(401).json({ error: "Token ausente" });

            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = payload; // { id, email, role }

            if (requiredRole && payload.role !== requiredRole) {
                return res.status(403).json({ error: "Permissão negada" });
            }
            next();
        } catch (err) {
            return res.status(401).json({ error: "Token inválido ou expirado" });
        }
    };
}

module.exports = { auth };