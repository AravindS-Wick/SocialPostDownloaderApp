import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, Clipboard } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { detectPlatformFromUrl } from '../services/api';

interface DownloadFormProps {
  onSubmit: (url: string, platform: string) => void;
  error?: string | null;
  initialUrl?: string;
  initialPlatform?: string;
}

const DownloadForm: React.FC<DownloadFormProps> = ({
  onSubmit,
  error,
  initialUrl = '',
  initialPlatform = '',
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [platform, setPlatform] = useState(initialPlatform);

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
    }
    if (initialPlatform) {
      setPlatform(initialPlatform);
    }
  }, [initialUrl, initialPlatform]);

  useEffect(() => {
    if (url) {
      const detectedPlatform = detectPlatformFromUrl(url);
      if (detectedPlatform !== 'unknown') {
        setPlatform(detectedPlatform);
      }
    }
  }, [url]);

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await Clipboard.getString();
      if (clipboardText) {
        setUrl(clipboardText);
        const detectedPlatform = detectPlatformFromUrl(clipboardText);
        setPlatform(detectedPlatform);
      }
    } catch (error) {
      console.error('Failed to paste from clipboard', error);
    }
  };

  const handleSubmit = () => {
    if (!url.trim()) return;
    onSubmit(url, platform);
  };

  const handleClearUrl = () => {
    setUrl('');
    setPlatform('');
  };

  const handleSelectPlatform = (newPlatform: string) => {
    setPlatform(newPlatform);
  };

  const getPlatformIcon = (platformName: string, isSelected: boolean) => {
    const color = isSelected ? 'white' : '#333';
    
    switch (platformName) {
      case 'youtube':
        return <FontAwesome5 name="youtube" size={18} color={isSelected ? 'white' : 'red'} />;
      case 'instagram':
        return <FontAwesome5 name="instagram" size={18} color={isSelected ? 'white' : '#C13584'} />;
      case 'twitter':
        return <FontAwesome5 name="twitter" size={18} color={isSelected ? 'white' : '#1DA1F2'} />;
      case 'tiktok':
        return <FontAwesome5 name="tiktok" size={18} color={isSelected ? 'white' : 'black'} />;
      case 'facebook':
        return <FontAwesome5 name="facebook" size={18} color={isSelected ? 'white' : '#4267B2'} />;
      default:
        return <Ionicons name="sync" size={18} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.urlInputContainer}>
        <View style={styles.urlInputWrapper}>
          <TextInput
            style={styles.urlInput}
            placeholder="Paste video/image URL here"
            value={url}
            onChangeText={setUrl}
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

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Platform</Text>
        <View style={styles.platformSelector}>
          <TouchableOpacity
            style={[
              styles.platformOption,
              platform === 'auto-detect' && styles.selectedPlatform,
            ]}
            onPress={() => handleSelectPlatform('auto-detect')}
          >
            {getPlatformIcon('auto-detect', platform === 'auto-detect')}
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
            {getPlatformIcon('youtube', platform === 'youtube')}
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
            {getPlatformIcon('instagram', platform === 'instagram')}
            <Text style={[
              styles.platformText,
              platform === 'instagram' && styles.selectedPlatformText,
            ]}>
              Instagram
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.downloadButton}
          disabled={!url.trim()}
          icon="download"
        >
          Download
        </Button>

        <Button
          mode="outlined"
          onPress={handleSubmit}
          style={styles.analyzeButton}
          disabled={!url.trim()}
          icon="magnify"
        >
          Analyze
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  urlInputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  urlInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  urlInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  iconButton: {
    margin: 0,
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContainer: {
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  platformSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  platformOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedPlatform: {
    backgroundColor: '#3498db',
  },
  platformText: {
    marginLeft: 6,
    color: '#333',
  },
  selectedPlatformText: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  downloadButton: {
    flex: 1,
    marginRight: 8,
  },
  analyzeButton: {
    flex: 1,
  },
});

export default DownloadForm;
