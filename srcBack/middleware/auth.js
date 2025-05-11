import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'd27a8c1dbb34303cb0c7ab0c108b68f39f0d421f48fe2f3e798b202fae62bfe7';

export const generateToken = (user, role) => {
  const payload = {
    id: user.id,
    role,
    email: user.email,
    nom: user.nom || user.Name || '', // Gère les cas où nom/Name n'existe pas
    prenom: user.prenom || '',
    telephone: user.telephone || user.tel || '',
    code_postal: user.code_postal || '',
    disponibilite: user.disponibilite || false,
    date_login: user.date_login || new Date().toISOString()
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        code: 'NO_TOKEN',
        message: 'Token manquant dans les headers (Authorization: Bearer <token>)'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Vérification minimale du payload
    if (!decoded.id || !decoded.role) {
      throw new Error('Token invalide : payload incomplet');
    }

    req.user = decoded;
    console.log(req.user)
    next();
  } catch (error) {
    let message = 'Token invalide';
    if (error.name === 'TokenExpiredError') {
      message = 'Token expiré';
    }
    return res.status(401).json({
      code: 'INVALID_TOKEN',
      message
    });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Requires admin role' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const isOperateur = async (req, res, next) => {
  try {
    if (req.user.role !== 'operateur') {
      return res.status(403).json({ message: 'Requires operateur role' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const isTechnicien = async (req, res, next) => {
  try {
    if (req.user.role !== 'technicien') {
      return res.status(403).json({ message: 'Requires technicien role' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};