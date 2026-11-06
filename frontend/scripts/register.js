async function registerUser(event) {

  event.preventDefault();

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

      alert(data.message || data.error);

    }

  } catch (error) {

    console.error(error);
    alert("Error de conexión con el servidor");

  }

}

document.getElementById("form-registro").addEventListener("submit", registerUser);