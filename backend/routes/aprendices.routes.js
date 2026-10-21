import { Router } from "express";
import { aprendizCtrl } from "../controller/aprendiz.controller.js";
import { aprendizVali } from "../validations/aprendiz.validation.js";
import { soloAdmin } from "../middlewares/validateRole.js";

const {
  validateRegisterAprendiz,
  validateUpdateAprendiz,
  validateExistAprendiz,
} = aprendizVali;

const {
  registerAprendiz,
  getAprendices,
  getAprendizId,
  getAprendicesByCurso,
  updateAprendiz,
  activeAprendiz,
  inactiveAprendiz,
} = aprendizCtrl;

const routerAprendiz = Router();

// GET /api/aprendices                 -> lista todos
// Los GET quedan abiertos a cualquier usuario logueado: el Home del usuario
// normal necesita el conteo para sus tarjetas. Lo que se protege es ESCRIBIR.
routerAprendiz.get("/", getAprendices);

// OJO: esta ruta va ANTES de "/:id", de lo contrario Express interpretaria
// la palabra "curso" como si fuera un id.
// GET /api/aprendices/curso/:curso    -> aprendices de un curso
routerAprendiz.get("/curso/:curso", getAprendicesByCurso);

// GET /api/aprendices/:id             -> uno por id
routerAprendiz.get("/:id", validateExistAprendiz, getAprendizId);

// POST /api/aprendices/register       -> crear (solo ADMIN)
// Es la matricula real: aqui se crea el Aprendiz en MongoDB. Si estuviera
// abierta, cualquier usuario logueado podria escribir su propio token desde la
// consola del navegador y matricularse sin que el administrador lo apruebe.
routerAprendiz.post("/register", soloAdmin, validateRegisterAprendiz, registerAprendiz);

// PUT /api/aprendices/update/:id      -> actualizar (solo ADMIN)
routerAprendiz.put("/update/:id", soloAdmin, validateUpdateAprendiz, updateAprendiz);

// PUT /api/aprendices/active/:id      -> activar (solo ADMIN)
routerAprendiz.put("/active/:id", soloAdmin, validateExistAprendiz, activeAprendiz);

// PUT /api/aprendices/inactive/:id    -> desactivar (solo ADMIN)
routerAprendiz.put("/inactive/:id", soloAdmin, validateExistAprendiz, inactiveAprendiz);

export { routerAprendiz };
