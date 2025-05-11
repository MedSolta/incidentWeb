import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import sequelize from './config/database.js';
import * as models from './models/index.js';
import router from './routes/index.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);


// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);



// Vérifier la connexion à la base de données
const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    await sequelize.sync();
    console.log('✅ Database synchronized successfully.');
  } catch (error) {
    console.error('❌ Error connecting or synchronizing the database:', error);
  }
};

// Lancer le test de connexion
testDatabaseConnection();

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});