import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const HeaderRight: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const theme = useTheme();

  const handleNewDownload = () => {
    navigation.navigate('Download');
  };

  return (
    <View style={styles.container}>
      <IconButton
        icon="plus"
        size={24}
        iconColor={theme.colors.primary}
        onPress={handleNewDownload}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginRight: 8,
  },
});

export default HeaderRight;
