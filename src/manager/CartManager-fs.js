import fs from "fs"
import { ProductManager } from "./ProductManager.js";

const prodManager = new ProductManager("./src/data/productos.json");

class CartManager {
    constructor(path) {
        this.path = path;
        try {
            let carts = fs.readFileSync(this.path, "utf-8");
            this.carts = JSON.parse(carts);
        } catch {
            this.carts = [];
        }
    }

    src = id => this.carts.find(cart => cart.id === id);

    async saveCart (productosCart) {
        try {
            await fs.promises.writeFile (
                this.path,
                JSON.stringify(productosCart, null, "\t")
            )
            console.log ("Se actualiza BASE carrito");
        } catch (error) {
                console.log (`Hubo un error al actualizar BASE carrito. Error: ${error}`);
        }
    }

    async addCart () {
        const newCart = {
            id: this.carts.length + 1,
            products: []
        }
        this.carts.push(newCart);

        const respuesta = await this.saveCart (this.carts);
        return !respuesta
        ? {error: "carrito creado"}
        : {error: "Error al crear carrito"};
    }

    getCartById(id) {
        const cart = this.src(id);
        if (cart) {
            return cart.products;
        }
        return "Not found - El carrito no existe";
    }
    
    async addProductInCart (cid, pid, res) {

        const carrito = await this.src(cid);

        if (carrito) {
            console.log("carrito existe");
            const producto = await prodManager.src(pid);

            if (producto) {
                console.log ("Producto existe");
                const existe = await carrito.products.find((prod) => prod.product === pid);

                if (!existe) {

                    const addItem = new ItemCart (pid, 1);
                    carrito.products.push(addItem);
                    console.log ("Se agrega producto a Carrito");

                    const respuesta = await this.saveCart (this.carts);
                    return !respuesta
                    ? {error: "Carrito actualizado"}
                    : {error: "Error al actualizar carrito"};
                } 
                console.log ("producto en carrito")

                if (existe.quantity < producto.stock) {

                    const addItem = {
                        ...existe, 
                        quantity: (existe.quantity+1)}

                    carrito.products.splice(carrito.products.indexOf(existe),1,addItem);
                    console.log("Se agrega item a producto en carrito")

                    const respuesta = await this.saveCart (this.carts);
                    return !respuesta
                    ? {error: "Carrito actualizado"}
                    : {error: "Error al actualizar carrito"};       
                }
                console.log("Limite de stock");
                return {error: `Limite de ${producto.stock} productos en stock`};

            }
            console.log ("Producto no existe");
            return {error: `El producto ID: ${pid} no existe`};
        } 
        console.log("Carrito no existe");
        return {error: `El carrito ID: ${cid} no existe`};
    }

    async deleteCart (cid) {

        const carrito = this.src(cid);

        if (carrito) {
            await this.carts.splice(this.carts.indexOf(carrito), 1);
            console.log ("Se elimano el Carrito");

            const respuesta = await this.saveCart (this.carts);
            return !respuesta
            ? {error: "Carrito actualizado"}
            : {error: "Error al actualizar carrito"};

        }
        console.log ("El Carrito no existe");
        return {error: `El carrito ID: ${cid} no existe`};
    }

    async deleteItem (cid, pid) {

        const carrito = this.src(cid);

        if (carrito) {
            console.log("carrito existe");
            const existe = carrito.products.find((prod) => prod.product === pid);

                if (existe) {
                    console.log ("producto existe en carrito")

                    if (existe.quantity > 1) {

                        const addItem = await {
                            ...existe, 
                            quantity: (existe.quantity-1)
                        }
        
                        await carrito.products.splice(carrito.products.indexOf(existe),1,addItem);
                        console.log("Se borra item del carrito")
        
                        const respuesta = await this.saveCart (this.carts);
                        return !respuesta
                        ? {error: "Carrito actualizado"}
                        : {error: "Error al actualizar carrito"};
                    } 

                    await carrito.products.splice(carrito.products.indexOf(existe),1);

                    const respuesta = await this.saveCart (this.carts);
                    return !respuesta
                    ? {error: "Carrito actualizado"}
                    : {error: "Error al actualizar carrito"};

                } 
                console.log ("El producto no existe dentro del carrito");
                return {error: `El producto ID: ${pid} no esta en el carrito`};
        }
        console.log("Carrito no existe");
        return {error: `El carrito ID: ${cid} no existe`};
    }
}

class ItemCart {
    constructor (product, quantity) {
        this.product  = product;
        this.quantity = quantity;
    }
}

export { CartManager };