/**
 * Script de busqueda y eliminacion de aprendices (para limpiar duplicados).
 *
 * Conecta a la base de datos indicada en MONGO_URL y permite:
 *   1) Buscar aprendices por nombre, email o documento (SOLO LECTURA, no borra nada).
 *   2) Eliminar un aprendiz concreto por su _id.
 *
 * USO:
 *   node scripts/delete-aprendiz.js "joymar"          -> lista los aprendices que coinciden
 *   node scripts/delete-aprendiz.js --id <_id>        -> elimina el aprendiz con ese _id
 *
 * OJO: la eliminacion es PERMANENTE. Primero ejecuta la busqueda, revisa el _id
 * que quieres quitar y luego ejecuta la eliminacion con --id.
 */
import dns from "dns";
import mongoose from "mongoose";
import * as dotenv from "dotenv";

import Aprendiz from "../models/Aprendiz.js";
// Importar Curso registra el modelo en Mongoose, necesario para poder usar
// populate("curso") en las busquedas (mismo truco que en seed.js).
import Curso from "../models/Curso.js";

dotenv.config();

// Mismo arreglo que en database.js y seed.js: forzar un DNS publico para que
// las cadenas "mongodb+srv://" funcionen tambien en redes que rechazan SRV.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

/**
 * Imprime los datos de un aprendiz en pantalla.
 * @param {import("mongoose").Document} a
 */
const mostrar = (a) => {
  console.log(`  _id:       ${a._id}`);
  console.log(`  nombre:    ${a.nombre}`);
  console.log(`  email:     ${a.email}`);
  console.log(`  documento: ${a.documento}`);
  console.log(`  curso:     ${a.curso?.nombre ?? a.curso ?? "(sin curso)"}`);
  console.log(
    `  status:    ${a.status === 0 ? "activo" : "inactivo"} | creado: ${a.createdAt?.toLocaleString()}`
  );
  console.log("");
};

const main = async () => {
  const args = process.argv.slice(2);
  const idIdx = args.indexOf("--id");

  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Conectado a la base de datos\n");

    // --- Modo eliminacion: --id <_id> --------------------------------------
    if (idIdx !== -1) {
      const id = args[idIdx + 1];
      if (!id) throw new Error("Falta el id despues de --id");

      const eliminado = await Aprendiz.findByIdAndDelete(id).populate("curso");
      if (!eliminado) {
        console.log(`No existe ningun aprendiz con id ${id}. Nada se elimino.`);
      } else {
        console.log("Aprendiz eliminado permanentemente:");
        mostrar(eliminado);
      }
      return;
    }

    // --- Modo busqueda: texto libre ----------------------------------------
    const texto = args.join(" ").trim();
    if (!texto) {
      console.log('Indica un texto de busqueda. Ejemplo: node scripts/delete-aprendiz.js "joymar"');
      return;
    }

    const regex = new RegExp(texto, "i");
    const aprendices = await Aprendiz.find({
      $or: [{ nombre: regex }, { email: regex }, { documento: texto }],
    }).populate("curso");

    if (!aprendices.length) {
      console.log(`No se encontraron aprendices para "${texto}".`);
      return;
    }

    console.log(
      `${aprendices.length} aprendiz(es) encontrado(s) para "${texto}". SOLO SE LISTARON, no se elimino nada.\n`
    );
    console.log("Para eliminar uno, ejecuta:\n   node scripts/delete-aprendiz.js --id <_id>\n");
    console.log("-------------------------------------------------------------");
    aprendices.forEach(mostrar);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

main();
