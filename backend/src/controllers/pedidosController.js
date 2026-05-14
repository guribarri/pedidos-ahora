const pool = require("../db");

class PedidosController {
    // POST crear pedido
    async create(req, res) {
        try {
            const { menus } = req.body;

            // Validar que haya al menos un menú
            if (!menus || menus.length === 0) {
                return res.status(400).json({ message: "El pedido debe contener al menos un menú" });
            }

            // Validar estructura de cada menú
            for (const menu of menus) {
                if (!menu.menu_id || !menu.cantidad || !menu.precio_unitario) {
                    return res.status(400).json({ message: "Cada menú debe contener menu_id, cantidad y precio_unitario" });
                }
            }

            // Crear el pedido (Postgres: DEFAULT VALUES)
            const result = await pool.query("INSERT INTO pedidos DEFAULT VALUES RETURNING id");
            const pedido_id = result.rows[0].id;

            // Insertar los menús del pedido (parámetros $1..$4 para pg)
            const insertMenusQuery = "INSERT INTO pedidos_menus (id_pedido, id_menu, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)";
            for (const menu of menus) {
                await pool.query(insertMenusQuery, [pedido_id, menu.menu_id, menu.cantidad, menu.precio_unitario]);
            }

            res.status(201).json({ message: "Pedido confirmado con exito", pedido_id });
        } catch (error) {
            res.status(500).json({ message: "Error al crear el pedido", error: error.message });
        }
    }
}

module.exports = PedidosController;