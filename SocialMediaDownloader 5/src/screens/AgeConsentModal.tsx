import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { Text, Button, Checkbox } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAppDispatch } from '../store';
import { addDownloadToHistory } from '../store/slices/historySlice';
import { startDownload } from '../services/downloader';
import { logDownloadConsent } from '../services/logger';

type AgeConsentModalProps = {
  navigation: StackNavigationProp<RootStackParamList, 'AgeConsent'>;
  route: RouteProp<RootStackParamList, 'AgeConsent'>;
};

export default function AgeConsentModal({ navigation, route }: AgeConsentModalProps) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  const { url, platform, downloadType, resolution } = route.params;
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleCancel = () => {
    navigation.goBack();
  };
  
  const handleDownload = async () => {
    if (!isChecked) return;
    
    setIsLoading(true);
    
    try {
      // Log consent given
      await logDownloadConsent(url, platform, downloadType, true);
      
      // Start download
      const result = await startDownload(url, platform, downloadType, resolution);
      
      // Add to history
      dispatch(addDownloadToHistory({
        id: Date.now().toString(),
        url,
        platform,
        type: downloadType,
        filename: result.filename,
        resolution: resolution || 'default',
        timestamp: new Date().toISOString(),
        path: result.path
      }));
      
      // Close modal and go back
      navigation.goBack();
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={true}
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.title, { color: theme.colors.text }]}>Age Verification</Text>
              
              <View style={styles.iconContainer}>
                <Text style={styles.warningIcon}>⚠️</Text>
              </View>
              
              <Text style={[styles.description, { color: theme.colors.text }]}>
                The content you are trying to download may contain adult content and is intended for viewers who are 18 years of age or older.
              </Text>
              
              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={isChecked ? 'checked' : 'unchecked'}
                  onPress={() => setIsChecked(!isChecked)}
                />
                <Text 
                  style={[styles.checkboxLabel, { color: theme.colors.text }]}
                  onPress={() => setIsChecked(!isChecked)}
                >
                  I confirm that I am at least 18 years old
                </Text>
              </View>
              
              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={handleCancel}
                  style={styles.button}
                >
                  Cancel
                </Button>
                
                <Button
                  mode="contained"
                  onPress={handleDownload}
                  style={styles.button}
                  disabled={!isChecked || isLoading}
                  loading={isLoading}
                >
                  Continue
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  iconContainer: {
    marginBottom: 16,
  },
  warningIcon: {
    fontSize: 48,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    width: '48%',
  },
});
