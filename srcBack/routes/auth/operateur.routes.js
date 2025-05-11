import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { Operateur, Verification, Admin } from '../../models/index.js';
import { generateToken } from '../../middleware/auth.js';
import jwt from 'jsonwebtoken';
import transporter from '../../config/mailer.js';
import util from 'util';

const router = express.Router();
const sendMail = util.promisify(transporter.sendMail.bind(transporter));

// Validation
const loginValidation = [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Mot de passe requis')
];

const registerValidation = [
    body('name').notEmpty().withMessage('Nom requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('telephone').notEmpty().withMessage('Téléphone requis')
];

// Générer mot de passe random
function generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 10 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}


router.post('/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // 1. Chercher l'utilisateur (opérateur ou admin)
        let user = await Operateur.findOne({ where: { email } });
        let role = 'operateur';

        if (!user) {
            user = await Admin.findOne({ where: { email } });
            role = 'admin';
            if (!user) {
                return res.status(401).json({ message: 'Identifiants invalides' });
            }
        }

        // 2. Vérifier le mot de passe
        if (!user.password || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        // 3. Vérifier si le compte est désactivé (opérateur seulement)
        if (role === 'operateur' && (user.disabled === 0 || user.disabled === false)) {
            return res.status(403).json({ message: 'Compte non vérifié' });
        }

        // 4. Générer le token et répondre
        const token = generateToken(user, role);
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name || user.nom,
                telephone: user.telephone || user.tel || null,
                role,
                disabled: user.disabled || false
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});



// Inscription opérateur
router.post('/operateur/register', registerValidation, async (req, res) => {
    try {
        const { name, email, telephone } = req.body;

        const existing = await Operateur.findOne({ where: { email } });
        if (existing) return res.status(400).json({ message: 'Email déjà utilisé' });

        const password = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        const operateur = await Operateur.create({
            name,
            email,
            telephone,
            password: hashedPassword,
            disabled: 1
        });

        const token = jwt.sign({ id: operateur.id, email }, process.env.JWT_SECRET, { expiresIn: '24h' });

        await Verification.create({ email, code: token });

        const verificationUrl = `http://localhost:${process.env.PORT}/api/auth/verify-operateur/${token}`;

        await sendMail({
            from: 'mohamedsoltani448@gmail.com',
            to: email,
            subject: 'Vérification de votre compte opérateur',
            html: `<p>Bonjour ${name},</p>
            <p>Merci de votre inscription.</p>
            <p>Pour activer votre compte, cliquez sur le lien suivant :</p>
            <a href="${verificationUrl}">Activer mon compte</a>`
        });

        res.status(201).json({
            message: 'Opérateur enregistré. Vérifiez votre email.',
            operateur: {
                name,
                email,
                telephone,
                password
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Vérification email opérateur
router.get('/verify-operateur/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const operateur = await Operateur.findByPk(decoded.id);
        if (!operateur) return res.status(404).json({ message: 'Opérateur introuvable' });

        const verif = await Verification.findOne({ where: { code: token } });
        if (!verif) return res.status(400).json({ message: 'Lien expiré ou invalide' });

        const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
        res.redirect(`${FRONTEND_URL}/set-password?token=${token}`);
    } catch (error) {
        res.status(400).json({ message: 'Lien invalide ou expiré' });
    }
});

// Définir mot de passe
router.post('/operateur/set-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const operateur = await Operateur.findByPk(decoded.id);
        if (!operateur) return res.status(404).json({ message: 'Opérateur introuvable' });

        if (password.length < 8) {
            return res.status(400).json({ message: 'Mot de passe trop court (min 8 caractères)' });
        }

        operateur.password = await bcrypt.hash(password, 10);
        operateur.disabled = 0;
        await operateur.save();

        await Verification.destroy({ where: { email: operateur.email } });

        res.status(200).json({ message: 'Mot de passe défini avec succès' });
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la mise à jour du mot de passe' });
    }
});

// Demande de réinitialisation
router.post('/reset-password-operateur', body('email').isEmail(), async (req, res) => {
    try {
        const { email } = req.body;
        const operateur = await Operateur.findOne({ where: { email } });

        if (!operateur) return res.status(400).json({ message: 'Email non trouvé' });

        const token = jwt.sign({ id: operateur.id, email }, process.env.JWT_SECRET, { expiresIn: '15m' });

        await Verification.create({ email, code: token });

        const resetUrl = `http://localhost:${process.env.PORT}/api/auth/reset-password-operateur/${token}`;

        await sendMail({
            from: 'mohamedsoltani448@gmail.com',
            to: email,
            subject: 'Réinitialisation du mot de passe',
            html: `<p>Bonjour ${operateur.name},</p>
             <p>Cliquez ci-dessous pour réinitialiser votre mot de passe :</p>
             <a href="${resetUrl}">Réinitialiser mon mot de passe</a>`
        });

        res.json({ message: 'Email de réinitialisation envoyé.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Redirection après clic sur lien de reset
router.get('/reset-password-operateur/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const verif = await Verification.findOne({ where: { code: token } });
        if (!verif) return res.status(400).json({ message: 'Token invalide ou expiré' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const operateur = await Operateur.findByPk(decoded.id);
        if (!operateur) return res.status(404).json({ message: 'Opérateur introuvable' });

        await Verification.destroy({ where: { code: token } });

        const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
        res.redirect(`${FRONTEND_URL}/set-password?token=${token}`);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
