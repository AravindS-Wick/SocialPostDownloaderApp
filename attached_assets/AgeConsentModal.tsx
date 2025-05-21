import React, { useState } from 'react';
import { View, StyleSheet, Modal, Platform } from 'react-native';
import { Text, Button, Surface, Checkbox, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AgeConsentModalProps {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
  contentInfo?: {
    title?: string;
    platform?: string;
  };
}

const AgeConsentModal = ({
  visible,
  onClose,
  onContinue,
  contentInfo = {}
}: AgeConsentModalProps) => {
  const [rememberChoice, setRememberChoice] = useState(false);
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleContinue = async () => {
    // If remember choice is selected, store this preference
    if (rememberChoice) {
      try {
        await AsyncStorage.setItem('age_consent_confirmed', 'true');
      } catch (error) {
        console.error('Failed to save age consent preference:', error);
      }
    }
    
    // Continue with download
    onContinue();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <Surface style={[styles.modalView, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.warningIconContainer}>
            <MaterialIcons name="warning" size={40} color={theme.colors.error} />
          </View>
          
          <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
            Age Verification Required
          </Text>
          
          <Text style={[styles.modalText, { color: theme.colors.onSurfaceVariant }]}>
            The content you are trying to download may contain age-restricted material.
            {contentInfo.title ? `\n\nContent: "${contentInfo.title}"` : ''}
            {contentInfo.platform ? `\nPlatform: ${contentInfo.platform}` : ''}
          </Text>
          
          <Text style={[styles.disclaimerText, { color: theme.colors.onSurfaceVariant }]}>
            By continuing, you confirm that you are at least 18 years old and are legally 
            allowed to view adult content in your jurisdiction.
          </Text>
          
          <View style={styles.checkboxContainer}>
            <Checkbox
              status={rememberChoice ? 'checked' : 'unchecked'}
              onPress={() => setRememberChoice(!rememberChoice)}
            />
            <Text 
              style={[styles.checkboxLabel, { color: theme.colors.onSurfaceVariant }]}
              onPress={() => setRememberChoice(!rememberChoice)}
            >
              Remember my choice
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <Button 
              mode="outlined" 
              onPress={onClose} 
              style={[styles.button, styles.cancelButton]}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleContinue} 
              style={[styles.button, styles.continueButton]}
            >
              I Confirm
            </Button>
          </View>
        </Surface>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalView: {
    width: Platform.OS === 'web' ? 450 : '100%',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  warningIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  disclaimerText: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    margin: 8,
  },
  cancelButton: {
    borderWidth: 1,
  },
  continueButton: {},
});

export default AgeConsentModal;