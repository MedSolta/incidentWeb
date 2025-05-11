import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Feedback = sequelize.define('Feedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_technicien: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_incident: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  signature: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  reclamation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date_feedback: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'feedback',
  timestamps: false
});

export default Feedback;