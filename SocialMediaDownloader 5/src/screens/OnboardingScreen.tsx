import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';

type OnboardingScreenProps = {
  onComplete: () => void;
};

type OnboardingSlide = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

const { width } = Dimensions.get('window');

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome to SocialSaver',
    description: 'The ultimate tool for downloading videos, images, and audio from your favorite social media platforms.',
    icon: 'download-cloud',
  },
  {
    id: '2',
    title: 'Multiple Platforms',
    description: 'Supports Instagram, YouTube, Twitter, and more. Simply paste the URL and we'll handle the rest.',
    icon: 'grid',
  },
  {
    id: '3',
    title: 'Choose Quality',
    description: 'Select your preferred resolution and format for the perfect download experience.',
    icon: 'settings',
  },
  {
    id: '4',
    title: 'Track History',
    description: 'All your downloads are saved in history for easy access and re-download.',
    icon: 'clock',
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;
  
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;
  
  const scrollToNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onComplete();
    }
  };
  
  const scrollToPrevious = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1 });
    }
  };
  
  const renderItem = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.iconContainer}>
          <Feather name={item.icon as any} size={80} color="#4A69BD" />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.skipButton} 
        onPress={onComplete}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      
      <View style={styles.pagination}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.paginationDot,
              { opacity: i === currentIndex ? 1 : 0.3 }
            ]}
          />
        ))}
      </View>
      
      <View style={styles.buttonContainer}>
        {currentIndex > 0 && (
          <Button
            mode="outlined"
            onPress={scrollToPrevious}
            style={styles.button}
          >
            Back
          </Button>
        )}
        
        <Button
          mode="contained"
          onPress={scrollToNext}
          style={styles.button}
        >
          {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    color: '#4A69BD',
    fontSize: 16,
    fontWeight: 'bold',
  },
  slide: {
    width,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(74, 105, 189, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#2C3E50',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#7F8C8D',
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4A69BD',
    marginHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 40,
    paddingHorizontal: 20,
  },
  button: {
    width: 150,
  },
});
