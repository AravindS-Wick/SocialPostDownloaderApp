import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';

type HeaderProps = {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
};

export default function Header({ title, showBackButton, onBackPress }: HeaderProps) {
  const navigation = useNavigation();
  
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <LinearGradient
      colors={['#4A69BD', '#5E82D6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      <View style={styles.content}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        
        <View style={styles.titleContainer}>
          <Feather name="download-cloud" size={24} color="#fff" />
          <Text style={styles.title}>{title}</Text>
        </View>
        
        <View style={styles.rightPlaceholder} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50, // Adjust for status bar
    paddingBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#FFFFFF',
  },
  rightPlaceholder: {
    width: 40,
  },
});
