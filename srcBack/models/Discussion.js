import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Discussion = sequelize.define('Discussion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_technicien: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'technicien',
      key: 'id'
    }
  },
  id_operateur: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'operateur',
      key: 'id'
    }
  },
  id_admin: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'admin',
      key: 'id'
    }
  },
  last_message_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('active', 'archived'),
    defaultValue: 'active'
  }
}, {
  tableName: 'discussions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['id_technicien', 'id_admin']
    },
    {
      unique: true,
      fields: ['id_operateur', 'id_admin']
    },
    {
      fields: ['last_message_at']
    }
  ]
});

export default Discussion;