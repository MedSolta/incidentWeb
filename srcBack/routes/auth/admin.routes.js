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


const router = express.Router();

// Validation middleware
const loginValidation = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
];

const registerValidation = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
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



// Admin login
router.post('/admin/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const admin = await Admin.findOne({ where: { email } });
        console.log('Admin trouvé:', admin);

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials: Admin not found' });
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials: Password does not match' });
        }

        const token = generateToken(admin, 'admin');
        res.json({
            token,
            admin: {
                id: admin.id,
                email: admin.email,
                nom: admin.nom,
                prenom: admin.prenom,
                tel: admin.tel,
                role: 'admin',
                date_login: admin.date_login
            }
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: error.message });
    }
});


// inscription pour un admin
router.post('/admin/register', registerAdminValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, nom, prenom, tel } = req.body;

        // Vérifier si l'admin existe déjà
        const existingAdmin = await Admin.findOne({ where: { email } });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Mot de passe haché généré:', hashedPassword);

        // Création de l'admin
        const admin = await Admin.create({
            email,
            password: hashedPassword,
            nom,
            prenom,
            tel: tel,
            role: 1, // 1 pour admin
        });

        res.status(201).json({
            message: 'Admin registered successfully',
            admin: {
                id: admin.id,
                email: admin.email,
                nom: admin.nom,
                prenom: admin.prenom,
                tel: admin.tel,
                role: admin.role,
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export default router;