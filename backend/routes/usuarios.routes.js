import { Router } from "express";
import { usuarioCtrl } from "../controller/usuario.controller.js";
import { usuarioVali } from "../validations/usuario.validation.js";
import { validateJWT } from "../middlewares/validateJWT.js";
import { soloAdmin } from "../middlewares/validateRole.js";

const { validateRegisterUsuario, validateLogin, validateUpdateUsuario } = usuarioVali;
const { registerUsuario, loginUsuario, getUsuarios, updateUsuario } = usuarioCtrl;

const routerUsuario = Router();

const puedeEditar = (req, res, next) => {
  if (req.usuario.rol === "ADMIN" || req.usuario._id.toString() === req.params.id) return next();
  res.status(403).json({ msg: "No tienes permiso para esta operacion" });
};

routerUsuario.post("/login", validateLogin, loginUsuario);

routerUsuario.post("/register", validateJWT, validateRegisterUsuario, registerUsuario);

routerUsuario.get("/", validateJWT, soloAdmin, getUsuarios);

routerUsuario.put("/update/:id", validateJWT, puedeEditar, validateUpdateUsuario, updateUsuario);

export { routerUsuario };