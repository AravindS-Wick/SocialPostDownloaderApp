import React from 'react';

// TODO: Ad display - backlog
// This component will display a banner ad using react-native-google-mobile-ads
// or a similar ad SDK. Implementation is deferred until monetization planning
// is finalized.
//
// Installation: npx expo install react-native-google-mobile-ads
//
// Usage:
//   <AdBanner placement="home_bottom" />
//   <AdBanner placement="history_top" />

interface AdBannerProps {
  placement?: string; // e.g., 'home_bottom', 'history_top', 'between_list_items'
}

const AdBanner: React.FC<AdBannerProps> = ({ placement: _placement }) => {
  // TODO: Ad display - backlog
  // When implemented:
  // 1. Import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads'
  // 2. Map placement prop to ad unit IDs from environment config
  // 3. Handle ad load/error/click events
  // 4. Respect user's ad preferences from settings (e.g., premium = no ads)
  // 5. Track ad impressions for analytics
  //
  // Example implementation:
  //
  // import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
  //
  // const adUnitId = __DEV__ ? TestIds.BANNER : AD_UNIT_IDS[placement];
  //
  // return (
  //   <View style={{ alignItems: 'center', marginVertical: 8 }}>
  //     <BannerAd
  //       unitId={adUnitId}
  //       size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
  //       requestOptions={{ requestNonPersonalizedAdsOnly: true }}
  //       onAdLoaded={() => console.log('Ad loaded')}
  //       onAdFailedToLoad={(error) => console.log('Ad failed:', error)}
  //     />
  //   </View>
  // );

  return null; // No-op until ad SDK is integrated
};

export default AdBanner;
