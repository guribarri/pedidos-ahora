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
            const result = await pool.query(`SELECT p.id, p.fecha, p.estado, json_agg(json_build_object(
                                                'id_menu', pm.id_menu,
                                                'cantidad', pm.cantidad,
                                                'precio_unitario', pm.precio_unitario,
                                                'nombre', m.nombre,
                                                'descripcion', m.descripcion
                                              )) AS menus
                                             FROM pedidos p
                                             JOIN pedidos_menus pm ON p.id = pm.id_pedido
                                             JOIN menus m ON pm.id_menu = m.id
                                             GROUP BY p.id, p.fecha, p.estado
                                             ORDER BY CASE WHEN p.estado = 'entregado' THEN 1 ELSE 0 END, p.fecha DESC`);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener los pedidos", error: error.message });
        }
    }

    //PATCH actualizar estado del pedido
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { direction } = req.body;

            if (!direction || !['forward', 'backward'].includes(direction)) {
                return res.status(400).json({ message: "Direction debe ser 'forward' o 'backward'" });
            }

            // Obtener el estado actual del pedido
            const pedidoResult = await pool.query("SELECT estado FROM pedidos WHERE id = $1", [id]);

            if (pedidoResult.rows.length === 0) {
                return res.status(404).json({ message: "Pedido no encontrado" });
            }

            const estadoActual = pedidoResult.rows[0].estado;
            let nuevoEstado;

            // Lógica de transición de estados
            if (direction === 'forward') {
                switch(estadoActual) {
                    case 'confirmado':
                        nuevoEstado = 'en_preparacion';
                        break;
                    case 'en_preparacion':
                        nuevoEstado = 'entregado';
                        break;
                    case 'entregado':
                        return res.status(400).json({ message: "No se puede avanzar desde estado Entregado" });
                    default:
                        return res.status(400).json({ message: "Estado inválido" });
                }
            } else {
                switch(estadoActual) {
                    case 'confirmado':
                        return res.status(400).json({ message: "No se puede retroceder desde estado Confirmado" });
                    case 'en_preparacion':
                        nuevoEstado = 'confirmado';
                        break;
                    case 'entregado':
                        nuevoEstado = 'en_preparacion';
                        break;
                    default:
                        return res.status(400).json({ message: "Estado inválido" });
                }
            }

            // Actualizar el estado
            const result = await pool.query("UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING id, fecha, estado", [nuevoEstado, id]);

            res.json({ message: "Estado actualizado exitosamente", pedido: result.rows[0] });
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar el estado del pedido", error: error.message });
        }
    }
}

module.exports = PedidosController;