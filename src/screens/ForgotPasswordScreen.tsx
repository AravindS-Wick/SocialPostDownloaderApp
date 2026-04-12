import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, IconButton, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { userAPI } from '../services/api';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);

  const emailError = emailTouched && email && !EMAIL_REGEX.test(email.trim())
    ? 'Enter a valid email address'
    : '';

  const handleForgotPassword = async () => {
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Email is required.');
      setEmailTouched(true);
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Enter a valid email address.');
      setEmailTouched(true);
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.forgotPassword(email.trim().toLowerCase());
      if (response.success) {
        setSuccess('If an account exists, a password reset link has been sent to your email.');
        setTimeout(() => {
          navigation.navigate('Auth' as never);
        }, 2000);
      } else {
        setError(response.message || 'Failed to request password reset');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <IconButton
            icon="close"
            size={24}
            onPress={() => navigation.goBack()}
          />
        </View>

        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Reset Password
        </Text>
        <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Enter your email address and we'll send you a password reset link
        </Text>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: theme.dark ? 'rgba(211,47,47,0.15)' : '#FFEBEE' }]}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {success ? (
          <View style={[styles.successBox, { backgroundColor: theme.dark ? 'rgba(56,142,60,0.15)' : '#E8F5E9' }]}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        ) : null}

        <TextInput
          label="Email Address"
          value={email}
          onChangeText={(v) => { setEmail(v); setEmailTouched(true); }}
          onBlur={() => setEmailTouched(true)}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          left={<TextInput.Icon icon="email" />}
          style={styles.input}
          error={!!emailError}
        />
        {emailError ? <HelperText type="error" visible>{emailError}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleForgotPassword}
          loading={loading}
          disabled={loading || !!emailError || !email.trim()}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
          labelStyle={styles.submitButtonLabel}
        >
          Send Reset Link
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          disabled={loading}
          style={styles.backButton}
        >
          Back to Login
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  title: { fontWeight: 'bold', marginBottom: 8 },
  subtitle: { marginBottom: 24 },
  errorBox: { padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: '#d32f2f', fontSize: 14 },
  successBox: { padding: 12, borderRadius: 8, marginBottom: 16 },
  successText: { color: '#2e7d32', fontSize: 14 },
  input: { marginBottom: 16 },
  submitButton: { marginTop: 8, borderRadius: 8 },
  submitButtonContent: { height: 50 },
  submitButtonLabel: { fontSize: 16, fontWeight: 'bold' },
  backButton: { marginTop: 12 },
});
