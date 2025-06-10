const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function register(data) {
    const { name, email, password } = data;
    const existing = await User.findOne({ where: { email } });
    if (existing) return { status: 400, body: { message: 'Email already exists' } };

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    return { status: 201, body: { id: user.id, email: user.email } };
}

async function login(data) {
    const { email, password } = data;
    const user = await User.findOne({ where: { email } });
    if (!user) return { status: 401, body: { message: 'Invalid credentials' } };

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return { status: 401, body: { message: 'Invalid credentials' } };


    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET
    );

    return { status: 200, body: { token } };
}


async function ValidateUser(user) {
    const userCandidate = await User.findOne({ where: { id: user.userId } });

    if (!userCandidate) return null;

    return {
        id: userCandidate.id,
        email: userCandidate.email,
        role: userCandidate.role
    };
}




module.exports = { register, login, ValidateUser };
