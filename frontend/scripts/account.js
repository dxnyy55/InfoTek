// USUARIO (Global)

const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "login.html";
}


// MOSTRAR DATOS PERSONALIZADOS

const saludo = document.getElementById("saludo-usuario");
if (saludo && user) {
    saludo.textContent = "Hola, " + (user.name || "Usuario");
    
    if(document.getElementById("nombre-usuario")) document.getElementById("nombre-usuario").textContent = user.name || "-";
    if(document.getElementById("apellido-usuario")) document.getElementById("apellido-usuario").textContent = user.apellido || user.lastName || "-";
    if(document.getElementById("email-usuario")) document.getElementById("email-usuario").textContent = user.email || "-";
    if(document.getElementById("sexo-usuario")) document.getElementById("sexo-usuario").textContent = user.sexo || "-";

    const campoNacimiento = document.getElementById("nacimiento-usuario");
    if (campoNacimiento) {
        const fechaRaw = user.nacimiento || user.birthDate; 
        if (fechaRaw) {
            const fecha = new Date(fechaRaw);
            if (!isNaN(fecha)) {
                const dia = String(fecha.getDate()).padStart(2, '0');
                const mes = String(fecha.getMonth() + 1).padStart(2, '0');
                const año = fecha.getFullYear();
                campoNacimiento.textContent = `${dia}/${mes}/${año}`;
            } else {
                campoNacimiento.textContent = fechaRaw;
            }
        } else {
            campoNacimiento.textContent = "-";
        }
    }
}


// INFO DE LA CUENTA

if (document.getElementById("username")) {
    document.getElementById("username").textContent = user.name;
    document.getElementById("user-id").textContent = user.id || user._id;

    if (user.createdAt) {
        const fecha = new Date(user.createdAt);
        document.getElementById("fecha-creacion").textContent = fecha.toLocaleDateString();
    }
}


// LÓGICA DE ACTUALIZACIÓN (EDITAR)

const btnEditar = document.getElementById("btn-editar");
if (btnEditar) {
    btnEditar.addEventListener("click", async () => {
        const nombre = prompt("Nuevo nombre:", user.name);
        if (nombre === null) return;
        const apellido = prompt("Nuevo apellido:", user.apellido || "");
        if (apellido === null) return;
        const sexo = prompt("Sexo (Hombre/Mujer/Otro):", user.sexo || "");
        if (sexo === null) return;

        const nacimientoActual = document.getElementById("nacimiento-usuario").textContent;
        const nacimiento = prompt("Fecha nacimiento (DD/MM/YYYY):", nacimientoActual === "-" ? "" : nacimientoActual);
        if (nacimiento === null) return;

        let nacimientoISO = null;
        if (nacimiento && nacimiento !== "-") {
            const partes = nacimiento.split(/[-/]/);
            if (partes.length === 3) {
                const [dia, mes, año] = partes;
                nacimientoISO = `${año}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
            }
        }

        try {
            const res = await fetch(`https://infotek-j9pu.onrender.com/api/auth/update-user/${user.id || user._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: nombre, apellido: apellido, sexo: sexo, nacimiento: nacimientoISO })
            });

            const data = await res.json();
            if (res.ok) {
                const userActualizado = { ...user, name: nombre, apellido: apellido, sexo: sexo, nacimiento: nacimientoISO };
                localStorage.setItem("user", JSON.stringify(userActualizado));
                alert("Información actualizada correctamente");
                window.location.reload();
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error al actualizar:", error);
            alert("No se pudo conectar con el servidor.");
        }
    });
}


// BOTÓN FAVORITOS (REDIRECCIÓN)

const btnFavoritos = document.getElementById("btn-favoritos");
if (btnFavoritos) {
    btnFavoritos.addEventListener("click", () => {
        window.location.href = "favoritos.html";
    });
}


// CERRAR SESIÓN

const btnLogout = document.getElementById("cerrar-sesion");
if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });
}


// COLOR DE FONDO

const selectorCuenta = document.getElementById("selector-color-cuenta");
const btnGuardarColor = document.getElementById("guardar-color");
const btnRestablecer = document.getElementById("restablecer-color");
const contenedorFondo = document.querySelector(".contenedor-principal-cuenta");

const DEGRADADO_DEFAULT = "linear-gradient(135deg, #ffffff 0%, #000000 100%)";

function aplicarColor(color) {
    if (!contenedorFondo) return;
    contenedorFondo.style.background = color;
}

// Cargar preferencia guardada o aplicar degradado por defecto (Blanco a Negro)
const colorGuardado = localStorage.getItem("colorFondo");
if (colorGuardado) {
    if (selectorCuenta) selectorCuenta.value = colorGuardado;
    aplicarColor(colorGuardado);
} else {
    aplicarColor(DEGRADADO_DEFAULT);
}

// Vista previa en tiempo real
if (selectorCuenta) {
    selectorCuenta.addEventListener("input", () => {
        aplicarColor(selectorCuenta.value);
    });
}

// Guardar color (Sin alertas molestas)
if (btnGuardarColor) {
    btnGuardarColor.addEventListener("click", () => {
        const nuevoColor = selectorCuenta.value;
        localStorage.setItem("colorFondo", nuevoColor);
    });
}

// Restablecer a degradado original (Blanco a Negro)
if (btnRestablecer) {
    btnRestablecer.addEventListener("click", () => {
        localStorage.removeItem("colorFondo");
        aplicarColor(DEGRADADO_DEFAULT);
        if (selectorCuenta) selectorCuenta.value = "#ffffff";
    });
}

// SISTEMA DE PEDIDOS SIMULADOS POR USUARIO


const contenedorPedidos = document.getElementById("contenedor-pedidos");
const currentUserId = user.id || user._id;
const currentUserEmail = user.email ? user.email.toLowerCase() : "";
const modalDinamico = document.getElementById("contenido-dinamico-modal");

let tipoPedidoActivo = null;

if (contenedorPedidos) {
    if (currentUserId === "69b1bff4c4a6d6159fc21827" || currentUserEmail === "sebas@gmail.com") {
        tipoPedidoActivo = "entregado";
        contenedorPedidos.innerHTML = `
            <div class="pedido-item" style="display: flex; gap: 10px; flex-direction: column; border-top: 1px solid rgba(0,0,0,0.08); padding-top: 12px; margin-top: 5px;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span style="font-size: 11px; color: #777; font-weight: bold;">Ref: TK-2026-8891</span>
                    <span style="background: #e6f9ed; color: #000000; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">Entregado</span>
                </div>
                <p style="margin: 0; font-size: 13px; font-weight: 500; color: #333; line-height: 1.3;">Procesador AMD Ryzen 7 5800X3D</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
                    <span style="font-size: 13px; color: #000000; font-weight: 700;">399.99 €</span>
                    <span style="font-size: 11px; color: #999;">20/05/2026</span>
                </div>
                <button id="btn-ver-localizador" style="margin-top: 8px; width: 100%; padding: 6px; background: #113554; color: white; border: none; border-radius: 4px; font-size: 12px; font-weight: bold; cursor: pointer; transition: background 0.2s;">
                    Ver localizador de envío
                </button>
            </div>
        `;
    } 
    else if (currentUserId === "69b1c31ccca4ee5e459fac79" || currentUserEmail === "sebastian@gmail.com") {
        tipoPedidoActivo = "en-camino";
        contenedorPedidos.innerHTML = `
            <div class="pedido-item" style="display: flex; gap: 10px; flex-direction: column; border-top: 1px solid rgba(0,0,0,0.08); padding-top: 12px; margin-top: 5px;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span style="font-size: 11px; color: #777; font-weight: bold;">Ref: TK-2026-9042</span>
                    <span style="background: #fff3cd; color: #856404; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">Saliendo de almacén</span>
                </div>
                <p style="margin: 0; font-size: 13px; font-weight: 500; color: #333; line-height: 1.3;">Tarjeta Gráfica MSI GeForce RTX 4060 Ti</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
                    <span style="font-size: 13px; color: #b38600; font-weight: 700;">449.99 €</span>
                    <span style="font-size: 11px; color: #fe5f55; font-weight: bold;">Llega en 2-3 días</span>
                </div>
                <button id="btn-ver-localizador" style="margin-top: 8px; width: 100%; padding: 6px; background: #113554; color: white; border: none; border-radius: 4px; font-size: 12px; font-weight: bold; cursor: pointer; transition: background 0.2s;">
                    Ver localizador de envío
                </button>
            </div>
        `;
    } 
    else {
        contenedorPedidos.innerHTML = `<p>No tienes pedidos recientes.</p>`;
    }
}

// LÓGICA E INYECTADO DEL MODAL SEGÚN EL USUARIO ACTIVO
if (tipoPedidoActivo && modalDinamico) {
    const modalGeneral = document.getElementById("modal-localizador");
    const btnAbrir = document.getElementById("btn-ver-localizador");
    const btnCerrar = document.getElementById("cerrar-modal-envio");

    const htmlEntregado = `
        <p style="font-size: 14px; color: #444; margin: 15px 0 20px 0;">Código de la expedición: <strong style="color: #222;">L38QB7041196891M</strong> <span style="float: right; color: #666; font-size: 12px;">Hay 1 envíos asociados</span></p>
        <div style="background: white; border: 1px solid #e0e0e0; border-radius: 4px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="font-size: 12px; font-weight: bold; color: #333; margin-bottom: 15px; font-family: monospace;">L38QB70411968910130840N</div>
            <div style="display: flex; align-items: center; gap: 20px;">
                <div style="display: flex; align-items: center; min-width: 100px;">
                    <div style="width: 8px; height: 8px; background: #00b347; border-radius: 50%;"></div>
                    <div style="width: 25px; height: 2px; background: #00b347;"></div>
                    <div style="width: 8px; height: 8px; background: #00b347; border-radius: 50%;"></div>
                    <div style="width: 25px; height: 2px; background: #00b347;"></div>
                    <div style="width: 20px; height: 20px; background: #00b347; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold;">✓</div>
                </div>
                <div>
                    <div style="font-weight: bold; color: #222; font-size: 15px; text-transform: uppercase;">ENTREGADO</div>
                    <div style="font-size: 13px; color: #666; margin-top: 2px;">Envío entregado a almacén de origen en entrega múltiple</div>
                </div>
                <div style="margin-left: auto; display: flex; align-items: center; gap: 5px; color: #113554; font-size: 13px; font-weight: bold; border-left: 1px solid #eee; padding-left: 15px;">
                    <span>📦</span><span>1 bulto de 1</span>
                </div>
            </div>
        </div>
    `;

    const htmlEnCamino = `
        <p style="font-size: 14px; color: #444; margin: 15px 0 20px 0;">Código de la expedición: <strong style="color: #222;">TR75XQ99214411K</strong> <span style="float: right; color: #666; font-size: 12px;">Hay 1 envíos asociados</span></p>
        <div style="background: white; border: 1px solid #e0e0e0; border-radius: 4px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
            <div style="font-size: 12px; font-weight: bold; color: #333; margin-bottom: 15px; font-family: monospace;">TR75XQ99214411009876A</div>
            <div style="display: flex; align-items: center; gap: 20px;">
                <div style="display: flex; align-items: center; min-width: 100px;">
                    <div style="width: 20px; height: 20px; background: #ffc107; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold;">➔</div>
                    <div style="width: 25px; height: 2px; background: #ddd;"></div>
                    <div style="width: 8px; height: 8px; background: #ddd; border-radius: 50%;"></div>
                    <div style="width: 25px; height: 2px; background: #ddd;"></div>
                    <div style="width: 8px; height: 8px; background: #ddd; border-radius: 50%;"></div>
                </div>
                <div>
                    <div style="font-weight: bold; color: #856404; font-size: 15px; text-transform: uppercase;">SALIENDO DE ALMACÉN</div>
                    <div style="font-size: 13px; color: #666; margin-top: 2px;">El envío está siendo clasificado en el centro logístico. Estimado: 2-3 días.</div>
                </div>
                <div style="margin-left: auto; display: flex; align-items: center; gap: 5px; color: #113554; font-size: 13px; font-weight: bold; border-left: 1px solid #eee; padding-left: 15px;">
                    <span>📦</span><span>1 bulto de 1</span>
                </div>
            </div>
        </div>
    `;

    modalDinamico.innerHTML = tipoPedidoActivo === "entregado" ? htmlEntregado : htmlEnCamino;

    if (btnAbrir && modalGeneral && btnCerrar) {
        btnAbrir.addEventListener("mouseover", () => btnAbrir.style.background = "#1a4a73");
        btnAbrir.addEventListener("mouseout", () => btnAbrir.style.background = "#113554");
        btnAbrir.addEventListener("click", () => { modalGeneral.style.display = "flex"; });
        btnCerrar.addEventListener("click", () => { modalGeneral.style.display = "none"; });
        window.addEventListener("click", (e) => {
            if (e.target === modalGeneral) modalGeneral.style.display = "none";
        });
    }
}