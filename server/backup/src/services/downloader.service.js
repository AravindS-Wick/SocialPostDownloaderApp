"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const youtube_dl_exec_1 = __importDefault(require("youtube-dl-exec"));
const stream_1 = require("stream");
class DownloaderService {
    constructor() {
        this.youtube = googleapis_1.google.youtube('v3');
        this.youtubeDl = youtube_dl_exec_1.default.create({
            binaryPath: '/opt/homebrew/bin/yt-dlp'
        }); // Type assertion needed due to incorrect type definitions
    }
    async downloadYouTube(url) {
        try {
            const videoId = this.extractVideoId(url);
            if (!videoId) {
                throw new Error('Invalid YouTube URL');
            }
            // Get video details from YouTube API
            const response = await this.youtube.videos.list({
                part: ['snippet', 'contentDetails'],
                id: [videoId],
                key: process.env.YOUTUBE_API_KEY
            });
            const video = response.data.items?.[0];
            if (!video) {
                throw new Error('Video not found');
            }
            // Get available formats using youtube-dl
            const formats = await this.youtubeDl(url, {
                dumpSingleJson: true,
                noWarnings: true,
                callHome: false,
                preferFreeFormats: true,
                youtubeSkipDashManifest: true
            });
            // Process formats
            const videoFormats = formats.formats
                .filter((f) => f.hasVideo)
                .map((f) => ({
                quality: f.format_note || f.height + 'p',
                itag: f.format_id,
                mimeType: f.ext,
                hasAudio: f.hasAudio,
                hasVideo: f.hasVideo,
                container: f.ext,
                contentLength: f.filesize?.toString() || '0',
                url: f.url
            }));
            const audioFormats = formats.formats
                .filter((f) => f.hasAudio && !f.hasVideo)
                .map((f) => ({
                quality: f.format_note || f.abr + 'kbps',
                itag: f.format_id,
                mimeType: f.ext,
                hasAudio: f.hasAudio,
                hasVideo: f.hasVideo,
                container: f.ext,
                contentLength: f.filesize?.toString() || '0',
                url: f.url
            }));
            return {
                title: video.snippet?.title || '',
                description: video.snippet?.description || '',
                thumbnail: video.snippet?.thumbnails?.high?.url || '',
                duration: video.contentDetails?.duration || '',
                author: video.snippet?.channelTitle || '',
                publishedAt: video.snippet?.publishedAt || '',
                videoId,
                formats: {
                    video: videoFormats,
                    audio: audioFormats
                }
            };
        }
        catch (error) {
            console.error('YouTube download error:', error);
            throw error instanceof Error ? error : new Error('Failed to download YouTube video');
        }
    }
    async getVideoStream(url, itag) {
        try {
            const formats = await this.youtubeDl(url, {
                dumpSingleJson: true,
                noWarnings: true,
                callHome: false,
                preferFreeFormats: true,
                youtubeSkipDashManifest: true
            });
            const format = formats.formats.find((f) => f.format_id === itag);
            if (!format) {
                throw new Error('Format not found');
            }
            return new stream_1.Readable({
                read() {
                    // Implementation will be handled by the stream
                }
            });
        }
        catch (error) {
            console.error('Stream error:', error);
            throw error instanceof Error ? error : new Error('Failed to get video stream');
        }
    }
    extractVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
    // Placeholder methods for other platforms
    async downloadInstagram(url) {
        throw new Error('Instagram downloads not implemented');
    }
    async downloadFacebook(url) {
        throw new Error('Facebook downloads not implemented');
    }
    async downloadTwitter(url) {
        throw new Error('Twitter downloads not implemented');
    }
    async downloadLinkedIn(url) {
        throw new Error('LinkedIn downloads not implemented');
    }
}
exports.default = DownloaderService;
