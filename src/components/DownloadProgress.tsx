import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, ProgressBar, useTheme } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

interface DownloadProgressProps {
  progress: number;
}

const DownloadProgress: React.FC<DownloadProgressProps> = ({ progress }) => {
  const theme = useTheme();
  const [statusText, setStatusText] = useState('Analyzing URL...');
  const [animatedProgress] = useState(new Animated.Value(0));
  
  // Update the status text based on the progress
  useEffect(() => {
    if (progress < 0.2) {
      setStatusText('Analyzing URL...');
    } else if (progress < 0.4) {
      setStatusText('Preparing download...');
    } else if (progress < 0.6) {
      setStatusText('Downloading content...');
    } else if (progress < 0.8) {
      setStatusText('Processing...');
    } else if (progress < 1) {
      setStatusText('Finishing up...');
    } else {
      setStatusText('Download complete!');
    }
    
    // Animate the progress
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Format the progress as a percentage
  const progressPercent = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: theme.colors.text }]}>
          {statusText}
        </Text>
        <Text style={[styles.percentText, { color: theme.colors.primary }]}>
          {progressPercent}%
        </Text>
      </View>
      
      <ProgressBar
        progress={progress}
        color={theme.colors.primary}
        style={styles.progressBar}
      />
      
      <View style={styles.iconContainer}>
        {progress === 1 ? (
          <Feather name="check-circle" size={24} color={theme.colors.primary} />
        ) : (
          <Feather name="download" size={24} color={theme.colors.primary} />
        )}
      </View>
      
      <Text style={[styles.noteText, { color: theme.colors.text }]}>
        Please do not close the app during download
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
  },
  percentText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    marginBottom: 24,
  },
  iconContainer: {
    marginVertical: 16,
  },
  noteText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default DownloadProgress;
