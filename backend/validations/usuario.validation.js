/**
 * @fileoverview Cadenas de validacion para las rutas de usuario.
 * Mismo patron que curso.validation.js: todas las reglas de un campo van
 * encadenadas y separadas por .bail(). Ver la explicacion completa alla.
 * @module validations/usuario.validation
 */
import { check } from "express-validator";
import { validateFields } from "../middlewares/validateFields.js";
import { usuarioHelper } from "../helpers/usuario.helper.js";

const { validateExistEmail, validateExistUsuarioById } = usuarioHelper;

const usuarioVali = {};

/**
 * Valida los datos para registrar un usuario.
 */
usuarioVali.validateRegisterUsuario = [
  check("nombre", "El nombre es obligatorio").notEmpty(),
  check("email", "El email es obligatorio")
    .notEmpty()
    .bail()
    .isEmail()
    .withMessage("El email no es valido")
    .bail()
    .custom(async (email) => {
      await validateExistEmail(email);
    }),
  check("password", "La contraseña es obligatoria")
    .notEmpty()
    .bail()
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
    check("documento", "El documento debe tener de 6 a 12 digitos")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{6,12}$/),
  validateFields,
];

/**
 * Valida los datos para iniciar sesion.
 *
 * Ojo: aqui NO se consulta la base de datos. Si el email existe o no, y si la
 * contraseña coincide, se resuelve en el controlador y con un mensaje generico.
 * Decir "ese email no existe" le confirmaria a un atacante que correos SI estan
 * registrados.
 */
usuarioVali.validateLogin = [
  check("email", "El email es obligatorio")
    .notEmpty()
    .bail()
    .isEmail()
    .withMessage("El email no es valido"),
  check("password", "La contraseña es obligatoria").notEmpty(),
  validateFields,
];

usuarioVali.validateUpdateUsuario = [
  check("id", "El id no es valido")
    .isMongoId()
    .bail()
    .custom(async (id) => {
      await validateExistUsuarioById(id);
    }),
  check("nombre", "El nombre es obligatorio").trim().notEmpty(),
  check("email", "El email es obligatorio")
    .trim()
    .notEmpty()
    .bail()
    .isEmail()
    .withMessage("El email no es valido")
    .bail()
    .matches(/^[^\s@]+@sena\.edu\.co$/i)
    .withMessage("Solo se permiten correos @sena.edu.co")
    .bail()
    .custom(async (email, { req }) => {
      await validateExistEmail(email, req.params.id);
    }),
  check("documento", "El documento debe tener de 6 a 12 digitos")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{6,12}$/),
  check("password", "La contraseña debe tener al menos 6 caracteres")
    .optional({ checkFalsy: true })
    .isLength({ min: 6 }),
  validateFields,
];

export { usuarioVali };
