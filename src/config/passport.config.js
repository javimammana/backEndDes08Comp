import passport from "passport";
import local from "passport-local";
import GitHubStrategy from "passport-github2";

import UserModel from "../models/usuario.model.js";
import { createHash, isValidPassword } from "../utils/hashbcrypt.js";
import { CartManager } from "../manager/CartManager.js";





const LocalStrategy = local.Strategy;
const cartManager = new CartManager();


const initializePassport = () => {

    passport.use("register", new LocalStrategy({
        passReqToCallback: true,
        usernameField: "email"
    }, async (req, username, password, done) => {
        const {first_name, last_name, email, age} = req.body;

        try {
            let user = await UserModel.findOne({email: email});

            if (user) {
                return done(null, false);
            }

            let cart = await cartManager.addCart();

            let userNvo = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password),
                cart: cart._id,
                login: "local",
                chatid: ""
            }

            let result = await UserModel.create(userNvo);

            return done(null, result);

        } catch (error) {
            return done(error);
        }
    }))

    passport.use ("login", new LocalStrategy({
        usernameField: "email"
    }, async (email, password, done) => {

        try {
            
            let usuario = await UserModel.findOne({email: email});

            if (!usuario) {
                console.log ("Usuario no existe");
                return done(null, false);
            }

            if (!isValidPassword(password, usuario)) {
                return done(null, false);
            }

            return done(null,usuario);

        } catch (error) {
            return done(error);
        }
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async(id, done) => {
        let user = await UserModel.findById({_id: id});
        done(null, user);
    })

    // login con GITHUB

    passport.use("github", new GitHubStrategy({
        clientID: "Iv23lia8BR4hBVTjbQEr",
        clientSecret: "2636fa4beda93965506a51fac12befa589a8e24a",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {

        // console.log("Perfil", profile);

        try {
            
            let usuario = await UserModel.findOne({email: profile._json.email})

            if (!usuario) {
                let cart = await cartManager.addCart();
                let userNvo = {
                    first_name: profile._json.name,
                    last_name: "",
                    age: "",
                    email: profile._json.email,
                    password: "",
                    login: "github",
                    cart: cart._id,
                    chatid: ""
                }

                let result = await UserModel.create(userNvo);
                done(null, result)
            } else {
                done (null, usuario);
            }
        } catch (error) {
            return done(error);
        }
    }))
}


export default initializePassport;