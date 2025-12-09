const express = require('express');
const criarTabelas = require('./config/initDataBase')

const app = express();
app.use(express.json());

//Carregando
criarTabelas()

app.get('/', (req, res) => {
    res.json({ message: 'API funcionando!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
