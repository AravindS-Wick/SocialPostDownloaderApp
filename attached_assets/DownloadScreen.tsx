import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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
  
  // Local state
  const [url, setUrl] = useState(urlParam || '');
  const [platform, setPlatform] = useState(platformParam || 'auto');
  const [selectedResolution, setSelectedResolution] = useState('720p');
  const [availableResolutions, setAvailableResolutions] = useState<string[]>([]);
  const [downloadType, setDownloadType] = useState<'video' | 'audio'>('video');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadResult, setDownloadResult] = useState<any>(null);
  
  // Handle form submission
  const handleSubmit = async (urlValue: string, platformValue: string) => {
    try {
      setError(null);
      setIsDownloading(true);
      setProgress(0);
      
      // Simulate getting available resolutions
      // In a real app, you would call your API to get this information
      setTimeout(() => {
        const mockResolutions = ['360p', '480p', '720p', '1080p'];
        setAvailableResolutions(mockResolutions);
        setProgress(20);
      }, 1000);
      
      // Simulate download process
      setTimeout(() => {
        setProgress(50);
        
        // Simulate completion
        setTimeout(() => {
          setProgress(100);
          setIsDownloading(false);
          
          // Mock download result
          const result = {
            id: Date.now().toString(),
            url: urlValue,
            platform: platformValue,
            type: downloadType,
            filename: `download_${Date.now()}.${downloadType === 'video' ? 'mp4' : 'mp3'}`,
            resolution: selectedResolution,
            timestamp: new Date().toISOString(),
            path: `/downloads/${downloadType === 'video' ? 'videos' : 'audio'}/`,
          };
          
          setDownloadResult(result);
        }, 2000);
      }, 1500);
      
    } catch (err) {
      setError('An error occurred during download. Please try again.');
      setIsDownloading(false);
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
              File: {downloadResult.filename}
            </Text>
            <Text style={{ color: theme.colors.text }}>
              Resolution: {downloadResult.resolution}
            </Text>
            <Text style={{ color: theme.colors.text, marginBottom: 16 }}>
              Saved to: {downloadResult.path}
            </Text>
            
            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={() => {
                  setDownloadResult(null);
                  setAvailableResolutions([]);
                }}
                style={styles.actionButton}
              >
                New Download
              </Button>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Main')}
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