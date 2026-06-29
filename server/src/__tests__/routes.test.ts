import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { build } from '../app';
import { mockFastifyInstance } from '../__mocks__/fastify.mock';
import { mockPlatformService } from '../__mocks__/platform.service.mock';

vi.mock('../services/platform.service.js', () => {
    return {
        PlatformService: vi.fn().mockImplementation(() => ({
            getInstagramAuthUrl: vi.fn().mockResolvedValue('https://instagram.com/auth'),
            getYouTubeAuthUrl: vi.fn().mockResolvedValue('https://youtube.com/auth'),
            getTwitterAuthUrl: vi.fn().mockResolvedValue('https://twitter.com/auth'),
            getTikTokAuthUrl: vi.fn().mockResolvedValue('https://tiktok.com/auth'),
            handleInstagramCallback: vi.fn().mockResolvedValue({
                accessToken: 'instagram-token',
                expiresIn: 3600
            })
        }))
    };
});
vi.mock('child_process', () => ({
    exec: vi.fn((cmd, callback) => {
        const match = cmd.match(/-o "([^"]+)"/);
        if (match) {
            const fs = require('fs');
            const path = require('path');
            fs.mkdirSync(path.dirname(match[1]), { recursive: true });
            fs.writeFileSync(match[1], 'a'.repeat(2000));
        }
        callback(null, { stdout: 'mock', stderr: '' });
    })
}));

describe('Routes', () => {
    let app: FastifyInstance;

    beforeEach(async () => {
        app = await build();
        vi.clearAllMocks();
    });

    describe('GET /api/auth/check-platform/:platform', () => {
        it('should check Instagram platform status', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/auth/check-platform/Instagram'
            });

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.payload)).toEqual({
                success: true,
                isLoggedIn: false
            });
        });

        it('should return 400 for unsupported platform', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/auth/check-platform/Unsupported'
            });

            expect(response.statusCode).toBe(400);
            expect(JSON.parse(response.payload)).toEqual({
                success: false,
                error: 'Failed to check platform login status'
            });
        });
    });

    describe('GET /api/auth/auth-url/:platform', () => {
        it('should get Instagram auth URL', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/auth/auth-url/Instagram'
            });

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.payload)).toEqual({
                success: true,
                authUrl: 'https://instagram.com/auth'
            });
        });

        it('should return 400 for unsupported platform', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/auth/auth-url/Unsupported'
            });

            expect(response.statusCode).toBe(400);
            expect(JSON.parse(response.payload)).toEqual({
                success: false,
                error: 'Failed to get auth URL'
            });
        });
    });

    describe('POST /api/auth/connect/:platform', () => {
        it('should connect Instagram platform', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/auth/connect/Instagram',
                payload: {
                    code: 'test-code'
                }
            });

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.payload)).toMatchObject({
                success: true,
                platform: {
                    id: 'instagram',
                    name: 'Instagram'
                }
            });
        });

        it('should return 400 for unsupported platform', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/auth/connect/Unsupported',
                payload: {
                    code: 'test-code'
                }
            });

            expect(response.statusCode).toBe(400);
            expect(JSON.parse(response.payload)).toEqual({
                success: false,
                error: 'Failed to connect platform'
            });
        });
    });

    describe('POST /api/auth/disconnect/:platform', () => {
        it('should disconnect Instagram platform', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/auth/disconnect/Instagram'
            });

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.payload)).toEqual({
                success: true
            });
        });

        it('should return 400 for unsupported platform', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/auth/disconnect/Unsupported'
            });

            expect(response.statusCode).toBe(400);
            expect(JSON.parse(response.payload)).toEqual({
                success: false,
                error: 'Failed to disconnect platform'
            });
        });
    });

    describe('POST /api/download', () => {
        it('should download Instagram media', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/download',
                payload: {
                    url: 'https://instagram.com/p/123'
                }
            });

            const payload = JSON.parse(response.payload);
            expect(payload.success).toBe(true);
            expect(payload.downloadUrl).toContain('/downloads/instagram_');
            expect(payload.filename).toContain('instagram_');
            expect(payload.title).toContain('Instagram Post');
        });

        it('should return 400 for invalid URL', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/download',
                payload: {
                    url: 'invalid-url'
                }
            });

            expect(response.statusCode).toBe(400);
            expect(JSON.parse(response.payload)).toEqual({
                success: false,
                error: 'Unsupported platform'
            });
        });
    });
}); 
