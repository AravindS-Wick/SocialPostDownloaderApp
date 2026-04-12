/**
 * TermsGateScreen
 *
 * Shown ONCE on first launch (or when CURRENT_TERMS_VERSION is bumped).
 * After acceptance it never appears again — the flag is persisted via
 * redux-persist so it survives restarts.
 *
 * UX pattern:
 *   • One short privacy summary paragraph
 *   • Expandable rows for each full document (opens LegalScreen)
 *   • Single checkbox + one "I Agree & Continue" button
 *   • Decline → exit (Android) or info alert (iOS)
 */
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  BackHandler,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Text, Button, Checkbox, useTheme, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { acceptTerms } from '../store/slices/settingsSlice';
import { RootStackParamList } from '../navigation/AppNavigator';

type DocKey = 'privacy' | 'terms' | 'conditions' | 'usage';

const LEGAL_DOCS: { key: DocKey; icon: string; label: string }[] = [
  { key: 'privacy',    icon: 'lock-closed-outline',   label: 'Privacy Policy' },
  { key: 'terms',      icon: 'document-text-outline', label: 'Terms of Service' },
  { key: 'conditions', icon: 'reader-outline',         label: 'Terms & Conditions' },
  { key: 'usage',      icon: 'ban-outline',            label: 'Usage Policy' },
];

export default function TermsGateScreen() {
  const dispatch   = useDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const theme      = useTheme();

  const [agreed, setAgreed] = useState(false);

  const handleAccept = () => {
    if (!agreed) {
      Alert.alert(
        'Agreement Required',
        'Please tick the checkbox to confirm you have read and agree to our terms before continuing.',
        [{ text: 'OK' }],
      );
      return;
    }
    dispatch(acceptTerms());
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const handleDecline = () => {
    Alert.alert(
      'Cannot Continue',
      'You must accept our legal agreements to use SocialPostDownloader. If you decline, the app will close.',
      [
        { text: 'Go Back', style: 'cancel' },
        {
          text: 'Decline & Close',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS === 'android') {
              BackHandler.exitApp();
            } else {
              Alert.alert(
                'Please Delete the App',
                'You cannot use SocialPostDownloader without accepting the legal agreements. Please delete the app from your device.',
              );
            }
          },
        },
      ],
    );
  };

  const isDark = theme.dark;
  const surface   = theme.colors.surface;
  const onSurface = theme.colors.onSurface;
  const muted     = theme.colors.onSurfaceVariant;
  const primary   = theme.colors.primary;
  const border    = isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>

      {/* ── Brand header ─────────────────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: primary }]}>
        <Ionicons name="shield-checkmark" size={40} color="#fff" style={{ marginBottom: 10 }} />
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Before You Continue
        </Text>
        <Text variant="bodySmall" style={styles.headerSub}>
          SocialPostDownloader requires your agreement to our legal terms.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Privacy summary paragraph ────────────────────────── */}
        <View style={[styles.summaryCard, { backgroundColor: surface, borderColor: border }]}>
          <Text variant="titleSmall" style={[styles.summaryTitle, { color: onSurface }]}>
            What you're agreeing to
          </Text>
          <Text variant="bodyMedium" style={[styles.summaryText, { color: muted }]}>
            By using this app you agree that we collect only what's needed to run the service
            (email, device info, and your download history), that you will only download content
            you have the right to use, and that all downloaded content remains the property of
            its original creator. We will never sell your data or use it for advertising.
            You can request deletion of your data at any time by emailing{' '}
            <Text
              style={{ color: primary }}
              onPress={() => Linking.openURL('mailto:legal@aravindhan-dev.com')}
            >
              legal@aravindhan-dev.com
            </Text>
            .
          </Text>
        </View>

        {/* ── Expandable document links ─────────────────────────── */}
        <Text variant="labelMedium" style={[styles.docsLabel, { color: muted }]}>
          TAP TO READ IN FULL
        </Text>

        <View style={[styles.docsCard, { backgroundColor: surface, borderColor: border }]}>
          {LEGAL_DOCS.map((doc, index) => (
            <React.Fragment key={doc.key}>
              <Button
                mode="text"
                icon={({ size, color }) => (
                  <Ionicons name={doc.icon as any} size={size} color={color} />
                )}
                contentStyle={styles.docRowContent}
                labelStyle={[styles.docRowLabel, { color: onSurface }]}
                style={styles.docRow}
                onPress={() => navigation.navigate('Legal', { docKey: doc.key })}
              >
                {doc.label}
              </Button>
              {index < LEGAL_DOCS.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Single checkbox agreement ────────────────────────── */}
        <View style={[styles.checkCard, { backgroundColor: surface, borderColor: agreed ? primary : border }]}>
          <View style={styles.checkRow}>
            <Checkbox
              status={agreed ? 'checked' : 'unchecked'}
              onPress={() => setAgreed(!agreed)}
              color={primary}
            />
            <Text
              variant="bodyMedium"
              style={[styles.checkLabel, { color: onSurface }]}
              onPress={() => setAgreed(!agreed)}
            >
              I have read and agree to the{' '}
              <Text style={{ color: primary }} onPress={() => navigation.navigate('Legal', { docKey: 'privacy' })}>
                Privacy Policy
              </Text>
              {', '}
              <Text style={{ color: primary }} onPress={() => navigation.navigate('Legal', { docKey: 'terms' })}>
                Terms of Service
              </Text>
              {', '}
              <Text style={{ color: primary }} onPress={() => navigation.navigate('Legal', { docKey: 'conditions' })}>
                Terms & Conditions
              </Text>
              {', and '}
              <Text style={{ color: primary }} onPress={() => navigation.navigate('Legal', { docKey: 'usage' })}>
                Usage Policy
              </Text>
              .
            </Text>
          </View>
        </View>

        {/* ── Copyright note ───────────────────────────────────── */}
        <Text variant="labelSmall" style={[styles.copyright, { color: muted }]}>
          © 2026 Aravindhan Dev. All rights reserved.{'\n'}
          SocialPostDownloader™ is a trademark of Aravindhan Dev.
        </Text>

      </ScrollView>

      {/* ── Sticky action footer ──────────────────────────────── */}
      <View style={[styles.footer, { backgroundColor: surface, borderTopColor: border }]}>
        <Button
          mode="outlined"
          onPress={handleDecline}
          style={styles.declineBtn}
          textColor={theme.colors.error}
        >
          Decline
        </Button>
        <Button
          mode="contained"
          onPress={handleAccept}
          disabled={!agreed}
          style={styles.acceptBtn}
          icon="check-circle"
        >
          I Agree &amp; Continue
        </Button>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 6,
  },

  // Scroll
  scroll: {
    padding: 20,
    paddingBottom: 12,
    gap: 16,
  },

  // Summary
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  summaryTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryText: {
    lineHeight: 22,
  },

  // Docs list
  docsLabel: {
    letterSpacing: 0.8,
    marginBottom: -8,
  },
  docsCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  docRow: {
    justifyContent: 'flex-start',
    borderRadius: 0,
  },
  docRowContent: {
    justifyContent: 'flex-start',
    paddingVertical: 4,
  },
  docRowLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'left',
  },

  // Checkbox
  checkCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkLabel: {
    flex: 1,
    lineHeight: 22,
    paddingTop: 6,
  },

  // Copyright
  copyright: {
    textAlign: 'center',
    lineHeight: 18,
    paddingBottom: 4,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  declineBtn: { flex: 1 },
  acceptBtn:  { flex: 2 },
});
