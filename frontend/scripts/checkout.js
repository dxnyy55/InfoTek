document.addEventListener("DOMContentLoaded", () => {
    // 1. LÓGICA DE COLOR (RESTAURADA)
    function aplicarColorTema() {
        const colorGuardado = localStorage.getItem("colorFondo");
        if (colorGuardado) {
            const bodyElement = document.getElementById("cuerpo-pagina") || document.body;
            bodyElement.style.setProperty("background", colorGuardado, "important");
            bodyElement.style.setProperty("background-color", colorGuardado, "important");
            bodyElement.style.setProperty("background-image", "none", "important");
            const contenedorLayout = document.querySelector(".contenedor-principal-cuenta");
            if (contenedorLayout) contenedorLayout.style.setProperty("background", colorGuardado, "important");
        }
    }
    aplicarColorTema();

    // 2. LÓGICA DE CARRITO (RESTAURADA)
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const subtotal = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
    if(document.getElementById("subtotal")) document.getElementById("subtotal").textContent = subtotal.toFixed(2) + "€";
    if(document.getElementById("total")) document.getElementById("total").textContent = subtotal.toFixed(2) + "€";

    // 3. CARGA DE DATOS (AUTOCOMPLETADO)
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) {
        fetch(`https://infotek-j9pu.onrender.com/api/auth/get-user-data/${user.id}`)
            .then(res => res.json())
            .then(data => {
                if ((data.shippingInfo || data.billingInfo) && confirm("¿Quieres usar tus datos guardados?")) {
                    if (data.shippingInfo) {
                        if(document.getElementById("nombre")) document.getElementById("nombre").value = data.shippingInfo.nombre || "";
                        if(document.getElementById("apellidos")) document.getElementById("apellidos").value = data.shippingInfo.apellidos || "";
                        if(document.getElementById("movil")) document.getElementById("movil").value = data.shippingInfo.movil || "";
                        if(document.getElementById("direccion")) document.getElementById("direccion").value = data.shippingInfo.direccion || "";
                        if(document.getElementById("cp")) document.getElementById("cp").value = data.shippingInfo.cp || "";
                        if(document.getElementById("poblacion")) document.getElementById("poblacion").value = data.shippingInfo.poblacion || "";
                        if(document.getElementById("provincia")) document.getElementById("provincia").value = data.shippingInfo.provincia || "";
                    }
                    if (data.billingInfo) {
                        document.getElementById("pago-section").classList.remove("oculto");
                        if(document.getElementById("card-number")) document.getElementById("card-number").value = data.billingInfo.payCard || "";
                        if(document.getElementById("card-name")) document.getElementById("card-name").value = data.billingInfo.cardHolder || "";
                        if(document.getElementById("card-exp")) document.getElementById("card-exp").value = data.billingInfo.expiry || "";
                    }
                }
            });
    }

    // 4. GUARDAR ENVÍO
    document.getElementById("form-envio").addEventListener("submit", (e) => {
        e.preventDefault();
        const dataEnvio = {
            nombre: document.getElementById("nombre").value,
            apellidos: document.getElementById("apellidos").value,
            movil: document.getElementById("movil").value,
            direccion: document.getElementById("direccion").value,
            cp: document.getElementById("cp").value,
            poblacion: document.getElementById("poblacion").value,
            provincia: document.getElementById("provincia").value
        };
        fetch(`https://infotek-j9pu.onrender.com/api/auth/update-shipping/${user.id}`, {
            method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(dataEnvio)
        });
        document.getElementById("pago-section").classList.remove("oculto");
        alert("Dirección guardada");
        aplicarColorTema(); // Por si acaso
    });

    // 5. GUARDAR PAGO
    document.getElementById("btn-pagar").addEventListener("click", () => {
        if (document.getElementById("guardar-datos-pago").checked) {
            fetch(`https://infotek-j9pu.onrender.com/api/auth/update-payment/${user.id}`, {
                method: 'PUT', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    payCard: document.getElementById("card-number").value,
                    cardHolder: document.getElementById("card-name").value,
                    expiry: document.getElementById("card-exp").value
                })
            });
        }
        window.location.href = "./confirmacion.html";
    });
});