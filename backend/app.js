const express = require('express');
const cors = require('cors');
const criarTabelas = require('./config/initDataBase')

const authMiddleware = require('./middleware/authMiddleware');
const clientController = require('./controllers/clientController');

const authRoutes = require('./routes/auth.route');
const clientRoutes = require('./routes/clients.route');
const warrantiesRoutes = require('./routes/warranties.route');

const app = express();
app.use(express.json());
app.use(cors());

//Carregando as rotas
app.use('/auth', authRoutes);
app.use('/warranties', warrantiesRoutes);
app.get('/clients', authMiddleware, clientController.listClients);


//Carregando
criarTabelas()

app.get('/', (req, res) => {
    res.json({ message: 'API funcionando!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
