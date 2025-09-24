// config/database.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función para conectar a la base de datos
export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('🗄️ SQLite Database Connected');
    
    // Crear usuario admin por defecto si no existe
    await createDefaultAdmin();
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
    process.exit(1);
  }
};

// Crear usuario administrador por defecto
const createDefaultAdmin = async () => {
  try {
    const adminExists = await prisma.user.findFirst({
      where: { email: 'admin@creacionesroxo.com' }
    });

    if (!adminExists) {
      // En producción, usar bcrypt para hashear la contraseña
      await prisma.user.create({
        data: {
          firstName: 'Admin',
          lastName: 'Roxo',
          email: 'admin@creacionesroxo.com',
          password: 'admin123', // En producción, hashear esto
          role: 'admin',
          phone: '+584000000000'
        }
      });
      console.log('👑 Usuario administrador creado');
    }
  } catch (error) {
    console.log('Usuario admin ya existe o error creándolo');
  }
};

export default prisma;