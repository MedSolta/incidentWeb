import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Incident = sequelize.define('Incident', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_operateur: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_technicien: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  accepted_by: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  date_insertion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  nom: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  adresse: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  code_postal: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  fiche_technique: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  titre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  etat: {
    type: DataTypes.STRING(255),
    defaultValue: 'ON HOLD'
  },
  date_acceptation: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'incidents',
  timestamps: false
});

export default Incident;