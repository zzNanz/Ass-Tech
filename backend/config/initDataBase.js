const db = require('./database');

const criarTabelas = () => {
  db.serialize(() => {
    
    //Tentando criar a tabela clientes
    db.run(`CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clientName TEXT NOT NULL,
      clientContact TEXT,
      clientDocument TEXT UNIQUE
    )`, (err) => {
      if(err){
        console.error("Erro ao criar tabela de clientes:", err);
      } else{
        console.log("Tabela de clientes criada ou já existe.");
      }
    }),

    //Tentando criar a tabela de garantias
    db.run(`CREATE TABLE IF NOT EXISTS warranties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clientId INTEGER,                 /* NOVO: Liga ao cliente */
      productName TEXT,
      purchaseDate TEXT,
      warrantyEndDate TEXT,
      serialNumber TEXT UNIQUE,
      status TEXT DEFAULT 'Ativa',
      FOREIGN KEY (clientId) REFERENCES clients(id) /* Define a Chave Estrangeira */
    )`, (err) => {
      if(err){
        console.error("Erro ao criar tabela de garantias:", err);
      } else{
        console.log("Tabela de garantias criada ou já existe.");
      }
    }),

    //Tentando criar a tabela usuarios
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`, (err) => {
      if(err){
        console.error("Erro ao criar tabela de usuários:", err);
      } else{
        console.log("Tabela de usuários criada ou já existe.");
      }
    });
  });
}

module.exports = criarTabelas;