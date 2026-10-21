import { Router } from "express";
import { cursoCtrl } from "../controller/curso.controller.js";
import { cursoVali } from "../validations/curso.validation.js";
import { soloAdmin } from "../middlewares/validateRole.js";

const {
  validateRegisterCurso,
  validateUpdateCurso,
  validateExistCurso,
} = cursoVali;

const {
  registerCurso,
  getCursos,
  getCursoId,
  updateCurso,
  activeCurso,
  inactiveCurso,
} = cursoCtrl;

const routerCurso = Router();

// GET    /api/cursos            -> lista todos
// Los GET quedan abiertos a cualquier usuario logueado: tanto el Home como la
// pagina de Cursos del usuario normal piden el listado para mostrar las
// tarjetas y la tabla. Lo que se protege es ESCRIBIR.
routerCurso.get("/", getCursos);

// GET    /api/cursos/:id        -> uno por id
routerCurso.get("/:id", validateExistCurso, getCursoId);

// POST   /api/cursos/register   -> crear (solo ADMIN)
routerCurso.post("/register", soloAdmin, validateRegisterCurso, registerCurso);

// PUT    /api/cursos/update/:id -> actualizar (solo ADMIN)
routerCurso.put("/update/:id", soloAdmin, validateUpdateCurso, updateCurso);

// PUT    /api/cursos/active/:id -> activar (solo ADMIN)
routerCurso.put("/active/:id", soloAdmin, validateExistCurso, activeCurso);

// PUT    /api/cursos/inactive/:id -> desactivar (solo ADMIN)
routerCurso.put("/inactive/:id", soloAdmin, validateExistCurso, inactiveCurso);

export { routerCurso };
