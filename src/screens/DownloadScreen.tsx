import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Button, ActivityIndicator, useTheme, Chip, Divider } from 'react-native-paper';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setAvailableResolutions, setDownloadType, setIsDownloading, setProgress } from '../store/slices/downloadSlice';
import { addDownloadToHistory } from '../store/slices/historySlice';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import DownloadService, { DownloadOptions, DownloadProgress } from '../services/DownloadService';
import { detectPlatformFromUrl, testApiEndpoints, downloadAPI, discoverApiEndpoints, updateDiscoveredEndpoints } from '../services/api';
import { v4 as uuidv4 } from 'uuid';
import { logDownloadAttempt, logDownloadComplete } from '../services/logger';
import { checkAlbumContents } from '../services/storage';
import axios from 'axios';
// import { API_BASE_URL } from '../../SocialMediaDownloader 5/src/utils/constants';
import { API_BASE_URL } from '../utils/constants';

// Define types for navigation and route
type DownloadScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Download'>;
type DownloadScreenRouteProp = RouteProp<RootStackParamList, 'Download'>;

// Prop type for the component
interface DownloadScreenProps {
  navigation: DownloadScreenNavigationProp;
  route: DownloadScreenRouteProp;
}

const DownloadScreen: React.FC<DownloadScreenProps> = ({ navigation, route }) => {
  // Get theme and initialize dispatch
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Get state from Redux
  const { isDownloading, progress, availableResolutions } = useSelector(
    (state: RootState) => state.download
  );
  
  // Local state
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('');
  const [mediaInfo, setMediaInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState('720p');
  const [selectedType, setSelectedType] = useState<'video' | 'audio'>('video');
  
  // Set up navigation options
  useEffect(() => {
    navigation.setOptions({
      title: 'Download Content',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [navigation]);
  
  // Initialize from route params
  useEffect(() => {
    if (route.params) {
      const { url: routeUrl, platform: routePlatform } = route.params;
      if (routeUrl) {
        setUrl(routeUrl);
        // If platform not provided, detect it
        const detectedPlatform = routePlatform || detectPlatformFromUrl(routeUrl);
        setPlatform(detectedPlatform);
        fetchMediaInfo(routeUrl);
      }
    }
  }, [route.params]);
  
  // Fetch information about the media
  const fetchMediaInfo = async (mediaUrl: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Log the download attempt
      await logDownloadAttempt(mediaUrl, platform);
      
      // Get information about the media
      const info = await DownloadService.getMediaInfo(mediaUrl);
      setMediaInfo(info);
      
      // Set available resolutions in Redux
      if (info.qualities) {
        dispatch(setAvailableResolutions(info.qualities));
        // Set default quality to highest available
        if (info.qualities.length > 0) {
          setSelectedQuality(info.qualities[0]);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching media info:', err);
      setError('Failed to get information about the media. Please check the URL and try again.');
      setLoading(false);
    }
  };
  
  // Test API endpoints
  const handleTestApiEndpoints = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Testing API endpoints from DownloadScreen...');
      
      const results = await testApiEndpoints();
      
      // Show results in an alert
      Alert.alert(
        'API Endpoint Test Results',
        `Health: ${results.health ? '✅' : '❌'}\n` +
        `Media Info: ${results.mediaInfo ? '✅' : '❌'}\n` +
        `Download: ${results.downloadMedia ? '✅' : '❌'}\n` +
        `Status: ${results.downloadStatus ? '✅' : '❌'}`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.error('Error testing API endpoints:', err);
      setError('Failed to test API endpoints. Check console for details.');
    } finally {
      setLoading(false);
    }
  };
  
  // Check album contents
  const handleCheckAlbumContents = async () => {
    try {
      setLoading(true);
      await checkAlbumContents();
    } catch (err) {
      console.error('Error checking album contents:', err);
      setError('Failed to check album contents. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Discover API endpoints
  const handleDiscoverApiEndpoints = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Discovering API endpoints...');
      
      await discoverApiEndpoints();
      
      Alert.alert('API Discovery', 'API endpoint discovery completed. Check console for details.');
    } catch (err) {
      console.error('Error discovering API endpoints:', err);
      setError('Failed to discover API endpoints. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Test direct API call
  const handleDirectApiTest = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('=== DIRECT API TEST ===');
      
      if (!url) {
        Alert.alert('Error', 'Please enter a URL first');
        setLoading(false);
        return;
      }
      
      console.log('Testing direct API call with URL:', url);
      
      // Test media info API
      console.log('Testing media info API directly...');
      
      // Try different possible endpoint paths
      const possibleMediaInfoPaths = [
        // '/api/media/info',
        '/api/download/info',
        '/api/info',
        '/api/youtube/info',
        '/youtube/info',
        '/download/info'
      ];
      
      let mediaInfoSuccess = false;
      
      for (const path of possibleMediaInfoPaths) {
        try {
          console.log(`Trying media info endpoint: ${path}`);
          const response = await axios.get(`${path.startsWith('/api') ? API_BASE_URL.replace('/api', '') : API_BASE_URL.replace('/api', '/api')}${path}`, {
            params: { url }
          });
          console.log(`Media info endpoint ${path} response:`, response.status);
          console.log(`Media info endpoint ${path} data:`, JSON.stringify(response.data));
          mediaInfoSuccess = true;
          
          // Update the discovered endpoint
          updateDiscoveredEndpoints({ mediaInfo: path });
          
          Alert.alert('Media Info API Test', `Success with endpoint: ${path}! Check console for details.`);
          break;
        } catch (pathError: any) {
          console.log(`Media info endpoint ${path} failed:`, pathError?.message || 'Unknown error');
        }
      }
      
      if (!mediaInfoSuccess) {
        try {
          const mediaInfoResult = await downloadAPI.getMediaInfo(url);
          console.log('Media info API direct test result:', JSON.stringify(mediaInfoResult));
          Alert.alert('Media Info API Test', 'Success with original endpoint! Check console for details.');
        } catch (mediaInfoError: any) {
          console.error('All media info API endpoints failed:', mediaInfoError?.message || 'Unknown error');
          Alert.alert('Media Info API Test', 'Failed with all endpoints! Check console for details.');
        }
      }
      
      // Test download API
      console.log('Testing download API directly...');
      
      const downloadOptions = {
        url,
        format: 'best',  // Use 'best' instead of specific format
        quality: 'best', // Use 'best' instead of specific quality
        type: 'video' as 'video' | 'audio' | 'image',
        useAutoFormat: true // Tell the API to use the best available format
      };
      
      // Try different possible endpoint paths for download
      const possibleDownloadPaths = [
        '/api/media/download',
        '/api/download',
        '/api/youtube/download',
        '/youtube/download',
        '/download'
      ];
      
      let downloadSuccess = false;
      let downloadId = '';
      
      for (const path of possibleDownloadPaths) {
        try {
          console.log(`Trying download endpoint: ${path}`);
          const response = await axios.post(`${path.startsWith('/api') ? API_BASE_URL.replace('/api', '') : API_BASE_URL.replace('/api', '/api')}${path}`, downloadOptions);
          console.log(`Download endpoint ${path} response:`, response.status);
          console.log(`Download endpoint ${path} data:`, JSON.stringify(response.data));
          downloadSuccess = true;
          
          if (response.data && response.data.downloadId) {
            downloadId = response.data.downloadId;
          }
          
          // Update the discovered endpoint
          updateDiscoveredEndpoints({ download: path });
          
          Alert.alert('Download API Test', `Success with endpoint: ${path}! Check console for details.`);
          break;
        } catch (pathError: any) {
          console.log(`Download endpoint ${path} failed:`, pathError?.message || 'Unknown error');
        }
      }
      
      if (!downloadSuccess) {
        try {
          const downloadResult = await downloadAPI.downloadMedia(downloadOptions);
          console.log('Download API direct test result:', JSON.stringify(downloadResult));
          Alert.alert('Download API Test', 'Success with original endpoint! Check console for details.');
          
          if (downloadResult && downloadResult.downloadId) {
            downloadId = downloadResult.downloadId;
          }
        } catch (downloadError: any) {
          console.error('All download API endpoints failed:', downloadError?.message || 'Unknown error');
          Alert.alert('Download API Test', 'Failed with all endpoints! Check console for details.');
        }
      }
      
      // Test status API if we got a download ID
      if (downloadId) {
        console.log('Testing status API directly with download ID:', downloadId);
        
        // Try different possible endpoint paths for status
        const possibleStatusPaths = [
          `/api/media/status/${downloadId}`,
          `/api/download/status/${downloadId}`,
          `/api/status/${downloadId}`,
          `/download/status/${downloadId}`,
          `/status/${downloadId}`
        ];
        
        let statusSuccess = false;
        
        for (const path of possibleStatusPaths) {
          try {
            console.log(`Trying status endpoint: ${path}`);
            const response = await axios.get(`${path.startsWith('/api') ? API_BASE_URL.replace('/api', '') : API_BASE_URL.replace('/api', '/api')}${path}`);
            console.log(`Status endpoint ${path} response:`, response.status);
            console.log(`Status endpoint ${path} data:`, JSON.stringify(response.data));
            statusSuccess = true;
            
            // Update the discovered endpoint
            // Extract the base path without the ID
            const basePath = path.substring(0, path.lastIndexOf('/') + 1);
            updateDiscoveredEndpoints({ status: basePath });
            
            Alert.alert('Status API Test', `Success with endpoint: ${path}! Check console for details.`);
            break;
          } catch (pathError: any) {
            console.log(`Status endpoint ${path} failed:`, pathError?.message || 'Unknown error');
          }
        }
        
        if (!statusSuccess) {
          try {
            const statusResult = await downloadAPI.getDownloadStatus(downloadId);
            console.log('Status API direct test result:', JSON.stringify(statusResult));
            Alert.alert('Status API Test', 'Success with original endpoint! Check console for details.');
          } catch (statusError: any) {
            console.error('All status API endpoints failed:', statusError?.message || 'Unknown error');
            Alert.alert('Status API Test', 'Failed with all endpoints! Check console for details.');
          }
        }
      } else {
        console.log('No download ID received, skipping status API test');
        Alert.alert('Status API Test', 'Skipped - No download ID received');
      }
    } catch (err) {
      console.error('Error in direct API test:', err);
      setError('Failed to test API directly. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Handle download start
  const handleDownload = async () => {
    if (!url || isDownloading) return;
    
    console.log('=== DOWNLOAD BUTTON CLICKED ===');
    console.log('URL value:', url);
    console.log('isDownloading value:', isDownloading);
    
    try {
      // Set downloading state
      dispatch(setIsDownloading(true));
      setError(null);
      
      console.log('=== DOWNLOAD INITIATED FROM UI ===');
      console.log('URL:', url);
      console.log('Platform:', platform);
      console.log('Type:', selectedType);
      console.log('Quality:', selectedQuality);
      
      // Create download options
      const downloadOptions: DownloadOptions = {
        url,
        platform,
        type: selectedType,
        quality: selectedQuality || 'best',
        format: 'best', // Use best format
        title: mediaInfo?.title || 'Downloaded Content',
        useAutoFormat: true, // Enable auto format selection
      };
      
      // Start download and track progress
      console.log('Calling DownloadService.downloadContent with options:', JSON.stringify(downloadOptions));
      
      let result;
      try {
        result = await DownloadService.downloadContent(
          downloadOptions,
          (downloadProgress: DownloadProgress) => {
            dispatch(setProgress(downloadProgress.progress));
            console.log(`Progress update in UI: ${downloadProgress.progress.toFixed(1)}%`);
          }
        );
        console.log('Download result received:', JSON.stringify(result));
      } catch (downloadError: any) {
        console.error('=== ERROR IN DOWNLOAD SERVICE CALL ===');
        console.error('Error message:', downloadError?.message || 'Unknown error');
        console.error('Error details:', JSON.stringify(downloadError));
        throw downloadError; // Re-throw to be caught by the outer try-catch
      }
      
      // Handle download result
      if (result && result.success && result.metadata) {
        // Add to history
        const historyItem = {
          id: uuidv4(),
          url,
          title: result.metadata.title,
          thumbnail: result.metadata.thumbnail,
          platform,
          type: selectedType,
          quality: selectedQuality,
          createdAt: new Date().toISOString(),
          fileSize: result.metadata.fileSize,
          filePath: result.filePath,
        };
        
        dispatch(addDownloadToHistory(historyItem));
        
        // Log successful download
        await logDownloadComplete(url, platform, selectedType, result.metadata.title);
        
        // Show success alert
        Alert.alert(
          'Download Complete',
          `Successfully downloaded "${result.metadata.title}"`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        // Show error
        setError(result.error || 'Failed to download. Please try again.');
      }
    } catch (err) {
      console.error('Download error:', err);
      setError('An unexpected error occurred during download.');
    } finally {
      dispatch(setIsDownloading(false));
    }
  };
  
  // Handle type selection
  const handleTypeSelect = (type: 'video' | 'audio') => {
    setSelectedType(type);
    dispatch(setDownloadType(type));
  };
  
  // Get platform icon
  const getPlatformIcon = () => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return <FontAwesome5 name="youtube" size={24} color="red" />;
      case 'instagram':
        return <FontAwesome5 name="instagram" size={24} color="#C13584" />;
      case 'twitter':
      case 'x':
        return <FontAwesome5 name="twitter" size={24} color="#1DA1F2" />;
      case 'tiktok':
        return <FontAwesome5 name="tiktok" size={24} color="#000000" />;
      case 'facebook':
        return <FontAwesome5 name="facebook" size={24} color="#4267B2" />;
      default:
        return <FontAwesome5 name="link" size={24} color="#777777" />;
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Fetching media information...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={() => fetchMediaInfo(url)}
            style={styles.retryButton}
          >
            Retry
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            Go Back
          </Button>
          <Button 
            mode="outlined" 
            onPress={handleTestApiEndpoints}
            style={[styles.backButton, { marginTop: 10 }]}
          >
            Test API Endpoints
          </Button>
          <Button 
            mode="outlined" 
            onPress={handleDirectApiTest}
            style={[styles.backButton, { marginTop: 10 }]}
          >
            Direct API Test
          </Button>
          <Button 
            mode="outlined" 
            onPress={handleDiscoverApiEndpoints}
            style={[styles.backButton, { marginTop: 10 }]}
          >
            Discover API Endpoints
          </Button>
          <Button 
            mode="outlined" 
            onPress={handleCheckAlbumContents}
            style={[styles.backButton, { marginTop: 10 }]}
          >
            Check Downloaded Files
          </Button>
        </View>
      ) : mediaInfo ? (
        <View style={styles.contentContainer}>
          {/* Media Preview */}
          <View style={styles.previewContainer}>
            <Image 
              source={{ uri: mediaInfo.thumbnail || 'https://via.placeholder.com/300x200' }} 
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <View style={styles.platformBadge}>
              {getPlatformIcon()}
              <Text style={styles.platformText}>
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </Text>
            </View>
          </View>
          
          {/* Media Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{mediaInfo.title}</Text>
            
            {mediaInfo.author && (
              <Text style={styles.author}>by {mediaInfo.author}</Text>
            )}
            
            {mediaInfo.duration && (
              <Text style={styles.duration}>
                Duration: {Math.floor(mediaInfo.duration / 60)}:{(mediaInfo.duration % 60).toString().padStart(2, '0')}
              </Text>
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Download Options */}
          <View style={styles.optionsContainer}>
            <Text style={styles.sectionTitle}>Download Options</Text>
            
            {/* Download Type Selection */}
            <View style={styles.typeSelectionContainer}>
              <Text style={styles.optionLabel}>Format:</Text>
              <View style={styles.typeOptions}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    selectedType === 'video' && styles.selectedTypeButton,
                  ]}
                  onPress={() => handleTypeSelect('video')}
                >
                  <Ionicons 
                    name="videocam" 
                    size={22} 
                    color={selectedType === 'video' ? 'white' : theme.colors.primary} 
                  />
                  <Text 
                    style={[
                      styles.typeText,
                      selectedType === 'video' && styles.selectedTypeText,
                    ]}
                  >
                    Video
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    selectedType === 'audio' && styles.selectedTypeButton,
                  ]}
                  onPress={() => handleTypeSelect('audio')}
                >
                  <Ionicons 
                    name="musical-notes" 
                    size={22} 
                    color={selectedType === 'audio' ? 'white' : theme.colors.primary} 
                  />
                  <Text 
                    style={[
                      styles.typeText,
                      selectedType === 'audio' && styles.selectedTypeText,
                    ]}
                  >
                    Audio Only
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Quality Selection */}
            {selectedType === 'video' && availableResolutions.length > 0 && (
              <View style={styles.qualityContainer}>
                <Text style={styles.optionLabel}>Quality:</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.qualityScrollView}
                >
                  {availableResolutions.map((quality) => (
                    <Chip
                      key={quality}
                      selected={selectedQuality === quality}
                      onPress={() => setSelectedQuality(quality)}
                      style={styles.qualityChip}
                      selectedColor={selectedQuality === quality ? 'white' : undefined}
                      mode={selectedQuality === quality ? 'flat' : 'outlined'}
                    >
                      {quality}
                    </Chip>
                  ))}
                </ScrollView>
              </View>
            )}
            
            {/* Audio Quality Selection */}
            {selectedType === 'audio' && mediaInfo.audioQualities && (
              <View style={styles.qualityContainer}>
                <Text style={styles.optionLabel}>Audio Quality:</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.qualityScrollView}
                >
                  {mediaInfo.audioQualities.map((quality: string) => (
                    <Chip
                      key={quality}
                      selected={selectedQuality === quality}
                      onPress={() => setSelectedQuality(quality)}
                      style={styles.qualityChip}
                      selectedColor={selectedQuality === quality ? 'white' : undefined}
                      mode={selectedQuality === quality ? 'flat' : 'outlined'}
                    >
                      {quality}
                    </Chip>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          
          {/* Download Button and Progress */}
          <View style={styles.downloadContainer}>
            {isDownloading ? (
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                <View style={styles.progressBarOuter}>
                  <View 
                    style={[
                      styles.progressBarInner, 
                      { width: `${progress}%`, backgroundColor: theme.colors.primary }
                    ]} 
                  />
                </View>
                <Text style={styles.downloadingText}>Downloading...</Text>
              </View>
            ) : (
              <View>
                <Button 
                  mode="contained" 
                  onPress={handleDownload}
                  style={styles.downloadButton}
                  icon="download"
                >
                  Download {selectedType === 'video' ? 'Video' : 'Audio'}
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={handleTestApiEndpoints}
                  style={[styles.downloadButton, { marginTop: 10 }]}
                  icon="api"
                >
                  Test API Connection
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={handleDirectApiTest}
                  style={[styles.downloadButton, { marginTop: 10 }]}
                  icon="test-tube"
                >
                  Direct API Test
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={handleDiscoverApiEndpoints}
                  style={[styles.downloadButton, { marginTop: 10 }]}
                  icon="magnify"
                >
                  Discover API Endpoints
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={handleCheckAlbumContents}
                  style={[styles.downloadButton, { marginTop: 10 }]}
                  icon="folder"
                >
                  Check Downloaded Files
                </Button>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No media information available</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  errorText: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginBottom: 10,
    width: 200,
  },
  backButton: {
    width: 200,
  },
  contentContainer: {
    padding: 15,
  },
  previewContainer: {
    position: 'relative',
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
  },
  platformBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformText: {
    marginLeft: 5,
    fontWeight: 'bold',
    color: '#333',
  },
  infoContainer: {
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  author: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  duration: {
    fontSize: 14,
    color: '#888',
  },
  divider: {
    marginVertical: 15,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  typeSelectionContainer: {
    marginBottom: 20,
  },
  optionLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  typeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 0.48,
  },
  selectedTypeButton: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  typeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#555',
  },
  selectedTypeText: {
    color: 'white',
  },
  qualityContainer: {
    marginBottom: 15,
  },
  qualityScrollView: {
    flexDirection: 'row',
  },
  qualityChip: {
    marginRight: 8,
    marginVertical: 4,
  },
  downloadContainer: {
    marginTop: 10,
  },
  downloadButton: {
    paddingVertical: 8,
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#3498db',
  },
  progressBarOuter: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    borderRadius: 5,
  },
  downloadingText: {
    marginTop: 8,
    color: '#666',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});

export default DownloadScreen;
