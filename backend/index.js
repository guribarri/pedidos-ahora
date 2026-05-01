const express = require('express');
const cors = require('cors');
const app = express();

const userController = new (require('./src/controllers/userController'))();

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.get('/', async (req, res) => {
  res.send('API de PedidosAhora funcionando 🚀');
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// User
app.post("/login", userController.login);

app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});