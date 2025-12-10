const db = require('../config/database')

module.exports = {

  /**
   * Metodo responsavel por adicionar uma nova garantia
   * @param {Object} req 
   * @param {Object} res  
   */
  addWarranty(req, res){
    // O clientId é fornecido pelo middleware clientController
    const clientId = req.clientId; 
        
    // Pega os dados da garantia do corpo da requisição
    const { productName, purchaseDate, warrantyEndDate, serialNumber, status } = req.body; 
        
    if (!clientId || !productName || !serialNumber || !purchaseDate) {
        return res.status(400).json({ success: false, message: 'Dados da garantia ou ID do cliente estão faltando.' });
    }

    // Comando SQL para inserção de dados
    // Usamos '?' como placeholders para segurança (prevenção de SQL Injection)
    const sql = `INSERT INTO warranties 
                (clientId, productName, purchaseDate, warrantyEndDate, serialNumber, status) 
                VALUES (?, ?, ?, ?, ?, ?)`;
        
    const params = [
      clientId, 
      productName, 
      purchaseDate, 
      warrantyEndDate, 
      serialNumber, 
      status || 'Ativa' // Usa 'Ativa' como padrão se 'status' não for fornecido
    ];

    // db.run() é usado para comandos que modificam o BD (INSERT, UPDATE, DELETE)
    db.run(sql, params, function (err) {
      if (err) {
        console.error("Erro ao adicionar garantia:", err.message);
        // Erro comum: número de série duplicado (CONSTRAINT UNIQUE)
        if (err.errno === 19) { 
          return res.status(409).json({ success: false, message: 'Erro: Número de série já cadastrado.' });
        }
        return res.status(500).json({ success: false, message: 'Erro interno ao salvar garantia.' });
      }
            
      // this.lastID retorna o ID gerado automaticamente para o novo registro
      return res.status(201).json({ 
        success: true, 
        message: 'Garantia adicionada com sucesso!', 
        id: this.lastID 
      });
    });
  },

  /**
   * Metodo responsavel por listar todas as garantias
   * @param {Object} req 
   * @param {Object} res  
   */
  listWarranties(req,res){
    const sql = `
      SELECT 
        w.*, 
        c.clientName, 
        c.clientDocument 
      FROM warranties w
      JOIN clients c ON w.clientId = c.id
      ORDER BY w.warrantyEndDate DESC`;

    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error("Erro ao listar garantias:", err.message);
        return res.status(500).json({ success: false, message: 'Erro ao buscar lista de garantias.' });
      }
      return res.json(rows);
    })
  },
  
  /** 
   * Buscar uma garantia específica por ID
   * @param {Object} req 
   * @param {Object} res  
   */
  getWarrantyById(req,res){
    const id = req.params.id;

    const sql = `
      SELECT 
          w.*, 
          c.clientName, 
          c.clientDocument,
          c.clientContact
      FROM warranties w
      JOIN clients c ON w.clientId = c.id
      WHERE w.id = ?`;

      db.get(sql, [id], (err, row) => {
        if (err) {
          console.error("Erro ao buscar garantia:", err.message);
          return res.status(500).json({ success: false, message: 'Erro interno ao buscar garantia.' });
        }

        if (!row) {
          return res.status(404).json({ success: false, message: 'Garantia não encontrada.' });
        }
            
        return res.json(row);
      })
  },

  /**
   * Atualizar uma garantia existente pelo ID
   * @param {Object} req 
   * @param {Object} res 
   */
  updateWarranty(req,res){
    const id = req.params.id;
    const { productName, purchaseDate, warrantyEndDate, serialNumber, status } = req.body;

    if (!productName && !purchaseDate && !warrantyEndDate && !serialNumber && !status) {
      return res.status(400).json({ success: false, message: 'Nenhum campo de garantia fornecido para atualização.' });
    }

    let updates = [];
    let params = [];

    if (productName) { updates.push("productName = ?"); params.push(productName); }
    if (purchaseDate) { updates.push("purchaseDate = ?"); params.push(purchaseDate); }
    if (warrantyEndDate) { updates.push("warrantyEndDate = ?"); params.push(warrantyEndDate); }
    if (serialNumber) { updates.push("serialNumber = ?"); params.push(serialNumber); }
    if (status) { updates.push("status = ?"); params.push(status); }
    
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Dados inválidos ou vazios.' });
    }

    params.push(id);

    const sql = `UPDATE warranties SET ${updates.join(', ')} WHERE id = ?`;

    db.run(sql, params, function (err) {
      if (err) {
          console.error("Erro ao atualizar garantia:", err.message);
          return res.status(500).json({ success: false, message: 'Erro ao atualizar a garantia.' });
      }
            
      if (this.changes === 0) {
           return res.status(404).json({ success: false, message: 'Garantia não encontrada ou nenhum dado alterado.' });
      }
            
      return res.json({ success: true, message: 'Garantia atualizada com sucesso!', changes: this.changes });
    });
  },
  
  deleteWarranty(req, res){
    const id = req.params.id;

    const sql = "DELETE FROM warranties WHERE id = ?";
        
    db.run(sql, [id], function (err) {
      if (err) {
          console.error("Erro ao deletar garantia:", err.message);
          return res.status(500).json({ success: false, message: 'Erro ao deletar a garantia.' });
      }
            
      if (this.changes === 0) {
          return res.status(404).json({ success: false, message: 'Garantia não encontrada.' });
      }

      return res.json({ success: true, message: 'Garantia deletada com sucesso!', changes: this.changes });
    });
  }
}