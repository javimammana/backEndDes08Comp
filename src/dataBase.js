import mongoose from "mongoose";

mongoose.connect("mongodb+srv://javiermammana:test@coderhouse.vv0r5fa.mongodb.net/eCommerce?retryWrites=true&w=majority")
    .then(() => console.log ("Conexion exitosa"))
    .catch((error) => console.log("Error en la conexion", error))