"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function testDownload() {
    try {
        // Test YouTube download
        const response = await axios_1.default.post('http://localhost:2500/api/download', {
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            type: 'video'
        });
        const result = response.data;
        console.log('Download result:', result);
        if (!result.success) {
            console.error('Download failed:', result.error);
            return;
        }
        console.log('Download successful!');
        console.log('File URL:', result.downloadUrl);
        console.log('Metadata:', {
            title: result.title,
            channel: result.channel,
            length: result.length
        });
    }
    catch (error) {
        console.error('Test failed:', error);
    }
}
testDownload();
