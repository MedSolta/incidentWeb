import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Verification = sequelize.define('Verification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'verification',
  timestamps: false
});

export default Verification;