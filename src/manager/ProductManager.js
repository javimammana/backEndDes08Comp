import { ProductModel } from "../models/products.model.js";

class ProductManager {

    validate (elemento) {
        const {title, description, price, code, stock} = elemento;
        return (!title || !description || !price || !code || !stock) ? false : true;
    }

    async addProduct(elemento) {

        const validacion = await this.validate(elemento);
        try {
            if (!validacion) {
                return {error: "Todos los campos deben estar completos.-"};
            }

            const codeExiste = await ProductModel.findOne({code: elemento.code});
            if (codeExiste) {
                console.log ("El codigo ya existe, debe ser unico.-")
                return;
            }

            const nvoProducto = new ProductModel({
                ...elemento
            })

            await nvoProducto.save()
            console.log ("Producto agregado")

        } catch (error) {
            console.log("Error al agregar producto", error);
            throw error;
        }
    }

    async getProducts () {
        try {
            const productos = await ProductModel.find().lean(); 
            // console.log (productos);
            return productos;
        } catch (error) {
            console.log("Error al recuperar los productos", error); 
            throw error; 
        }
    }

    async getProductsPaginate (limit, page, query, sort) {
        const filtro = query ? {category: query} : {};
        const orden = sort ? {price: Number(sort)} : {};
        const productos = await ProductModel.paginate(filtro, {limit: limit || 10, page: page || 1, sort : orden});
        return productos;
    }

    async getProductById(id) {
        try {
            const producto = await ProductModel.findById(id).lean();
            if (!producto) {
                console.log("El producto no existe.");
                return null;
            }

            console.log ("Producto encontrado.");
            return producto;
        } catch (error) {
            console.log ("Error al recuperar producto por ID", error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            const deleteProduct = await ProductModel.findByIdAndDelete(id);

            if (!deleteProduct) {
                console.log("Producto no encontrado.-");
                return null;
            }
            console.log("Producto eliminado");

        } catch (error) {
            console.log ("Error al eliminar producto por ID", error);
            throw error;
        }
    }

    async updateProduct (id, elemento) {
        try {
            const prodUpdate = await ProductModel.findByIdAndUpdate(id, elemento);

            if (!prodUpdate) {
                console.log ("Producto no encontrado para actualizar.-");
                return null;
            }
            console.log ("Producto actualizado.-");
            return prodUpdate;
        } catch (error) {
            console.log ("Error al actualizar producto por ID", error);
            throw error;
        }
    }
}

export { ProductManager };