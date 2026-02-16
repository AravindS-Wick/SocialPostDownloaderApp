"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = userRoutes;
exports.userRoutes = userRoutes;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const USERS_DB = path_1.default.join(__dirname, '../../db/users.json');
const GUEST_LOG = path_1.default.join(__dirname, '../../db/guest_downloads.json');
function readUsers() {
    if (!fs_1.default.existsSync(USERS_DB))
        return [];
    return JSON.parse(fs_1.default.readFileSync(USERS_DB, 'utf-8'));
}
function writeUsers(users) {
    fs_1.default.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));
}
function logGuestDownload(entry) {
    let logs = [];
    if (fs_1.default.existsSync(GUEST_LOG)) {
        logs = JSON.parse(fs_1.default.readFileSync(GUEST_LOG, 'utf-8'));
    }
    logs.unshift(entry);
    fs_1.default.writeFileSync(GUEST_LOG, JSON.stringify(logs.slice(0, 1000), null, 2));
}
async function userRoutes(fastify) {
    // Signup
    fastify.post('/signup', async (request, reply) => {
        const { email, password } = request.body;
        if (!email || !password) {
            return reply.code(400).send({ message: 'Email and password required' });
        }
        const users = readUsers();
        if (users.find(u => u.email === email)) {
            return reply.code(409).send({ message: 'User already exists' });
        }
        const hash = await bcryptjs_1.default.hash(password, 10);
        users.push({ email, password: hash, created: Date.now(), downloads: [] });
        writeUsers(users);
        reply.send({ success: true });
    });
    // Login
    fastify.post('/login', async (request, reply) => {
        const { email, password } = request.body;
        const users = readUsers();
        const user = users.find(u => u.email === email);
        if (!user) {
            return reply.code(401).send({ message: 'Invalid credentials' });
        }
        const match = await bcryptjs_1.default.compare(password, user.password);
        if (!match) {
            return reply.code(401).send({ message: 'Invalid credentials' });
        }
        reply.send({ success: true, email });
    });
    // Get profile
    fastify.get('/profile', async (request, reply) => {
        const { email } = request.query;
        const users = readUsers();
        const user = users.find(u => u.email === email);
        if (!user) {
            return reply.code(404).send({ message: 'User not found' });
        }
        reply.send({ email: user.email, created: user.created, downloads: user.downloads });
    });
    // Social login stubs
    fastify.post('/connect/instagram', async (request, reply) => {
        reply.send({ success: true, message: 'Instagram connect stub' });
    });
    fastify.post('/connect/twitter', async (request, reply) => {
        reply.send({ success: true, message: 'Twitter connect stub' });
    });
    fastify.post('/connect/youtube', async (request, reply) => {
        reply.send({ success: true, message: 'YouTube connect stub' });
    });
    // Log download attempt/completion/consent
    fastify.post('/log', async (request, reply) => {
        const { email, type, status, meta, ageConsent } = request.body;
        const entry = {
            email: email || null,
            type,
            status,
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
