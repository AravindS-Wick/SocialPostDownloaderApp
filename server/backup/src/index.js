"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const twitter_api_v2_1 = require("twitter-api-v2");
const instagram_private_api_1 = require("instagram-private-api");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const execAsync = util_1.default.promisify(child_process_1.exec);
const app = (0, fastify_1.default)({
    logger: {
        level: 'info',
        transport: {
            target: 'pino-pretty'
        }
    }
});
// Add request logging
app.addHook('onRequest', (request, reply, done) => {
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
    done();
});
// Add response logging
app.addHook('onResponse', (request, reply, done) => {
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.url} - ${reply.statusCode}`);
    done();
});
// Enable CORS with more specific options
app.register(cors_1.default, {
    origin: ['http://localhost:2000', 'http://127.0.0.1:2000'], // Allow both localhost and 127.0.0.1
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Disposition', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition', 'Content-Length', 'Content-Type'],
    credentials: false,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400 // 24 hours
});
// Swagger documentation
app.register(swagger_1.default, {
    swagger: {
        info: {
            title: 'Social Media Downloader API',
            description: 'API for downloading content from various social media platforms',
            version: '1.0.0'
        }
    }
});
app.register(swagger_ui_1.default, {
    routePrefix: '/documentation'
});
// Create downloads directory if it doesn't exist
const downloadsDir = path_1.default.join(__dirname, '..', 'downloads');
if (!fs_1.default.existsSync(downloadsDir)) {
    fs_1.default.mkdirSync(downloadsDir);
}
// Serve static files from the downloads directory with proper headers
app.register(require('@fastify/static'), {
    root: downloadsDir,
    prefix: '/downloads/',
    setHeaders: (res, filePath) => {
        res.setHeader('Content-Disposition', `attachment; filename="${path_1.default.basename(filePath)}"`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    }
});
// Initialize platform-specific clients
const twitterClient = new twitter_api_v2_1.TwitterApi(process.env.TWITTER_BEARER_TOKEN || '');
const ig = new instagram_private_api_1.IgApiClient();
function isDownloadError(error) {
    return error instanceof Error && 'filename' in error;
}
// Helper function to generate unique filename
const generateFilename = (platform, type, extension) => {
    return `${platform}-${type}-${Date.now()}.${extension}`;
};
// Helper function to clean filename
function cleanFilename(filename) {
    return filename.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
}
// Helper function to check if URL is from YouTube
function isYouTubeURL(url) {
    return url.includes('youtube.com') || url.includes('youtu.be');
}
// YouTube download handler
async function downloadYouTube(url, type) {
    let outputPath = ''; // Initialize with empty string
    try {
        console.log(`Starting YouTube download for URL: ${url}`);
        // Clean the URL by removing any query parameters
        const cleanUrl = url.split('?')[0];
        console.log(`Cleaned URL: ${cleanUrl}`);
        // Select format based on type
        let format;
        if (type === 'audio') {
            format = 'bestaudio[ext=m4a]/bestaudio/best';
        }
        else {
            format = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
        }
        console.log(`Selected format: ${format}`);
        const timestamp = Date.now();
        const ext = type === 'audio' ? 'm4a' : 'mp4';
        const filename = `youtube_${timestamp}.${ext}`;
        outputPath = path_1.default.join(downloadsDir, filename);
        console.log(`Output path: ${outputPath}`);
        // Single command to download and get metadata
        const command = `yt-dlp "${cleanUrl}" -f "${format}" -o "${outputPath}" --write-info-json --no-warnings --progress --newline`;
        console.log(`Executing command: ${command}`);
        const { stdout, stderr } = await execAsync(command);
        if (stderr) {
            console.error('YouTube download error:', stderr);
            throw new Error('Failed to download from YouTube');
        }
        // Wait a moment to ensure file is written
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Verify the downloaded file
        if (!fs_1.default.existsSync(outputPath)) {
            console.error('File not found at path:', outputPath);
            throw new Error('Downloaded file not found');
        }
        const stats = fs_1.default.statSync(outputPath);
        console.log(`Downloaded file size: ${stats.size} bytes`);
        if (stats.size < 1000) { // Less than 1KB
            console.error('File too small:', stats.size);
            throw new Error('Downloaded file is too small, download may have failed');
        }
        // Try to read metadata from the info json file
        let meta = {
            title: 'YouTube Video',
            thumbnail: '',
            channel: '',
            hashtags: [],
            length: '',
            ageRestriction: false,
        };
        try {
            const infoJsonPath = outputPath + '.info.json';
            if (fs_1.default.existsSync(infoJsonPath)) {
                const info = JSON.parse(fs_1.default.readFileSync(infoJsonPath, 'utf8'));
                meta = {
                    title: info.title || 'YouTube Video',
                    thumbnail: info.thumbnail || '',
                    channel: info.uploader || '',
                    hashtags: info.tags || [],
                    length: info.duration_string || '',
                    ageRestriction: info.age_limit > 0,
                };
                // Clean up the info json file
                fs_1.default.unlinkSync(infoJsonPath);
            }
        }
        catch (e) {
            console.warn('Could not read metadata:', e);
            // Continue with default metadata
        }
        console.log('Download completed successfully');
        return {
            success: true,
            downloadUrl: `/downloads/${filename}`,
            filename,
            ...meta,
        };
    }
    catch (error) {
        console.error('YouTube download error:', error);
        // Clean up any partial download
        try {
            if (outputPath && fs_1.default.existsSync(outputPath)) {
                fs_1.default.unlinkSync(outputPath);
            }
            // Also clean up info json if it exists
            const infoJsonPath = outputPath + '.info.json';
            if (fs_1.default.existsSync(infoJsonPath)) {
                fs_1.default.unlinkSync(infoJsonPath);
            }
        }
        catch (e) {
            console.warn('Error cleaning up partial download:', e);
        }
        throw error;
    }
}
// Instagram download handler
async function downloadInstagram(url, type) {
    try {
        console.log(`Starting Instagram download for URL: ${url}`);
        const timestamp = Date.now();
        const ext = type === 'audio' ? 'm4a' : 'mp4';
        const filename = `instagram_${timestamp}.${ext}`;
        const outputPath = path_1.default.join(downloadsDir, filename);
        console.log(`Output path: ${outputPath}`);
        // Select format based on type
        let format;
        if (type === 'audio') {
            format = 'bestaudio[ext=m4a]/bestaudio/best';
        }
        else {
            format = 'best[ext=mp4]/best';
        }
        console.log(`Selected format: ${format}`);
        // Build the command with additional options
        const command = `yt-dlp "${url}" -f "${format}" -o "${outputPath}" --no-warnings --progress --newline`;
        console.log(`Executing command: ${command}`);
        const { stdout, stderr } = await execAsync(command);
        if (stderr) {
            console.error('Instagram download error:', stderr);
            throw new Error('Failed to download from Instagram');
        }
        // Verify the downloaded file
        if (!fs_1.default.existsSync(outputPath)) {
            throw new Error('Downloaded file not found');
        }
        const stats = fs_1.default.statSync(outputPath);
        console.log(`Downloaded file size: ${stats.size} bytes`);
        if (stats.size < 1000) { // Less than 1KB
            throw new Error('Downloaded file is too small, download may have failed');
        }
        // Mock metadata for Instagram
        const meta = {
            title: `Instagram Post ${timestamp}`,
            thumbnail: '',
            channel: '',
            hashtags: [],
            length: '',
            ageRestriction: false,
        };
        console.log('Download completed successfully');
        return {
            success: true,
            downloadUrl: `/downloads/${filename}`,
            filename,
            ...meta,
        };
    }
    catch (error) {
        console.error('Instagram download error:', error);
        throw error;
    }
}
// Twitter/X download handler
async function downloadTwitter(url, type) {
    try {
        console.log(`Starting Twitter download for URL: ${url}`);
        const timestamp = Date.now();
        const ext = type === 'audio' ? 'm4a' : 'mp4';
        const filename = `twitter_${timestamp}.${ext}`;
        const outputPath = path_1.default.join(downloadsDir, filename);
        console.log(`Output path: ${outputPath}`);
        // Select format based on type
        let format;
        if (type === 'audio') {
            format = 'bestaudio[ext=m4a]/bestaudio/best';
        }
        else {
            format = 'best[ext=mp4]/best';
        }
        console.log(`Selected format: ${format}`);
        // Build the command with additional options
        const command = `yt-dlp "${url}" -f "${format}" -o "${outputPath}" --no-warnings --progress --newline`;
        console.log(`Executing command: ${command}`);
        const { stdout, stderr } = await execAsync(command);
        if (stderr) {
            console.error('Twitter download error:', stderr);
            throw new Error('Failed to download from Twitter');
        }
        // Verify the downloaded file
        if (!fs_1.default.existsSync(outputPath)) {
            throw new Error('Downloaded file not found');
        }
        const stats = fs_1.default.statSync(outputPath);
        console.log(`Downloaded file size: ${stats.size} bytes`);
        if (stats.size < 1000) { // Less than 1KB
            throw new Error('Downloaded file is too small, download may have failed');
        }
        // Mock metadata for Twitter
        const meta = {
            title: `Twitter Post ${timestamp}`,
            thumbnail: '',
            channel: '',
            hashtags: [],
            length: '',
            ageRestriction: false,
        };
        console.log('Download completed successfully');
        return {
            success: true,
            downloadUrl: `/downloads/${filename}`,
            filename,
            ...meta,
        };
    }
    catch (error) {
        console.error('Twitter download error:', error);
        throw error;
    }
}
// Download route
app.post('/api/download', async (request, reply) => {
    try {
        const { url, type } = request.body;
        let result;
        if (isYouTubeURL(url)) {
            result = await downloadYouTube(url, type);
        }
        else if (url.includes('instagram.com')) {
            result = await downloadInstagram(url, type);
        }
        else if (url.includes('twitter.com') || url.includes('x.com')) {
            result = await downloadTwitter(url, type);
        }
        else {
            return reply.code(400).send({
                success: false,
                error: 'Unsupported platform'
            });
        }
        return reply.send(result);
    }
    catch (error) {
        console.error('Download error:', error);
        if (isDownloadError(error)) {
            return reply.code(500).send({
                success: false,
                error: error.message || 'Unknown error occurred',
                filename: error.filename
            });
        }
        return reply.code(500).send({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
// Serve downloaded files with proper headers
app.get('/downloads/:filename', async (request, reply) => {
    try {
        const { filename } = request.params;
        const filepath = path_1.default.join(downloadsDir, filename);
        if (!fs_1.default.existsSync(filepath)) {
            return reply.code(404).send({ success: false, message: 'File not found' });
        }
        const stats = fs_1.default.statSync(filepath);
        if (stats.size < 1000) {
            return reply.code(500).send({ success: false, message: 'File is too small, download may have failed' });
        }
        // Set headers
        reply.header('Content-Disposition', `attachment; filename="${filename}"`);
        reply.header('Content-Type', filename.endsWith('.mp4') ? 'video/mp4' : 'audio/mp4');
        reply.header('Content-Length', stats.size);
        reply.header('Access-Control-Expose-Headers', 'Content-Disposition');
        // Create a read stream and pipe it to the response
        const stream = fs_1.default.createReadStream(filepath);
        return reply.send(stream);
    }
    catch (error) {
        console.error('Error serving file:', error);
        return reply.code(500).send({
            success: false,
            message: 'Error serving file: ' + (error instanceof Error ? error.message : 'Unknown error')
        });
    }
});
// Add root route handler
app.get('/', async (request, reply) => {
    return { message: 'Social Media Downloader API is running' };
});
// Start server
const start = async () => {
    try {
        await app.listen({ port: 2500, host: '0.0.0.0' });
        console.log('Server is running on port 2500');
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    app.log.error('Uncaught Exception:', err);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    app.log.error('Unhandled Rejection:', err);
    process.exit(1);
});
app.register(require('./routes/user'), { prefix: '/api/user' });
start();
