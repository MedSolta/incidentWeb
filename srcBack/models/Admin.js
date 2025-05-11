import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  prenom: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  tel: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  date_login: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  role: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName: 'admin',
  timestamps: false
});

export default Admin;