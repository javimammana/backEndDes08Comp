import { Router } from "express";
import UserModel from "../models/usuario.model.js";
import { isValidPassword } from "../utils/hashbcrypt.js";
import passport from "passport";
import jwt from "jsonwebtoken";

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

function adminLoginJWT (req, res, next) {
    const {email, password} = req.body;
    if (email === admin.email) {
        if (password === admin.password) {

            const token = jwt.sign({
                first_name: "Coder",
                last_name: "House",
                // age: usuario.age,
                email: admin.email,
                role: "ADMIN",
                // cart: usuario.cart,
                // favorite: usuario.favorite,
                chatid: "ADMIN"
            }, "coderhouse", {expiresIn: "5m"});
    
            res.cookie("coderCookieToken", token, {
                maxAge: 90000,
                httpOnly: true
            });

                res.redirect("/realtimeproducts");
                return
        
        } else { 
            res.status(401).send("usuario o contraseña incorrecto") 
            return
        }
    }
    next();
}

// PASSPORT - LOCAL



// router.post ("/login", adminLogin , passport.authenticate("login", {
//     failureRedirect: "/failedlogin"
// }), async(req, res) => {

//     if(!req.user) {
//         return res.status(400).send("Credenciales Invalidas");
//     }

//     req.session.login = true;

//     req.session.user = {
//         first_name: req.user.first_name,
//         last_name: req.user.last_name,
//         age: req.user.age,
//         email: req.user.email,
//         role: req.user.role,
//         cart: req.user.cart,
//         favorite: req.user.favorite,
//         chatid: req.user.chatid
//     };

//     res.redirect("/products");
// })

// router.get("/failedlogin", (req, res) => {
//     res.send("Error de Login")
// })

// PASSPORT - LOCAL - JWT

router.post ("/login", adminLoginJWT, async(req, res) => {
    const {email, password} = req.body;
    try {
        
        let usuario = await UserModel.findOne({email: email});
        console.log(usuario);
        if (!usuario) {
            console.log ("Usuario no existe");
            return done(null, false);
        }

        if (!isValidPassword(password, usuario)) {
            return done(null, false);
        }

        console.log("correcto!!")

        const token = jwt.sign({
            first_name: usuario.first_name,
            last_name: usuario.last_name,
            age: usuario.age,
            email: usuario.email,
            role: usuario.role,
            cart: usuario.cart,
            favorite: usuario.favorite,
            chatid: usuario.chatid
        }, "coderhouse", {expiresIn: "5m"});

        res.cookie("coderCookieToken", token, {
            maxAge: 90000,
            httpOnly: true
        });

        console.log (token)

        res.redirect("/products")

    } catch (error) {

    }
})

// PASSPORT GITHUB

router.get("/github", passport.authenticate("github", {scope: ["user:email"]}), async(req, res) => { })

router.get("/githubcallback", passport.authenticate("github", {
    failureRedirect: "/login"
}), async(req, res) => {
    // req.session.user = req.user;
    // req.session.login = true;
    let usuario = req.user;
    const token = jwt.sign({
        first_name: usuario.first_name,
        last_name: usuario.last_name,
        age: usuario.age,
        email: usuario.email,
        role: usuario.role,
        cart: usuario.cart,
        favorite: usuario.favorite,
        chatid: usuario.chatid
    }, "coderhouse", {expiresIn: "5m"});

    res.cookie("coderCookieToken", token, {
        maxAge: 90000,
        httpOnly: true
    });

    res.redirect("/products")
})

router.get("/logout", (req, res) => {
    res.clearCookie("coderCookieToken")
    res.redirect("/login")
})

export default router;