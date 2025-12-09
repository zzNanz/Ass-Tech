const sqlite3 = require('sqlite3')
const path = require('path');

const dbPath = path.resolve(__dirname, '../database/assistencia.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    throw Error('Erro ao encontrar o banco de dados: ' + err.message);
  } else{
    console.log('Conectado ao banco de dados SQLite em ' + dbPath);
  }
});

module.exports = db;