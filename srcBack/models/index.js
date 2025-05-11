import Admin from './Admin.js';
import Discussion from './Discussion.js';
import Favoris from './Favoris.js';
import Feedback from './Feedback.js';
import Incident from './Incident.js';
import Message from './Message.js';
import Notification from './Notification.js';
import Operateur from './Operateur.js';
import Technicien from './Technicien.js';
import TechnicienIncident from './TechnicienIncident.js';
import Verification from './Verification.js';

// Relations Favoris
Favoris.belongsTo(Technicien, {
  foreignKey: 'id_technicien',
  as: 'Technicien'
});
Favoris.belongsTo(Incident, {
  foreignKey: 'id_incident',
  as: 'Incident'
});
Technicien.hasMany(Favoris, {
  foreignKey: 'id_technicien',
  as: 'Favoris'
});
Incident.hasMany(Favoris, {
  foreignKey: 'id_incident',
  as: 'Favoris'
});

// Relations Feedback
Feedback.belongsTo(Technicien, {
  foreignKey: 'id_technicien',
  as: 'Technicien'
});
Feedback.belongsTo(Incident, {
  foreignKey: 'id_incident',
  as: 'Incident'
});
Technicien.hasMany(Feedback, {
  foreignKey: 'id_technicien',
  as: 'Feedbacks'
});
Incident.hasMany(Feedback, {
  foreignKey: 'id_incident',
  as: 'Feedbacks'
});

// Relations Incident
Incident.belongsTo(Operateur, {
  foreignKey: 'id_operateur',
  as: 'Operateur'
});
Incident.belongsTo(Technicien, {
  foreignKey: 'id_technicien',
  as: 'Technicien'
});
Operateur.hasMany(Incident, {
  foreignKey: 'id_operateur',
  as: 'Incidents'
});
Technicien.hasMany(Incident, {
  foreignKey: 'id_technicien',
  as: 'Incidents'
});

// Relations Notification
Notification.belongsTo(Technicien, {
  foreignKey: 'id_technicien',
  as: 'Technicien'
});
Technicien.hasMany(Notification, {
  foreignKey: 'id_technicien',
  as: 'Notifications'
});

// Relations TechnicienIncident
TechnicienIncident.belongsTo(Technicien, {
  foreignKey: 'id_technicien',
  as: 'Technicien'
});
TechnicienIncident.belongsTo(Incident, {
  foreignKey: 'id_incident',
  as: 'Incident'
});
Technicien.hasMany(TechnicienIncident, {
  foreignKey: 'id_technicien',
  as: 'TechnicienIncidents'
});
Incident.hasMany(TechnicienIncident, {
  foreignKey: 'id_incident',
  as: 'TechnicienIncidents'
});

// Relations Discussion
Discussion.belongsTo(Technicien, {
  foreignKey: 'id_technicien',
  as: 'Technicien'
});
Discussion.belongsTo(Operateur, {
  foreignKey: 'id_operateur',
  as: 'Operateur'
});
Discussion.belongsTo(Admin, {
  foreignKey: 'id_admin',
  as: 'Admin'
});
Technicien.hasMany(Discussion, {
  foreignKey: 'id_technicien',
  as: 'Discussions'
});
Operateur.hasMany(Discussion, {
  foreignKey: 'id_operateur',
  as: 'Discussions'
});
Admin.hasMany(Discussion, {
  foreignKey: 'id_admin',
  as: 'Discussions'
});

// Relations Message (version corrigée)
Message.belongsTo(Discussion, {
  foreignKey: 'discussion_id',
  as: 'Discussion'
});
Discussion.hasMany(Message, {
  foreignKey: 'discussion_id',
  as: 'Messages'
});

// Association polymorphique pour l'expéditeur
Message.belongsTo(Admin, {
  foreignKey: 'sender_id',
  constraints: false,
  as: 'AdminSender'
});

Message.belongsTo(Technicien, {
  foreignKey: 'sender_id',
  constraints: false,
  as: 'TechnicienSender'
});
Message.belongsTo(Operateur, {
  foreignKey: 'sender_id',
  constraints: false,
  as: 'OperateurSender'
});

// Associations inverses (optionnelles)
Admin.hasMany(Message, {
  foreignKey: 'sender_id',
  constraints: false,
  scope: {
    sender_type: 'admin'
  },
  as: 'AdminMessages'
});

Technicien.hasMany(Message, {
  foreignKey: 'sender_id',
  constraints: false,
  scope: {
    sender_type: 'technicien'
  },
  as: 'TechnicienMessages'
});
Operateur.hasMany(Message, {
  foreignKey: 'sender_id',
  constraints: false,
  scope: {
    sender_type: 'operateur'
  },
  as: 'OperateurMessages'
});

export {
  Admin,
  Discussion,
  Favoris,
  Feedback,
  Incident,
  Message,
  Notification,
  Operateur,
  Technicien,
  TechnicienIncident,
  Verification
};