const express = require('express');
const app = express();

const userController = new (require('./src/controllers/userController'))();



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