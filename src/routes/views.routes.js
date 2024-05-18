import { Router } from "express";
import { ProductManager } from "../manager/ProductManager.js";
import ChatManager from "../manager/ChatManager.js";
import { CartManager } from "../manager/CartManager.js";

const router = Router();
const manager = new ProductManager();
const managerCart = new CartManager();

router.get("/", async (req, res) => {
    try {

        if (!req.session.login) {
            return res.redirect("/login");
        }
    
        const user = req.session.user

        const products = await manager.getProducts();
        console.log(products)
        res.render("home", {
            title: "Productos",
            fileCss: "style.css",
            products
        });
    } catch (error) {
        res.status(500).json({error: "Error del servicor"});
        console.log (error)
    }
});

router.get("/products", async (req, res) => {
    try {

        if (!req.session.login) {
            return res.redirect("/login");
        }
    
        const user = req.session.user

        const { query, page, limit, sort } = req.query;
        const products = await manager.getProductsPaginate(limit, page, query, sort);

        let elementos = products.docs.map(prod => {
            const cosas = {
                ...prod.toObject(),
                price: prod.price.toFixed(2)
            };
            // console.log (cosas);
            return cosas;
        });
        // console.log(elementos)

        const pages = []

        if (products.totalPages != 1) {
            for (let i = 1; i <= products.totalPages; i++) {
                pages.push({page: i, limit: limit, filtro: query, sort: sort, pageNow: i == products.page ? true : false });
            }
        }

        res.render("products", {
            title: "Productos",
            fileCss: "style.css",
            products,
            elementos,
            pages,
            sort,
            query,
            user
        });

    } catch (error) {
        res.status(500).json({error: "Error del servicor"});
        console.log (error)
    }
});

router.get ("/product/:pid", async(req, res) => {
    try {
        if (!req.session.login) {
            return res.redirect("/login");
        }
    
        const user = req.session.user

        const {pid} = req.params;
        const producto = await manager.getProductById(pid);
        const product = {
            ...producto,
            price: producto.price.toFixed(2)
        }
        // console.log(product)
        res.render("product", {
            title: product ? product.title : "El producto no existe",
            fileCss: "style.css",
            product,
            user
        });
    } catch (error) {
        res.status(500).json({error: "Error del servicor"});
        console.log (error)
    }
})

router.get("/carts", async (req, res) => {

    try {

        if (!req.session.login) {
            return res.redirect("/login");
        }

        const user = req.session.user;

        // const cid = user.cart;

        const cart = await managerCart.getCartById(user.cart);


        const cartTotal = cart.products.map(inCart => {
            const totalProd = {
                ...inCart,
                totalPrice: (inCart.quantity * inCart.product.price).toFixed(2),
                }
            return totalProd
        })

        const cartRender = {
            ...cart,
            products: cartTotal
        }
        // console.log(cartRender)

        res.render("cart", {
            title: "Carrito",
            fileCss: "style.css",
            // cid,
            cartRender,
            user
        });

                
    } catch (error) {
        res.status(500).json({error: "Error del servidor"});
    }
})

router.get("/realtimeproducts", (req, res) => {
    try {
        if (!req.session.login) {
            return res.redirect("/login");
        }
        const user = req.session.user

        res.render("realTimeProducts", {
            title: "Manager de productos",
            fileCss: "style.css",
            user
        });
    } catch (error) {
        res.status(500).json({error: "Error del servidor"});
    }
})

//CHAT//
router.get ("/messages", async (req, res) => {
    try {

        if (!req.session.login) {
            return res.redirect("/login");
        }
        const user = req.session.user
        
        const chats = await ChatManager.getAllMessages();
        // console.log(chats);
        res.render("chat", {
            title: "CHAT",
            fileCss: "style.css",
            chats,
        });
    } catch (e) {
        console.log(e);
        res.json({
            message: "Error al leer Mensajes",
            e,
        });
    }
})

router.get("/login", (req, res) => {
    res.render("login", {
        title: "Login",
        fileCss: "style.css"
    })
})

router.get("/register", (req, res) => {
    res.render("register", {
        title: "Registro",
        fileCss: "style.css"
    })
})

router.get("/profile", (req, res) => {
    if (!req.session.login) {
        return res.redirect("/login");
    }

    const user = req.session.user
    res.render("profile", {
        title: `Perfil de ${req.session.user.first_name}`,
        fileCss: "style.css",
        user
    })
})


export default router;