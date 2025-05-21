import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText, Menu, useTheme } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { detectPlatformFromUrl } from '../services/api';

interface DownloadFormProps {
  onSubmit: (url: string, platform: string) => void;
  error: string | null;
  initialUrl?: string;
  initialPlatform?: string;
}

const DownloadForm: React.FC<DownloadFormProps> = ({ 
  onSubmit,
  error,
  initialUrl = '',
  initialPlatform = 'auto'
}) => {
  const theme = useTheme();
  const [url, setUrl] = useState(initialUrl);
  const [platform, setPlatform] = useState(initialPlatform);
  const [isPlatformMenuVisible, setIsPlatformMenuVisible] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Update platform when URL changes if in auto mode
  useEffect(() => {
    if (platform === 'auto' && url) {
      const detectedPlatform = detectPlatformFromUrl(url);
      if (detectedPlatform !== 'unknown') {
        setPlatform(detectedPlatform);
      }
    }
  }, [url, platform]);

  const handleUrlChange = (text: string) => {
    setUrl(text);
    setUrlError(null);
  };

  const handleSubmit = () => {
    // Validate URL
    if (!url.trim()) {
      setUrlError('Please enter a URL');
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setUrlError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    onSubmit(url, platform);
  };

  const platformOptions = [
    { label: 'Auto Detect', value: 'auto' },
    { label: 'YouTube', value: 'youtube' },
    { label: 'Instagram', value: 'instagram' },
    { label: 'Twitter/X', value: 'twitter' },
  ];

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label="URL"
        placeholder="https://..."
        value={url}
        onChangeText={handleUrlChange}
        error={!!urlError || !!error}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        right={
          url ? (
            <TextInput.Icon 
              icon="close-circle" 
              onPress={() => setUrl('')} 
            />
          ) : null
        }
      />
      
      {urlError && (
        <HelperText type="error" visible={!!urlError}>
          {urlError}
        </HelperText>
      )}
      
      {error && (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      )}
      
      <View style={styles.platformContainer}>
        <View style={{ flex: 1 }}>
          <TextInput
            mode="outlined"
            label="Platform"
            value={platformOptions.find(p => p.value === platform)?.label || 'Select Platform'}
            editable={false}
            right={
              <TextInput.Icon
                icon="chevron-down"
                onPress={() => setIsPlatformMenuVisible(true)}
              />
            }
            style={styles.platformInput}
          />
          <Menu
            visible={isPlatformMenuVisible}
            onDismiss={() => setIsPlatformMenuVisible(false)}
            anchor={{ x: 0, y: 0 }}
            style={styles.menu}
          >
            {platformOptions.map((option) => (
              <Menu.Item
                key={option.value}
                title={option.label}
                onPress={() => {
                  setPlatform(option.value);
                  setIsPlatformMenuVisible(false);
                }}
                titleStyle={{ 
                  color: platform === option.value ? theme.colors.primary : theme.colors.text 
                }}
                leadingIcon={platform === option.value ? 'check' : undefined}
              />
            ))}
          </Menu>
        </View>
        
        <Button 
          mode="contained" 
          onPress={handleSubmit}
          style={styles.submitButton}
          disabled={!url.trim()}
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
  },
  input: {
    marginBottom: 8,
  },
  platformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  platformInput: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    height: 50,
    justifyContent: 'center',
  },
  menu: {
    width: 200,
  },
});

export default DownloadForm;
