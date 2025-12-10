const db = require('../config/database');

module.exports = {
  /**
   * Metodo responsavel por encontrar ou criar um cliente
   * @param {Object} req 
   * @param {Object} res  
   */
  findorCreateClient(req, res, next){
    const { clientName, clientContact, clientDocument } = req.body;

    if (!clientName || !clientDocument) {
      return res.status(400).json({ success: false, message: 'Nome e Documento do cliente são obrigatórios.' });
    }

    const sqlFind = "SELECT id FROM clients WHERE clientDocument = ?";

    db.get(sqlFind, [clientDocument], (err, row) => {
      if (err) {
        console.error("Erro ao buscar cliente:", err.message);
        return res.status(500).json({ success: false, message: 'Erro interno ao buscar cliente.' });
      }

      if (row) {
        // Caso 1: Cliente ENCONTRADO
        // Anexa o ID existente e avança
        req.clientId = row.id;
        next();
      } else {
        // Caso 2: Cliente NÃO encontrado (Insere novo)
        const sqlInsert = "INSERT INTO clients (clientName, clientContact, clientDocument) VALUES (?, ?, ?)";
        const params = [clientName, clientContact, clientDocument];

        db.run(sqlInsert, params, function (errInsert) {
          if (errInsert) {
              console.error("Erro ao inserir novo cliente:", errInsert.message);
              return res.status(500).json({ success: false, message: 'Erro ao cadastrar novo cliente.' });
          }
                    
          // Anexa o ID recém-criado e avança
          req.clientId = this.lastID;
          next(); 
        });
      }
    })
  }
}