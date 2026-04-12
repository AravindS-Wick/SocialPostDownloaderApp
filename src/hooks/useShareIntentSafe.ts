import { useState, useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';

type ShareIntentData = {
  text?: string | null;
  webUrl?: string | null;
  files?: any;
  type?: string | null;
};

type ShareIntentResult = {
  hasShareIntent: boolean;
  shareIntent: ShareIntentData | null;
  resetShareIntent: () => void;
};

// Load the native module ONCE at module level (outside any component).
let nativeModule: any = null;
try {
  const core = require('expo-modules-core');
  if (core?.requireOptionalNativeModule) {
    nativeModule = core.requireOptionalNativeModule('ExpoShareIntentModule');
  }
} catch {
  // Not available
}

/**
 * Safe wrapper that talks directly to the ExpoShareIntentModule native module,
 * bypassing expo-share-intent's JS layer (which depends on expo-linking).
 */
export function useShareIntentSafe(): ShareIntentResult {
  const [shareIntent, setShareIntent] = useState<ShareIntentData | null>(null);
  const appState = useRef(AppState.currentState);

  const resetShareIntent = () => {
    setShareIntent(null);
    try {
      nativeModule?.clearShareIntent('ShareKey');
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!nativeModule) {
      console.log('[ShareIntent] Native module not available');
      return;
    }

    console.log('[ShareIntent] Native module loaded, setting up listeners');

    const processEvent = (event: any) => {
      console.log('[ShareIntent] onChange event received:', JSON.stringify(event));
      if (event?.value) {
        try {
          // Native module sends Kotlin Map → arrives as JS object
          // but could also be a JSON string in some cases
          const parsed = typeof event.value === 'string' ? JSON.parse(event.value) : event.value;
          const intentData: ShareIntentData = {
            text: parsed.text || null,
            webUrl: parsed.webUrl || parsed.webbrowserUrl || null,
            files: parsed.files || null,
            type: parsed.type || null,
          };
          console.log('[ShareIntent] Parsed intent:', JSON.stringify(intentData));
          setShareIntent(intentData);
        } catch (e) {
          console.log('[ShareIntent] Parse error, using raw value:', event.value);
          setShareIntent({ text: String(event.value), webUrl: null, files: null, type: 'text' });
        }
      }
    };

    // Set up listeners FIRST
    let changeSubscription: any;
    let errorSubscription: any;
    try {
      changeSubscription = nativeModule.addListener('onChange', processEvent);
      errorSubscription = nativeModule.addListener('onError', (event: any) => {
        console.log('[ShareIntent] onError:', event?.value);
      });
    } catch (e) {
      console.log('[ShareIntent] Failed to add listeners:', e);
    }

    // Also check hasShareIntent synchronously
    try {
      const hasPending = nativeModule.hasShareIntent('');
      console.log('[ShareIntent] Has pending intent:', hasPending);
    } catch {
      // ignore
    }

    // THEN request any pending share intent (with a small delay to ensure listeners are ready)
    const refreshTimer = setTimeout(() => {
      if (Platform.OS === 'android') {
        try {
          console.log('[ShareIntent] Calling getShareIntent...');
          nativeModule.getShareIntent('');
        } catch (e) {
          console.log('[ShareIntent] getShareIntent error:', e);
        }
      }
    }, 100);

    // Re-check when app comes to foreground (for when app was already open)
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && appState.current !== 'active') {
        console.log('[ShareIntent] App foregrounded, checking for share intent');
        try {
          nativeModule.getShareIntent('');
        } catch {
          // ignore
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      clearTimeout(refreshTimer);
      subscription.remove();
      changeSubscription?.remove();
      errorSubscription?.remove();
    };
  }, []);

  const hasShareIntent = !!(shareIntent?.text || shareIntent?.webUrl || shareIntent?.files);

  return {
    hasShareIntent,
    shareIntent,
    resetShareIntent,
  };
}
