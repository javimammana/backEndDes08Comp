import { Router } from "express";
// import UserModel from "../models/usuario.model.js";
// import { createHash } from "../utils/hashbcrypt.js";
import passport from "passport";

const router = Router();

// router.post("/", async (req, res) => {
//     const {first_name, last_name, email, age, password, repassword} = req.body;

//     try {
//         const existUser = await UserModel.findOne({email: email});
//         if (existUser) {
//             return res.status(400).send("El correo ya esta registrado");
//         } else if(password === repassword) {
//             const newUser = await UserModel.create({
//                 first_name,
//                 last_name,
//                 email,
//                 age,
//                 password: createHash(password),
//                 role: "user"
//             })

//             req.session.user = {
//                 email: newUser.email,
//                 fisrt_name: newUser.first_name,
//                 role: newUser.role
//             }

//             req.session.loguin = true;

//             res.status(200).send("usuario creado")
//         } else {
//             return res.status(400).send("La contraseña no cohincide")
//         }
//     } catch (error) {
//         res.status(500).send("error al crear el usuario" + error)
//     }
// })

// PASSPORT - LOCAL

router.post ("/", passport.authenticate("register", {
    failureRedirect: "/failedregister"
}), async(req, res) => {
    if (!req.user) {
        return res.status(400).send("Credenciales invalidas");
    }

    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email,
        role: req.user.role,
        cart: req.user.cart
    };

    req.session.loguin = true;

    res.redirect("/profile");
})

router.get("/failedregister", (req, res) => {
    res.send("Registro Fallido");
})


export default router;