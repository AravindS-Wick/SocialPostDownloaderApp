import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Surface, Button, useTheme, ProgressBar } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';

import DownloadForm from '../components/DownloadForm';
import ResolutionPicker from '../components/ResolutionPicker';
import DownloadProgress from '../components/DownloadProgress';
import DownloadService from '../services/DownloadService';
import { checkAndRequestPermissions } from '../services/permissions';
import { setIsDownloading, setProgress, setAvailableResolutions } from '../store/slices/downloadSlice';
import { logDownloadAttempt, logDownloadComplete } from '../services/logger';

type DownloadScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Download'>;
type DownloadScreenRouteProp = RouteProp<RootStackParamList, 'Download'>;

interface DownloadScreenProps {
  navigation: DownloadScreenNavigationProp;
  route: DownloadScreenRouteProp;
}

const DownloadScreen: React.FC<DownloadScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // Get the URL and platform from the navigation params
  const { url: urlParam, platform: platformParam } = route.params || {};
  
  // Get download state from Redux
  const { isDownloading, progress, availableResolutions } = useSelector(
    (state: RootState) => state.download
  );
  
  // Local state
  const [url, setUrl] = useState(urlParam || '');
  const [platform, setPlatform] = useState(platformParam || 'auto');
  const [selectedResolution, setSelectedResolution] = useState('720p');
  const [downloadType, setDownloadType] = useState<'video' | 'audio'>('video');
  const [error, setError] = useState<string | null>(null);
  const [downloadResult, setDownloadResult] = useState<any>(null);
  
  // Check permissions when component mounts
  useEffect(() => {
    const checkPermissions = async () => {
      const hasPermissions = await checkAndRequestPermissions();
      if (!hasPermissions) {
        Alert.alert(
          'Permissions Required',
          'This app needs access to your media library to save downloads. Please grant the permissions in your device settings.',
          [{ text: 'OK' }]
        );
      }
    };
    
    checkPermissions();
  }, []);
  
  // Handle form submission
  const handleSubmit = async (urlValue: string, platformValue: string) => {
    try {
      setError(null);
      dispatch(setIsDownloading(true));
      dispatch(setProgress(0));
      
      // Log download attempt
      await logDownloadAttempt(urlValue, platformValue, downloadType);
      
      // Get media info to determine available resolutions
      const mediaInfo = await DownloadService.getMediaInfo(urlValue);
      
      // Mock available resolutions for now
      // In a real app, these would come from the mediaInfo response
      const resolutions = ['360p', '480p', '720p', '1080p'];
      dispatch(setAvailableResolutions(resolutions));
      
      // Start download process
      const result = await DownloadService.downloadContent(
        {
          url: urlValue,
          platform: platformValue,
          type: downloadType,
          quality: selectedResolution,
          title: mediaInfo?.title,
        },
        (downloadProgress) => {
          dispatch(setProgress(downloadProgress.progress));
        }
      );
      
      // Log download completion
      await logDownloadComplete(urlValue, platformValue, downloadType, result.success);
      
      if (result.success) {
        setDownloadResult(result);
      } else {
        setError(result.error || 'Download failed');
      }
      
      dispatch(setIsDownloading(false));
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(`An error occurred: ${errorMessage}`);
      dispatch(setIsDownloading(false));
      await logDownloadComplete(urlValue, platformValue, downloadType, false, errorMessage);
      console.error(err);
    }
  };
  
  // Start download when the screen loads if URL is provided
  useEffect(() => {
    if (urlParam && platformParam) {
      handleSubmit(urlParam, platformParam);
    }
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>Download Media</Text>
        
        {!isDownloading && !downloadResult && (
          <>
            <DownloadForm
              onSubmit={handleSubmit}
              error={error}
              initialUrl={url}
              initialPlatform={platform}
            />
            
            {availableResolutions.length > 0 && (
              <View style={styles.optionsContainer}>
                <ResolutionPicker
                  availableResolutions={availableResolutions}
                  selectedResolution={selectedResolution}
                  onSelect={setSelectedResolution}
                />
                
                <View style={styles.typeContainer}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Download Type
                  </Text>
                  <View style={styles.buttonGroup}>
                    <Button
                      mode={downloadType === 'video' ? 'contained' : 'outlined'}
                      onPress={() => setDownloadType('video')}
                      style={styles.typeButton}
                    >
                      Video
                    </Button>
                    <Button
                      mode={downloadType === 'audio' ? 'contained' : 'outlined'}
                      onPress={() => setDownloadType('audio')}
                      style={styles.typeButton}
                    >
                      Audio Only
                    </Button>
                  </View>
                </View>
                
                <Button
                  mode="contained"
                  onPress={() => handleSubmit(url, platform)}
                  style={styles.downloadButton}
                >
                  Start Download
                </Button>
              </View>
            )}
          </>
        )}
        
        {isDownloading && (
          <DownloadProgress progress={progress} />
        )}
        
        {downloadResult && (
          <View style={styles.resultContainer}>
            <Text style={[styles.successText, { color: theme.colors.primary }]}>
              Download Completed!
            </Text>
            <Text style={{ color: theme.colors.text }}>
              File: {downloadResult.metadata?.title || downloadResult.fileUri?.split('/').pop()}
            </Text>
            {downloadResult.metadata?.quality && (
              <Text style={{ color: theme.colors.text }}>
                Resolution: {downloadResult.metadata.quality}
              </Text>
            )}
            <Text style={{ color: theme.colors.text, marginBottom: 16 }}>
              Saved to: {downloadResult.metadata?.type === 'audio' ? 'Audio' : 'Video'} folder
            </Text>
            
            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={() => {
                  setDownloadResult(null);
                  dispatch(setAvailableResolutions([]));
                }}
                style={styles.actionButton}
              >
                New Download
              </Button>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('TabNavigator')}
                style={styles.actionButton}
              >
                Go to Home
              </Button>
            </View>
          </View>
        )}
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: 20,
  },
  typeContainer: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  downloadButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
  resultContainer: {
    alignItems: 'center',
    padding: 16,
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionButton: {
    marginHorizontal: 8,
    flex: 1,
  },
});

export default DownloadScreen;
