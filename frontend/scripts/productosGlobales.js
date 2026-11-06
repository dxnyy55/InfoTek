// ===============================
// PRODUCTOS GLOBALES PARA TODA LA WEB
// ===============================

if (!window.productos) {
    window.productos = [];

    fetch("https://infotek-j9pu.onrender.com/api/productos")
        .then(res => res.json())
        .then(data => {
            window.productos = data;
            console.log("Productos cargados globalmente:", window.productos);
        })
        .catch(err => console.error("Error cargando productos globales:", err));
}