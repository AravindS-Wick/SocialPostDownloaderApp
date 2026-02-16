const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const USERS_DB = path.join(__dirname, '../../db/users.json');
const GUEST_LOG = path.join(__dirname, '../../db/guest_downloads.json');

function readUsers() {
    if (!fs.existsSync(USERS_DB)) return [];
    return JSON.parse(fs.readFileSync(USERS_DB, 'utf-8'));
}
function writeUsers(users) {
    fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));
}
function logGuestDownload(entry) {
    let logs = [];
    if (fs.existsSync(GUEST_LOG)) logs = JSON.parse(fs.readFileSync(GUEST_LOG, 'utf-8'));
    logs.unshift(entry);
    fs.writeFileSync(GUEST_LOG, JSON.stringify(logs.slice(0, 1000), null, 2));
}

async function userRoutes(fastify, opts) {
    // Signup
    fastify.post('/signup', async (request, reply) => {
        const { email, password } = request.body || request.body || request.data || {};
        if (!email || !password) return reply.code(400).send({ message: 'Email and password required' });
        const users = readUsers();
        if (users.find(u => u.email === email)) return reply.code(409).send({ message: 'User already exists' });
        const hash = await bcrypt.hash(password, 10);
        users.push({ email, password: hash, created: Date.now(), downloads: [] });
        writeUsers(users);
        reply.send({ success: true });
    });

    // Login
    fastify.post('/login', async (request, reply) => {
        const { email, password } = request.body || request.body || request.data || {};
        const users = readUsers();
        const user = users.find(u => u.email === email);
        if (!user) return reply.code(401).send({ message: 'Invalid credentials' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return reply.code(401).send({ message: 'Invalid credentials' });
        reply.send({ success: true, email });
    });

    // Get profile
    fastify.get('/profile', (request, reply) => {
        const { email } = request.query;
        const users = readUsers();
        const user = users.find(u => u.email === email);
        if (!user) return reply.code(404).send({ message: 'User not found' });
        reply.send({ email: user.email, created: user.created, downloads: user.downloads });
    });

    // Social login stubs
    fastify.post('/connect/instagram', (request, reply) => {
        reply.send({ success: true, message: 'Instagram connect stub' });
    });
    fastify.post('/connect/twitter', (request, reply) => {
        reply.send({ success: true, message: 'Twitter connect stub' });
    });
    fastify.post('/connect/youtube', (request, reply) => {
        reply.send({ success: true, message: 'YouTube connect stub' });
    });

    // Log download attempt/completion/consent
    fastify.post('/log', (request, reply) => {
        const { email, type, status, meta, ageConsent } = request.body;
        const entry = {
            email: email || null,
            type,
            status, // 'attempt', 'complete', 'consent'
            meta,
            ageConsent: !!ageConsent,
            date: Date.now(),
        };
        if (email) {
            const users = readUsers();
            const user = users.find(u => u.email === email);
            if (user) {
                user.downloads = user.downloads || [];
                user.downloads.unshift(entry);
                writeUsers(users);
                return reply.send({ success: true });
            }
        }
        logGuestDownload(entry);
        reply.send({ success: true });
    });
}

module.exports = userRoutes; 
