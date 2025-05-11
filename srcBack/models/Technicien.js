import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Technicien = sequelize.define('Technicien', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  prenom: {
    type: DataTypes.STRING(40),
    allowNull: false
  },
  code_postal: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  disponibilite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  acceptation: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  date_login: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  },
  file: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  archived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'techniciens',
  timestamps: true
});

export default Technicien;