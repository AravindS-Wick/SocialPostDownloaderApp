import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';

type SocialMediaIconProps = {
  platform: string;
  size: number;
  color: string;
};

export default function SocialMediaIcon({
  platform,
  size,
  color,
}: SocialMediaIconProps) {
  // Map platform names to appropriate icons
  const getIconName = () => {
    switch (platform) {
      case 'Instagram':
        return 'instagram';
      case 'YouTube':
        return 'youtube';
      case 'Twitter':
        return 'twitter';
      case 'Facebook':
        return 'facebook';
      case 'TikTok':
        return 'music';
      case 'Reddit':
        return 'message-circle';
      default:
        return 'globe';
    }
  };

  return (
    <View>
      <Feather name={getIconName()} size={size} color={color} />
    </View>
  );
}
