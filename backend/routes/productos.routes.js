import express from "express";
import Producto from "../models/producto.model.js";

const router = express.Router();

// Obtener todos los productos ordenados de forma personalizada por categorías
router.get("/", async (req, res) => {
    try {
        const productos = await Producto.find();

        // Define aquí el orden exacto en el que quieres que aparezcan las categorías
        const ordenCategorias = {
            "CPU": 1,
            "GPU": 2,
            "RAM": 3,
            "Placas Base": 4,
            "Almacenamiento": 5,
            "PC": 6,
            "Electrodomesticos": 7,
            "Consolas": 8
        };

        // Ordenamos el array en Node.js antes de enviarlo al frontend
        productos.sort((a, b) => {
            // Asegúrate de que 'categoria' coincide con el nombre del campo en tu modelo de Mongoose
            const catA = ordenCategorias[a.categoria] || 99;
            const catB = ordenCategorias[b.categoria] || 99;

            if (catA !== catB) {
                return catA - catB; // Ordena por grupo de categoría
            }
            
            // Si son de la misma categoría, los ordena por su orden de creación (_id) interno
            return a._id.toString().localeCompare(b._id.toString());
        });

        console.log("Productos obtenidos y ordenados por categoría:", productos.length);
        res.json(productos);
    } catch (error) {
        console.error("Error en GET /api/productos:", error);
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

// Obtener un producto por ID
router.get("/:id", async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        res.json(producto);
    } catch (error) {
        console.error("Error en GET /api/productos/:id:", error);
        res.status(500).json({ error: "Error al obtener el producto" });
    }
});

export default router;