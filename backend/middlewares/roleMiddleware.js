
const authorizeRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({
        mensaje: "No tienes permisos para realizar esta acción",
      });
    }

    next();
  };
};

module.exports = authorizeRoles;