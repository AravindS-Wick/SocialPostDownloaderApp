import { startDownload } from '../../src/services/downloader';
import { getVideoInfo } from '../../src/services/api';
import { saveFile } from '../../src/services/storage';
import { sendNotification } from '../../src/services/notifications';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Mock dependencies
jest.mock('../../src/services/api', () => ({
  getVideoInfo: jest.fn(),
}));

jest.mock('../../src/services/storage', () => ({
  saveFile: jest.fn(),
}));

jest.mock('../../src/services/notifications', () => ({
  sendNotification: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  cacheDirectory: 'file://test/cache/',
  createDownloadResumable: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
  },
}));

jest.mock('../../src/store', () => ({
  store: {
    dispatch: jest.fn(),
  },
}));

describe('Downloader Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start a video download successfully', async () => {
    // Setup mocks
    const mockVideoInfo = {
      title: 'Test Video',
      formats: [
        {
          url: 'https://example.com/video.mp4',
          mimeType: 'video/mp4',
          hasVideo: true,
          hasAudio: true,
          height: 720,
          width: 1280,
          qualityLabel: '720p',
        },
        {
          url: 'https://example.com/video_1080.mp4',
          mimeType: 'video/mp4',
          hasVideo: true,
          hasAudio: true,
          height: 1080,
          width: 1920,
          qualityLabel: '1080p',
        },
      ],
    };

    (getVideoInfo as jest.Mock).mockResolvedValue(mockVideoInfo);

    const mockDownloadResult = {
      uri: 'file://test/cache/youtube_test_video_12345.mp4',
    };

    const mockDownloadResumable = {
      downloadAsync: jest.fn().mockResolvedValue(mockDownloadResult),
    };

    (FileSystem.createDownloadResumable as jest.Mock).mockReturnValue(mockDownloadResumable);

    const savedPath = '/storage/emulated/0/Download/SocialSaver/Video/youtube_test_video_12345.mp4';
    (saveFile as jest.Mock).mockResolvedValue(savedPath);

    // Call the function
    const result = await startDownload(
      'https://www.youtube.com/watch?v=test123',
      'YouTube',
      'video',
      '1080'
    );

    // Assertions
    expect(getVideoInfo).toHaveBeenCalledWith(
      'https://www.youtube.com/watch?v=test123',
      'YouTube'
    );
    expect(FileSystem.createDownloadResumable).toHaveBeenCalled();
    expect(mockDownloadResumable.downloadAsync).toHaveBeenCalled();
    expect(saveFile).toHaveBeenCalledWith(
      mockDownloadResult.uri,
      expect.stringContaining('youtube_test_video_'),
      'video'
    );
    expect(sendNotification).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Download Complete',
    }));
    expect(result).toEqual({
      filename: expect.stringContaining('youtube_test_video_'),
      path: savedPath,
    });
  });

  it('should handle download errors', async () => {
    // Setup mock to throw an error
    (getVideoInfo as jest.Mock).mockRejectedValue(new Error('API Error'));

    // Call function and expect it to throw
    await expect(startDownload(
      'https://www.youtube.com/watch?v=test123',
      'YouTube',
      'video'
    )).rejects.toThrow('API Error');
  });

  it('should download the closest matching resolution', async () => {
    // Setup mocks
    const mockVideoInfo = {
      title: 'Test Video',
      formats: [
        {
          url: 'https://example.com/video_360.mp4',
          mimeType: 'video/mp4',
          hasVideo: true,
          hasAudio: true,
          height: 360,
          width: 640,
          qualityLabel: '360p',
        },
        {
          url: 'https://example.com/video_720.mp4',
          mimeType: 'video/mp4',
          hasVideo: true,
          hasAudio: true,
          height: 720,
          width: 1280,
          qualityLabel: '720p',
        },
      ],
    };

    (getVideoInfo as jest.Mock).mockResolvedValue(mockVideoInfo);

    const mockDownloadResult = {
      uri: 'file://test/cache/youtube_test_video_12345.mp4',
    };

    const mockDownloadResumable = {
      downloadAsync: jest.fn().mockResolvedValue(mockDownloadResult),
    };

    (FileSystem.createDownloadResumable as jest.Mock).mockReturnValue(mockDownloadResumable);

    const savedPath = '/storage/emulated/0/Download/SocialSaver/Video/youtube_test_video_12345.mp4';
    (saveFile as jest.Mock).mockResolvedValue(savedPath);

    // Request 480p but only have 360p and 720p available
    const result = await startDownload(
      'https://www.youtube.com/watch?v=test123',
      'YouTube',
      'video',
      '480'
    );

    // Should choose 360p as it's closer to 480p than 720p
    const expectedFormatUrl = 'https://example.com/video_360.mp4';
    expect(FileSystem.createDownloadResumable).toHaveBeenCalledWith(
      expectedFormatUrl,
      expect.any(String),
      expect.any(Object),
      expect.any(Function)
    );
  });

  it('should handle audio download properly', async () => {
    // Setup mocks
    const mockVideoInfo = {
      title: 'Test Audio',
      formats: [
        {
          url: 'https://example.com/audio.mp3',
          mimeType: 'audio/mp3',
          hasVideo: false,
          hasAudio: true,
          audioBitrate: 128,
        },
        {
          url: 'https://example.com/audio_high.mp3',
          mimeType: 'audio/mp3',
          hasVideo: false,
          hasAudio: true,
          audioBitrate: 320,
        },
      ],
    };

    (getVideoInfo as jest.Mock).mockResolvedValue(mockVideoInfo);

    const mockDownloadResult = {
      uri: 'file://test/cache/youtube_test_audio_12345.mp3',
    };

    const mockDownloadResumable = {
      downloadAsync: jest.fn().mockResolvedValue(mockDownloadResult),
    };

    (FileSystem.createDownloadResumable as jest.Mock).mockReturnValue(mockDownloadResumable);

    const savedPath = '/storage/emulated/0/Download/SocialSaver/Audio/youtube_test_audio_12345.mp3';
    (saveFile as jest.Mock).mockResolvedValue(savedPath);

    // Call function
    const result = await startDownload(
      'https://www.youtube.com/watch?v=test123',
      'YouTube',
      'audio'
    );

    // Should choose the highest bitrate audio
    const expectedFormatUrl = 'https://example.com/audio_high.mp3';
    expect(FileSystem.createDownloadResumable).toHaveBeenCalledWith(
      expectedFormatUrl,
      expect.any(String),
      expect.any(Object),
      expect.any(Function)
    );
    expect(saveFile).toHaveBeenCalledWith(
      mockDownloadResult.uri,
      expect.stringContaining('youtube_test_audio_'),
      'audio'
    );
  });

  it('should handle image download properly', async () => {
    // Setup mocks
    const mockVideoInfo = {
      title: 'Test Image',
      thumbnail: 'https://example.com/thumbnail.jpg',
      formats: [],
    };

    (getVideoInfo as jest.Mock).mockResolvedValue(mockVideoInfo);

    const mockDownloadResult = {
      uri: 'file://test/cache/instagram_test_image_12345.jpg',
    };

    const mockDownloadResumable = {
      downloadAsync: jest.fn().mockResolvedValue(mockDownloadResult),
    };

    (FileSystem.createDownloadResumable as jest.Mock).mockReturnValue(mockDownloadResumable);

    const savedPath = '/storage/emulated/0/Download/SocialSaver/Image/instagram_test_image_12345.jpg';
    (saveFile as jest.Mock).mockResolvedValue(savedPath);

    // Call function
    const result = await startDownload(
      'https://www.instagram.com/p/test123',
      'Instagram',
      'image'
    );

    // Should use the thumbnail URL
    expect(FileSystem.createDownloadResumable).toHaveBeenCalledWith(
      'https://example.com/thumbnail.jpg',
      expect.any(String),
      expect.any(Object),
      expect.any(Function)
    );
    expect(saveFile).toHaveBeenCalledWith(
      mockDownloadResult.uri,
      expect.stringContaining('instagram_test_image_'),
      'image'
    );
  });

  it('should handle web platform properly', async () => {
    // Mock Platform.OS as 'web'
    jest.spyOn(Platform, 'OS', 'get').mockReturnValue('web');

    // Create mock DOM elements for web test
    const mockAnchor = {
      href: '',
      download: '',
      click: jest.fn(),
    };
    document.createElement = jest.fn().mockReturnValue(mockAnchor);
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();

    const mockVideoInfo = {
      title: 'Test Video Web',
      formats: [
        {
          url: 'https://example.com/video.mp4',
          mimeType: 'video/mp4',
          hasVideo: true,
          hasAudio: true,
          height: 720,
        },
      ],
    };

    (getVideoInfo as jest.Mock).mockResolvedValue(mockVideoInfo);

    // Call the function
    const result = await startDownload(
      'https://www.youtube.com/watch?v=test123',
      'YouTube',
      'video'
    );

    // Assertions for web platform
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockAnchor.href).toBe('https://example.com/video.mp4');
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(result).toEqual({
      filename: expect.stringContaining('youtube_test_video_web_'),
      path: 'https://example.com/video.mp4',
    });

    // Reset Platform.OS mock
    jest.spyOn(Platform, 'OS', 'get').mockReturnValue('android');
  });

  it('should throw error when no formats are available', async () => {
    // Setup mock with no valid formats
    const mockVideoInfo = {
      title: 'Test Error',
      formats: [],
    };

    (getVideoInfo as jest.Mock).mockResolvedValue(mockVideoInfo);

    // Call function and expect it to throw
    await expect(startDownload(
      'https://www.youtube.com/watch?v=test123',
      'YouTube',
      'video'
    )).rejects.toThrow('No video format found for this content');
  });
});
