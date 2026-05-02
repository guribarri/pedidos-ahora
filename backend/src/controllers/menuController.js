const pool = require("../db");

class MenuController {
  // GET todos los menús
  async getAll(req, res) {
    try {
      const result = await pool.query("SELECT * FROM menus ORDER BY id ASC");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener menús" });
    }
  }

  // GET menú por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query("SELECT * FROM menus WHERE id = $1", [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Menú no encontrado" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener menú" });
    }
  }

  // POST crear menú (solo admin)
  async create(req, res) {
    try {
      const { nombre, descripcion, precio } = req.body;

      // Validación
      if (!nombre || precio === undefined) {
        return res.status(400).json({ error: "nombre y precio son requeridos" });
      }

      if (isNaN(precio) || precio < 0) {
        return res.status(400).json({ error: "precio debe ser un número positivo" });
      }

      const result = await pool.query(
        "INSERT INTO menus (nombre, descripcion, precio) VALUES ($1, $2, $3) RETURNING *",
        [nombre, descripcion || null, precio]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al crear menú" });
    }
  }

  // PUT actualizar menú (solo admin)
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, precio } = req.body;

      // Validar que existe el menú
      const existingMenu = await pool.query("SELECT * FROM menus WHERE id = $1", [id]);
      if (existingMenu.rows.length === 0) {
        return res.status(404).json({ error: "Menú no encontrado" });
      }

      // Preparar valores a actualizar
      const updatedNombre = nombre !== undefined ? nombre : existingMenu.rows[0].nombre;
      const updatedDescripcion = descripcion !== undefined ? descripcion : existingMenu.rows[0].descripcion;
      const updatedPrecio = precio !== undefined ? precio : existingMenu.rows[0].precio;

      if (isNaN(updatedPrecio) || updatedPrecio < 0) {
        return res.status(400).json({ error: "precio debe ser un número positivo" });
      }

      const result = await pool.query(
        "UPDATE menus SET nombre = $1, descripcion = $2, precio = $3 WHERE id = $4 RETURNING *",
        [updatedNombre, updatedDescripcion, updatedPrecio, id]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al actualizar menú" });
    }
  }

  // DELETE menú (solo admin)
  async delete(req, res) {
    try {
      const { id } = req.params;

      // Validar que existe el menú
      const result = await pool.query("SELECT * FROM menus WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Menú no encontrado" });
      }

      await pool.query("DELETE FROM menus WHERE id = $1", [id]);
      res.json({ message: "Menú eliminado correctamente" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al eliminar menú" });
    }
  }
}

module.exports = MenuController;
