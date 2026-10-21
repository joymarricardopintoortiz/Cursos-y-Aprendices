/**
 * @fileoverview Middleware que restringe una ruta a un rol concreto.
 *
 * Va DESPUES de validateJWT y ANTES del controlador. validateJWT ya dejo el
 * usuario cargado en req.usuario, asi que aqui solo se mira su rol:
 *
 *   router.post("/register", validateJWT, soloAdmin, registerAprendiz);
 *
 * Si el rol no coincide, corta con un 403 y el controlador no se ejecuta.
 *
 * 403 (Forbidden) = "se quien eres, pero no tienes permiso para esto".
 * Se distingue del 401: en el 401 el frontend cierra la sesion y manda al login,
 * mientras que con un 403 la sesion sigue siendo valida, simplemente el usuario
 * intento algo que no le corresponde.
 *
 * @module middlewares/validateRole
 */

/**
 * Permite el paso unicamente a los usuarios con rol ADMIN.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const soloAdmin = (req, res, next) => {
  if (req.usuario?.rol === "ADMIN") return next();
  res.status(403).json({ msg: "No tienes permiso para esta operacion" });
};

export { soloAdmin };
