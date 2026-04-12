import React, { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { Text, Appbar, List, Divider, useTheme, Button } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

// ── Static content ──────────────────────────────────────────────────────────
// Keeping text inline avoids require() on .md files (which needs extra metro config).
// Each document is split into sections for clean rendering.

type Section = { heading: string; body: string[] };

const DOCS: Record<string, { icon: string; title: string; updated: string; sections: Section[] }> = {
  privacy: {
    icon: '🔒',
    title: 'Privacy Policy',
    updated: 'April 7, 2026',
    sections: [
      {
        heading: '1. Introduction',
        body: [
          'SocialPostDownloader ("the App," "we," "us," "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and API services.',
          'If you do not agree with our practices, please do not use the App.',
        ],
      },
      {
        heading: '2. Information We Collect',
        body: [
          'Directly provided: email address, username, hashed password, media URLs you submit, download history and preferences, and support messages.',
          'Automatically collected: IP address, device type, OS version, device identifiers (UUID), crash reports, error logs, and session tokens.',
          'Third-party (only to fulfil downloads): public metadata from YouTube, Instagram, and Twitter/X (title, duration, public creator names). We do NOT collect private messages, location data, or payment information.',
        ],
      },
      {
        heading: '3. How We Use Your Information',
        body: [
          'Service delivery (contract) — providing download functionality and account access.',
          'Service improvement (legitimate interest) — analysing usage patterns, fixing bugs.',
          'Communication (contract) — responding to support requests, sending policy updates.',
          'Security (legitimate interest) — fraud detection, breach prevention.',
          'We do NOT use your data for advertising, third-party marketing, or cross-app tracking.',
        ],
      },
      {
        heading: '4. Data Sharing & Disclosure',
        body: [
          'Service providers: cloud hosting, error logging, and email delivery — all under data processing agreements.',
          'Law enforcement: when required by court order, subpoena, or to prevent fraud or harm.',
          'Platform APIs (YouTube, Instagram, Twitter/X): solely to retrieve publicly available content.',
          'We do NOT sell personal information.',
        ],
      },
      {
        heading: '5. Data Security',
        body: [
          'TLS 1.2+ encryption in transit, AES-256 at rest, bcrypt-salted password hashing, role-based access control, and audit logging.',
          'In the event of a breach, we will notify affected users within 72 hours per GDPR Article 33.',
        ],
      },
      {
        heading: '6. Your Rights',
        body: [
          'Access & Portability — obtain a copy of your data within 30 days.',
          'Correction — fix inaccurate information within 30 days.',
          'Deletion ("Right to be Forgotten") — request erasure within 30 days.',
          'Opt-out — disable analytics in Settings → Privacy.',
          'To exercise any right: legal@aravindhan-dev.com',
        ],
      },
      {
        heading: '7. GDPR (EU Residents)',
        body: [
          'Lawful bases: contract performance, legitimate interest, and legal obligation.',
          'International transfers use Standard Contractual Clauses.',
          'You may withdraw consent, request a Data Processing Agreement, or lodge a complaint with your national supervisory authority.',
        ],
      },
      {
        heading: '8. CCPA (California Residents)',
        body: [
          'Right to know what data we collect — response within 45 days.',
          'Right to delete — response within 45 days.',
          'Right to opt-out of data sharing — immediate.',
          'No discrimination for exercising your rights.',
          'Requests: legal@aravindhan-dev.com',
        ],
      },
      {
        heading: '9. Children\'s Privacy',
        body: [
          'The App is NOT intended for children under 13. We do not knowingly collect data from minors. If we learn we have, we delete it immediately.',
        ],
      },
      {
        heading: '10. Data Retention',
        body: [
          'Account data: retained until you request deletion.',
          'Download history: deleted 90 days after account deletion.',
          'Analytics: anonymised after 30 days.',
          'Legal/compliance logs: retained 6 years (legal obligation).',
        ],
      },
      {
        heading: '11. Contact',
        body: [
          'Email: legal@aravindhan-dev.com',
          'Response time: 30 days.',
        ],
      },
    ],
  },

  terms: {
    icon: '⚖️',
    title: 'Terms of Service',
    updated: 'April 7, 2026',
    sections: [
      {
        heading: '1. Agreement & Acceptance',
        body: [
          'By downloading, installing, or using SocialPostDownloader you agree to be legally bound by these Terms. If you do not accept, do not use the App.',
          'These Terms form a binding legal agreement between you and Aravindhan Dev.',
        ],
      },
      {
        heading: '2. Grant of License',
        body: [
          'We grant you a limited, non-exclusive, non-transferable, revocable licence to install and use the App on your personal device for personal, non-commercial use.',
          'You may NOT copy, modify, reverse-engineer, distribute, sell, or create derivative works of the App.',
        ],
      },
      {
        heading: '3. User Responsibilities',
        body: [
          'Provide accurate account information and maintain credential security.',
          'You are liable for all activity under your account.',
          'Do not share your account or create multiple accounts.',
        ],
      },
      {
        heading: '4. Content & Use Restrictions',
        body: [
          'The App downloads publicly available content only. You are responsible for verifying you have the right to download any content.',
          'PROHIBITED: downloading for commercial redistribution, circumventing DRM, violating platform Terms (YouTube, Instagram, Twitter/X), and downloading content you do not have rights to.',
          'The Company does NOT warrant the legality of downloaded content. You accept all liability for how you use downloads.',
        ],
      },
      {
        heading: '5. Intellectual Property',
        body: [
          'All right, title, and interest in the App — source code, UI, features, trademarks — are owned exclusively by Aravindhan Dev.',
          'You retain ownership of content you create. Downloaded third-party content remains the property of its original creator.',
        ],
      },
      {
        heading: '6. Disclaimer of Warranties',
        body: [
          'THE APP IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND — express, implied, merchantability, fitness for purpose, non-infringement, accuracy, or availability.',
          'We do not guarantee the App will be error-free, continuously available, or that downloads will always succeed.',
        ],
      },
      {
        heading: '7. Limitation of Liability',
        body: [
          'TO THE MAXIMUM EXTENT PERMITTED BY LAW, our total liability is LIMITED TO $0 (zero) or the amount you paid for the App, whichever is greater.',
          'We are NOT liable for consequential, incidental, indirect, special, or punitive damages, even if advised of their possibility.',
        ],
      },
      {
        heading: '8. Indemnification',
        body: [
          'You agree to defend, indemnify, and hold harmless Aravindhan Dev from any claims, damages, or expenses (including attorney\'s fees) arising from your use of the App, your violations of these Terms, or your IP infringement.',
        ],
      },
      {
        heading: '9. DMCA Compliance',
        body: [
          'We comply with the Digital Millennium Copyright Act. To report copyright infringement: dmca@aravindhan-dev.com',
          'We respond to valid takedown notices within 10 business days.',
        ],
      },
      {
        heading: '10. Termination',
        body: [
          'We may terminate your access immediately for illegal activities, repeated violations, security threats, or DMCA violations.',
          'With 30 days notice for business or regulatory reasons.',
        ],
      },
      {
        heading: '11. Governing Law',
        body: [
          'These Terms are governed by the laws of [Your Jurisdiction]. Disputes are resolved by binding individual arbitration — you waive the right to class action.',
        ],
      },
    ],
  },

  conditions: {
    icon: '📜',
    title: 'Terms & Conditions',
    updated: 'April 7, 2026',
    sections: [
      {
        heading: '1. Acceptance',
        body: [
          'By using the App or postDownloader API you accept these Terms & Conditions in full. These supplement the Terms of Service.',
        ],
      },
      {
        heading: '2. Service Description',
        body: [
          'The App downloads publicly available social media content. The API provides RESTful endpoints for media downloading, JWT authentication, and user account management.',
          'This service works ONLY with publicly available content. It does NOT access private content, bypass security, or store content permanently.',
        ],
      },
      {
        heading: '3. Prohibited Activities',
        body: [
          'Illegal conduct: IP infringement, malware transmission, fraud, hacking, or illegal distribution.',
          'Platform violations: circumventing YouTube Content ID, violating Instagram/Twitter/X ToS, API rate limit abuse.',
          'Security violations: hacking, DoS attacks, injecting malicious code, social engineering.',
          'Harassment: threats, defamation, coordinated abuse, doxxing, non-consensual intimate content.',
          'Commercial use without written permission.',
        ],
      },
      {
        heading: '4. Third-Party Services',
        body: [
          'The service depends on YouTube (Google), Instagram (Meta), and Twitter/X (X Corp.).',
          'We are NOT responsible for their availability, ToS changes, API limitations, or content policies.',
          'Platform outages may prevent the App from functioning. No refunds are provided for platform-caused downtime.',
        ],
      },
      {
        heading: '5. Liability & Indemnification',
        body: [
          'THE SERVICE IS PROVIDED "AS IS." WE DISCLAIM ALL WARRANTIES.',
          'Total liability capped at $0 or amount paid. No consequential, incidental, indirect, or punitive damages.',
          'You indemnify us for all claims from your use, violations, or content you download.',
        ],
      },
      {
        heading: '6. Dispute Resolution',
        body: [
          '1. 30-day good-faith negotiation.',
          '2. Mediation if negotiation fails.',
          '3. Binding individual arbitration per AAA Commercial Arbitration Rules.',
          'Class action lawsuits are waived.',
        ],
      },
      {
        heading: '7. Export Compliance',
        body: [
          'You will not use the Service to export to embargoed countries or transfer to sanctioned parties.',
          'You represent you are not on a government prohibited list.',
        ],
      },
      {
        heading: '8. Entire Agreement',
        body: [
          'These Terms, plus the Privacy Policy, Usage Policy, and Copyright Notice, constitute the entire agreement. All prior agreements are superseded.',
          'If any provision is invalid, it is severed; remaining provisions remain in full effect.',
        ],
      },
    ],
  },

  usage: {
    icon: '🚫',
    title: 'Acceptable Use Policy',
    updated: 'April 7, 2026',
    sections: [
      {
        heading: '1. Acceptable Use',
        body: [
          'Permitted: downloading public media you have the right to download, personal archiving of content you created, educational and research use with attribution, fair-use commentary, and non-commercial personal backups.',
          'All use requires compliance with platform Terms of Service, copyright law, and these Terms.',
        ],
      },
      {
        heading: '2. Zero-Tolerance Violations',
        body: [
          'CHILD SEXUAL ABUSE MATERIAL (CSAM) — immediate account termination + law enforcement reporting.',
          'Terrorism / violent extremism content — immediate termination + potential law enforcement reporting.',
          'Gore or extreme violence — immediate termination.',
          'Non-consensual intimate imagery — immediate termination.',
          'These violations carry NO warnings and NO appeal.',
        ],
      },
      {
        heading: '3. Prohibited Content & Activities',
        body: [
          'Copyright infringement: downloading for distribution, sale, or profit.',
          'Platform violations: circumventing YouTube Content ID, Instagram/Twitter/X ToS abuse.',
          'Privacy violations: downloading private content, doxxing, stalking.',
          'Fraud & deception: impersonation, phishing, malware.',
          'Hate speech: content promoting hatred based on race, religion, gender, sexuality, disability, or nationality.',
          'API abuse: automated downloading without authorisation, circumventing rate limits, bot activity.',
        ],
      },
      {
        heading: '4. Commercial Use',
        body: [
          'Commercial use (monetisation, distribution, subscription services, competing products) is PROHIBITED without written authorisation.',
          'Unauthorised commercial use results in immediate termination and legal action for damages.',
        ],
      },
      {
        heading: '5. Enforcement Tiers',
        body: [
          'First violation: warning email + 7-day suspension.',
          'Second violation (within 6 months): 30-day suspension + content deletion.',
          'Third violation (within 12 months): permanent termination + IP blocking.',
          'Severe violations (zero-tolerance list): immediate termination.',
        ],
      },
      {
        heading: '6. API Rate Limits',
        body: [
          '1,000 requests/day per user.',
          '10,000 requests/day per IP.',
          '100 requests/minute burst.',
          '50 downloads/day per account.',
          'Exceeding limits: 1-hour IP block; repeated abuse leads to account suspension.',
        ],
      },
      {
        heading: '7. Contact',
        body: [
          'Abuse reports: abuse@aravindhan-dev.com (urgent CSAM/threats: 1–2 hour response)',
          'DMCA: dmca@aravindhan-dev.com',
          'Legal: legal@aravindhan-dev.com',
        ],
      },
    ],
  },

  copyright: {
    icon: '©️',
    title: 'Copyright Notice',
    updated: 'April 7, 2026',
    sections: [
      {
        heading: 'Copyright Ownership',
        body: [
          'Copyright © 2026 Aravindhan Dev. All rights reserved.',
          'All right, title, and interest in SocialPostDownloader and postDownloader API — including source code, UI, features, algorithms, documentation, trademarks, and trade secrets — are owned exclusively by Aravindhan Dev.',
        ],
      },
      {
        heading: 'License Grant',
        body: [
          'You are granted a limited, non-exclusive, non-transferable, revocable licence to download, install, and use the App on your personal device in accordance with the Terms of Service.',
          'You may NOT copy, modify, distribute, reverse-engineer, or create derivative works.',
        ],
      },
      {
        heading: 'Third-Party Content',
        body: [
          'Downloaded content remains the property of its original creator. Aravindhan Dev does NOT claim ownership of downloaded content.',
          'Creators retain copyright, moral rights, DMCA rights, and all other intellectual property rights.',
          'You are responsible for verifying you have the right to download and use any content.',
        ],
      },
      {
        heading: 'Fair Use',
        body: [
          'The App supports fair-use activities: personal archiving of your own content, research and study, commentary and criticism, and educational use with attribution.',
          'Fair use does NOT cover commercial redistribution or activities that harm the creator\'s market.',
        ],
      },
      {
        heading: 'DMCA Compliance',
        body: [
          'We qualify for DMCA Safe Harbor (17 U.S.C. § 512).',
          'To report copyright infringement, send a written notice to: dmca@aravindhan-dev.com',
          'Include: your name, contact info, description of the copyrighted work, location of infringing content, and a declaration under penalty of perjury that you own the copyright.',
          'We respond within 10 business days.',
        ],
      },
      {
        heading: 'Trademarks',
        body: [
          'SocialPostDownloader™ and postDownloader™ are trademarks of Aravindhan Dev.',
          'You may not use our trademarks without written permission.',
        ],
      },
      {
        heading: 'Enforcement',
        body: [
          'Infringement may result in injunctions, monetary damages, statutory damages (up to $150,000 per copyright violation), and attorney\'s fees.',
          'DMCA violations carry criminal penalties of up to 10 years imprisonment.',
        ],
      },
    ],
  },
};

// ── Types ────────────────────────────────────────────────────────────────────
type LegalScreenRouteProp = RouteProp<RootStackParamList, 'Legal'>;

// ── Component ────────────────────────────────────────────────────────────────
export default function LegalScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<LegalScreenRouteProp>();
  const theme = useTheme();

  const docKey = route.params?.docKey ?? 'privacy';
  const doc = DOCS[docKey] ?? DOCS.privacy;

  const [expanded, setExpanded] = useState<string | null>(doc.sections[0]?.heading ?? null);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`${doc.icon} ${doc.title}`} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Meta row */}
        <View style={[styles.metaRow, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Last updated: {doc.updated} · Version 1.0 · ✅ Verified
          </Text>
        </View>

        {/* Accordion sections */}
        {doc.sections.map((s) => (
          <React.Fragment key={s.heading}>
            <List.Accordion
              title={s.heading}
              titleStyle={[styles.accordionTitle, { color: theme.colors.onSurface }]}
              expanded={expanded === s.heading}
              onPress={() => setExpanded(expanded === s.heading ? null : s.heading)}
              style={{ backgroundColor: theme.colors.surface }}
            >
              <View style={[styles.sectionBody, { backgroundColor: theme.colors.background }]}>
                {s.body.map((line, i) => (
                  <Text
                    key={i}
                    variant="bodyMedium"
                    style={[styles.bodyLine, { color: theme.colors.onSurfaceVariant }]}
                  >
                    {line}
                  </Text>
                ))}
              </View>
            </List.Accordion>
            <Divider />
          </React.Fragment>
        ))}

        {/* Contact footer */}
        <View style={[styles.contactBox, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="labelMedium" style={{ color: theme.colors.primary, marginBottom: 4 }}>
            Questions?
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            legal@aravindhan-dev.com · dmca@aravindhan-dev.com
          </Text>
          <Button
            mode="text"
            compact
            style={{ marginTop: 4, alignSelf: 'flex-start' }}
            onPress={() => Linking.openURL('mailto:legal@aravindhan-dev.com')}
          >
            Send Email
          </Button>
        </View>

        {/* Copyright footer */}
        <Text variant="labelSmall" style={[styles.copyright, { color: theme.colors.onSurfaceVariant }]}>
          © 2026 Aravindhan Dev. All rights reserved.{'\n'}
          SocialPostDownloader™ is a trademark of Aravindhan Dev.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  metaRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionBody: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  bodyLine: {
    marginBottom: 10,
    lineHeight: 22,
  },
  contactBox: {
    margin: 16,
    padding: 16,
    borderRadius: 10,
  },
  copyright: {
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    lineHeight: 18,
  },
});
