const express = require('express');
const cors = require('cors');
const app = express();

const userController = new (require('./src/controllers/userController'))();
const MenuController = require('./src/controllers/menuController');
const menuController = new MenuController();
const PedidosController = require('./src/controllers/pedidosController');
const pedidosController = new PedidosController();
const MesasController = require('./src/controllers/mesasController');
const mesasController = new MesasController();
const { isAdmin, isAuthenticated } = require('./src/middleware/authMiddleware');

// Configurar CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'http://localhost:3000' : true,
  credentials: true,
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

// PATCH alternar visibilidad (solo admin)
app.patch("/menus/:id/visibility", isAdmin, menuController.toggleVisibility.bind(menuController));

// Mesas Routes
// POST acceder a mesa por QR (público)
app.post("/mesas/:numero/acceder", mesasController.accederMesa.bind(mesasController));
// GET todas las mesas (solo admin)
app.get("/mesas", isAdmin, mesasController.getAllMesas.bind(mesasController));

//POST crear pedido (público)
app.post("/pedidos", pedidosController.create.bind(pedidosController));
// GET pedidos del usuario actual
app.get("/pedidos/usuario", pedidosController.getByUser.bind(pedidosController));
// GET pedido por ID para el usuario actual
app.get("/pedidos/:id", pedidosController.getById.bind(pedidosController));
// PATCH agregar menús a un pedido existente para el usuario actual
app.patch("/pedidos/:id/menus", pedidosController.addMenus.bind(pedidosController));
// GET todos los pedidos (solo admin)
app.get("/pedidos", isAdmin, pedidosController.getAll.bind(pedidosController));
// PATCH actualizar estado del pedido (autenticado)
app.patch("/pedidos/:id/estado", isAuthenticated, pedidosController.updateStatus.bind(pedidosController));


app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});