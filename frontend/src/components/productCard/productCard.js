/**
 * Función auxiliar interna para actualizar el contador flotante del header
 * de forma nativa si existe en la página actual.
 */
function refrescarContadorLocal() {
    const badge = document.getElementById("carrito-count");
    if (badge) {
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        const productosUnicos = carrito.length;

        if (productosUnicos > 0) {
            badge.textContent = productosUnicos;
            badge.style.display = "flex";
        } else {
            badge.style.display = "none";
        }
    }
}


// ANIMACIÓN: PRODUCTO VUELA AL CARRITO

export function animarProductoAlCarrito(imagenSrc, origenX, origenY) {
    const carritoIcon = document.getElementById("btn-carrito-nav");
    if (!carritoIcon) return;

    const destino = carritoIcon.getBoundingClientRect();

    const img = document.createElement("img");
    img.src = imagenSrc;
    img.classList.add("fly-img");

    img.style.left = origenX + "px";
    img.style.top = origenY + "px";

    document.body.appendChild(img);

    setTimeout(() => {
        img.style.transform = `translate(${destino.left - origenX}px, ${destino.top - origenY}px) scale(0.2)`;
        img.style.opacity = "0";
    }, 50);

    setTimeout(() => img.remove(), 900);
}

// CREAR CARD DE PRODUCTO

export function createProductCard(producto, onVer, onCarrito, onComparar, onFavorito, esFavorito = false) {
    const card = document.createElement("div");
    card.classList.add("producto-card");

    // Validar ruta de imagen por si viene relativa de la base de datos
    const imagen = producto.imagenes?.[0]
        ? "../" + producto.imagenes[0]
        : "../recursos/imagenes/default.jpg";

    card.innerHTML = `
        <img class="producto-img" src="${imagen}" alt="${producto.nombreCorto}">
        
        <h3 class="producto-nombre">${producto.nombreLargo}</h3>

        <div class="producto-rating">
            <span class="rating-number">${producto.rating ? producto.rating.toFixed(1) : "N/A"}</span>
        </div>

        <p class="producto-precio">${producto.precio} €</p>

        <div class="botones-producto">
            <button class="btn-favorito ${esFavorito ? "activo" : ""}">
                <img src="../recursos/imagenes/corazon.png" alt="Favorito">
            </button>

            <button class="btn-comparar">
                <img src="../recursos/imagenes/comparar.png" alt="Comparar">
            </button>
        </div>
    `;

    // Evento para abrir la vista de detalle del producto
    card.addEventListener("click", () => onVer(producto));

    // Evento para añadir a la lista de comparación
    card.querySelector(".btn-comparar").addEventListener("click", (e) => {
        e.stopPropagation();
        onComparar(producto._id, e.currentTarget);
    });

    // Evento para añadir o quitar de favoritos
    card.querySelector(".btn-favorito").addEventListener("click", (e) => {
        e.stopPropagation();
        onFavorito(producto, e.currentTarget);
    });

    return card;
}

/**
 * FUNCIÓN CENTRALIZADA PARA AÑADIR AL CARRITO
 * Guarda el producto en LocalStorage y refresca el número superior sin romper scripts
 */
export function ejecutarLogicaAñadirCarrito(producto, evento = null) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const itemExiste = carrito.find(item => item._id === producto._id);

    if (itemExiste) {
        itemExiste.cantidad += 1;
    } else {
        carrito.push({
            _id: producto._id,
            nombreLargo: producto.nombreLargo,
            precio: producto.precio,
            imagenes: producto.imagenes,
            cantidad: 1
        });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));

    // Refresca el contador del header nativo al instante
    refrescarContadorLocal();

    // Disparar animación de vuelo si se proporciona el evento de clic
    if (evento) {
        const targetCard = evento.target.closest('.producto-card') || document;
        const imgElement = targetCard.querySelector('.producto-img');
        const imgSrc = imgElement ? imgElement.src : "../recursos/imagenes/default.jpg";
        animarProductoAlCarrito(imgSrc, evento.clientX, evento.clientY);
    }
}