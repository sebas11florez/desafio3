const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;

class ProductManager {
    constructor(path) {
        this.path = path;
        this.products = this.getProducts();
        this.id = this.products.length > 0 ? this.products[this.products.length - 1].id + 1 : 1;
    }

    saveProducts() {
        fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2));
    }

    addProduct(product) {
        const { title, description, price, thumbnail, code, stock } = product;
        if (this.products.some(p => p.code === code)) {
            throw new Error('El código del producto ya existe');
        }
        if (!title) {
            throw new Error('El título es obligatorio');
        }
        if (!description) {
            throw new Error('La descripción es obligatoria');
        }
        if (!price) {
            throw new Error('El precio es obligatorio');
        }
        if (!thumbnail) {
            throw new Error('La imagen es obligatoria');
        }
        if (!code) {
            throw new Error('El código es obligatorio');
        }
        if (!stock) {
            throw new Error('El stock es obligatorio');
        }
        const newProduct = { id: this.id++, ...product };
        this.products.push(newProduct);
        this.saveProducts();
    }

    getProducts() {
        try {
            return JSON.parse(fs.readFileSync(this.path));
        } catch (error) {
            return [];
        }
    }

    getProductById(id) {
        const product = this.products.find(product => product.id === id);
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        return { ...product };
    }

    updateProduct(id, updatedProduct) {
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex === -1) {
            throw new Error('Producto no encontrado');
        }
        const existingProduct = { ...this.products[productIndex] };
        const allowedFields = ['title', 'description', 'price', 'thumbnail', 'code', 'stock'];
        for (let field of allowedFields) {
            if (updatedProduct.hasOwnProperty(field)) {
                existingProduct[field] = updatedProduct[field];
            }
        }
        this.products[productIndex] = existingProduct;
        this.saveProducts();
    }

    deleteProduct(id) {
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex === -1) {
            throw new Error('Producto no encontrado');
        }
        this.products.splice(productIndex, 1);
        this.saveProducts();
    }
}

const manager = new ProductManager('./products.json');

app.get('/products', (req, res) => {
    const limit = req.query.limit;
    const products = manager.getProducts();
    if (limit) {
        res.json(products.slice(0, limit));
    } else {
        res.json(products);
    }
});

app.get('/products/:pid', (req, res) => {
    const pid = parseInt(req.params.pid);
    try {
        const product = manager.getProductById(pid);
        res.json(product);
    } catch (error) {
        res.status(404).send(error.message);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
