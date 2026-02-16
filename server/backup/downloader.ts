const downloaderController = require('../controllers/downloader.controller');
const downloaderService = require('../services/downloader.service');

async function downloaderRoutes(fastify, options) {
    // Get video info endpoint
    fastify.post('/download', {
        schema: {
            description: 'Get video information from social media platforms',
            tags: ['downloader'],
            body: {
                type: 'object',
                required: ['url'],
                properties: {
                    url: {
                        type: 'string',
                        description: 'URL of the social media post to download'
                    }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        thumbnail: { type: 'string' },
                        duration: { type: 'string' },
                        author: { type: 'string' },
                        publishedAt: { type: 'string' },
                        videoId: { type: 'string' },
                        formats: {
                            type: 'object',
                            properties: {
                                video: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            quality: { type: 'string' },
                                            itag: { type: 'string' },
                                            mimeType: { type: 'string' },
                                            hasAudio: { type: 'boolean' },
                                            hasVideo: { type: 'boolean' },
                                            container: { type: 'string' },
                                            contentLength: { type: 'string' },
                                            url: { type: 'string' }
                                        }
                                    }
                                },
                                audio: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            quality: { type: 'string' },
                                            itag: { type: 'string' },
                                            mimeType: { type: 'string' },
                                            hasAudio: { type: 'boolean' },
                                            hasVideo: { type: 'boolean' },
                                            container: { type: 'string' },
                                            contentLength: { type: 'string' },
                                            url: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                },
                500: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            }
        }
    }, downloaderController.downloadContent);

    // Stream video endpoint
    fastify.get('/stream', {
        schema: {
            description: 'Stream video content',
            tags: ['downloader'],
            querystring: {
                type: 'object',
                required: ['url', 'itag'],
                properties: {
                    url: {
                        type: 'string',
                        description: 'URL of the video to stream'
                    },
                    itag: {
                        type: 'string',
                        description: 'Format itag to stream'
                    }
                }
            }
        },
        handler: async (request, reply) => {
            try {
                const { url, itag } = request.query;

                // Get the stream
                const videoStream = await downloaderService.getVideoStream(url, itag);

                // Set headers
                reply.raw.writeHead(200, {
                    'Content-Type': 'video/mp4',
                    'Transfer-Encoding': 'chunked'
                });

                // Handle stream errors
                videoStream.on('error', (error) => {
                    console.error('Stream error:', error);
                    if (!reply.sent) {
                        reply.code(500).send({ error: 'Streaming failed' });
                    }
                });

                // Handle client disconnect
                request.raw.on('close', () => {
                    videoStream.destroy();
                });

                // Pipe the stream to response
                videoStream.pipe(reply.raw);

                // Return a promise that resolves when the stream ends
                return new Promise((resolve, reject) => {
                    videoStream.on('end', resolve);
                    videoStream.on('error', reject);
                });
            } catch (error) {
                if (!reply.sent) {
                    reply.code(500).send({ error: error.message });
                }
            }
        }
    });
}

module.exports = downloaderRoutes; 
