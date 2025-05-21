// Function to detect platform from URL
export const detectPlatform = (url: string): string | null => {
  if (!url) return null;
  
  try {
    const domain = new URL(url).hostname.toLowerCase();
    
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      return 'YouTube';
    } else if (domain.includes('instagram.com')) {
      return 'Instagram';
    } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
      return 'Twitter';
    } else if (domain.includes('tiktok.com')) {
      return 'TikTok';
    } else if (domain.includes('facebook.com') || domain.includes('fb.com')) {
      return 'Facebook';
    } else if (domain.includes('reddit.com')) {
      return 'Reddit';
    }
    
    return null;
  } catch (error) {
    console.error('Error detecting platform:', error);
    return null;
  }
};

// Function to validate URL format
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Function to get color for platform
export const getPlatformColor = (platform: string): string => {
  switch (platform) {
    case 'YouTube':
      return '#FF0000';
    case 'Instagram':
      return '#E4405F';
    case 'Twitter':
      return '#1DA1F2';
    case 'TikTok':
      return '#000000';
    case 'Facebook':
      return '#1877F2';
    case 'Reddit':
      return '#FF5700';
    default:
      return '#4A69BD';
  }
};

// Function to check if a URL is supported
export const isSupportedUrl = (url: string): boolean => {
  return !!detectPlatform(url);
};
