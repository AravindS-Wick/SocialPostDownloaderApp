const fastify = require('fastify');
const cors = require('@fastify/cors');
const swagger = require('@fastify/swagger');
const swaggerUi = require('@fastify/swagger-ui');
const { TwitterApi } = require('twitter-api-v2');
const { IgApiClient } = require('instagram-private-api');
const ytdl = require('ytdl-core');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const express = require('express');
const userRoutes = require('./routes/user');
require('dotenv').config();

const execAsync = util.promisify(exec);
const app = fastify({
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
app.register(cors, {
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
app.register(swagger, {
    swagger: {
        info: {
            title: 'Social Media Downloader API',
            description: 'API for downloading content from various social media platforms',
            version: '1.0.0'
        }
    }
});

app.register(swaggerUi, {
    routePrefix: '/documentation'
});

// Create downloads directory if it doesn't exist
const downloadsDir = path.join(__dirname, '..', 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
}

// Serve static files from the downloads directory with proper headers
app.register(require('@fastify/static'), {
    root: downloadsDir,
    prefix: '/downloads/',
    setHeaders: (res, path) => {
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(path)}"`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    }
});

// Initialize platform-specific clients
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
const ig = new IgApiClient();

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
    try {
        console.log(`Starting YouTube download for URL: ${url}`);

        // Clean the URL by removing any query parameters
        const cleanUrl = url.split('?')[0];
        console.log(`Cleaned URL: ${cleanUrl}`);

        // Select format based on type
        let format;
        if (type === 'audio') {
            format = 'bestaudio[ext=m4a]/bestaudio/best';
        } else {
            format = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
        }
        console.log(`Selected format: ${format}`);

        const timestamp = Date.now();
        const ext = type === 'audio' ? 'm4a' : 'mp4';
        const filename = `youtube_${timestamp}.${ext}`;
        const outputPath = path.join(downloadsDir, filename);
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
        if (!fs.existsSync(outputPath)) {
            console.error('File not found at path:', outputPath);
            throw new Error('Downloaded file not found');
        }

        const stats = fs.statSync(outputPath);
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
            if (fs.existsSync(infoJsonPath)) {
                const info = JSON.parse(fs.readFileSync(infoJsonPath, 'utf8'));
                meta = {
                    title: info.title || 'YouTube Video',
                    thumbnail: info.thumbnail || '',
                    channel: info.uploader || '',
                    hashtags: info.tags || [],
                    length: info.duration_string || '',
                    ageRestriction: info.age_limit > 0,
                };
                // Clean up the info json file
                fs.unlinkSync(infoJsonPath);
            }
        } catch (e) {
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
    } catch (error) {
        console.error('YouTube download error:', error);
        // Clean up any partial download
        try {
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
            // Also clean up info json if it exists
            const infoJsonPath = outputPath + '.info.json';
            if (fs.existsSync(infoJsonPath)) {
                fs.unlinkSync(infoJsonPath);
            }
        } catch (e) {
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
        const outputPath = path.join(downloadsDir, filename);
        console.log(`Output path: ${outputPath}`);

        // Select format based on type
        let format;
        if (type === 'audio') {
            format = 'bestaudio[ext=m4a]/bestaudio/best';
        } else {
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
        if (!fs.existsSync(outputPath)) {
            throw new Error('Downloaded file not found');
        }

        const stats = fs.statSync(outputPath);
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
    } catch (error) {
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
        const outputPath = path.join(downloadsDir, filename);
        console.log(`Output path: ${outputPath}`);

        // Select format based on type
        let format;
        if (type === 'audio') {
            format = 'bestaudio[ext=m4a]/bestaudio/best';
        } else {
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
        if (!fs.existsSync(outputPath)) {
            throw new Error('Downloaded file not found');
        }

        const stats = fs.statSync(outputPath);
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
    } catch (error) {
        console.error('Twitter download error:', error);
        throw error;
    }
}

// Download endpoint
app.post('/api/download', async (request, reply) => {
    let stream;
    let outputPath;
    try {
        console.log('Received download request:', request.body);
        const { url, type, user, ageConsent } = request.body;

        if (!url) {
            console.log('Error: URL is missing');
            return reply.code(400).send({ success: false, message: 'URL is required' });
        }

        if (!['video', 'audio'].includes(type)) {
            console.log('Error: Invalid type:', type);
            return reply.code(400).send({ success: false, message: 'Invalid type. Must be "video" or "audio"' });
        }

        console.log(`Processing download request for ${type} from URL: ${url}`);

        // Clean the URL by removing any query parameters
        const cleanUrl = url.split('?')[0];
        console.log(`Cleaned URL: ${cleanUrl}`);

        // Select format based on type
        let format;
        if (type === 'audio') {
            format = 'bestaudio[ext=m4a]/bestaudio/best';
        } else {
            format = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
        }
        console.log(`Selected format: ${format}`);

        const timestamp = Date.now();
        const ext = type === 'audio' ? 'm4a' : 'mp4';
        const filename = `youtube_${timestamp}.${ext}`;
        outputPath = path.join(downloadsDir, filename);
        console.log(`Output path: ${outputPath}`);

        // Download the file and get metadata
        const command = `yt-dlp "${cleanUrl}" -f "${format}" -o "${outputPath}" --write-info-json --no-warnings --progress --newline`;
        console.log(`Executing command: ${command}`);

        const { stdout, stderr } = await execAsync(command);

        if (stderr) {
            console.error('Download error:', stderr);
            throw new Error('Failed to download content');
        }

        // Wait a moment to ensure file is written
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verify the downloaded file
        if (!fs.existsSync(outputPath)) {
            console.error('File not found at path:', outputPath);
            throw new Error('Downloaded file not found');
        }

        const stats = fs.statSync(outputPath);
        console.log(`Downloaded file size: ${stats.size} bytes`);

        if (stats.size < 1000) { // Less than 1KB
            console.error('File too small:', stats.size);
            throw new Error('Downloaded file is too small, download may have failed');
        }

        // Try to parse metadata from info.json
        let metadata = {
            title: `Download ${timestamp}`,
            thumbnail: '',
            channel: '',
            hashtags: [],
            length: '',
            ageRestriction: false
        };

        try {
            const infoJsonPath = outputPath + '.info.json';
            if (fs.existsSync(infoJsonPath)) {
                const infoJson = JSON.parse(fs.readFileSync(infoJsonPath, 'utf8'));
                metadata = {
                    title: infoJson.title || metadata.title,
                    thumbnail: infoJson.thumbnail || '',
                    channel: infoJson.channel || '',
                    hashtags: infoJson.tags || [],
                    length: infoJson.duration_string || '',
                    ageRestriction: infoJson.age_limit > 0
                };
            }
        } catch (e) {
            console.warn('Could not parse metadata:', e);
        }

        // Log the download
        try {
            await app.db.collection('downloads').insertOne({
                email: user || null,
                type,
                status: 'complete',
                meta: metadata,
                ageConsent: ageConsent || false,
                timestamp: new Date(),
                url: cleanUrl,
                filename
            });
        } catch (e) {
            console.warn('Could not log download:', e);
        }

        // Set response headers
        const contentType = type === 'audio' ? 'audio/mp4' : 'video/mp4';
        reply.header('Content-Type', contentType);
        reply.header('Content-Length', stats.size);
        reply.header('Content-Disposition', `attachment; filename="${filename}"`);
        reply.header('X-Title', metadata.title);
        reply.header('X-Thumbnail', metadata.thumbnail);
        reply.header('X-Channel', metadata.channel);
        reply.header('X-Hashtags', JSON.stringify(metadata.hashtags));
        reply.header('X-Length', metadata.length);
        reply.header('X-Age-Restriction', metadata.ageRestriction.toString());
        reply.header('Transfer-Encoding', 'chunked');
        reply.header('Cache-Control', 'no-cache');
        reply.header('Pragma', 'no-cache');

        // Create a read stream with 1MB chunks
        stream = fs.createReadStream(outputPath, {
            highWaterMark: 1024 * 1024 // 1MB chunks
        });

        // Handle stream errors
        stream.on('error', (error) => {
            console.error('Stream error:', error);
            if (!reply.sent) {
                reply.code(500).send({
                    success: false,
                    message: 'Error streaming file: ' + error.message
                });
            }
            cleanup();
        });

        // Handle client disconnect
        request.raw.on('close', () => {
            console.log('Client disconnected, destroying stream');
            cleanup();
        });

        // Handle stream end
        stream.on('end', () => {
            console.log('Stream ended successfully');
            cleanup();
        });

        // Handle stream data
        let bytesSent = 0;
        stream.on('data', (chunk) => {
            bytesSent += chunk.length;
            console.log(`Sent ${bytesSent} bytes of ${stats.size}`);
        });

        // Cleanup function
        function cleanup() {
            if (stream) {
                stream.destroy();
            }
            try {
                if (outputPath && fs.existsSync(outputPath)) {
                    fs.unlinkSync(outputPath);
                }
                const infoJsonPath = outputPath + '.info.json';
                if (fs.existsSync(infoJsonPath)) {
                    fs.unlinkSync(infoJsonPath);
                }
            } catch (e) {
                console.warn('Error cleaning up file:', e);
            }
        }

        // Send the stream
        return reply.send(stream);
    } catch (error) {
        console.error('Download endpoint error:', error);
        if (stream) {
            stream.destroy();
        }
        // Clean up any partial download
        try {
            if (outputPath && fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
            const infoJsonPath = outputPath + '.info.json';
            if (fs.existsSync(infoJsonPath)) {
                fs.unlinkSync(infoJsonPath);
            }
        } catch (e) {
            console.warn('Error cleaning up partial download:', e);
        }
        return reply.code(500).send({
            success: false,
            message: 'Error during download process: ' + error.message
        });
    }
});

// Serve downloaded files with proper headers
app.get('/downloads/:filename', async (request, reply) => {
    let stream;
    try {
        const { filename } = request.params;
        const filepath = path.join(downloadsDir, filename);

        console.log('File request received:', {
            filename,
            filepath,
            headers: request.headers
        });

        if (!fs.existsSync(filepath)) {
            console.error('File not found:', filepath);
            return reply.code(404).send({ success: false, message: 'File not found' });
        }

        const stats = fs.statSync(filepath);
        console.log(`File stats:`, {
            filename,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
        });

        // Handle range requests
        const range = request.headers.range;
        let start = 0;
        let end = stats.size - 1;

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            start = parseInt(parts[0], 10);
            end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        }

        const chunkSize = end - start + 1;

        // Determine content type based on file extension
        let contentType;
        if (filename.endsWith('.mp4')) {
            contentType = 'video/mp4';
        } else if (filename.endsWith('.m4a')) {
            contentType = 'audio/mp4';
        } else {
            contentType = 'application/octet-stream';
        }

        // Set headers for direct download
        reply.header('Content-Type', contentType);
        reply.header('Content-Length', chunkSize);
        reply.header('Content-Range', `bytes ${start}-${end}/${stats.size}`);
        reply.header('Accept-Ranges', 'bytes');
        reply.header('Content-Disposition', `attachment; filename="${filename}"`);
        reply.header('Cache-Control', 'no-cache');
        reply.header('Connection', 'keep-alive');

        // Create a read stream with 1MB chunks
        stream = fs.createReadStream(filepath, {
            start,
            end,
            highWaterMark: 1024 * 1024 // 1MB chunks
        });

        // Handle stream errors
        stream.on('error', (error) => {
            console.error('Stream error:', error);
            if (!reply.sent) {
                reply.code(500).send({
                    success: false,
                    message: 'Error streaming file: ' + error.message
                });
            }
        });

        // Handle client disconnect
        request.raw.on('close', () => {
            console.log('Client disconnected, destroying stream');
            if (stream) {
                stream.destroy();
            }
        });

        // Handle stream end
        stream.on('end', () => {
            console.log('Stream ended successfully');
        });

        // Handle stream data
        let bytesSent = 0;
        stream.on('data', (chunk) => {
            bytesSent += chunk.length;
            console.log(`Sent ${bytesSent} bytes of ${chunkSize}`);
        });

        return reply.code(range ? 206 : 200).send(stream);
    } catch (error) {
        console.error('Error serving file:', error);
        if (stream) {
            stream.destroy();
        }
        return reply.code(500).send({
            success: false,
            message: 'Error serving file: ' + error.message
        });
    }
});

// Add root route handler
app.get('/', async (request, reply) => {
    return { message: 'Social Media Downloader API is running' }
});

// Test endpoint
app.post('/api/test', async (request, reply) => {
    try {
        console.log('Test endpoint received request:', request.body);
        const { url, type, user, ageConsent } = request.body;

        // Simulate a small delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Return a test response
        return reply.send({
            success: true,
            message: 'Test successful',
            receivedData: {
                url,
                type,
                user,
                ageConsent
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Test endpoint error:', error);
        return reply.code(500).send({
            success: false,
            message: 'Test failed: ' + error.message
        });
    }
});

// Start server
const start = async () => {
    try {
        const port = process.env.PORT || 2500;
        await app.listen({
            port: port,
            host: '0.0.0.0'
        });
        console.log(`Server is running on http://localhost:${port}`);
        console.log('Server configuration:');
        console.log('- CORS enabled for http://localhost:2000');
        console.log('- Download directory:', downloadsDir);
        console.log('- Available routes:');
        console.log('  * POST /api/download');
        console.log('  * GET /downloads/:filename');
        console.log('  * GET /api/user/*');
    } catch (err) {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${process.env.PORT || 2500} is already in use. Please try a different port or kill the process using this port.`);
            process.exit(1);
        } else {
            console.error('Server startup error:', err);
            process.exit(1);
        }
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

// Register routes
app.register(require('./routes/user'), { prefix: '/api/user' });

start();

