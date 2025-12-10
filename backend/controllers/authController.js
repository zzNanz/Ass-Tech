require('dotenv').config()
const db = require('../config/database')
const jwt = require('jsonwebtoken')

const SECRET = process.env.SECRET_KEY;

module.exports = {
  
  /**
  * Metodo para realizar o login do usuario
  * @param {Object} req - Objeto de requisição do Express
  * @param {Object} res - Objeto de resposta do Express
  */
  getter(req, res){
    const sql = "SELECT id, username FROM users ORDER BY username ASC";

    db.all(sql, [], (err, rows) => {
      if (err) {
          console.error("Erro ao listar usuários:", err.message);
          return res.status(500).json({ success: false, message: 'Erro interno ao buscar lista de usuários.' });
      }

        return res.json(rows);
      });
  },

 register(req, res){
    const { username, password } = req.body;

    if(!username || !password){
      return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios.' });
    }

    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    const params = [username, password];

    db.run(sql, params, function (err) {
      if (err) {
          // Erro 19: CONSTRAINT_UNIQUE (usuário já existe)
          if (err.errno === 19) {
              return res.status(409).json({ success: false, message: 'Nome de usuário já está em uso.' });
          }
          console.error("Erro ao cadastrar novo usuário:", err.message);
          return res.status(500).json({ success: false, message: 'Erro interno ao cadastrar usuário.' });
      }

      // Sucesso na inserção
      return res.status(201).json({ 
          success: true, 
          message: 'Novo atendente cadastrado com sucesso!', 
          userId: this.lastID,
          username: username
      });
    });
 },
  
  /**
  * Metodo para realizar o login do usuario
  * @param {Object} req - Objeto de requisição do Express
  * @param {Object} res - Objeto de resposta do Express
  */
  login(req, res){
    const { username, password } = req.body;

    if(!username || !password){
      return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios.' });
    }

    const sql = "SELECT id, username FROM users WHERE username = ? AND password = ?";
    db.get(sql, [username, password], (err, row) => {
      if(err){
        console.error("Erro ao consultar o usuário:", err);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
      }

      if(row){
        const payload = {
          id: row.id,
          username: row.username
        };
        
        const token = jwt.sign(payload, SECRET, {expiresIn: '1h'});
        
        return res.json({
          success: true, 
          message: 'Login realizado', 
          token: token, 
          user: row.username
        });
        
      } else {
        return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
      }
    })
  }
}