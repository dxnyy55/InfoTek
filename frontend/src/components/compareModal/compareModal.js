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

// INYECTAR HTML DEL MODAL
function injectModalHTML() {
    if (document.getElementById("modal-comparativa")) return;

    const html = `
    <div id="modal-comparativa" class="modal-comparativa" style="display:none;">
        <div class="modal-contenido">
            <button class="modal-cerrar" id="cerrar-comparativa">X</button>

            <div class="modal-header">
                <h2>Comparativa de Productos</h2>
                <p id="comparativa-count"></p>
            </div>

            <div class="grafica-comparativa">
                <div id="canvas-comparativa"></div>
            </div>

            <div id="comparativa-tabla-contenedor"></div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML("beforeend", html);
}

// GENERAR TABLA DE COMPARACIÓN
function generarTabla(productos) {
    let html = `
    <table class="comparativa-tabla">
        <thead>
            <tr>
                <th>Característica</th>
                ${productos.map(p => `<th>${p.nombreCorto}</th>`).join("")}
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Imagen</td>
                ${productos.map(p => `
                    <td><img class="comparativa-img" src="../${p.imagenes[0]}"></td>
                `).join("")}
            </tr>
            <tr>
                <td>Precio</td>
                ${productos.map(p => `<td>${p.precio} €</td>`).join("")}
            </tr>
            <tr>
                <td>Stock</td>
                ${productos.map(p => `<td>${p.stock} u.</td>`).join("")}
            </tr>
            <tr>
                <td>Categoría</td>
                ${productos.map(p => `<td>${p.categoria}</td>`).join("")}
            </tr>
    `;

    const keys = new Set();
    productos.forEach(p => {
        Object.keys(p.especificaciones || {}).forEach(k => keys.add(k));
    });

    keys.forEach(key => {
        html += `
        <tr>
            <td>${key}</td>
            ${productos.map(p => `<td>${p.especificaciones[key] || "-"}</td>`).join("")}
        </tr>
        `;
    });

    html += `</tbody></table>`;
    return html;
}

let grafica = null;

// GENERAR GRÁFICA COMPARATIVA
function generarGraficaComparativa(productos) {
    const contenedor = document.getElementById("canvas-comparativa");
    if (!contenedor) return;

    if (grafica) grafica.destroy();

    const opciones = {
        chart: {
            type: "line",
            height: 300,
            toolbar: {
                show: true,
                tools: {
                    download: false,
                    selection: false,
                    zoom: false,
                    zoomin: true,
                    zoomout: true,
                    pan: false,
                    reset: false
                }
            }
        },
        series: productos.map(p => ({
            name: p.nombreCorto,
            data: p.historialPrecios ? p.historialPrecios.map(h => h.precio || null) : []
        })),
        xaxis: {
            categories: productos[0]?.historialPrecios ? productos[0].historialPrecios.map(h => h.fecha) : []
        }
    };

    grafica = new ApexCharts(contenedor, opciones);
    grafica.render();
}

// INICIALIZAR MODAL Y VALIDAR CATEGORÍAS
export function initCompareModal() {
    injectModalHTML();

    const modal = document.getElementById("modal-comparativa");
    const cerrar = document.getElementById("cerrar-comparativa");
    const tablaContenedor = document.getElementById("comparativa-tabla-contenedor");
    const countLabel = document.getElementById("comparativa-count");

    cerrar.addEventListener("click", () => {
        modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });

    return {
        abrir: (productos) => {
            if (!productos || productos.length === 0) return;

            const primeraCategoria = productos[0].categoria;
            const categoriasDiferentes = productos.some(p => p.categoria !== primeraCategoria);

            if (categoriasDiferentes) {
                mostrarNotificacion("Solo se pueden comparar componentes de la misma categoría.");
                return;
            }

            countLabel.textContent = `Comparando ${productos.length} producto(s)`;
            
            tablaContenedor.innerHTML = generarTabla(productos);

            modal.style.display = "flex";

            setTimeout(() => {
                generarGraficaComparativa(productos);
            }, 100);
        }
    };
}