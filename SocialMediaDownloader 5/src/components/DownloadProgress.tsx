import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar, useTheme } from 'react-native-paper';

interface DownloadProgressProps {
  progress: number; // 0 to 100
}

const DownloadProgress = ({ progress }: DownloadProgressProps) => {
  const theme = useTheme();
  const progressDecimal = progress / 100;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        Downloading...
      </Text>
      
      <ProgressBar
        progress={progressDecimal}
        color={theme.colors.primary}
        style={styles.progressBar}
      />
      
      <Text style={[styles.percentText, { color: theme.colors.onSurface }]}>
        {Math.round(progress)}%
      </Text>
      
      <Text style={[styles.statusText, { color: theme.colors.onSurfaceVariant }]}>
        {getStatusMessage(progress)}
      </Text>
    </View>
  );
};

// Helper function to get status message based on progress
const getStatusMessage = (progress: number): string => {
  if (progress < 20) {
    return 'Analyzing URL and fetching information...';
  } else if (progress < 50) {
    return 'Getting available formats...';
  } else if (progress < 80) {
    return 'Downloading media content...';
  } else {
    return 'Processing and saving download...';
  }
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  percentText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default DownloadProgress;