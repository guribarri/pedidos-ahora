// Middleware para verificar si el usuario es administrador
const ADMIN_EMAIL = 'admin@pedidiosahora.com';

const isAdmin = (req, res, next) => {
  // El email del usuario viene en el header o en el body
  const userEmail = req.headers['x-user-email'] || req.body.userEmail;

  if (!userEmail) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  if (userEmail !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Solo administradores pueden realizar esta acción' });
  }

  req.userEmail = userEmail;
  next();
};

module.exports = { isAdmin };
