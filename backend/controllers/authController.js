// authController.js - VERSIÓN MEJORADA
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";
import bcrypt from "bcryptjs";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "fallback-secret", {
    expiresIn: "30d",
  });
};

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    console.log("📝 Registro attempt:", { email, firstName, lastName });

    // Validaciones básicas
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message:
          "Todos los campos son requeridos: email, password, firstName, lastName",
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Formato de email inválido" });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear nuevo usuario
    const user = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        favorites: [],
      },
    });

    // Generar token
    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    console.log("✅ Usuario registrado exitosamente:", user.email);

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("❌ Error en registro:", error);
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Login attempt:", { email });

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        message: "Email y contraseña son requeridos",
      });
    }

    // Buscar usuario (CORRECTED VERSION)
    const user = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });

    if (!user) {
      console.log("❌ Usuario no encontrado:", email);
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    // Resto del código permanece igual...
    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(400).json({ message: "Usuario desactivado" });
    }

    // Verificar password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Contraseña incorrecta para:", email);
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    // Generar token
    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    console.log("✅ Login exitoso:", user.email, "Role:", user.role);

    res.json({
      message: "Login exitoso",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        address: true,
        favorites: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ Error obteniendo perfil:", error);
    res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};
