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

    //GET all pedidos
    async getAll(req, res) {
        try {
            const result = await pool.query(`SELECT p.id, p.fecha, json_agg(json_build_object(
                                                'id_menu', pm.id_menu,
                                                'cantidad', pm.cantidad,
                                                'precio_unitario', pm.precio_unitario,
                                                'nombre', m.nombre,
                                                'descripcion', m.descripcion
                                              )) AS menus
                                             FROM pedidos p
                                             JOIN pedidos_menus pm ON p.id = pm.id_pedido
                                             JOIN menus m ON pm.id_menu = m.id
                                             GROUP BY p.id, p.fecha
                                             ORDER BY p.fecha DESC`);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener los pedidos", error: error.message });
        }
    }   
}

module.exports = PedidosController;