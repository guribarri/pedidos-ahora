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

            // 2. Obtener la sesión activa para esta mesa
            const sesionResult = await pool.query(
                `SELECT id FROM sesiones_mesas WHERE mesa_id = $1 AND estado = 'activa' ORDER BY fecha_inicio DESC LIMIT 1`,
                [mesaId]
            );

            if (sesionResult.rows.length === 0) {
                return res.status(400).json({ message: 'No hay sesión activa para esta mesa' });
            }

            const sesionId = sesionResult.rows[0].id;

            // 3. Verificar que al menos un pedido haya solicitado la cuenta (estado 'cuenta_pedida')
            // 3. Verificar que la sesión tenga la bandera 'cuenta_solicitada'
            // Asegurarnos que la columna exista (para despliegues que no recrearon la DB)
            await pool.query("ALTER TABLE sesiones_mesas ADD COLUMN IF NOT EXISTS cuenta_solicitada BOOLEAN DEFAULT false");

            const cuentaReqResult = await pool.query(
                `SELECT cuenta_solicitada FROM sesiones_mesas WHERE id = $1`,
                [sesionId]
            );

            const cuentaSolicitada = cuentaReqResult.rows.length > 0 && cuentaReqResult.rows[0].cuenta_solicitada;
            if (!cuentaSolicitada) {
                return res.status(400).json({ message: 'No se puede cerrar la mesa: no se solicitó la cuenta para esta sesión.' });
            }

            // 4. Marcar como 'pagado' aquellos pedidos que estén en 'entregado' o en cualquier estado pendiente
            const updateResult = await pool.query(
                `UPDATE pedidos SET estado = 'pagado' WHERE sesion_mesa_id = $1 AND estado != 'pagado' RETURNING id`,
                [sesionId]
            );

            // 5. Finalizar la sesión activa de esa mesa
            await pool.query(
                `UPDATE sesiones_mesas 
                 SET estado = 'finalizada', fecha_fin = NOW() 
                 WHERE id = $1`,
                [sesionId]
            );

            // 6. Volver a poner la mesa como 'libre' para el próximo comensal
            await pool.query(
                `UPDATE mesas SET estado = 'libre' WHERE id = $1`,
                [mesaId]
            );

            res.json({ message: `Mesa ${numero} cerrada con éxito y ${updateResult.rowCount} pedido(s) marcado(s) como pagado.` });
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

    async getSession(req, res) {
        try {
            const { id } = req.params;
            // Asegurarnos que la columna exista
            await pool.query("ALTER TABLE sesiones_mesas ADD COLUMN IF NOT EXISTS cuenta_solicitada BOOLEAN DEFAULT false");

            const result = await pool.query('SELECT id, mesa_id, fecha_inicio, fecha_fin, estado, cuenta_solicitada FROM sesiones_mesas WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Sesión no encontrada' });
            }
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error al obtener sesión:', error);
            res.status(500).json({ message: 'Error al obtener sesión', error: error.message });
        }
    }

    async solicitarCuenta(req, res) {
        try {
            const { id } = req.params;
            // Asegurarnos que la columna exista
            await pool.query("ALTER TABLE sesiones_mesas ADD COLUMN IF NOT EXISTS cuenta_solicitada BOOLEAN DEFAULT false");

            const sesionResult = await pool.query('SELECT id, estado FROM sesiones_mesas WHERE id = $1', [id]);
            if (sesionResult.rows.length === 0) {
                return res.status(404).json({ message: 'Sesión no encontrada' });
            }

            if (sesionResult.rows[0].estado !== 'activa') {
                return res.status(400).json({ message: 'La sesión no está activa' });
            }

            await pool.query('UPDATE sesiones_mesas SET cuenta_solicitada = true WHERE id = $1', [id]);

            res.json({ message: 'Cuenta solicitada para la sesión' });
        } catch (error) {
            console.error('Error al solicitar cuenta:', error);
            res.status(500).json({ message: 'Error al solicitar la cuenta', error: error.message });
        }
    }
}

module.exports = MesasController;
