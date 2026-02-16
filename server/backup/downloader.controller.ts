const downloaderService = require('../services/downloader.service');

class DownloaderController {
    async downloadContent(request, reply) {
        try {
            const { url } = request.body;

            if (!url) {
                return reply.code(400).send({ error: 'URL is required' });
            }

            let result;
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                result = await downloaderService.downloadYouTube(url);
            } else if (url.includes('instagram.com')) {
                result = await downloaderService.downloadInstagram(url);
            } else if (url.includes('facebook.com')) {
                result = await downloaderService.downloadFacebook(url);
            } else if (url.includes('twitter.com') || url.includes('x.com')) {
                result = await downloaderService.downloadTwitter(url);
            } else if (url.includes('linkedin.com')) {
                result = await downloaderService.downloadLinkedIn(url);
            } else {
                return reply.code(400).send({ error: 'Unsupported platform' });
            }

            return reply.send(result);
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ error: error.message });
        }
    }
}

module.exports = new DownloaderController(); 
