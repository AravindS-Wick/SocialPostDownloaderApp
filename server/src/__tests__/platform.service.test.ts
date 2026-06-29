import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlatformService } from '../services/platform.service';

describe('PlatformService', () => {
    let platformService: PlatformService;

    const mockConfig = {
        instagram: {
            clientId: 'test-instagram-client-id',
            clientSecret: 'test-instagram-client-secret',
            redirectUri: 'http://localhost:3000/auth/instagram/callback',
            scope: ['user_profile']
        },
        youtube: {
            clientId: 'test-youtube-client-id',
            clientSecret: 'test-youtube-client-secret',
            redirectUri: 'http://localhost:3000/auth/youtube/callback',
            scope: ['youtube.readonly']
        },
        twitter: {
            clientId: 'test-twitter-client-id',
            clientSecret: 'test-twitter-client-secret',
            redirectUri: 'http://localhost:3000/auth/twitter/callback',
            scope: ['tweet.read']
        },
        tiktok: {
            clientId: 'test-tiktok-client-id',
            clientSecret: 'test-tiktok-client-secret',
            redirectUri: 'http://localhost:3000/auth/tiktok/callback',
            scope: ['user.info.basic']
        }
    };

    beforeEach(() => {
        const mockFastify = {} as any;
        platformService = new PlatformService(mockFastify);
    });

    describe('getInstagramAuthUrl', () => {
        it('should return Instagram auth URL', async () => {
            const url = await platformService.getInstagramAuthUrl(mockConfig.instagram);
            expect(url).toContain('instagram.com/oauth/authorize');
            expect(url).toContain('test-instagram-client-id');
            expect(url).toContain(encodeURIComponent('http://localhost:3000/auth/instagram/callback'));
        });
    });

    describe('getYouTubeAuthUrl', () => {
        it('should return YouTube auth URL', async () => {
            const url = await platformService.getYouTubeAuthUrl(mockConfig.youtube);
            expect(url).toContain('accounts.google.com/o/oauth2/v2/auth');
            expect(url).toContain('test-youtube-client-id');
            expect(url).toContain(encodeURIComponent('http://localhost:3000/auth/youtube/callback'));
        });
    });

    describe('getTwitterAuthUrl', () => {
        it('should return Twitter auth URL', async () => {
            const url = await platformService.getTwitterAuthUrl(mockConfig.twitter);
            expect(url).toContain('twitter.com/i/oauth2/authorize');
            expect(url).toContain('test-twitter-client-id');
            expect(url).toContain(encodeURIComponent('http://localhost:3000/auth/twitter/callback'));
        });
    });

    describe('getTikTokAuthUrl', () => {
        it('should return TikTok auth URL', async () => {
            const url = await platformService.getTikTokAuthUrl(mockConfig.tiktok);
            expect(url).toContain('tiktok.com/auth/authorize');
            expect(url).toContain('test-tiktok-client-id');
            expect(url).toContain(encodeURIComponent('http://localhost:3000/auth/tiktok/callback'));
        });
    });

    describe('handleInstagramCallback', () => {
        it('should handle Instagram callback and return tokens', async () => {
            const mockResponse = {
                access_token: 'test-access-token',
                expires_in: 3600
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await platformService.handleInstagramCallback('test-code', mockConfig.instagram);
            expect(result).toEqual({
                accessToken: 'test-access-token',
                expiresIn: 3600
            });
        });
    });

    describe('handleYouTubeCallback', () => {
        it('should handle YouTube callback and return tokens', async () => {
            const mockResponse = {
                access_token: 'test-access-token',
                refresh_token: 'test-refresh-token',
                expires_in: 3600
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await platformService.handleYouTubeCallback('test-code', mockConfig.youtube);
            expect(result).toEqual({
                accessToken: 'test-access-token',
                refreshToken: 'test-refresh-token',
                expiresIn: 3600
            });
        });
    });

    describe('handleTwitterCallback', () => {
        it('should handle Twitter callback and return tokens', async () => {
            const mockResponse = {
                access_token: 'test-access-token',
                refresh_token: 'test-refresh-token',
                expires_in: 3600
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await platformService.handleTwitterCallback('test-code', mockConfig.twitter);
            expect(result).toEqual({
                accessToken: 'test-access-token',
                refreshToken: 'test-refresh-token',
                expiresIn: 3600
            });
        });
    });

    describe('handleTikTokCallback', () => {
        it('should handle TikTok callback and return tokens', async () => {
            const mockResponse = {
                access_token: 'test-access-token',
                refresh_token: 'test-refresh-token',
                expires_in: 3600
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await platformService.handleTikTokCallback('test-code', mockConfig.tiktok);
            expect(result).toEqual({
                accessToken: 'test-access-token',
                refreshToken: 'test-refresh-token',
                expiresIn: 3600
            });
        });
    });
}); 
