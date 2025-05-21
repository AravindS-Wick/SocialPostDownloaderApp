import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

interface PlatformInfoProps {
  platform: string;
  title: string;
  description: string;
}

const PlatformInfo: React.FC<PlatformInfoProps> = ({ platform, title, description }) => {
  const theme = useTheme();

  const getIcon = () => {
    switch (platform) {
      case 'instagram':
        return <Ionicons name="logo-instagram" size={24} color={theme.colors.primary} />;
      case 'youtube':
        return <Ionicons name="logo-youtube" size={24} color={theme.colors.primary} />;
      case 'twitter':
        return <Ionicons name="logo-twitter" size={24} color={theme.colors.primary} />;
      default:
        return <FontAwesome name="magic" size={24} color={theme.colors.primary} />;
    }
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.iconContainer}>{getIcon()}</View>
      <Text style={[styles.title, { color: theme.colors.primary }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.colors.text }]}>{description}</Text>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    elevation: 2,
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default PlatformInfo;