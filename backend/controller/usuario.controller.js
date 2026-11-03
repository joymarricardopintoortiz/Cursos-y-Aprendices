import bcrypt from "bcryptjs";

import Usuario from "../models/Usuario.js";
import { generarJWT } from "../helpers/generarJWT.js";

const usuarioCtrl = {};

/**
 * Registrar un nuevo usuario.
 *
 * La contraseña NUNCA se guarda tal cual. Se le aplica un hash con bcrypt:
 *   "123456"  ->  "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
 *
 * El hash va en un solo sentido: de la contraseña se saca el hash, pero del
 * hash no se puede volver a la contraseña. Por eso al iniciar sesion no se
 * "desencripta" nada: se hashea lo que escribio el usuario y se comparan los
 * dos hashes (eso hace bcrypt.compareSync).
 *
 * El "salt" es un texto aleatorio que se mezcla antes de hashear, para que dos
 * personas con la misma contraseña no terminen con el mismo hash.
 */
usuarioCtrl.registerUsuario = async (req, res) => {
  const { nombre, email, password, documento } = req.body;
  try {
    const newUsuario = new Usuario({
      nombre: nombre.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
      documento: (documento || "").trim(),
      password,
    });

    // Hashear antes de guardar
    const salt = bcrypt.genSaltSync(10);
    newUsuario.password = bcrypt.hashSync(password, salt);

    await newUsuario.save();
    res.json({ msg: "Usuario registrado correctamente" });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

/**
 * Iniciar sesion.
 *
 * Responde { usuario, token }. El "usuario" sale sin password gracias al
 * metodo toJSON del modelo.
 *
 * Fijense que los tres errores posibles (email que no existe, usuario inactivo,
 * contraseña equivocada) responden casi lo mismo. Es a proposito: si dijeramos
 * "ese email no existe", le estariamos confirmando a un atacante cuales correos
 * SI estan registrados.
 *
 * Ademas responden 200 con { error } y NO 400: un 400 se marca solo en la
 * consola del navegador (peticion fallida en rojo) aunque el frontend lo
 * muestre bonito. El frontend revisa data.error y pinta el mensaje en el
 * formulario, asi la consola queda limpia.
 */
usuarioCtrl.loginUsuario = async (req, res) => {
  const { email, password } = req.body;
  try {
    const usuario = await Usuario.findOne({ email: email.toLowerCase().trim() });

    if (!usuario) {
      return res.json({ error: "Usuario o contraseña incorrectos" });
    }

    if (usuario.status !== 0) {
      return res.json({ error: "El usuario esta inactivo" });
    }

    // Compara la contraseña escrita contra el hash guardado.
    const passwordValido = bcrypt.compareSync(password, usuario.password);

    if (!passwordValido) {
      return res.json({ error: "Usuario o contraseña incorrectos" });
    }

    // Todo bien: se genera el token con el id del usuario adentro.
    const token = await generarJWT(usuario._id);

    res.json({ usuario, token });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

usuarioCtrl.getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

usuarioCtrl.updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, documento, password } = req.body;
  try {
    const cambios = {
      nombre: nombre.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
      documento: (documento || "").trim(),
    };
    if (password) {
      cambios.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    }
    const usuario = await Usuario.findByIdAndUpdate(id, cambios, { new: true });
    res.json({ msg: "Usuario actualizado correctamente", usuario });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

/**
 * Consulta si un correo esta disponible.
 *
 * Los usuarios normales NO pueden leer la lista completa de usuarios
 * (GET / es solo ADMIN), pero necesitan saber si su correo ya existe antes
 * de guardar el perfil. El correo del propio usuario se reporta como
 * disponible para que pueda conservarlo.
 *
 * GET /api/usuarios/email-disponible?email=x@sena.edu.co
 * Responde { disponible: true | false }
 */
usuarioCtrl.verificarEmail = async (req, res) => {
  const { email } = req.query;
  try {
    const mail = String(email ?? "").toLowerCase().trim();
    const existe = await Usuario.findOne({ email: mail });
    const esMio = existe?._id.toString() === req.usuario._id.toString();
    res.json({ disponible: !existe || esMio });
  } catch (error) {
    res.status(400).json({ msg: "No fue posible terminar la operacion" });
  }
};

export { usuarioCtrl };
