import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import designRoutes from './routes/designs.js';
import charmRoutes from './routes/charms.js';
import adminSetup from './routes/adminSetup.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Conectar a la base de datos
connectDB().catch(console.error);

// Rutas
app.use('/api/setup', adminSetup);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/charms', charmRoutes);

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ 
    message: '🚀 API de Creaciones Roxo funcionando con SQLite!',
    version: '1.0.0',
    database: 'SQLite + Prisma',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      designs: '/api/designs',
      charms: '/api/charms'
    }
  });
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint no encontrado' });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error global:', error);
  res.status(500).json({ message: 'Error interno del servidor', error: error.message });
});

app.listen(PORT, () => {
  console.log(`🎯 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 Frontend: ${process.env.FRONTEND_URL}`);
  console.log(`🗄️ Database: SQLite + Prisma`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});