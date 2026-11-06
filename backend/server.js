import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import productosRoutes from "./routes/productos.routes.js";
import authRoutes from "./routes/authRoutes.js";
import favoritosRoutes from "./routes/favoritos.routes.js";

dotenv.config();

const app = express();

// Necesario para obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());

// ===============================
// SERVIR CARPETA RECURSOS EN PRODUCCIÓN
// ===============================
// Apuntamos a la carpeta recursos dentro del repositorio para que Render pueda servir las imágenes correctamente
app.use("/recursos", express.static(path.join(__dirname, "../frontend/recursos")));

// MongoDB
const uri = process.env.MONGO_URI;

async function connexionMongoDB() {
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB conectado");

    // ==========================================
    // SISTEMA KEEP-ALIVE (Mantiene la BD despierta)
    // ==========================================
    const INTERVALO_TIEMPO = 5 * 60 * 1000; 

    setInterval(async () => {
      try {
        await mongoose.connection.db.admin().ping();
        console.log("🔄 Ping automático a MongoDB para mantener la sesión activa.");
      } catch (error) {
        console.error("❌ Error en el ping de mantenimiento a la BD:", error);
      }
    }, INTERVALO_TIEMPO);
    // ==========================================

  } catch (err) {
    console.error(err);
  }
}

connexionMongoDB();

// Rutas API
app.use("/api/productos", productosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/favoritos", favoritosRoutes);

// Puerto dinámico para Render con respaldo en el 3000 para local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});