const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = util.promisify(exec);

// Test URLs
const TEST_URLS = {
    twitter: 'https://x.com/shayan_speaks/status/1920026290465177962',
    instagram: 'https://www.instagram.com/reel/DJULblCxG7l/?utm_source=ig_web_button_share_sheet'
};

// Create test downloads directory if it doesn't exist
const testDownloadsDir = path.join(__dirname, 'test-downloads');
if (!fs.existsSync(testDownloadsDir)) {
    fs.mkdirSync(testDownloadsDir);
}

async function testDownload(url, platform) {
    try {
        console.log(`\nTesting ${platform} download for URL: ${url}`);

        const timestamp = Date.now();
        const filename = `${platform}_${timestamp}.mp4`;
        const outputPath = path.join(testDownloadsDir, filename);
        console.log(`Output path: ${outputPath}`);

        // Build the command
        const command = `yt-dlp "${url}" -f "best[ext=mp4]/best" -o "${outputPath}" --no-warnings --progress --newline`;
        console.log(`Executing command: ${command}`);

        const { stdout, stderr } = await execAsync(command);

        if (stderr) {
            console.error(`${platform} download error:`, stderr);
            throw new Error(`Failed to download from ${platform}`);
        }

        // Verify the downloaded file
        if (!fs.existsSync(outputPath)) {
            throw new Error('Downloaded file not found');
        }

        const stats = fs.statSync(outputPath);
        console.log(`Downloaded file size: ${stats.size} bytes`);

        if (stats.size < 1000) { // Less than 1KB
            throw new Error('Downloaded file is too small, download may have failed');
        }

        console.log(`${platform} download completed successfully`);
        return true;
    } catch (error) {
        console.error(`${platform} download error:`, error);
        return false;
    }
}

async function runTests() {
    console.log('Starting download tests...');

    // Test Twitter download
    const twitterSuccess = await testDownload(TEST_URLS.twitter, 'twitter');
    console.log(`Twitter test ${twitterSuccess ? 'passed' : 'failed'}`);

    // Test Instagram download
    const instagramSuccess = await testDownload(TEST_URLS.instagram, 'instagram');
    console.log(`Instagram test ${instagramSuccess ? 'passed' : 'failed'}`);
}

runTests().catch(console.error); 
