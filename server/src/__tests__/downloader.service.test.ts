import { describe, it, expect, vi } from 'vitest';
import DownloaderService from '../services/downloader.service.js';

describe('DownloaderService', () => {
    let downloaderService: DownloaderService;

    beforeEach(() => {
        downloaderService = new DownloaderService();
    });

    it('should throw error for invalid YouTube URL', async () => {
        await expect(downloaderService.downloadYouTube('https://invalid.url/'))
            .rejects
            .toThrow('Invalid YouTube URL');
    });

    it('should throw error for unsupported Instagram downloads', async () => {
        await expect(downloaderService.downloadInstagram('https://instagram.com/p/123'))
            .rejects
            .toThrow('Instagram downloads not implemented');
    });

    it('should throw error for unsupported Twitter downloads', async () => {
        await expect(downloaderService.downloadTwitter('https://twitter.com/status/123'))
            .rejects
            .toThrow('Twitter downloads not implemented');
    });
});
