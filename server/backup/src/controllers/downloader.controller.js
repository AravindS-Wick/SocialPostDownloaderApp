"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadContent = downloadContent;
const downloader_service_1 = __importDefault(require("../services/downloader.service"));
const downloaderService = new downloader_service_1.default();
async function downloadContent(request, reply) {
    try {
        const { url } = request.body;
        if (!url) {
            return reply.status(400).send({ error: 'URL is required' });
        }
        const result = await downloaderService.downloadYouTube(url);
        return reply.send(result);
    }
    catch (error) {
        console.error('Download error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to download content';
        return reply.status(500).send({ error: errorMessage });
    }
}
