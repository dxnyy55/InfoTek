import { createProductCard } from "../src/components/productCard/productCard.js";

const contenedor = document.getElementById("lista-favoritos");
const contador = document.getElementById("contador-productos");
const contenedorPrincipal = document.querySelector(".contenedor-principal-cuenta");

// ===============================
// PERSISTENCIA DE COLOR
// ===============================
function cargarPreferenciaColor() {
    const colorGuardado = localStorage.getItem("colorFondo");
    if (colorGuardado && contenedorPrincipal) {
        contenedorPrincipal.style.background = colorGuardado;
    }
}

// ===============================
// LÓGICA DE FAVORITOS
// ===============================
const user = JSON.parse(localStorage.getItem("user"));
const usuarioId = user?.id || user?._id;

if (!user) {
    window.location.href = "login.html";
}

async function cargarFavoritos() {
    if (!usuarioId) return;

    try {
        const resFav = await fetch(`https://infotek-j9pu.onrender.com/api/favoritos/${usuarioId}`);
        const favoritos = await resFav.json();

        const resProd = await fetch("https://infotek-j9pu.onrender.com/api/productos");
        const productos = await resProd.json();

        const productosFav = productos.filter(p =>
            favoritos.some(f => (f.productoId?._id || f.productoId) === p._id)
        );

        contenedor.innerHTML = "";

        if (productosFav.length === 0) {
            contenedor.innerHTML = "<p style='color:white; text-align:center;'>Aún no tienes productos guardados.</p>";
            contador.textContent = "0 productos";
            return;
        }

        productosFav.forEach(p => {
            const card = createProductCard(
                p,
                () => verDetalle(p),
                () => {}, // Función carrito vacía para favoritos
                () => {}, // Función comparar vacía para favoritos
                () => eliminarFavorito(p), // Esta es la función onFavorito
                true // <--- Este es el parámetro isFavorite que ahora sí recibirá el JS
            );
            contenedor.appendChild(card);
        });

        contador.textContent = `${productosFav.length} productos`;

    } catch (error) {
        console.error("Error:", error);
    }
}

function verDetalle(producto) {
    window.location.href = `producto.html?id=${producto._id}`;
}

async function eliminarFavorito(producto) {
    try {
        const res = await fetch("https://infotek-j9pu.onrender.com/api/favoritos", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                usuarioId,
                productoId: producto._id
            })
        });

        if (res.ok) {
            // Al eliminar, recargamos la lista para que el producto desaparezca de la vista
            cargarFavoritos();
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
    }
}

// Inicialización
cargarPreferenciaColor();
cargarFavoritos();

document.getElementById("btn-cuenta-header")?.addEventListener("click", () => {
    window.location.href = "account.html";
});