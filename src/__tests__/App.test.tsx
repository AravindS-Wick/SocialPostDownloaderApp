/**
 * Core constants & URL utilities for SocialPostDownloaderApp
 */

import {
  APP_NAME,
  API_BASE_URL,
  RAILWAY_API,
  SUPPORTED_PLATFORMS,
  VIDEO_RESOLUTIONS,
  AUDIO_QUALITIES,
  DOWNLOAD_TYPES,
  STORAGE_KEYS,
} from '../utils/constants';

describe('App constants', () => {
  it('APP_NAME is defined', () => {
    expect(APP_NAME).toBeTruthy();
    expect(typeof APP_NAME).toBe('string');
  });

  it('API_BASE_URL is a valid HTTP/HTTPS URL', () => {
    // In __DEV__ (Jest env), resolves to localhost:2500; in production, resolves to RAILWAY_API
    expect(API_BASE_URL).toMatch(/^https?:\/\//);
    expect(typeof API_BASE_URL).toBe('string');
  });

  it('SUPPORTED_PLATFORMS includes YouTube, Instagram, Twitter', () => {
    expect(SUPPORTED_PLATFORMS).toContain('YouTube');
    expect(SUPPORTED_PLATFORMS).toContain('Instagram');
    expect(SUPPORTED_PLATFORMS).toContain('Twitter');
  });

  it('VIDEO_RESOLUTIONS covers standard quality ladder', () => {
    expect(VIDEO_RESOLUTIONS).toContain('360');
    expect(VIDEO_RESOLUTIONS).toContain('720');
    expect(VIDEO_RESOLUTIONS).toContain('1080');
  });

  it('AUDIO_QUALITIES has low, medium, high', () => {
    expect(AUDIO_QUALITIES).toEqual(expect.arrayContaining(['low', 'medium', 'high']));
  });

  it('DOWNLOAD_TYPES has video, audio, image', () => {
    expect(DOWNLOAD_TYPES).toEqual(expect.arrayContaining(['video', 'audio', 'image']));
  });

  it('STORAGE_KEYS has required keys', () => {
    expect(STORAGE_KEYS.ACTIVITY_LOGS).toBeTruthy();
    expect(STORAGE_KEYS.SETTINGS).toBeTruthy();
    expect(STORAGE_KEYS.DOWNLOAD_HISTORY).toBeTruthy();
    expect(STORAGE_KEYS.USER_AUTH).toBeTruthy();
  });
});

describe('URL pattern detection', () => {
  const isYouTube = (url: string) =>
    /youtube\.com|youtu\.be/i.test(url);
  const isInstagram = (url: string) =>
    /instagram\.com/i.test(url);
  const isTwitter = (url: string) =>
    /twitter\.com|x\.com/i.test(url);

  it('detects YouTube watch URLs', () => {
    expect(isYouTube('https://www.youtube.com/watch?v=MaMswoJy9bg')).toBe(true);
    expect(isYouTube('https://youtu.be/MaMswoJy9bg')).toBe(true);
  });

  it('detects YouTube Shorts URLs', () => {
    expect(isYouTube('https://youtube.com/shorts/j1lKMiA9Ofg')).toBe(true);
  });

  it('detects Instagram reel URLs', () => {
    expect(isInstagram('https://www.instagram.com/reel/DQj3Ba5iPgo/')).toBe(true);
    expect(isInstagram('https://www.instagram.com/p/DQj3Ba5iPgo/')).toBe(true);
  });

  it('detects Twitter/X URLs', () => {
    expect(isTwitter('https://twitter.com/user/status/12345')).toBe(true);
    expect(isTwitter('https://x.com/ZohranKMamdani/status/1985899742044262838')).toBe(true);
  });

  it('does not false-positive unrelated URLs', () => {
    expect(isYouTube('https://example.com/video')).toBe(false);
    expect(isInstagram('https://facebook.com/reel/abc')).toBe(false);
    expect(isTwitter('https://threads.net/@user')).toBe(false);
  });

  it('handles URLs with query params and fragments', () => {
    expect(isYouTube('https://youtu.be/MaMswoJy9bg?si=nrVLIeLdkPDsCRP9')).toBe(true);
    expect(isInstagram('https://www.instagram.com/reel/DQj3Ba5iPgo/?utm_source=ig_web_copy_link')).toBe(true);
  });
});
