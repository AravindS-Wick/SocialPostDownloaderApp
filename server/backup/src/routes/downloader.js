"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = downloaderRoutes;
const downloader_controller_1 = require("../controllers/downloader.controller");
const downloader_service_1 = __importDefault(require("../services/downloader.service"));
const downloaderService = new downloader_service_1.default();
async function downloaderRoutes(fastify) {
    // Get video info endpoint
    fastify.post('/download', downloader_controller_1.downloadContent);
    // Stream video endpoint
    fastify.get('/stream', async (request, reply) => {
        try {
            const { url, itag } = request.query;
            if (!url || !itag) {
                return reply.status(400).send({ error: 'URL and itag are required' });
            }
            const stream = await downloaderService.getVideoStream(url, itag);
            // Set appropriate headers
            reply.header('Content-Type', 'video/mp4');
            reply.header('Transfer-Encoding', 'chunked');
            // Pipe the stream to the response
            return reply.send(stream);
        }
        catch (error) {
            console.error('Stream error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to stream video';
            return reply.status(500).send({ error: errorMessage });
        }
    });
}
