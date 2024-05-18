import { Router } from "express";
// import UserModel from "../models/usuario.model.js";
// import { isValidPassword } from "../utils/hashbcrypt.js";
import passport from "passport";

const router = Router();

const admin = {
    email: "adminCoder@coder.com",
    password: "adminCod3r123"
}

function adminLogin (req, res, next) {
    const {email, password} = req.body;
    if (email === admin.email) {
        if (password === admin.password) {

            console.log("Admin!!")
                req.session.login = true;
                req.session.user = {
                    email: admin.email,
                    first_name: "Coder",
                    last_name: "House",
                    role: "ADMIN"
                }

                res.redirect("/realtimeproducts");
                return
        
        } else { 
            res.status(401).send("usuario o contraseña incorrecto") 
            return
        }
    }
    next();
}
// router.post("/login", async (req, res) => {
//     const {email, password} = req.body;

//     try {
//         if (email === admin.email) {
//             if (password === admin.password) {

//                 console.log("Admin!!")
//                     req.session.login = true;
//                     req.session.user = {
//                         email: admin.email,
//                         first_name: "Coder",
//                         last_name: "House",
//                         role: "admin"
//                     }

//                     res.redirect("/realtimeproducts");
//                     return
            
//             } else { 
//                 res.status(401).send("usuario o contraseña incorrecto") 
//                 return
//             }
//         }

//         const user = await UserModel.findOne({email: email});
//         if (user) {
//             if (isValidPassword(password, user)) {
//                 req.session.login = true;
//                 req.session.user = {
//                     email: user.email,
//                     first_name: user.first_name,
//                     last_name: user.last_name,
//                     role: user.role
//                 }
//                 res.redirect("/products");
//             } else {
//                 res.status(401).send("usuario o contraseña incorrecto")
//             }
//         } else {
//             res.status(401).send("usuario o contraseña incorrecto")
//         }

//     } catch (error) {
//         res.status (400).send("Error en el Login")
//     }
    
// })

// PASSPORT - LOCAL

router.post ("/login", adminLogin , passport.authenticate("login", {
    failureRedirect: "/failedlogin"
}), async(req, res) => {

    if(!req.user) {
        return res.status(400).send("Credenciales Invalidas");
    }

    req.session.login = true;

    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email,
        role: req.user.role,
        cart: req.user.cart,
        favorite: req.user.favorite,
        chatid: req.user.chatid
    };

    res.redirect("/products");
})

router.get("/failedlogin", (req, res) => {
    res.send("Error de Login")
})

// PASSPORT GITHUB

router.get("/github", passport.authenticate("github", {scope: ["user:email"]}), async(req, res) => { })

router.get("/githubcallback", passport.authenticate("github", {
    failureRedirect: "/login"
}), async(req, res) => {
    req.session.user = req.user;
    req.session.login = true;
    res.redirect("/products")
})

router.get("/logout", (req, res) => {
    if(req.session.login) {
        req.session.destroy();
    }

    res.redirect("/login")
})

export default router;