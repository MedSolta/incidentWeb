import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Favoris = sequelize.define('Favoris', {
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
  date_ajout: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'favoris',
  timestamps: false,
  indexes: [
    {
      fields: ['id_technicien', 'id_incident']
    }
  ]
});

export default Favoris;