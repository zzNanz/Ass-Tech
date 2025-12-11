// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET = process.env.SECRET_KEY; 

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: 'Token mal formatado.' });
    }

    // Tenta verificar e decodificar o token
    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) {
            // Se o token for inválido ou expirado
            return res.status(401).json({ message: 'Token inválido ou expirado.' });
            // 🚨 SOLUÇÃO: O 'return' garante que o código não tente usar 'decoded'
        }
        
        // Token Válido: Anexa os dados do usuário à requisição
        req.userId = decoded.id; 
        req.username = decoded.username; 
        
        // Continua para a próxima função (o Controller)
        next();
    });
};

module.exports = authMiddleware;