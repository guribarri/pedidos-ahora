const pool = require("../db");

class PedidosController {
    async getPedidoById(id, userEmail = null, sesionMesaId = null) {
        try {
            const queryParams = [id];
            let query = `
                SELECT p.id, p.fecha, p.estado, p.user_email,
                       p.mesa_id, p.sesion_mesa_id, mesa.numero AS mesa_numero
                FROM pedidos p
                LEFT JOIN mesas mesa ON p.mesa_id = mesa.id
                WHERE p.id = $1
            `;

            // Filtrar por email solo si no es un pedido de mesa compartido
            if (userEmail && !sesionMesaId) {
                query += ' AND p.user_email = $2';
                queryParams.push(userEmail);
            }

            const pedidoResult = await pool.query(query, queryParams);
            
            if (pedidoResult.rows.length === 0) {
                return null;
            }

            const pedido = pedidoResult.rows[0];

            // Obtener los menús asociados
            const menusResult = await pool.query(`
                SELECT pm.id_menu, pm.cantidad, pm.precio_unitario, m.nombre, m.descripcion
                FROM pedidos_menus pm
                JOIN menus m ON pm.id_menu = m.id
                WHERE pm.id_pedido = $1
            `, [id]);

            pedido.menus = menusResult.rows;
            return pedido;
        } catch (error) {
            console.error('Error en getPedidoById:', error);
            return null;
        }
    }

    // POST crear pedido
    async create(req, res) {
        try {
            const { menus } = req.body;
            const userEmail = req.headers['x-user-email'] || req.body.userEmail || null;
            const mesaId = req.headers['x-mesa-id'] ? parseInt(req.headers['x-mesa-id']) : null;
            const sesionMesaId = req.headers['x-sesion-mesa-id'] ? parseInt(req.headers['x-sesion-mesa-id']) : null;

            // Requiere email O que sea un pedido de mesa
            if (!userEmail && !mesaId) {
                return res.status(400).json({ message: "El email del usuario es requerido en el header x-user-email" });
            }

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

            // Crear el pedido (con o sin mesa)
            const result = await pool.query(
                "INSERT INTO pedidos (user_email, mesa_id, sesion_mesa_id) VALUES ($1, $2, $3) RETURNING id",
                [userEmail, mesaId, sesionMesaId]
            );
            const pedido_id = result.rows[0].id;

            const insertMenusQuery = "INSERT INTO pedidos_menus (id_pedido, id_menu, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)";
            for (const menu of menus) {
                await pool.query(insertMenusQuery, [pedido_id, menu.menu_id, menu.cantidad, menu.precio_unitario]);
            }

            const pedido = await this.getPedidoById(pedido_id, userEmail, sesionMesaId);
            res.status(201).json({ message: "Pedido confirmado con exito", pedido });
        } catch (error) {
            console.error('Error al crear pedido:', error);
            res.status(500).json({ message: "Error al crear el pedido", error: error.message });
        }
    }

    async getByUser(req, res) {
        try {
            const userEmail = req.headers['x-user-email'] || req.body.userEmail;
            if (!userEmail) {
                return res.status(400).json({ message: "El email del usuario es requerido" });
            }

            const result = await pool.query(`
                SELECT p.id, p.fecha, p.estado, p.user_email
                FROM pedidos p
                WHERE p.user_email = $1
                ORDER BY CASE WHEN p.estado = 'entregado' THEN 1 ELSE 0 END, p.fecha DESC
            `, [userEmail]);

            // Obtener menús para cada pedido
            const pedidos = await Promise.all(result.rows.map(async (pedido) => {
                const menusResult = await pool.query(`
                    SELECT pm.id_menu, pm.cantidad, pm.precio_unitario, m.nombre, m.descripcion
                    FROM pedidos_menus pm
                    JOIN menus m ON pm.id_menu = m.id
                    WHERE pm.id_pedido = $1
                `, [pedido.id]);
                
                pedido.menus = menusResult.rows;
                return pedido;
            }));

            res.json(pedidos);
        } catch (error) {
            console.error('Error al obtener pedidos del usuario:', error);
            res.status(500).json({ message: "Error al obtener los pedidos del usuario", error: error.message });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const userEmail = req.headers['x-user-email'] || req.body.userEmail || null;
            const sesionMesaId = req.headers['x-sesion-mesa-id'] ? parseInt(req.headers['x-sesion-mesa-id']) : null;

            const pedido = await this.getPedidoById(id, userEmail, sesionMesaId);
            if (!pedido) {
                return res.status(404).json({ message: "Pedido no encontrado" });
            }

            res.json(pedido);
        } catch (error) {
            console.error('Error al obtener el pedido:', error);
            res.status(500).json({ message: "Error al obtener el pedido", error: error.message });
        }
    }

    async addMenus(req, res) {
        try {
            const { id } = req.params;
            const { menus } = req.body;
            const userEmail = req.headers['x-user-email'] || req.body.userEmail || null;
            const sesionMesaId = req.headers['x-sesion-mesa-id'] ? parseInt(req.headers['x-sesion-mesa-id']) : null;

            if (!menus || menus.length === 0) {
                return res.status(400).json({ message: "El pedido debe contener al menos un menú" });
            }

            const pedidoResult = await pool.query(
                "SELECT user_email, sesion_mesa_id FROM pedidos WHERE id = $1", [id]
            );
            if (pedidoResult.rows.length === 0) {
                return res.status(404).json({ message: "Pedido no encontrado" });
            }

            const pedidoOwnerEmail = pedidoResult.rows[0].user_email;
            const pedidoSesionId = pedidoResult.rows[0].sesion_mesa_id;

            // Permitir acceso si: es de mesa con sesion correcta, o es el dueño por email
            const esDeMesa = pedidoSesionId && sesionMesaId && pedidoSesionId === sesionMesaId;
            if (!esDeMesa && pedidoOwnerEmail && pedidoOwnerEmail !== userEmail) {
                return res.status(403).json({ message: "No tienes permiso para modificar este pedido" });
            }

            for (const menu of menus) {
                if (!menu.menu_id || !menu.cantidad || !menu.precio_unitario) {
                    return res.status(400).json({ message: "Cada menú debe contener menu_id, cantidad y precio_unitario" });
                }
            }

            const selectExistingQuery = "SELECT cantidad FROM pedidos_menus WHERE id_pedido = $1 AND id_menu = $2";
            const updateQuery = "UPDATE pedidos_menus SET cantidad = $1 WHERE id_pedido = $2 AND id_menu = $3";
            const insertQuery = "INSERT INTO pedidos_menus (id_pedido, id_menu, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)";

            for (const menu of menus) {
                const existing = await pool.query(selectExistingQuery, [id, menu.menu_id]);
                if (existing.rows.length > 0) {
                    const newCantidad = existing.rows[0].cantidad + menu.cantidad;
                    await pool.query(updateQuery, [newCantidad, id, menu.menu_id]);
                } else {
                    await pool.query(insertQuery, [id, menu.menu_id, menu.cantidad, menu.precio_unitario]);
                }
            }

            const pedido = await this.getPedidoById(id, userEmail, sesionMesaId);
            res.json({ message: "Menús agregados al pedido", pedido });
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar el pedido", error: error.message });
        }
    }

    //GET all pedidos
    async getAll(req, res) {
        try {
            const result = await pool.query(`
                SELECT p.id, p.fecha, p.estado, p.user_email, p.mesa_id, p.sesion_mesa_id, m.numero as mesa_numero
                FROM pedidos p
                LEFT JOIN mesas m ON p.mesa_id = m.id
                ORDER BY CASE WHEN p.estado = 'entregado' THEN 1 ELSE 0 END, p.fecha DESC
            `);

            // Obtener menús para cada pedido
            const pedidos = await Promise.all(result.rows.map(async (pedido) => {
                const menusResult = await pool.query(`
                    SELECT pm.id_menu, pm.cantidad, pm.precio_unitario, m.nombre, m.descripcion
                    FROM pedidos_menus pm
                    JOIN menus m ON pm.id_menu = m.id
                    WHERE pm.id_pedido = $1
                `, [pedido.id]);
                
                pedido.menus = menusResult.rows;
                return pedido;
            }));

            res.json(pedidos);
        } catch (error) {
            console.error('Error al obtener los pedidos:', error);
            res.status(500).json({ message: "Error al obtener los pedidos", error: error.message });
        }
    }

    //PATCH actualizar estado del pedido
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { direction } = req.body;
            const userEmail = req.headers['x-user-email'] || req.body.userEmail;

            if (!direction || !['forward', 'backward'].includes(direction)) {
                return res.status(400).json({ message: "Direction debe ser 'forward' o 'backward'" });
            }

            // Obtener el estado actual del pedido y el propietario
            const pedidoResult = await pool.query("SELECT estado, user_email FROM pedidos WHERE id = $1", [id]);

            if (pedidoResult.rows.length === 0) {
                return res.status(404).json({ message: "Pedido no encontrado" });
            }

            const { estado: estadoActual, user_email: pedidoOwnerEmail } = pedidoResult.rows[0];

            // Verificar que el usuario sea propietario del pedido o admin
            if (pedidoOwnerEmail && pedidoOwnerEmail !== userEmail) {
                return res.status(403).json({ message: "No tienes permiso para actualizar este pedido" });
            }

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