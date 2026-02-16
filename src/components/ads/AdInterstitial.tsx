import React from 'react';

// TODO: Ad display - backlog
// This component manages interstitial ad display between screens or after downloads.
// Implementation is deferred until monetization planning is finalized.
//
// Installation: npx expo install react-native-google-mobile-ads
//
// Usage:
//   <AdInterstitial trigger="post_download" onAdClosed={() => navigateAway()} />
//   <AdInterstitial trigger="screen_transition" />

interface AdInterstitialProps {
  trigger?: 'post_download' | 'screen_transition';
  onAdClosed?: () => void;
}

const AdInterstitial: React.FC<AdInterstitialProps> = ({ trigger: _trigger, onAdClosed: _onAdClosed }) => {
  // TODO: Ad display - backlog
  // When implemented:
  // 1. Import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads'
  // 2. Preload the ad on component mount
  // 3. Show on trigger prop change
  // 4. Call onAdClosed when ad is dismissed
  // 5. Respect frequency caps (e.g., max 1 interstitial per 5 minutes)
  // 6. Respect user's ad preferences from settings (premium = no ads)
  //
  // Example implementation:
  //
  // import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
  //
  // const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : PROD_INTERSTITIAL_ID;
  // const interstitial = InterstitialAd.createForAdRequest(adUnitId);
  //
  // useEffect(() => {
  //   const loadListener = interstitial.addAdEventListener(AdEventType.LOADED, () => {
  //     setLoaded(true);
  //   });
  //   const closeListener = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
  //     onAdClosed?.();
  //     interstitial.load(); // preload next
  //   });
  //   interstitial.load();
  //   return () => { loadListener(); closeListener(); };
  // }, []);
  //
  // useEffect(() => {
  //   if (trigger && loaded) interstitial.show();
  // }, [trigger]);

  return null; // No-op until ad SDK is integrated
};

export default AdInterstitial;
