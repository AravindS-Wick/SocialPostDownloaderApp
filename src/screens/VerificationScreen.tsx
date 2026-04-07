import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import type { RootState } from '../store';
import { clearAuthError } from '../store/slices/authSlice';
import { userAPI } from '../services/api';

export default function VerificationScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const theme = useTheme();
  const email = useSelector((state: RootState) => state.auth.pendingVerificationEmail);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerify = async () => {
    if (!email || code.length !== 6) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await userAPI.verifyEmail({ email, code });
      setSuccess('Email verified! You can now log in.');
      setTimeout(() => {
        dispatch(clearAuthError());
        navigation.navigate('Auth' as never);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await userAPI.resendVerification(email);
      setSuccess('A new code has been sent to your email.');
    } catch {
      setError('Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, marginBottom: 8 }}>
          Verify Your Email
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 24 }}>
          Enter the 6-digit code sent to {email}
        </Text>

        <TextInput
          label="Verification Code"
          value={code}
          onChangeText={(text) => setCode(text.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.input}
          mode="outlined"
        />

        {error ? <HelperText type="error" visible>{error}</HelperText> : null}
        {success ? <HelperText type="info" visible>{success}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleVerify}
          loading={loading}
          disabled={code.length !== 6 || loading}
          style={styles.button}
        >
          Verify
        </Button>

        <Button
          mode="text"
          onPress={handleResend}
          disabled={loading}
          style={styles.resendButton}
        >
          Resend Code
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Auth' as never)}
          style={styles.resendButton}
        >
          Back to Login
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  input: { marginBottom: 16 },
  button: { marginTop: 8 },
  resendButton: { marginTop: 12 },
});
