const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const imgPrincipal = document.getElementById("producto-imagen");
const btnCarrito = document.getElementById("btn-carrito");
const nombreEl = document.getElementById("producto-nombre");
const precioActualEl = document.getElementById("producto-precio-actual");
const specificationsEl = document.getElementById("producto-especificaciones");
const ratingEl = document.getElementById("producto-rating"); 


// GENERAR ESTRELLAS DE VALORACIÓN

function generarEstrellas(rating) {
    if (!rating || rating <= 0) return "☆☆☆☆☆";
    const llenas = Math.floor(rating);
    const vacias = 5 - llenas;
    return "★".repeat(llenas) + "☆".repeat(vacias);
}


// ACTUALIZAR CONTADOR DEL CARRITO

window.actualizarContadorCarritoGlobal = function() {
    const span = document.getElementById("carrito-count");
    if (!span) return;
    
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const totalUnidades = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    
    span.textContent = totalUnidades;
    span.style.display = totalUnidades > 0 ? "flex" : "none";
};


// CARGAR DATOS DEL PRODUCTO Y GALERÍA

async function cargarProducto() {
    try {
        const res = await fetch(`https://infotek-j9pu.onrender.com/api/productos/${id}`);
        const producto = await res.json();
        if (!producto) return;

        // Rellenar datos básicos
        nombreEl.textContent = producto.nombreLargo || producto.nombreCorto;
        precioActualEl.textContent = producto.precio + " €";

        // Gestionar la imagen principal y las miniaturas de abajo
        renderizarGaleria(producto);

        // Estrellas de puntuación
        ratingEl.innerHTML = `
            <span class="stars">${generarEstrellas(producto.rating)}</span>
            <span class="rating-number">${producto.rating ? producto.rating.toFixed(1) : "0.0"} / 5</span>
        `;

        // Rellenar especificaciones técnicas
        specificationsEl.innerHTML = "";
        Object.entries(producto.especificaciones).forEach(([k, v]) => {
            const li = document.createElement("li");
            li.textContent = `${k}: ${v}`;
            specificationsEl.appendChild(li);
        });

        generarGraficaIndividual(producto.historialPrecios);
        btnCarrito.onclick = () => agregarAlCarrito(producto);
    } catch (e) { console.error("Error:", e); }
}

// CREAR MINIATURAS Y CAMBIAR FOTO PRINCIPAL

function renderizarGaleria(producto) {
    const contenedorMiniaturas = document.getElementById("miniaturas");
    contenedorMiniaturas.innerHTML = "";

    // Obtener array de imágenes del producto
    const listaImagenes = producto.imagenes && producto.imagenes.length > 0 
        ? producto.imagenes 
        : [producto.image || "recursos/imagenes/placeholder.png"];

    // Asignar primera imagen a la vista grande
    imgPrincipal.src = "../" + listaImagenes[0];

    // Si hay varias imágenes, crear la fila de miniaturas abajo
    if (listaImagenes.length > 1) {
        listaImagenes.forEach((url, index) => {
            const miniatura = document.createElement("img");
            miniatura.src = "../" + url;
            miniatura.className = "miniatura"; 
            
            if (index === 0) miniatura.classList.add("activa");

            // Evento al hacer clic en una miniatura
            miniatura.addEventListener("click", () => {
                imgPrincipal.src = "../" + url;
                document.querySelectorAll(".miniatura").forEach(m => m.classList.remove("activa"));
                miniatura.classList.add("activa");
            });

            contenedorMiniaturas.appendChild(miniatura);
        });
    }
}

// GRÁFICA DE HISTORIAL DE PRECIOS

function generarGraficaIndividual(historial) {
    const contenedor = document.getElementById("contenedor-grafica");
    if (!contenedor) return;
    contenedor.innerHTML = '<canvas id="graficaCanvas"></canvas>';
    const ctx = document.getElementById("graficaCanvas");
    new Chart(ctx, {
        type: "line",
        data: {
            labels: historial.map(h => h.fecha),
            datasets: [{ label: "Precio (€)", data: historial.map(h => h.precio), borderColor: "#191970", tension: 0.3 }]
        }
    });
}

// GESTIÓN DEL CARRITO DE COMPRAS

function agregarAlCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const idProducto = String(producto._id);
    const item = carrito.find(i => String(i.id) === idProducto);
    
    if (item) {
        item.cantidad += 1;
    } else {
        carrito.push({ 
            id: idProducto, 
            nombre: producto.nombreCorto, 
            precio: parseFloat(producto.precio), 
            cantidad: 1, 
            imagen: producto.imagenes[0] 
        });
    }
    
    localStorage.setItem("carrito", JSON.stringify(carrito));

    if (imgPrincipal && typeof animarProductoAlCarrito === 'function') {
        const rect = imgPrincipal.getBoundingClientRect();
        animarProductoAlCarrito(imgPrincipal.src, rect.left, rect.top);
    }

    actualizarContadorCarritoGlobal();
    if (typeof mostrarToast === 'function') {
        mostrarToast("Producto añadido al carrito");
    }
}

// Inicializar al cargar la página
window.addEventListener('load', actualizarContadorCarritoGlobal);
if (id) cargarProducto();