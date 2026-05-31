const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../services/prismaClient');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        const userExists = await prisma.user.findUnique({
            where: { email }
        });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'BUYER'
            }
        });

        if (user) {
            res.status(201).json({
                id: user.id,
                _id: user.id, // For backward compatibility
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
            });
        }
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { registerUser, loginUser };
