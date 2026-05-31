const pool = require('../db');

class MesasController {
    /**
     * POST /mesas/:numero/acceder?token=...
     * Valida el QR token, crea o se une a la sesión activa de la mesa
     * y devuelve el currentPedidoId si ya existe un pedido en curso.
     */
    async accederMesa(req, res) {
        try {
            const { numero } = req.params;
            const { token } = req.query;

            if (!token) {
                return res.status(400).json({ message: 'Token de mesa requerido' });
            }

            // Validar mesa y token QR
            const mesaResult = await pool.query(
                'SELECT id, numero, estado FROM mesas WHERE numero = $1 AND qr_token = $2',
                [numero, token]
            );

            if (mesaResult.rows.length === 0) {
                return res.status(403).json({ message: 'Token inválido o mesa no encontrada' });
            }

            const mesa = mesaResult.rows[0];

            // Buscar sesión activa para esta mesa
            const sesionResult = await pool.query(
                `SELECT id FROM sesiones_mesas
                 WHERE mesa_id = $1 AND estado = 'activa'
                 ORDER BY fecha_inicio DESC LIMIT 1`,
                [mesa.id]
            );

            let sesionId;
            let currentPedidoId = null;

            if (sesionResult.rows.length === 0) {
                // No hay sesión activa → crear nueva y marcar mesa como ocupada
                const nuevaSesion = await pool.query(
                    `INSERT INTO sesiones_mesas (mesa_id, estado)
                     VALUES ($1, 'activa') RETURNING id`,
                    [mesa.id]
                );
                sesionId = nuevaSesion.rows[0].id;

                await pool.query(
                    `UPDATE mesas SET estado = 'ocupada' WHERE id = $1`,
                    [mesa.id]
                );
            } else {
                // Ya existe sesión activa → unirse y buscar pedido activo
                sesionId = sesionResult.rows[0].id;

                const pedidoResult = await pool.query(
                    `SELECT id FROM pedidos
                     WHERE sesion_mesa_id = $1 AND estado != 'entregado'
                     ORDER BY fecha DESC LIMIT 1`,
                    [sesionId]
                );

                if (pedidoResult.rows.length > 0) {
                    currentPedidoId = pedidoResult.rows[0].id;
                }
            }

            res.json({
                sesionId,
                mesaId: mesa.id,
                mesaNumero: mesa.numero,
                currentPedidoId,
            });
        } catch (error) {
            console.error('Error al acceder a la mesa:', error);
            res.status(500).json({ message: 'Error al acceder a la mesa', error: error.message });
        }
    }

    async cerrarMesa(req, res) {
        try {
            const { numero } = req.params;

            // 1. Buscar la mesa por número para obtener su ID
            const mesaResult = await pool.query('SELECT id FROM mesas WHERE numero = $1', [numero]);
            if (mesaResult.rows.length === 0) {
                return res.status(444).json({ message: 'Mesa no encontrada' });
            }
            const mesaId = mesaResult.rows[0].id;

            // 2. Finalizar la sesión activa de esa mesa
            await pool.query(
                `UPDATE sesiones_mesas 
                 SET estado = 'finalizada', fecha_fin = NOW() 
                 WHERE mesa_id = $1 AND estado = 'activa'`,
                [mesaId]
            );

            // 3. Volver a poner la mesa como 'libre' para el próximo comensal
            await pool.query(
                `UPDATE mesas SET estado = 'libre' WHERE id = $1`,
                [mesaId]
            );

            res.json({ message: `Mesa ${numero} cerrada con éxito y sesión finalizada.` });
        } catch (error) {
            console.error('Error al cerrar la mesa:', error);
            res.status(500).json({ message: 'Error al cerrar la mesa', error: error.message });
        }
    }

    async getAllMesas(req, res) {
        try {
            const result = await pool.query('SELECT * FROM mesas ORDER BY numero');
            res.json(result.rows);
        } catch (error) {
            console.error('Error al obtener mesas:', error);
            res.status(500).json({ message: 'Error al obtener mesas', error: error.message });
        }
    }
}

module.exports = MesasController;
