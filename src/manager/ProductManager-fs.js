// const fs = require("fs");
import fs from "fs";

class ProductManager {
    constructor(path) {
        this.path = path;
        try {
            let productos = fs.readFileSync(this.path, "utf-8");
            this.productos = JSON.parse(productos);
        } catch {
            this.productos = [];
        }
    }
    
    src = id => this.productos.find(prod => prod.id === id);

    validate (elemento) {
        const {title, description, price, code, stock} = elemento;
        return (!title || !description || !price || !code || !stock) ? false : true;
    }

    async saveProduct (productos) {
        try {
            await fs.promises.writeFile (
                this.path,
                JSON.stringify(productos, null, "\t")
            )
            console.log ("Se escribe BASE");
            return
        } catch (error) {
            console.log (`Hubo un error al escribir BASE. Error: ${error}`);
            return
        }
    }

    async addProduct(elemento) {

        const validacion = await this.validate(elemento);

        if (!validacion) {
            return {error: "Todos los campos deben estar completos.-"};
        }

        if (elemento) {
            const product = this.productos.some(prod => prod.code === elemento.code);
            
            if (!product) {
                const newProduct = await {
                        ...elemento,
                        thumbnail: ["sinImg.png"],
                        status: true,
                        id: this.productos.length + 1
                    }
                    this.productos.push(newProduct);
                    console.log("Producto creado");

                    const respuesta = await this.saveProduct(this.productos);
                    return !respuesta 
                    ? {error: "Producto agregado a la base.-"}
                    : {error: "Hubo un error agregar el producto a la base"};
                } 
                console.log ("Producto OK");
                return {error:`El codigo ${elemento.code} del producto ya existe`};
        }
        console.log ("Datos incompletos");
        return;
    }

    getProducts = () => {
        return this.productos;
    }

    async getProductById(id) {
        const product = await this.src(id);
        if (product) {
            return product;
        }
        return "Not found - El producto no existe";
    }

    async deleteProduct(id) {

        const product = this.src(id);

        if (product) {
            await this.productos.splice(this.productos.indexOf(product), 1);
            console.log ("Se elimina producto");

            const respuesta = await this.saveProduct(this.productos);
            return !respuesta
            ? {error: "Producto borrado de la Base"}
            : {error: "Hubo un error al borrar el producto de la base"};
        }
        console.log (`Id:${id} no existe`);
        return {error: `El producto id:${id} no existe para ser eliminado`};
    }

    async updateProduct (id, elemento) {

        const product = this.src(id);

        if (product) {

            const productCode = this.productos.some(prod => prod.code === elemento.code);
                
            if (!productCode) {

                    const newProduct = {
                        ...elemento,
                        id: id
                    }

                    this.productos.splice(this.productos.indexOf(product), 1, newProduct);
                    console.log ("Producto modificado");

                    const respuesta = await this.saveProduct(this.productos);
                    return !respuesta
                    ? {error: "Producto modificado en la Base"}
                    : {error: "Hubo un error al modificar el producto en la base"}
            }
            console.log ("Producto OK");
            return {error: `El codigo ${product.code} ya existe`};
        }
        console.log (`Id:${id} no existe`);
        return {error: `El producto id:${id} no existe para ser modificado`};
    }
}

class Product {
    constructor (title, description, price, code, stock, category) {
        this.title  = title;
        this.description = description;
        this.price = price;
        this.thumbnail = ["sinImg.png"];
        this.code = code;
        this.stock = stock;
        this.status = true;
        this.category = category;
    }
}

export { ProductManager, Product };