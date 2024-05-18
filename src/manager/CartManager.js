import { CartModel } from "../models/cart.model.js";
import { ProductManager } from "./ProductManager.js";

const manager = new ProductManager();

class CartManager {

    async addCart () {
        try {
            const nvoCart = new CartModel({products: []});
            await nvoCart.save();
            return nvoCart;
        } catch (error) {
            console.log ("Error al crear un carrito Nvo", error);
            throw error;
        }
    }

    async getCartById(id) {
        try {
            const cart = await CartModel.findById(id).populate("products.product").lean();
            if (!cart) {
                console.log ("El carrito no existe.");
                return null;
            }
            console.log ("Carrito encontrado.");
            // console.log (cart.products)
            return cart;
        } catch (error) {
            console.log ("Error al buscar carrito por ID", error)
            throw error;
        }
    }
    
    async addProductInCart (cid, pid, res) {
        try {
            const cart = await this.getCartById(cid);

            if (!cart) {
                console.log("El carrito no existe")
                return null;
            }

            const prod = await manager.getProductById(pid);

            if (!prod) {
                console.log("El producto no existe.")
                return null;
            }

            const existProd = cart.products.find(item => item.product._id.toString() === pid);

            if (existProd) {
                console.log("Existe")
                existProd.quantity++
            } else {
                console.log("No existe")
                cart.products.push({product: pid, quantity: 1})
            }

            await CartModel.findByIdAndUpdate(cart._id, cart);

            return cart;

        } catch (error) {
            console.log ("Error al agregar producto al carrito", error);
            throw error;
        }
    }

    async updateCart (cid, update, res) {

        try {
            const cart = await this.getCartById(cid);
            if (!cart) {
                console.log("El carrito no existe")
                return null;
            }

            await this.deleteCart(cid);

            for (const prod of update) {
                let prodSRC = await manager.getProductById(prod.product);
                if (prodSRC) {
                    console.log(prod)
                    await this.addProductInCart(cid, prod.product);
                    await this.updateItem(cid, prod.product, prod);
                }
            }

        } catch (error) {
            console.log ("Error al actualizar carrito", error);
            throw error;
        }
    }

    async updateItem (cid, pid, update) {

        try {
            const cart = await this.getCartById(cid);
            if (!cart) {
                console.log("El carrito no existe")
                return null;
            }

            const prod = await manager.getProductById(pid);
            if (!prod) {
                console.log("El producto no existe.")
                return null;
            }

            const existProd = cart.products.find(item => item.product._id.toString() === pid);
            if (existProd) {
                console.log("Existe")
                existProd.quantity = update.quantity;
            } else {
                console.log("El producto no existe en carrito");
            }

            await CartModel.findByIdAndUpdate(cart._id, cart);

            return cart;

        } catch (error) {
            console.log ("Error al actualizar producto en carrito", error);
            throw error;
        }
    }

    async deleteCart (cid) {

        try {
            const cart = await this.getCartById(cid);
            if (!cart) {
                console.log("El carrito no existe")
                return null;
            }

            cart.products = [];

            cart.markModified("products");

            await cart.save();
            return cart;

        } catch (error) {
            console.log ("Error al vaciar carrito", error);
            throw error;
        }
    }

    async deleteItem (cid, pid) {

        try {
            
            const cart = await this.getCartById(cid);
            if (!cart) {
                console.log("El carrito no existe")
                return null;
            }

            const prod = await manager.getProductById(pid);
            if (!prod) {
                console.log("El producto no existe.")
                return null;
            }

            
            const existProd = cart.products.find(item => item.product.toString() === pid);
            console.log(existProd)
            if (existProd) {
                console.log("Existe!");
                await cart.products.splice(cart.products.indexOf(existProd),1)
            } else {
                console.log("El producto no existe en el carrito.-")
                return null;
            }

            cart.markModified("products");

            await cart.save();
            return cart;

        } catch (error) {
            console.log ("Error al borrar producto del carrito", error);
            throw error;
        }
    }
}

class ItemCart {
    constructor (product, quantity) {
        this.product  = product;
        this.quantity = quantity;
    }
}

export { CartManager };