const { google } = require('googleapis');
const youtubeDl = require('youtube-dl-exec');
const stream = require('stream');
const { promisify } = require('util');
const path = require('path');

class DownloaderService {
    constructor() {
        this.youtube = google.youtube({
            version: 'v3',
            auth: 'AIzaSyAkszcx0ZbeiC6PcthYU5UWdvrhFMYWwyc'
        });
        this.youtubeDl = youtubeDl.create({
            binaryPath: '/opt/homebrew/bin/yt-dlp'
        });
    }

    async downloadYouTube(url) {
        try {
            // Extract video ID from URL
            const videoId = this.extractVideoId(url);
            if (!videoId) {
                throw new Error('Invalid YouTube URL');
            }

            // Get video details from YouTube Data API
            const response = await this.youtube.videos.list({
                part: ['snippet', 'contentDetails', 'status'],
                id: [videoId]
            });

            if (!response.data.items || response.data.items.length === 0) {
                throw new Error('Video not found');
            }

            const video = response.data.items[0];
            const snippet = video.snippet;
            const contentDetails = video.contentDetails;

            // Get available formats using youtube-dl
            const info = await this.youtubeDl(url, {
                dumpSingleJson: true,
                noWarnings: true,
                noCallHome: true,
                noCheckCertificate: true,
                preferFreeFormats: true,
                youtubeSkipDashManifest: true,
                format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'
            }).catch(error => {
                console.error('youtube-dl error:', error);
                throw new Error(`youtube-dl error: ${error.message}`);
            });

            if (!info || !info.formats) {
                throw new Error('Failed to get video formats');
            }

            // Process formats
            const formats = info.formats.map(format => ({
                quality: format.format_note || format.format,
                itag: format.format_id,
                mimeType: format.ext,
                hasAudio: format.acodec !== 'none',
                hasVideo: format.vcodec !== 'none',
                container: format.ext,
                contentLength: format.filesize,
                url: format.url
            }));

            // Separate video and audio formats
            const videoFormats = formats.filter(f => f.hasVideo);
            const audioFormats = formats.filter(f => !f.hasVideo && f.hasAudio);

            return {
                title: snippet.title,
                description: snippet.description,
                thumbnail: snippet.thumbnails.high.url,
                duration: contentDetails.duration,
                author: snippet.channelTitle,
                publishedAt: snippet.publishedAt,
                videoId: videoId,
                formats: {
                    video: videoFormats,
                    audio: audioFormats
                }
            };
        } catch (error) {
            console.error('YouTube download error:', error);
            throw new Error(`YouTube download error: ${error.message}`);
        }
    }

    async getVideoStream(url, itag) {
        try {
            // Get video info
            const info = await this.youtubeDl(url, {
                dumpSingleJson: true,
                noWarnings: true,
                noCallHome: true,
                noCheckCertificate: true,
                preferFreeFormats: true,
                youtubeSkipDashManifest: true,
                format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'
            }).catch(error => {
                console.error('youtube-dl error:', error);
                throw new Error(`youtube-dl error: ${error.message}`);
            });

            if (!info || !info.formats) {
                throw new Error('Failed to get video formats');
            }

            // Find the requested format
            const format = info.formats.find(f => f.format_id === itag);
            if (!format) {
                throw new Error('Requested format not found');
            }

            // Create a readable stream from the URL
            const videoStream = this.youtubeDl.exec(url, {
                format: itag,
                output: '-',
                noWarnings: true,
                noCallHome: true,
                noCheckCertificate: true,
                preferFreeFormats: true,
                youtubeSkipDashManifest: true,
                format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best'
            });

            return videoStream;
        } catch (error) {
            console.error('Stream error:', error);
            throw new Error(`Stream error: ${error.message}`);
        }
    }

    extractVideoId(url) {
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'youtu.be') {
                return urlObj.pathname.slice(1);
            }
            const videoId = urlObj.searchParams.get('v');
            return videoId;
        } catch (error) {
            return null;
        }
    }

    // Placeholder methods for other platforms
    async downloadInstagram(url) {
        throw new Error('Instagram download not implemented yet');
    }

    async downloadFacebook(url) {
        throw new Error('Facebook download not implemented yet');
    }

    async downloadTwitter(url) {
        throw new Error('Twitter download not implemented yet');
    }

    async downloadLinkedIn(url) {
        throw new Error('LinkedIn download not implemented yet');
    }
}

module.exports = new DownloaderService(); 
