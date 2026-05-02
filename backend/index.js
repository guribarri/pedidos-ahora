const express = require('express');
const cors = require('cors');
const app = express();

const userController = new (require('./src/controllers/userController'))();
const MenuController = require('./src/controllers/menuController');
const menuController = new MenuController();
const { isAdmin } = require('./src/middleware/authMiddleware');

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

// Menu Routes
// GET todos los menús (público)
app.get("/menus", menuController.getAll.bind(menuController));

// GET menú por ID (público)
app.get("/menus/:id", menuController.getById.bind(menuController));

// POST crear menú (solo admin)
app.post("/menus", isAdmin, menuController.create.bind(menuController));

// PUT actualizar menú (solo admin)
app.put("/menus/:id", isAdmin, menuController.update.bind(menuController));

// DELETE eliminar menú (solo admin)
app.delete("/menus/:id", isAdmin, menuController.delete.bind(menuController));

app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});