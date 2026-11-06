// REGISTRO

const formRegistro = document.getElementById("form-registro");

if (formRegistro) {
  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;

    if (password !== password2) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await fetch("https://infotek-j9pu.onrender.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Usuario registrado correctamente");
        window.location.href = "login.html";
      } else {
        alert(data.message || "Error al registrar");
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  });
}

// LOGIN (SIN ALERT MOLESTO)

const formLogin = document.getElementById("form-login");

if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("https://infotek-j9pu.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar usuario en localStorage sin mostrar alertas
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirigir al index de manera inmediata y profesional
        window.location.href = "index.html";
      } else {
        alert(data.message || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor");
    }
  });
}