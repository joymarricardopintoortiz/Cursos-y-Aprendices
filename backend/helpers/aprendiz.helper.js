import Aprendiz from "../models/Aprendiz.js";
import Curso from "../models/Curso.js";

/**
 * Funciones de apoyo para las validaciones de aprendiz.
 * @namespace aprendizHelper
 */
const aprendizHelper = {};

/**
 * Valida que exista un aprendiz con ese id.
 * @param {string} id
 * @throws {Error} Si el aprendiz no existe.
 */
aprendizHelper.validateExistAprendizById = async (id) => {
  const aprendiz = await Aprendiz.findById(id);
  if (!aprendiz) {
    throw new Error("El aprendiz no existe");
  }
};

/**
 * Valida que el curso enviado exista y este activo.
 * @param {string} id
 * @throws {Error} Si el curso no existe o esta inactivo.
 */
aprendizHelper.validateExistCurso = async (id) => {
  const curso = await Curso.findOne({ _id: id, status: 0 });
  if (!curso) {
    throw new Error("El curso no existe o esta inactivo");
  }
};

/**
 * Valida que el aprendiz no este ya matriculado en ese curso.
 * El mismo documento puede estar en varios cursos; solo se bloquea
 * si se repite en el MISMO curso.
 * @param {string} documento
 * @param {string} curso - Id del curso seleccionado.
 * @param {string} [id=null] - Id a excluir (se usa al actualizar).
 * @throws {Error} Si el aprendiz ya esta matriculado en ese curso.
 */
aprendizHelper.validateExistDocumentoCurso = async (documento, curso, id = null) => {
  // Sin curso valido no se consulta la BD: la validacion del curso
  // (isMongoId + existencia) se encarga de reportar el error.
  if (!curso || !/^[0-9a-fA-F]{24}$/.test(curso)) return;
  const aprendiz = await Aprendiz.findOne({ documento: documento.trim(), curso });
  if (aprendiz) {
    if (!id || aprendiz._id.toString() !== id.toString()) {
      throw new Error("El aprendiz ya esta matriculado en este curso");
    }
  }
};

export { aprendizHelper };
