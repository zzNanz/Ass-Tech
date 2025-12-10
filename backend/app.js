const express = require('express');
const criarTabelas = require('./config/initDataBase')

const authRoutes = require('./routes/auth.route');
const clientRoutes = require('./routes/clients.route');
const warrantiesRoutes = require('./routes/warranties.route');

const app = express();
app.use(express.json());

//Carregando as rotas
app.use('/auth', authRoutes);
app.use('/warranties', warrantiesRoutes);
app.use('/clients', clientRoutes);

//Carregando
criarTabelas()

app.get('/', (req, res) => {
    res.json({ message: 'API funcionando!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
