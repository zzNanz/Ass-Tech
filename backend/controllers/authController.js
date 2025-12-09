const db = require('../config/database')

module.exports = {
  
  /**
  * Metodo para realizar o login do usuario
  * @param {Object} req - Objeto de requisição do Express
  * @param {Object} res - Objeto de resposta do Express
  */
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
        return res.json({ 
          success: true, 
          message: 'Login bem-sucedido!', 
          user: row.username,
          userId: row.id
        });
      } else {
        return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
      }
    })
  }
}