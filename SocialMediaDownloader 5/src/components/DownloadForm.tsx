import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, useTheme } from 'react-native-paper';
import PlatformSelector from './PlatformSelector';

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
  initialPlatform = 'auto',
}) => {
  const theme = useTheme();
  const [url, setUrl] = useState(initialUrl);
  const [platform, setPlatform] = useState(initialPlatform);
  const [urlInputError, setUrlInputError] = useState<string | null>(null);

  const handleUrlChange = (text: string) => {
    setUrl(text);
    if (urlInputError) setUrlInputError(null);
  };

  const handlePlatformChange = (selectedPlatform: string) => {
    setPlatform(selectedPlatform);
  };

  const handleSubmit = () => {
    if (!url.trim()) {
      setUrlInputError('Please enter a URL');
      return;
    }

    // Basic URL validation
    if (!url.startsWith('http')) {
      setUrlInputError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    onSubmit(url.trim(), platform);
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Enter URL"
        value={url}
        onChangeText={handleUrlChange}
        mode="outlined"
        placeholder="https://www.instagram.com/p/..."
        autoCapitalize="none"
        autoCorrect={false}
        error={!!urlInputError || !!error}
        style={styles.urlInput}
      />
      {urlInputError && (
        <View style={styles.errorContainer}>
          <TextInput.Helper type="error" visible={!!urlInputError}>
            {urlInputError}
          </TextInput.Helper>
        </View>
      )}

      <View style={styles.platformSection}>
        <PlatformSelector 
          selectedPlatform={platform} 
          onSelectPlatform={handlePlatformChange} 
        />
      </View>

      <Button 
        mode="contained" 
        onPress={handleSubmit} 
        style={styles.submitButton}
        labelStyle={styles.submitButtonText}
      >
        Download
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  urlInput: {
    marginBottom: 8,
  },
  errorContainer: {
    marginBottom: 8,
  },
  platformSection: {
    marginBottom: 16,
  },
  submitButton: {
    paddingVertical: 6,
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
  },
});

export default DownloadForm;