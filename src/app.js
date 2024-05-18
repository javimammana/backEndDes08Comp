import express from "express";
import exphbs from "express-handlebars";
import { Server } from "socket.io";
import multer from "multer";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";

//base de datos
import "./dataBase.js";


import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import viewsRouter from "./routes/views.routes.js";
import sessionRouter from "./routes/session.routes.js";
import initializePassport from "./config/passport.config.js";
import userRouter from "./routes/user.routes.js";

import ChatManager from "./manager/ChatManager.js";



const app = express();
const PORT = 8080;
const claveCookie = "CamareroDesencamaronemelo";

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./src/public"));
app.use(cookieParser(claveCookie));
app.use(session({
    secret: "secretClave",
    resave: true, //mantien activa la sesion frente a la inactividad del ususario
    saveUninitialized: true, //permite guardar sesion aun cuando este vacio
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://javiermammana:test@coderhouse.vv0r5fa.mongodb.net/eCommerce?retryWrites=true&w=majority&appName=CoderHouse",
        ttl: 60 * 5
    })
}));
app.use(passport.initialize());
app.use(passport.session());
initializePassport();

//Configuramos Multer: 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./src/public/img/productos");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
app.use(multer({storage}).single("image"));


//Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");


 //Rutas
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/", viewsRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/users", userRouter);


//Servidor
const httpServer = app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));


//Socket
const  io = new Server(httpServer);

import { ProductManager } from "./manager/ProductManager.js";
const manager = new ProductManager();

io.on("connection", async (socket) => {
    console.log ("Un cliente se conecta a PROD");

    //Productos en tiempo real.-

    socket.emit("listProduct", await manager.getProducts());

    socket.on("deleteProduct", async (data) => {
        console.log(data)
        await manager.deleteProduct(data);
        socket.emit("listProduct", await manager.getProducts());
    });

    socket.on("addForForm", async (data) => {
        // console.log(data);
        const resultado = await manager.addProduct(data);
        // console.log (resultado);
        socket.emit("listProduct", await manager.getProducts());
        socket.emit("resultado", resultado); //Aplicar la respuesta para mostrar en pantalla.-
    });

    //CHAT!

    const messages = await ChatManager.getAllMessages();
    console.log("Nuevo usuario conectado al CHAT");

    socket.on("message", async (data) => {
        // console.log(data);
        await ChatManager.sendMessage(data);
        const messages = await ChatManager.getAllMessages();
        io.emit("messages", messages);
    });

    socket.on("inicio", async (data) => {
        const messages = await ChatManager.getAllMessages();
        io.emit("messages", messages);
        socket.broadcast.emit("connected", data);
    });

    socket.emit("messages", messages);
})





