import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Platform,
  Dimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { Ionicons, FontAwesome5, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, IconButton, useTheme, Card, Avatar, ProgressBar, Chip, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { checkAndRequestPermissions } from '../services/permissions';
import { loginSuccess, logout } from '../store/slices/authSlice';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();
  const dispatch = useDispatch();
  const windowWidth = Dimensions.get('window').width;
  
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('auto-detect');
  const [downloadType, setDownloadType] = useState('video');
  const [quality, setQuality] = useState('1080p');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [downloadHistory, setDownloadHistory] = useState<any[]>([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check permissions on component mount
  useEffect(() => {
    const checkPermissions = async () => {
      // Skip permissions check on web
      if (Platform.OS === 'web') {
        // We'll handle web errors separately
        return;
      }
      
      const hasPermissions = await checkAndRequestPermissions();
      if (!hasPermissions) {
        setShowError(true);
        setErrorMessage('Media library permissions are required to save downloads.');
      }
    };
    
    checkPermissions();
    
    // Mock history data to show the UI
    setDownloadHistory([
      {
        id: '1',
        title: 'Summer Travel Highlights',
        url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        platform: 'youtube',
        type: 'video',
        quality: 'high',
        size: '24.5 MB',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Beautiful Sunset Photography',
        url: 'https://instagram.com/p/abc123',
        thumbnail: 'https://source.unsplash.com/random/300x200/?sunset',
        platform: 'instagram',
        type: 'image',
        quality: 'high',
        size: '3.2 MB',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Latest News Update',
        url: 'https://twitter.com/user/status/123456789',
        thumbnail: 'https://source.unsplash.com/random/300x200/?news',
        platform: 'twitter',
        type: 'video',
        quality: 'medium',
        size: '18.7 MB',
        createdAt: new Date().toISOString(),
      }
    ]);
  }, []);

  const handlePasteFromClipboard = async () => {
    try {
      // In a real implementation, we would use clipboard-expo here
      // Since we're in a web environment, we'll simulate this behavior
      const clipboardText = 'https://youtu.be/swID4lyPVu8?feature=shared';
      setUrl(clipboardText);
      
      // Auto-detect platform
      detectPlatform(clipboardText);
    } catch (error) {
      console.error('Failed to paste from clipboard', error);
    }
  };

  const handleClearUrl = () => {
    setUrl('');
    setShowPreview(false);
    setPreviewData(null);
  };

  const detectPlatform = (inputUrl: string) => {
    if (inputUrl.includes('youtube') || inputUrl.includes('youtu.be')) {
      setPlatform('youtube');
    } else if (inputUrl.includes('instagram')) {
      setPlatform('instagram');
    } else if (inputUrl.includes('twitter') || inputUrl.includes('x.com')) {
      setPlatform('twitter');
    } else if (inputUrl.includes('tiktok')) {
      setPlatform('tiktok');
    } else if (inputUrl.includes('facebook')) {
      setPlatform('facebook');
    } else {
      setPlatform('auto-detect');
    }
  };

  const handleSelectPlatform = (newPlatform: string) => {
    setPlatform(newPlatform);
  };

  const handleDownload = () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setProgress(0);
    
    // Simulate download progress
    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + (Math.random() * 10);
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setLoading(false);
            // Add to history
            const newDownload = {
              id: Date.now().toString(),
              title: `Downloaded ${downloadType} from ${platform}`,
              url: url,
              thumbnail: platform === 'youtube' 
                ? 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
                : 'https://source.unsplash.com/random/300x200/?nature',
              platform: platform,
              type: downloadType,
              quality: quality,
              size: downloadType === 'video' ? '24.5 MB' : '3.2 MB',
              createdAt: new Date().toISOString(),
            };
            setDownloadHistory([newDownload, ...downloadHistory]);
            
            // Show success feedback
            alert(`Successfully downloaded ${downloadType} in ${quality} quality!`);
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 200);
  };

  const handleAnalyze = () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setProgress(0);
    
    // Simulate analyzing
    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + (Math.random() * 15);
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setLoading(false);
            setShowPreview(true);
            setPreviewData({
              title: 'Amazing Social Media Content',
              author: 'Content Creator',
              duration: '3:45',
              availableQualities: ['1080p', '720p', '480p', '360p'],
              thumbnail: 'https://source.unsplash.com/random/800x450/?video',
              description: 'This is a great video with lots of interesting content.',
              views: '1.2M',
              likes: '45K',
              publishDate: '2023-05-15',
            });
          }, 800);
          return 100;
        }
        return newProgress;
      });
    }, 150);
  };

  const handleDeleteDownload = (id: string) => {
    setDownloadHistory(downloadHistory.filter(item => item.id !== id));
  };

  const getPlatformIcon = (platformName: string, size: number = 24, color?: string) => {
    switch (platformName) {
      case 'youtube':
        return <FontAwesome5 name="youtube" size={size} color={color || "#FF0000"} />;
      case 'instagram':
        return <FontAwesome5 name="instagram" size={size} color={color || "#C13584"} />;
      case 'twitter':
        return <FontAwesome5 name="twitter" size={size} color={color || "#1DA1F2"} />;
      case 'tiktok':
        return <FontAwesome5 name="tiktok" size={size} color={color || "#000000"} />;
      case 'facebook':
        return <FontAwesome5 name="facebook-square" size={size} color={color || "#4267B2"} />;
      default:
        return <MaterialIcons name="public" size={size} color={color || "#888888"} />;
    }
  };
  
  const renderDownloadItem = (item: any) => {
    return (
      <Card key={item.id} style={styles.historyCard}>
        <Card.Title
          title={item.title}
          subtitle={`${item.platform} · ${item.type} · ${item.quality}`}
          left={(props) => getPlatformIcon(item.platform, props.size)}
          right={(props) => (
            <IconButton
              {...props}
              icon="delete"
              onPress={() => handleDeleteDownload(item.id)}
              size={20}
            />
          )}
        />
        <Card.Content>
          <View style={styles.historyCardContent}>
            <Image 
              source={{ uri: item.thumbnail }} 
              style={styles.historyThumbnail} 
              resizeMode="cover"
            />
            <View style={styles.historyDetails}>
              <Text style={styles.historyDetailText}>
                <Text style={styles.historyDetailLabel}>Size: </Text>
                {item.size}
              </Text>
              <Text style={styles.historyDetailText}>
                <Text style={styles.historyDetailLabel}>Date: </Text>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
              <View style={{ flexDirection: 'row', marginTop: 5 }}>
                <Chip 
                  icon={() => item.type === 'video' 
                    ? <FontAwesome5 name="video" size={14} color="#666" /> 
                    : <FontAwesome5 name="image" size={14} color="#666" />
                  }
                  style={styles.historyChip}
                >
                  {item.type}
                </Chip>
                <Chip 
                  icon={() => <MaterialIcons name="high-quality" size={14} color="#666" />}
                  style={styles.historyChip}
                >
                  {item.quality}
                </Chip>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#7F00FF', '#E100FF']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.titleAndAuthContainer}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Social Media Downloader</Text>
            <Text style={styles.subtitle}>
              Download videos, photos, and music from all your favorite platforms
            </Text>
          </View>
          <View style={styles.authButtonsContainer}>
            {!user ? (
              <View style={styles.authButtons}>
                <TouchableOpacity 
                  style={styles.loginButton}
                  onPress={() => {
                    dispatch(loginSuccess({
                      token: 'demo-token-123',
                      user: {
                        id: '1',
                        username: 'demouser',
                        email: 'demo@example.com',
                        profileImage: 'https://i.pravatar.cc/150?img=1'
                      }
                    }));
                  }}
                >
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.signupButton}
                  onPress={() => {
                    Alert.alert('Sign Up', 'Account creation form would appear here.');
                  }}
                >
                  <Text style={styles.signupButtonText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                <Avatar.Image 
                  size={36} 
                  source={{ uri: 'https://i.pravatar.cc/150?img=1' }} 
                  style={styles.headerAvatar}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Main Download Card */}
      <View style={styles.cardContainer}>
        <Card style={styles.card}>
          <Card.Content>
            {/* URL Input */}
            <View style={styles.urlInputContainer}>
              <View style={styles.urlInputWrapper}>
                <TextInput
                  style={styles.urlInput}
                  placeholder="Paste video/image URL here"
                  value={url}
                  onChangeText={(text) => {
                    setUrl(text);
                    detectPlatform(text);
                  }}
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
                {url ? (
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={handleClearUrl}
                    style={styles.iconButton}
                  />
                ) : (
                  <IconButton
                    icon="content-paste"
                    size={20}
                    onPress={handlePasteFromClipboard}
                    style={styles.iconButton}
                  />
                )}
              </View>
            </View>

            {/* Platform Selection */}
            <Text style={styles.sectionLabel}>Platform</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.platformScroller}>
              <TouchableOpacity
                style={[
                  styles.platformOption,
                  platform === 'auto-detect' && styles.selectedPlatform,
                ]}
                onPress={() => handleSelectPlatform('auto-detect')}
              >
                <MaterialIcons name="auto-awesome" size={18} color={platform === 'auto-detect' ? 'white' : '#333'} />
                <Text style={[
                  styles.platformText,
                  platform === 'auto-detect' && styles.selectedPlatformText,
                ]}>
                  Auto-detect
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.platformOption,
                  platform === 'youtube' && styles.selectedPlatform,
                ]}
                onPress={() => handleSelectPlatform('youtube')}
              >
                <FontAwesome5 name="youtube" size={18} color={platform === 'youtube' ? 'white' : '#FF0000'} />
                <Text style={[
                  styles.platformText,
                  platform === 'youtube' && styles.selectedPlatformText,
                ]}>
                  YouTube
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.platformOption,
                  platform === 'instagram' && styles.selectedPlatform,
                ]}
                onPress={() => handleSelectPlatform('instagram')}
              >
                <FontAwesome5 name="instagram" size={18} color={platform === 'instagram' ? 'white' : '#C13584'} />
                <Text style={[
                  styles.platformText,
                  platform === 'instagram' && styles.selectedPlatformText,
                ]}>
                  Instagram
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.platformOption,
                  platform === 'twitter' && styles.selectedPlatform,
                ]}
                onPress={() => handleSelectPlatform('twitter')}
              >
                <FontAwesome5 name="twitter" size={18} color={platform === 'twitter' ? 'white' : '#1DA1F2'} />
                <Text style={[
                  styles.platformText,
                  platform === 'twitter' && styles.selectedPlatformText,
                ]}>
                  Twitter
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.platformOption,
                  platform === 'tiktok' && styles.selectedPlatform,
                ]}
                onPress={() => handleSelectPlatform('tiktok')}
              >
                <FontAwesome5 name="tiktok" size={18} color={platform === 'tiktok' ? 'white' : '#000000'} />
                <Text style={[
                  styles.platformText,
                  platform === 'tiktok' && styles.selectedPlatformText,
                ]}>
                  TikTok
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.platformOption,
                  platform === 'facebook' && styles.selectedPlatform,
                ]}
                onPress={() => handleSelectPlatform('facebook')}
              >
                <FontAwesome5 name="facebook" size={18} color={platform === 'facebook' ? 'white' : '#4267B2'} />
                <Text style={[
                  styles.platformText,
                  platform === 'facebook' && styles.selectedPlatformText,
                ]}>
                  Facebook
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Download Type Selection */}
            <Text style={styles.sectionLabel}>Download Type</Text>
            <View style={styles.downloadTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.downloadTypeOption,
                  { flex: 1, borderTopLeftRadius: 50, borderBottomLeftRadius: 50 },
                  downloadType === 'video' && styles.selectedDownloadType,
                ]}
                onPress={() => setDownloadType('video')}
              >
                <FontAwesome5 name="video" size={16} color={downloadType === 'video' ? 'white' : '#333'} />
                <Text style={[
                  styles.downloadTypeText,
                  downloadType === 'video' && styles.selectedDownloadTypeText,
                ]}>
                  Video
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.downloadTypeOption,
                  { flex: 1 },
                  downloadType === 'audio' && styles.selectedDownloadType,
                ]}
                onPress={() => setDownloadType('audio')}
              >
                <FontAwesome5 name="music" size={16} color={downloadType === 'audio' ? 'white' : '#333'} />
                <Text style={[
                  styles.downloadTypeText,
                  downloadType === 'audio' && styles.selectedDownloadTypeText,
                ]}>
                  Audio
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.downloadTypeOption,
                  { flex: 1, borderTopRightRadius: 50, borderBottomRightRadius: 50 },
                  downloadType === 'photo' && styles.selectedDownloadType,
                ]}
                onPress={() => setDownloadType('photo')}
              >
                <FontAwesome5 name="image" size={16} color={downloadType === 'photo' ? 'white' : '#333'} />
                <Text style={[
                  styles.downloadTypeText,
                  downloadType === 'photo' && styles.selectedDownloadTypeText,
                ]}>
                  Photo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quality Selection */}
            <Text style={styles.sectionLabel}>Quality</Text>
            <View style={styles.qualitySelector}>
              <TouchableOpacity
                style={[
                  styles.qualityOption,
                  { flex: 1, borderTopLeftRadius: 50, borderBottomLeftRadius: 50 },
                  quality === '1080p' && styles.selectedQuality,
                ]}
                onPress={() => setQuality('1080p')}
              >
                <MaterialIcons name="high-quality" size={16} color={quality === '1080p' ? 'white' : '#333'} />
                <Text style={[
                  styles.qualityText,
                  quality === '1080p' && styles.selectedQualityText,
                ]}>
                  1080p HD
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.qualityOption,
                  { flex: 1 },
                  quality === '720p' && styles.selectedQuality,
                ]}
                onPress={() => setQuality('720p')}
              >
                <Text style={[
                  styles.qualityText,
                  quality === '720p' && styles.selectedQualityText,
                ]}>
                  720p HD
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.qualityOption,
                  { flex: 1 },
                  quality === '480p' && styles.selectedQuality,
                ]}
                onPress={() => setQuality('480p')}
              >
                <Text style={[
                  styles.qualityText,
                  quality === '480p' && styles.selectedQualityText,
                ]}>
                  480p
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.qualityOption,
                  { flex: 1, borderTopRightRadius: 50, borderBottomRightRadius: 50 },
                  quality === '360p' && styles.selectedQuality,
                ]}
                onPress={() => setQuality('360p')}
              >
                <Text style={[
                  styles.qualityText,
                  quality === '360p' && styles.selectedQualityText,
                ]}>
                  360p
                </Text>
              </TouchableOpacity>
            </View>

            {/* Show progress if loading */}
            {loading && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                <ProgressBar progress={progress / 100} color="#7F00FF" style={styles.progressBar} />
                <Text style={styles.progressStatus}>
                  {progress < 100 ? 'Processing...' : 'Complete!'}
                </Text>
              </View>
            )}
            
            {/* Show preview if available */}
            {showPreview && previewData && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>Content Preview</Text>
                
                <View style={styles.previewContent}>
                  <Image 
                    source={{ uri: previewData.thumbnail }} 
                    style={styles.previewThumbnail}
                    resizeMode="cover"
                  />
                  
                  <View style={styles.previewDetails}>
                    <Text style={styles.previewVideoTitle} numberOfLines={2}>
                      {previewData.title}
                    </Text>
                    
                    <Text style={styles.previewAuthor}>
                      By {previewData.author}
                    </Text>
                    
                    <Text style={styles.previewStats}>
                      {previewData.duration} • {previewData.views} views
                    </Text>
                    
                    <View style={styles.previewQualityContainer}>
                      <Text style={styles.previewQualityLabel}>Available Qualities:</Text>
                      <View style={styles.previewQualityChips}>
                        {previewData.availableQualities.map((q: string, i: number) => (
                          <Chip 
                            key={i} 
                            style={styles.previewQualityChip}
                            textStyle={{fontSize: 10}}
                          >
                            {q}
                          </Chip>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Error message if any */}
            {showError && (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error" size={20} color="#e74c3c" />
                <Text style={styles.errorText}>
                  {errorMessage || "Permission error: Media Library access required."}
                </Text>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleDownload}
                style={styles.downloadButton}
                contentStyle={{height: 50}}
                labelStyle={{fontSize: 16, fontWeight: 'bold', color: 'white'}}
                disabled={!url.trim() || loading}
                loading={loading && !showPreview}
                icon={({size, color}) => (
                  <MaterialIcons name="file-download" size={24} color={color} />
                )}
              >
                DOWNLOAD
              </Button>

              <Button
                mode="outlined"
                onPress={handleAnalyze}
                style={styles.analyzeButton}
                contentStyle={{height: 50}}
                labelStyle={{fontSize: 16, fontWeight: 'bold'}}
                disabled={!url.trim() || loading}
                loading={loading && showPreview}
                icon={({size, color}) => (
                  <MaterialIcons name="analytics" size={22} color={color} />
                )}
              >
                ANALYZE
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Recent Downloads Section */}
      {downloadHistory.length > 0 && (
        <View style={styles.historySection}>
          <View style={styles.sectionHeaderContainer}>
            <MaterialIcons name="history" size={24} color="#7F00FF" />
            <Text style={styles.sectionHeaderText}>Recent Downloads</Text>
          </View>
          
          <View style={styles.historyList}>
            {downloadHistory.map(renderDownloadItem)}
          </View>
        </View>
      )}

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <View style={styles.sectionHeaderContainer}>
          <MaterialIcons name="stars" size={24} color="#7F00FF" />
          <Text style={styles.sectionHeaderText}>Supported Platforms</Text>
        </View>
        
        <View style={styles.featuresGrid}>
          <View style={styles.featureItem}>
            {getPlatformIcon('youtube', 32)}
            <Text style={styles.featureText}>YouTube</Text>
          </View>
          <View style={styles.featureItem}>
            {getPlatformIcon('instagram', 32)}
            <Text style={styles.featureText}>Instagram</Text>
          </View>
          <View style={styles.featureItem}>
            {getPlatformIcon('twitter', 32)}
            <Text style={styles.featureText}>Twitter</Text>
          </View>
          <View style={styles.featureItem}>
            {getPlatformIcon('tiktok', 32)}
            <Text style={styles.featureText}>TikTok</Text>
          </View>
          <View style={styles.featureItem}>
            {getPlatformIcon('facebook', 32)}
            <Text style={styles.featureText}>Facebook</Text>
          </View>
        </View>
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>© 2025 Social Media Downloader</Text>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Header
  header: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    maxWidth: '90%',
  },
  // Card container
  cardContainer: {
    marginHorizontal: 16,
    marginTop: -30,
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    backgroundColor: 'white',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#7000EA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(127, 0, 255, 0.1)',
  },
  // URL Input 
  urlInputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  urlInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderWidth: 1.5,
    borderColor: '#d0d0d0',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  urlInput: {
    flex: 1,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  iconButton: {
    margin: 0,
  },
  // Section labels
  sectionLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 14,
    marginTop: 18,
    color: '#333',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  // Platform selector
  platformScroller: {
    marginBottom: 16,
  },
  platformOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 50,
    marginRight: 10,
    marginBottom: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedPlatform: {
    backgroundColor: '#7F00FF',
    elevation: 4,
    shadowColor: '#7F00FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  platformText: {
    marginLeft: 8,
    color: '#333',
    fontWeight: '500',
  },
  selectedPlatformText: {
    color: 'white',
  },
  // Download type selector
  downloadTypeSelector: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#d0d0d0',
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  downloadTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: '#f4f4f4',
  },
  selectedDownloadType: {
    backgroundColor: '#7F00FF',
    elevation: 4,
    shadowColor: '#7F00FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  downloadTypeText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedDownloadTypeText: {
    color: 'white',
  },
  // Quality selector
  qualitySelector: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#d0d0d0',
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  qualityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: '#f4f4f4',
  },
  selectedQuality: {
    backgroundColor: '#7F00FF',
    elevation: 4,
    shadowColor: '#7F00FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  qualityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedQualityText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Progress bar
  progressContainer: {
    marginVertical: 20,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  progressText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7F00FF',
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 10,
    borderRadius: 5,
  },
  progressStatus: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
    fontWeight: '500',
  },
  // Preview section
  previewContainer: {
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#7F00FF',
  },
  previewContent: {
    flexDirection: 'row',
  },
  previewThumbnail: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  previewDetails: {
    flex: 1,
    marginLeft: 12,
  },
  previewVideoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  previewAuthor: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  previewStats: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  previewQualityContainer: {
    marginTop: 4,
  },
  previewQualityLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  previewQualityChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  previewQualityChip: {
    marginRight: 4,
    marginBottom: 4,
    backgroundColor: '#f0f0f0',
  },
  // Error container
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 8,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#ffcdd2',
    elevation: 2,
    shadowColor: '#e57373',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 12,
  },
  downloadButton: {
    flex: 1,
    marginRight: 12,
    backgroundColor: '#7F00FF',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#7F00FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  analyzeButton: {
    flex: 1,
    borderColor: '#7F00FF',
    borderWidth: 2,
    borderRadius: 8,
  },
  // History section
  historySection: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  historyList: {
    marginTop: 8,
  },
  historyCard: {
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderRadius: 12,
  },
  historyCardContent: {
    flexDirection: 'row',
    marginTop: 8,
  },
  historyThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 6,
  },
  historyDetails: {
    flex: 1,
    marginLeft: 12,
  },
  historyDetailText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  historyDetailLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
  historyChip: {
    marginRight: 6,
    backgroundColor: '#f0f0f0',
    height: 26,
  },
  // Features section
  featuresSection: {
    marginHorizontal: 16,
    marginBottom: 30,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  featureItem: {
    width: '18%',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 12,
    marginTop: 6,
    color: '#555',
    textAlign: 'center',
  },
  // Footer
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
  },
  footerText: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
});