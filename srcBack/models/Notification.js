import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_technicien: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date_notification: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  titre: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'notification',
  timestamps: false
});

export default Notification;