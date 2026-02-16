const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execAsync = util.promisify(exec);
const TEST_URL = 'https://youtu.be/EptnMYijPjc';

async function testYouTubeDownload() {
    console.log(`Testing YouTube download for: ${TEST_URL}\n`);

    try {
        // Create test directory if it doesn't exist
        const testDir = path.join(__dirname, 'test-downloads');
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir);
        }

        const outputPath = path.join(testDir, `test-${Date.now()}.mp4`);
        console.log(`Saving to: ${outputPath}`);

        // Download video using yt-dlp with improved format selection
        console.log('\nStarting download...');
        const command = `yt-dlp "${TEST_URL}" -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" -o "${outputPath}" --no-warnings --progress --newline`;
        console.log(`Executing command: ${command}`);

        const { stdout, stderr } = await execAsync(command);
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);

        // Verify the downloaded file
        if (!fs.existsSync(outputPath)) {
            throw new Error('Downloaded file not found');
        }

        const stats = fs.statSync(outputPath);
        console.log(`\nDownloaded file size: ${stats.size} bytes`);

        if (stats.size < 1000) { // Less than 1KB
            throw new Error('Downloaded file is too small, download may have failed');
        }

        console.log('\nDownload completed successfully!');
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testYouTubeDownload(); 
