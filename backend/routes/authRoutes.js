import express from "express";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import Usuario from "../models/User.js";

const router = express.Router();

// Configurar Nodemailer con la cuenta oficial de InfoTek
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'infotek.oficial@gmail.com',        
        pass: 'okyx sskp gjqw ttyv' 
    }
});

// Almacén temporal de códigos (en memoria)
const codigosRecuperacion = {};

// ------------------------------------------
// 0. Registro de usuarios (Con cifrado explícito)
// ------------------------------------------
router.post('/registro', async (req, res) => {
    const { nombre, email, password } = req.body;
    const emailLimpiado = email ? email.trim() : "";

    try {
        const existeUsuario = await Usuario.findOne({ 
            mailAdress: { $regex: new RegExp(`^${emailLimpiado}$`, 'i') } 
        });

        if (existeUsuario) {
            return res.status(400).json({ message: "El correo electrónico ya está registrado." });
        }

        // Ciframos la contraseña con bcrypt antes de crear el usuario
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const nuevoUsuario = new Usuario({
            username: nombre,
            mailAdress: emailLimpiado,
            password: passwordHash
        });

        await nuevoUsuario.save();
        res.status(201).json({ message: "Usuario registrado con éxito." });

    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).json({ message: "Error interno al registrar el usuario." });
    }
});

// ------------------------------------------
// 0.1. Inicio de sesión (Login seguro)
// ------------------------------------------
router.post('/login', async (req, res) => {
    const email = req.body.email ? req.body.email.trim() : "";
    const { password } = req.body;

    console.log("--- INTENTO DE LOGIN ---");
    console.log("Email recibido:", email);
    console.log("Password recibido (plano):", password);

    try {
        const usuario = await Usuario.findOne({ 
            mailAdress: { $regex: new RegExp(`^${email}$`, 'i') } 
        });

        if (!usuario) {
            console.log("❌ Usuario no encontrado en la base de datos.");
            return res.status(401).json({ message: "Correo o contraseña incorrectos." });
        }

        console.log("✔️ Usuario encontrado:", usuario.mailAdress);
        console.log("Hash en BD:", usuario.password);

        const esPasswordCorrecta = await bcrypt.compare(password, usuario.password);
        console.log("¿Coincide la contraseña?", esPasswordCorrecta);

        if (!esPasswordCorrecta) {
            console.log("❌ La contraseña no coincide con el hash.");
            return res.status(401).json({ message: "Correo o contraseña incorrectos." });
        }

        console.log("✔️ ¡Login exitoso!");
        
        // CORREGIDO: Devolvemos un objeto 'user' completo que incluye el _id y name 
        // para que localStorage guarde exactamente lo que el frontend espera.
        res.status(200).json({ 
            message: "Inicio de sesión exitoso", 
            user: { 
                id: usuario._id,
                _id: usuario._id,
                name: usuario.username || usuario.name, 
                email: usuario.mailAdress,
                apellido: usuario.apellido || "",
                sexo: usuario.sexo || "",
                nacimiento: usuario.nacimiento || ""
            } 
        });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
});

// ------------------------------------------
// 1. Enviar código de 6 dígitos por email
// ------------------------------------------
router.post('/enviar-codigo', async (req, res) => {
    const email = req.body.email ? req.body.email.trim() : "";

    try {
        const usuario = await Usuario.findOne({ 
            mailAdress: { $regex: new RegExp(`^${email}$`, 'i') } 
        });

        if (!usuario) {
            return res.status(404).json({ message: "El correo electrónico no está registrado." });
        }

        const codigo = Math.floor(100000 + Math.random() * 900000).toString();

        codigosRecuperacion[email] = {
            codigo: codigo,
            expira: Date.now() + 10 * 60 * 1000 // 10 minutos de validez
        };

        const mailOptions = {
            from: '"InfoTek Soporte" <infotek.oficial@gmail.com>',
            to: email,
            subject: 'Código de recuperación de contraseña - InfoTek',
            html: `
                <div style="font-family: Arial, sans-serif; color: #191970; padding: 20px;">
                    <h2>Recuperación de Contraseña</h2>
                    <p>Has solicitado restablecer tu contraseña en <strong>InfoTek</strong>.</p>
                    <p>Tu código de verificación es:</p>
                    <h1 style="background: #f0f0f5; padding: 10px; display: inline-block; letter-spacing: 5px;">${codigo}</h1>
                    <p>Este código caduca en 10 minutos.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Código enviado con éxito." });

    } catch (error) {
        console.error("Error al enviar correo:", error);
        res.status(500).json({ message: "Error interno al enviar el correo." });
    }
});

// ------------------------------------------
// 2. Verificar el código introducido
// ------------------------------------------
router.post('/verificar-codigo', (req, res) => {
    const { email, codigo } = req.body;
    const registro = codigosRecuperacion[email];

    if (!registro) {
        return res.status(400).json({ message: "No hay ninguna solicitud activa para este correo." });
    }

    if (Date.now() > registro.expira) {
        delete codigosRecuperacion[email];
        return res.status(400).json({ message: "El código ha expirado." });
    }

    if (registro.codigo !== codigo) {
        return res.status(400).json({ message: "Código incorrecto." });
    }

    res.status(200).json({ message: "Código verificado correctamente." });
});

// ------------------------------------------
// 3. Cambiar la contraseña definitivamente (Con cifrado bcrypt)
// ------------------------------------------
router.post('/recover-password', async (req, res) => {
    const email = req.body.email ? req.body.email.trim() : "";
    const { newPassword } = req.body;

    try {
        const usuario = await Usuario.findOne({ 
            mailAdress: { $regex: new RegExp(`^${email}$`, 'i') } 
        });

        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        // Ciframos la nueva contraseña obligatoriamente con bcrypt
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(newPassword, salt);
        
        await usuario.save();

        delete codigosRecuperacion[email];

        res.status(200).json({ message: "Contraseña actualizada con éxito." });

    } catch (error) {
        console.error("Error al actualizar contraseña:", error);
        res.status(500).json({ message: "Error al actualizar la contraseña." });
    }
});

export default router;