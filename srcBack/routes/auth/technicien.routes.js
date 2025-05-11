import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { Admin, Operateur, Technicien, Verification } from '../../models/index.js';
import { generateToken } from '../../middleware/auth.js';
import upload from '../../middleware/upload.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import transporter from '../../config/mailer.js';
import util from 'util';
import { log } from 'console';
const sendMail = util.promisify(transporter.sendMail.bind(transporter));


const router = express.Router();

// Validation middleware
const loginValidation = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
];

const registerValidation = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    //body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('nom').notEmpty().withMessage('Name is required'),
    body('prenom').notEmpty().withMessage('First name is required'),
    body('telephone').notEmpty().withMessage('Phone number is required'),
    body('code_postal').notEmpty().withMessage('Postal code is required'),
]


// Validation pour l'inscription admin
const registerAdminValidation = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('nom').notEmpty().withMessage('Name is required'),
    body('prenom').notEmpty().withMessage('First name is required'),
    body('tel').notEmpty().withMessage('Phone number is required'),
];

function generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}


// Technicien login
router.post('/technicien/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const technicien = await Technicien.findOne({ where: { email } });

        if (!technicien || !(await bcrypt.compare(password, technicien.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!technicien.acceptation) {
            return res.status(403).json({ message: 'Account not yet approved' });
        }

        const token = generateToken(technicien, 'technicien');
        res.json({
            token,
            technicien: {
                id: technicien.id,
                email: technicien.email,
                nom: technicien.nom,
                prenom: technicien.prenom,
                code_postal: technicien.code_postal,
                disponibilite: technicien.disponibilite,
                telephone: technicien.telephone,
                role: 'technicien',
                acceptation: technicien.acceptation,
                date_login: technicien.date_login,
                file: technicien.file
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



router.post('/technicien/register', upload.single('file'), async (req, res) => {
    try {
        // Récupération des données du formulaire
        const { email, nom, prenom, telephone, code_postal } = req.body;

        // Debug: Affiche le corps de la requête et les fichiers
        console.log("Données reçues:", {
            body: req.body,
            file: req.file ? req.file : 'Aucun fichier'
        });

        // Validation des champs requis
        const requiredFields = { email, nom, prenom, telephone, code_postal };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Tous les champs sont requis',
                missingFields
            });
        }

        // Vérification de l'unicité
        const [existingEmail, existingPhone] = await Promise.all([
            Technicien.findOne({ where: { email } }),
            Technicien.findOne({ where: { telephone } })
        ]);

        if (existingEmail) {
            return res.status(400).json({ message: 'Email déjà utilisé' });
        }
        if (existingPhone) {
            return res.status(400).json({ message: 'Téléphone déjà utilisé' });
        }

        // Génération du mot de passe
        const password = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Création du technicien
        const technicienData = {
            email,
            password: hashedPassword,
            nom,
            prenom,
            telephone,
            code_postal,
            acceptation: false,
            disponibilite: false,
            file: req.file?.path
        };

        const technicien = await Technicien.create(technicienData);

        // ... reste du code pour l'email de vérification ...

        res.status(201).json({
            message: 'Inscription réussie',
            technicien: {
                id: technicien.id,
                email: technicien.email,
                nom: technicien.nom,
                prenom: technicien.prenom,
                telephone: technicien.telephone,
                code_postal: technicien.code_postal,
                file: technicien.file
            }
        });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            message: 'Erreur serveur',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});



router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const technicien = await Technicien.findByPk(decoded.id);

        if (!technicien) {
            return res.status(404).json({ message: 'Technicien non trouvé' });
        }
        const verifToken = await Verification.findOne({ where: { code: token } })
        if (!verifToken) {
            return res.status(400).json({ message: 'Expired Token' });
        }
        // Rediriger vers le frontend avec le token
        const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
        res.redirect(`${FRONTEND_URL}/set-password?token=${token}`);


    } catch (error) {
        res.status(400).json({ message: 'Lien de vérification invalide ou expiré' });
    }
});


router.post('/technicien/set-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const technicien = await Technicien.findByPk(decoded.id);


        if (!technicien) {
            return res.status(404).json({ message: 'Technicien non trouvé' });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        technicien.password = hashedPassword;
        technicien.acceptation = true; // Activation du compte
        await technicien.save();
        const verif = await Verification.destroy({ where: { email: technicien.email } })

        res.status(200).json({ message: 'Mot de passe défini avec succès, vous pouvez vous connecter.' });

    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la mise à jour du mot de passe' });
    }
});



router.post('/reset-password-technicien',
    body('email').isEmail().withMessage('Please enter a valid email'),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email } = req.body;
            const technicien = await Technicien.findOne({ where: { email } });
            if (!technicien) {
                return res.status(400).json({ message: 'Email not found' });
            }

            const verificationToken = jwt.sign(
                { email: technicien.email, id: technicien.id },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
            );

            const verificationUrl = `http://localhost:${process.env.PORT}/api/auth/reset-password-technicien/${verificationToken}`;

            const verif = await Verification.create({
                email: technicien.email,
                code: verificationToken
            });

            if (!verif) {
                return res.status(400).json({ message: 'Erreur lors de la création du token de vérification' });
            }

            const mailOptions = {
                from: 'mohamedsoltani448@gmail.com',
                to: technicien.email,
                subject: 'Réinitialisation du mot de passe Technicien',
                html: `<p>Bonjour ${technicien.nom},</p>
                    <p>Pour réinitialiser votre mot de passe, cliquez sur le lien ci-dessous :</p>
                    <a href="${verificationUrl}">Réinitialiser mon mot de passe</a>
                    <p>Ce lien expirera dans 15 minutes.</p>`
            };

            await sendMail(mailOptions);

            res.json({ message: 'Email de réinitialisation envoyé avec succès.' });

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

// 💡 Route pour gérer le lien de réinitialisation (clic depuis email)
router.get('/reset-password-technicien/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const verification = await Verification.findOne({ where: { code: token } });
        if (!verification) {
            return res.status(400).json({ message: 'Token invalide ou expiré' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const technicien = await Technicien.findByPk(decoded.id);

        if (!technicien) {
            return res.status(404).json({ message: 'Technicien non trouvé' });
        }

        await Verification.destroy({ where: { code: token } });

        const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
        res.redirect(`${FRONTEND_URL}/set-password?token=${token}`);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export default router;