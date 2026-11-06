import { createProductCard, animarProductoAlCarrito } from "../src/components/productCard/productCard.js";
import { initCompareModal } from "../src/components/compareModal/compareModal.js";
import { aplicarFiltros } from "./filtros.js";

const contenedor = document.getElementById("lista-productos");
const contador = document.getElementById("contador-productos");
const botonesCategorias = document.querySelectorAll(".categoria-btn");
const btnCompararFinal = document.getElementById("btn-comparar-final");
const btnCuenta = document.getElementById("btn-cuenta");
const compareModal = initCompareModal();

let seleccionados = [];
let productosOriginales = [];
let productosFiltrados = [];

// NOTIFICACIÓN FLOTANTE ELEGANTE
function mostrarNotificacion(mensaje) {
    const alertaExistente = document.getElementById("alerta-flotante-custom");
    if (alertaExistente) alertaExistente.remove();

    const alerta = document.createElement("div");
    alerta.id = "alerta-flotante-custom";
    alerta.textContent = mensaje;

    Object.assign(alerta.style, {
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#191970",
        color: "#ffffff",
        padding: "12px 24px",
        borderRadius: "8px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        fontSize: "15px",
        fontWeight: "600",
        zIndex: "10000",
        transition: "opacity 0.3s ease"
    });

    document.body.appendChild(alerta);

    setTimeout(() => {
        alerta.style.opacity = "0";
        setTimeout(() => alerta.remove(), 300);
    }, 3500);
}

// MOSTRAR PRODUCTOS
async function renderizarProductos(lista) {
    contenedor.innerHTML = "";

    const usuario = JSON.parse(localStorage.getItem("user"));
    let idsFavoritos = [];
    
    if (usuario) {
        const userId = usuario.id || usuario._id;
        try {
            const res = await fetch(`https://infotek-j9pu.onrender.com/api/favoritos/${userId}`);
            const favs = await res.json();
            idsFavoritos = favs.map(f => {
                if (!f.productoId) return null;
                return typeof f.productoId === 'object' ? f.productoId._id : f.productoId;
            }).filter(id => id !== null);
        } catch (err) {
            console.error("Error al obtener favoritos iniciales:", err);
        }
    }

    lista.forEach(p => {
        const esFav = idsFavoritos.includes(p._id);

        const card = createProductCard(
            p,
            verDetalle,
            añadirCarrito,
            toggleComparar,
            toggleFavorito,
            esFav
        );
        contenedor.appendChild(card);
    });

    if (contador) contador.textContent = `${lista.length} productos`;
}

// ACTIVAR FILTROS
function activarFiltros() {
    const buscador = document.getElementById("filtro-texto");
    const precioMin = document.getElementById("precio-min");
    const precioMax = document.getElementById("precio-max");
    const checkboxes = document.querySelectorAll(".filtro-categoria, .filtro-marca");

    const actualizar = () => {
        // Al filtrar, respetamos estrictamente el orden original de la base de datos
        productosFiltrados = aplicarFiltros(productosOriginales);
        renderizarProductos(productosFiltrados);
    };

    if (buscador) buscador.addEventListener("input", actualizar);
    if (precioMin) precioMin.addEventListener("input", actualizar);
    if (precioMax) precioMax.addEventListener("input", actualizar);
    checkboxes.forEach(cb => cb.addEventListener("change", actualizar));

    const btnLimpiar = document.getElementById("btn-limpiar-filtros");
    if (btnLimpiar) {
        btnLimpiar.addEventListener("click", () => {
            if (buscador) buscador.value = "";
            if (precioMin) precioMin.value = "";
            if (precioMax) precioMax.value = "";
            checkboxes.forEach(cb => cb.checked = false);

            // Al limpiar filtros, restauramos la lista exactamente con el orden original del backend
            productosFiltrados = [...productosOriginales];
            renderizarProductos(productosFiltrados);
        });
    }
}

// CONTADOR DEL CARRITO
function actualizarContadorCarrito() {
    const span = document.getElementById("carrito-count");
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    if (span) span.textContent = total;
}

// AÑADIR AL CARRITO (REAL)
function añadirCarrito(producto, boton, event) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const index = carrito.findIndex(item => item.id === producto._id);

    if (index === -1) {
        carrito.push({
            id: producto._id,
            nombre: producto.nombreCorto,
            precio: producto.precio,
            cantidad: 1,
            imagen: producto.imagenes?.[0] || null
        });
    } else {
        carrito[index].cantidad += 1;
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorCarrito();

    const cardImg = event.target.closest(".producto-card").querySelector(".producto-img");
    const rect = cardImg.getBoundingClientRect();

    animarProductoAlCarrito(
        "../" + (producto.imagenes?.[0] || "recursos/imagenes/placeholder.png"),
        rect.left,
        rect.top
    );
}

// CARGAR PRODUCTOS DESDE EL BACKEND
fetch("https://infotek-j9pu.onrender.com/api/productos")
    .then(res => res.json())
    .then(data => {
        // Guardamos los productos exactamente en el orden que manda el backend (.sort(_id: 1))
        productosOriginales = data; 
        productosFiltrados = [...data];
        window.productos = data;

        renderizarProductos(productosFiltrados);
        activarFiltros();
    })
    .catch(err => console.error("Error cargando productos:", err));

function mostrarProductos(lista) {
    renderizarProductos(lista);
}

botonesCategorias.forEach(btn => {
    btn.addEventListener("click", () => {
        botonesCategorias.forEach(b => b.classList.remove("activo"));
        btn.classList.add("activo");
    });
});

// FAVORITOS
function toggleFavorito(producto, boton) {
    const usuario = JSON.parse(localStorage.getItem("user"));

    if (!usuario) {
        mostrarNotificacion("⚠️ Debes iniciar sesión");
        return;
    }

    const activo = boton.classList.contains("activo");
    const bodyData = {
        usuarioId: usuario.id || usuario._id,
        productoId: producto._id
    };

    if (!activo) {
        fetch("https://infotek-j9pu.onrender.com/api/favoritos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData)
        })
        .then(res => {
            if(res.ok) boton.classList.add("activo");
        })
        .catch(err => console.error("Error al guardar favorito:", err));
    } else {
        fetch("https://infotek-j9pu.onrender.com/api/favoritos", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData)
        })
        .then(res => {
            if(res.ok) boton.classList.remove("activo");
        })
        .catch(err => console.error("Error al eliminar favorito:", err));
    }
}

// COMPARAR
function toggleComparar(id, boton) {
    const producto = productosOriginales.find(p => p._id === id);

    if (seleccionados.length === 0) {
        seleccionados.push(producto);
        boton.classList.add("seleccionado");
        return;
    }

    if (producto.categoria !== seleccionados[0].categoria) {
        mostrarNotificacion("⚠️ Solo puedes comparar productos de la misma categoría");
        return;
    }

    const index = seleccionados.findIndex(p => p._id === id);

    if (index !== -1) {
        seleccionados.splice(index, 1);
        boton.classList.remove("seleccionado");
        return;
    }

    seleccionados.push(producto);
    boton.classList.add("seleccionado");
}

btnCompararFinal.addEventListener("click", () => {
    if (seleccionados.length < 2) {
        mostrarNotificacion("⚠️ Selecciona al menos 2 productos");
        return;
    }
    compareModal.abrir(seleccionados);
});

function verDetalle(producto) {
    window.location.href = `producto.html?id=${producto._id}`;
}

btnCuenta.addEventListener("click", () => {
    window.location.href = "./account.html";
});

const btnCarritoNav = document.getElementById("btn-carrito-nav");
if (btnCarritoNav) {
    btnCarritoNav.addEventListener("click", () => {
        window.location.href = "./carrito.html";
    });
}

actualizarContadorCarrito();

const colorGuardado = localStorage.getItem("colorFondo");

if (colorGuardado) {
    document.documentElement.style.setProperty("--color-fondo", colorGuardado);
    if (typeof selectorColor !== 'undefined') selectorColor.value = colorGuardado;
}

if (typeof selectorColor !== 'undefined') {
    selectorColor.addEventListener("input", (e) => {
        const nuevoColor = e.target.value;
        document.documentElement.style.setProperty("--color-fondo", nuevoColor);
        localStorage.setItem("colorFondo", nuevoColor);
    });
}