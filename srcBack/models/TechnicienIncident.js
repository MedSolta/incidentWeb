import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TechnicienIncident = sequelize.define('TechnicienIncident', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_technicien: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_incident: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date_assignation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'technicien_incident',
  timestamps: false
});

export default TechnicienIncident;